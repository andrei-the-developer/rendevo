# Landing pubblica — direzione di design

`[design]` · 2026-08-24 · risponde a `DOMANDE.md` «[marketing] → [design] —
Dove sta la landing pubblica?» e alla richiesta di Andrei nel gruppo.

Regola che ho seguito (dalla mia memoria, incarico 2): *ogni idea va scritta
come «cosa vede l'utente, in che momento, in che ordine dall'alto». Se non
riesco a scriverlo, non ho un'idea, ho un'atmosfera.* Questo documento è
scritto così apposta: si può implementare leggendolo, senza chiedermi altro.

---

## 1. Dove sta, e perché non è la home dell'app

Oggi `frontend/app/page.tsx` **non è una home**: è un bootstrap. Al primo
`useEffect` chiama `/api/eventi`, e se non ne trova uno crea un invito e fa
`router.replace('/e/{id}')`. Chi arriva da una pubblicità non vedrebbe mai una
pagina: si troverebbe dentro un editor desktop, su un telefono, con un invito
vuoto intestato a nessuno.

**Decisione: la landing è una pagina nuova e separata, `app/(pubblico)/page.tsx`,
servita sull'host pubblico. Il bootstrap resta dov'è e diventa `/crea`.**

Il routing per host, non per percorso, per una ragione precisa:
`beta.andreievictoria.it` risponde **401 su ogni percorso** (`basic_auth` di
Caddy, domanda 12 di `DOMANDE-PER-ANDREI.md`). Una landing su un *percorso* di
quell'host sarebbe dietro la password, cioè invisibile — e Meta controlla la
pagina di destinazione prima di approvare l'inserzione, quindi i 30 €
resterebbero non spendibili esattamente come oggi (domanda 13).

Assetto proposto, senza toccare il blocco del webhook:

| host | cosa serve | protezione |
|---|---|---|
| `andreievictoria.it` | **solo la landing** + `/api/stripe/webhook` già esistente | pubblico, indicizzabile |
| `beta.andreievictoria.it` | l'app (editor, `/i/{token}`) | `basic_auth`, `noindex` |
| `andreievictoria222.it` | com'è oggi | invariato |

La landing **non deve importare niente dell'editor** e non deve chiamare
`/api/eventi`: è statica (SSG), niente sessione, niente cookie. È l'unica
pagina del progetto che ha senso far vedere a Google, ed è anche l'unica che
regge un picco di traffico senza toccare il database.

## 2. La regola che governa tutta la pagina

**La landing non descrive il prodotto: lo fa usare.** Non abbiamo niente da
raccontare che i concorrenti italiani non raccontino già meglio di noi
(«consegna in pochi giorni», «revisioni illimitate»): sono servizi artigianali
con un modulo davanti, e su quel terreno perdiamo. Abbiamo però una cosa che
loro non hanno: **il prodotto funziona in due secondi, senza registrazione.**

Conseguenza operativa, e vale come vincolo: **niente screenshot, niente mockup
di telefono, niente illustrazioni di inviti.** Tutto quello che sulla landing
sembra un invito **è** un invito, disegnato dai componenti veri
(`FronteBusta`, `ListaBlocchi`). Un catalogo di immagini finte lo fanno tutti e
non prova niente; una busta che si apre davvero mentre la guardi prova tutto.

Questo rispetta anche il vincolo del REGISTRO: **un solo renderer**. La landing
non introduce un percorso di rendering nuovo, passa un `Evento` di esempio ai
componenti che già esistono.

## 3. L'hero: la busta col nome di chi sta guardando

Quello che vede l'utente, dall'alto, nell'ordine:

1. **Una busta chiusa, grande, centrata**, col sigillo di cera e il monogramma.
   Non un'immagine: `FronteBusta` con la grana di `grana.svg`.
   Sul fronte, dove sta `.busta__indirizzo`, c'è scritto **«Per te»**.
2. Sopra la busta, una riga sola: *«Gli inviti che si aprono.»*
   Sotto: *«Inviti digitali per matrimoni, compleanni e feste. Si aprono come
   una busta vera, si mandano su WhatsApp, si preparano in due minuti.»*
3. Sotto la busta, **un campo di testo unico**, con etichetta
   *«Scrivi il nome di chi vuoi invitare»*. Mentre digiti, **il nome compare
   sulla busta in corsivo**, al posto di «Per te», con la grafia dell'invito.
4. Il bottone accanto dice **«Apri»**. Al clic parte la sequenza che già
   esiste: il sigillo si spacca, il lembo ruota indietro, la lettera sale.
   `Sipario` fa già esattamente questo (`DURATA_APERTURA = 2100`, e rispetta
   già `prefers-reduced-motion`).
5. Dietro la busta aperta **c'è l'invito di esempio**, che continua scorrendo.

Perché questo e non un hero classico: è l'unica idea che mette la conversione
**prima** dell'apertura, che è il punto dove perdiamo persone senza accorgercene.
È la stessa idea 1 già approvata a registro (il link `?a=Nome`), applicata alla
landing — e qui è gratis, perché il nome sta nello stato di React e **non
tocca il database** (nessun nome di invitato salvato: vincolo GDPR del REGISTRO
rispettato alla lettera).

Il dato che lo regge: busta scritta a mano, **~99% di aperture contro il 15–21%
della posta stampata, +37% di risposte** (DMA). Il nome sulla busta non è
decoro, è la funzione che vendiamo.

Dettagli che non sono opzionali:
- Se il campo resta vuoto, «Apri» funziona lo stesso e la busta dice «Per te».
  Nessun errore, nessun asterisco: non è un modulo, è un giocattolo.
- `iniziali()` (`CartaBusta.tsx:4`) calcola già il monogramma sul sigillo dal
  titolo: scrivendo «Anna» il sigillo diventa **A**. Cambia sotto il dito.
  È il dettaglio che fa capire, senza una riga di testo, che è personalizzabile.
- Il campo è un `<input>` vero con `<label>`, non un `contenteditable` sulla
  busta: su mobile la tastiera deve aprirsi in modo prevedibile.
- **Una volta aperta, la busta non si richiude.** L'utente scorre e basta. Un
  «richiudi» sarebbe un secondo colpo di scena, contro la mia regola: il
  disvelamento sta in un punto solo.

## 4. Sotto la piega: l'invito vero, non le sue funzioni

Dopo l'apertura si scorre **un invito di esempio completo e credibile**
(nomi inventati, data del 2027, un luogo vero italiano), disegnato da
`ListaBlocchi` con un `Evento` costante in un file di dati.

Le funzioni non si elencano: si incontrano scorrendo, e **una riga sottile in
margine** le nomina mentre passano. Cioè il countdown si vede *funzionare* e
accanto c'è scritto «Il conto alla rovescia si aggiorna da solo»; l'RSVP si
vede *disegnato* e accanto «Gli invitati rispondono da qui, tu leggi le
risposte». Niente griglia di icone con tre colonne: quella è la pagina di tutti
gli altri.

L'RSVP di esempio va mostrato **con il modulo intero e già su «Sì»** — altrimenti
i campi condizionali «Chi viene» e «Intolleranze» non compaiono mai
(`Interattivi.tsx:345,356`) e la parte più convincente resta invisibile. Il
tasto d'invio non manda niente ma **non deve sembrare rotto**:
`.bottone:disabled { opacity: .55 }` (`blocchi.css:355`) va neutralizzato lì
dentro, e su Safari serve `-webkit-text-fill-color` sugli input, o si sbiadiscono.

Alla fine dell'invito di esempio, **il cambio d'abito**: due bottoni piccoli
cambiano `data-tema` e `data-palette` sul contenitore e **l'intero esempio
cambia carattere e colore sul posto**, senza ricaricare. È la dimostrazione più
economica che abbiamo (i token esistono già, `temi.css`) e dice in un secondo
quello che un catalogo di 40 template dice male: non scegli una figurina,
scegli una veste.

## 5. Il piede: prezzo e chiusura

Una riga onesta sul prezzo (**69 €, una volta, per un invito**, listino della
domanda 3) e **la fascetta della bozza** — lo stesso oggetto tipografico deciso
per l'anteprima — come nota che oggi siamo in beta.

**Firma «Creato con Inviti»**: chiudo qui anche la seconda domanda di
`marketing`. Va **nel piede dell'anteprima non pagata**, mai sull'invito di un
cliente che ha pagato, e sulla landing non serve affatto. Il posto è quello
perché lì la pagina non è ancora di nessuno: è nostra.

## 6. Il punto che blocca, e la mia raccomandazione

**La landing sarà pubblica; l'app dietro no.** Il bottone «Crea il tuo invito»
oggi porterebbe a un 401 con richiesta di password: la peggior fine possibile
per un clic pagato, e Meta rifiuterebbe comunque l'inserzione.

Finché la beta è chiusa, la CTA in fondo alla landing deve essere
**«Chiedi l'accesso alla beta» → link `wa.me` di Andrei**. Non un modulo email:
un modulo email significa raccogliere indirizzi, cioè dati personali, cioè il
blocco GDPR già a registro, per una lista che non sappiamo ancora usare. Su
WhatsApp il contatto resta nel telefono di Andrei e noi non conserviamo niente.

E vale la pena dirlo chiaro: **l'hero è già la prova del prodotto**. Un
visitatore che scrive un nome, apre la busta e scorre l'invito ha *usato*
Inviti senza mai incontrare la password. La landing non è il cartello davanti
alla porta chiusa: è la stanza.

## 7. Cosa costa, onestamente

- **Hero interattivo**: basso. `FronteBusta` e `Sipario` esistono, prendono già
  le prop giuste, e il nome è un `useState`. La parte nuova è il campo e il
  ricalcolo del monogramma, che è una funzione già scritta.
- **Esempio scorrevole**: basso-medio. È un `Evento` costante passato a
  `ListaBlocchi`; il costo vero sono le annotazioni in margine e il
  comportamento dell'RSVP finto (i due dettagli CSS del §4).
- **Cambio tema/palette dal vivo**: basso. Due attributi su un contenitore.
- **Routing per host + landing statica**: è la parte non mia. Caddy deve
  servire `andreievictoria.it` verso la landing **senza `basic_auth`**,
  lasciando intatto il percorso del webhook Stripe.
- **Cosa NON va fatto ora**: un blog, una pagina prezzi separata, testimonianze
  (non ne abbiamo di vere), un catalogo di template.

## 8. Scartato, con il perché (leggere prima di riproporre)

- **Video dell'apertura in autoplay nell'hero.** Pesa, su mobile parte male, e
  soprattutto trasforma in filmato una cosa che l'utente può *fare*. Se abbiamo
  la cosa vera, il video è un downgrade.
- **Carosello di template.** Non è una gara che possiamo vincere (loro ne hanno
  40) e non è la gara giusta: il valore percepito non sta nella scelta, sta
  nella qualità di quello che scegli. Due temi × due palette fatti benissimo.
- **Parallasse / scroll-jacking sulla landing.** Rompe l'inerzia nativa su
  mobile. L'utente non pensa «che bello», pensa «è rotto». Vale qui come
  sull'invito.
- **Contatore «X inviti già creati».** Non abbiamo il numero, e un numero basso
  fa più danno del silenzio.
- **La landing come home dell'app** (stesso `/` con un bottone «entra»).
  Sembra più semplice, ma trascina cookie di sessione e chiamate API in una
  pagina che deve essere statica e cacheabile, e mette la pubblicità dentro
  l'host protetto da password.
