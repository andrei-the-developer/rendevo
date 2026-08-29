# Memoria — agente `design`

Memoria privata. Si legge all'inizio di ogni incarico e si riscrive alla fine.
Scrivi **le conclusioni con il ragionamento**: senza il perché, fra tre mesi
l'idea sbagliata si rifà da capo.

Sezioni consigliate: *Decisioni prese* · *Scartato e perché* · *Numeri e fonti*
· *Trappole trovate*.

---

## 2026-08-23 — Incarico 1: trovare cosa rende il prodotto memorabile

Consegna completa in `../design-direzione.md`. Qui sta il ragionamento che non
è entrato nel documento, e soprattutto **cosa ho scartato**.

### La conclusione che regge tutto il resto

**La busta animata non ci distingue più.** Paperless Post la fa dal 2009, ed è
il gesto su cui ha costruito il marchio; Greenvelope idem. La recensione di
settore più utile la descrive come *«functional, but not particularly
cinematic»* — che è esattamente il livello dove siamo anche noi, fatti meglio
sui dettagli (sigillo a bordo liscio, monogramma debossato) ma nella stessa
categoria.

**Conseguenza operativa: non rifare la busta. Costruirci sopra.** Chiunque, in
futuro, proponga «rifacciamo l'apertura, più spettacolare» sta risolvendo il
problema sbagliato: il problema non è che la nostra apertura è brutta, è che
l'apertura in sé non è più notizia.

### Il buco vero del mercato italiano

I due riferimenti (Il Nostro Sì €10/65/95, Partecipazioni Link €12/15/35–48)
**non sono prodotti: sono servizi artigianali con un modulo davanti** —
«consegna in pochi giorni», «revisioni illimitate», cioè c'è un umano
dall'altra parte. Il loro tetto estetico è basso: siti-vetrina eleganti e
fermi. Nessuno dei due fa niente di memorabile.

Questo significa che **la barra da superare in Italia è molto più bassa di
quella internazionale**, e che il nostro vantaggio (editor self-serve,
istantaneo, senza registrazione) è reale ma è argomento di `marketing`, non
mio.

### Le quattro idee, e perché in quest'ordine

1. **Busta indirizzata all'ospite** (`?a=Nome` nel link) — *raccomandata*.
2. **Sigillo che si rompe sotto il dito + foley** (non musica: cera, carta).
3. **Un link, tre vite** (l'invito cambia prima/il giorno/dopo).
4. **La materia oltre la busta** (grana continua, velo, bordo dorato).

**Perché ho raccomandato la 1 e non la 2**, che è più spettacolare: la 2
premia chi ha *già* aperto. La 1 agisce **nell'anteprima WhatsApp**, cioè prima
dell'apertura, che è l'unico punto dove perdiamo persone senza accorgercene.
Ed è l'unica che sposta un *numero* (aperture, abbandoni sul modulo) invece di
un'impressione. Se fra sei mesi qualcuno mi chiede perché non ho messo prima
l'effetto più bello: perché l'effetto più bello non serve a chi non ha aperto.

**Perché la 3 non è la prima pur essendo la più importante a sei mesi**: rompe
la garanzia «chi crea vede quello che vedrà chi riceve» finché l'editor non ha
un selettore di stato. Quel selettore è metà del costo e **non è tagliabile** —
se qualcuno prova a spedire la 3 senza, ha rotto il principio fondante del
prodotto per un effetto.

### Scartato, e perché (leggere prima di riproporre)

- **Vibrazione/haptics alla rottura del sigillo.** È la conclusione naturale
  dell'idea 2 e sembra ovvia. **Su iPhone non esiste**: WebKit non espone
  `navigator.vibrate`, supporto globale ~77% con il buco esattamente dove sta
  il pubblico di fascia alta. Le librerie che «sbloccano» le haptics su iOS
  Safari sono trucchi non ufficiali. → Il feedback resta visivo + sonoro.
  **Scartata definitivamente, non riproporre finché WebKit non cambia idea.**
- **Guestbook / muro dei messaggi degli ospiti sull'invito.** Bella (social
  proof + partecipazione), ma: la fa già Il Nostro Sì a €95 e Partiful gratis
  (quindi non distingue), richiede moderazione, e soprattutto **fa cadere il
  progetto dentro il blocco GDPR già registrato** (messaggi con nomi di
  persone, conservati). Rimandata, non bocciata: ha senso *dopo* l'informativa,
  come parte della «terza vita» dell'idea 3.
- **Elenco ospiti salvato nel database** (per generare i link personalizzati).
  Scartato **per la v1 apposta**: appena salviamo i nomi, entriamo nel blocco
  legale del REGISTRO e l'idea 1 non si può spedire. La versione «povera» —
  un campo nell'editor che genera i link e li dimentica al refresh — è
  volutamente povera per poter uscire subito.
- **Catalogo di template (30–40 come i concorrenti).** Non è una gara che
  possiamo vincere e non è la gara giusta: due temi × due palette fatti
  benissimo battono quaranta template mediocri, perché il valore percepito non
  sta nella *scelta* ma nella qualità di quello che scegli.
- **Page flip / «libro che si sfoglia».** Costoso, fragile su touch, e legge
  come un PDF sfogliabile del 2011 — l'opposto del posizionamento.
- **Dark mode automatico sull'invito.** Gli sposi hanno scelto una palette; il
  telefono dell'invitato non ha voce in capitolo. (Homepage ed editor sono
  un'altra questione, lì ha senso.)
- **Terzo asse oltre tema × palette** (una «mano»/materiale come dimensione
  separata). Tentato mentalmente e scartato: due assi già danno 4 combinazioni
  da verificare, un terzo ne darebbe 8+ e ogni idea andrebbe provata su tutte.
  Il costo di verifica cresce più del valore.
- **Scroll-jacking / parallasse.** Rompe l'inerzia nativa dello scroll su
  mobile. L'utente non pensa «che bello», pensa «è rotto».

### Trappole trovate leggendo il codice (verificate, non dedotte)

- **La grana della carta esiste solo dentro il sipario.** `grana.svg` è
  referenziata in due punti soli di `blocchi.css` (righe 472 e 631: corpo busta
  e lettera). Nel momento in cui l'ospite apre — cioè quando finalmente guarda
  il contenuto — la materia sparisce e l'invito torna a essere una pagina web.
  È l'osservazione che ha generato l'idea 4, ed è il tipo di cosa che non si
  vede in uno screenshot.
- **Il commento di `Sipario.tsx` (righe 17-18) è falso.** Dice «lo usano sia la
  pagina invitato sia l'editor»; `Tela.tsx` non importa `Sipario` affatto. Il
  codice è giusto (l'editor mostra la busta in linea), la documentazione no.
  Segnalato a `frontend`.
- **`node_modules` non installato** in `frontend/` → non ho potuto verificare
  contro i doc locali di Next 16.3.2 come chiede `frontend/AGENTS.md`. Le
  domande su `searchParams` sono aperte, non risolte.
- Cose **già a posto**, da non «migliorare» per sbaglio: `tabular-nums` sul
  countdown (`blocchi.css:139`), tasto musica `position: fixed`
  (`guscio.css:6`), musica che parte sul gesto di apertura e non in autoplay.

### Numeri e fonti che voglio ricordare

- **Busta indirizzata a mano: ~99% di aperture contro il 15–21% della posta
  stampata; +37% di risposte** (DMA). → È il dato che regge l'idea 1, e il
  motivo per cui il nome sulla busta non è decoro ma conversione.
- **Autoplay audio: 92,3% lo trova fastidioso, 76% lo zittisce subito.** → La
  musica resta agganciata al gesto di apertura. Non negoziabile.
- **Cartaceo di lusso 2026**: strati traslucidi su opachi «per costruire
  suspense e mistero visivo»; ritorno alla sobrietà (meno decorazione, più
  qualità del materiale). → Conferma che il ramo asimmetrico e i due temi
  attuali sono nella direzione giusta; il velo è l'evoluzione naturale.
- **Animazioni guidate dallo scroll: NON Baseline** a metà 2026 (~84%; Safari
  26+ ok, Firefox stabile ancora dietro flag). → Qualunque idea che le usi
  deve degradare, non presupporle.
- **Partiful**: ha vinto **non essendo più bello**, ma rendendo l'invito un
  oggetto sociale che partecipa alla festa (boops, commenti, album). È il
  principio dietro le idee 1 e 3, ed è la lezione da non dimenticare: la
  differenziazione non è sempre estetica.

URL completi in `../design-direzione.md` §6.

### Domande lasciate aperte (non ancora scritte in DOMANDE.md)

Elencate nel report finale al coordinamento — altri tre agenti giravano in
parallelo e non potevo toccare `DOMANDE.md`. **Al prossimo incarico: verificare
che siano state trascritte, e se `frontend` ha risposto.** Le tre che contano:
`searchParams` in `generateMetadata` di Next 16 senza rompere la cache;
fattibilità del press-and-hold sul sigillo su iOS reale; costo del selettore di
stato nell'editor per l'idea 3.

---

## 2026-08-23 — Incarico 2: rispiegare le idee 3 e 4, progettare l'anteprima

Consegna in `../design-direzione.md` **Parte II** (§7–§10).
Versione visiva per Andrei (mockup veri, non descrizioni):
https://claude.ai/code/artifact/2453138f-5e43-4f59-bfe0-d2de53548e83

### La lezione principale, da non ridimenticare

**Andrei non ha capito le idee 3 e 4 perché le avevo scritte per metafore.**
«Un link, tre vite» e «la materia oltre la busta» non dicono *cosa si vede sullo
schermo*. Riscritte con un esempio letterale (una data vera, un'ora vera, cosa
compare in cima) sono diventate immediatamente discutibili — e due pezzi si sono
rivelati da buttare, cosa che la metafora nascondeva.

**Regola per me: ogni idea va accompagnata da «cosa vede l'utente, in che
momento, in che ordine dall'alto». Se non riesco a scriverlo, non ho un'idea,
ho un'atmosfera.** E per un'idea *visiva*, la risposta a «spiegati meglio» è un
mockup, non un altro paragrafo.

### Decisioni prese (e perché)

1. **Idea 3 ridotta a una fetta sola: «il programma sa che ora è».**
   Il motivo per cui *questa* fetta si può spedire e il resto no non è il costo:
   è che **non rompe la garanzia** «chi crea vede quello che vedrà chi riceve».
   Nell'editor la voce non si accende perché non è il giorno giusto — stesso
   componente, stessa logica, data diversa. Nessun selettore di stato.
   Il resto (riordino blocchi, chiusura RSVP, ringraziamento) richiede il
   selettore, il fuso e una pagina che cambia con l'orologio → rimandato dopo
   Stripe. **Se qualcuno riapre l'idea 3 intera: il collo di bottiglia è il
   selettore nell'editor, non l'animazione.**

2. **Idea 4 ridotta a tre CSS: grana continua, taglio dorato, bordo strappato.**
   Il bordo strappato (*deckle edge*) sul fondo dell'hero è il pezzo che ho
   aggiunto in questo giro: è il segno con cui in cartoleria si riconosce la
   carta cara, si fa con `mask`/`clip-path` (tecnica già in casa, `temi.css:112`),
   e non ce l'ha nessun concorrente.

3. **Anteprima: bozza di stampa, non filigrana.** Paperless Post e Greenvelope
   **non segnano affatto** l'anteprima: la mandano pulita e fanno pagare
   l'*invio*. Non li copiamo del tutto (senza segno l'anteprima *è* il prodotto),
   ma il segno prende la forma della **fascetta del tipografo** — un oggetto che
   nessuno confonde col finito e che nessuno giudica brutto.
   **Regola generata: i segni stanno sull'imballaggio, mai sul contenuto.**

4. **Durata dell'anteprima e segno sono UNA decisione.** 72 ore sono sicure solo
   perché la fascetta è riconoscibile anche da chi riceve. Se un giorno si toglie
   la fascetta, i 10 minuti tornano necessari. Non separare le due cose.

### Scartato in questo giro (leggere prima di riproporre)

- **Il «velo» di carta velina** — l'avevo proposto io nella Parte I, lo ritiro
  io. Tre motivi cumulativi: `backdrop-filter` caro su fascia media; le
  alternative richiedono animazioni da scroll (non Baseline, ~84%) o un
  `IntersectionObserver` che nel progetto non esiste; e soprattutto **è un
  secondo colpo di scena a due secondi dal primo**, contro la mia stessa regola
  («il disvelamento sta in un punto solo»). **Non riproporre.**
- **Filigrana in diagonale sull'anteprima.** Rovina l'unica cosa che vendiamo
  nel momento esatto in cui chiediamo 69 €. E verrebbe fotografata.
- **Countdown di scadenza visibile sull'anteprima** («scade fra 4 minuti»).
  L'ansia non fa comprare un oggetto sentimentale: fa chiudere la scheda.
- **Sfocare/coprire parte dell'invito** (paywall che sfuma il testo). Qui il
  contenuto è *dell'utente*: nasconderglielo è ostile, non persuasivo.
- **Distinguere il creatore dall'ospite sulla pagina `/i/{token}`** per mostrare
  il prezzo solo a lui. Tecnicamente si potrebbe (il cookie c'è), ma
  `invitoPubblico` **non inoltra i cookie** (`api-server.ts:38-40`) e farlo
  renderebbe la risposta dipendente dalla sessione = problema di cache aperto
  per un guadagno minimo. Il prezzo sta nell'editor, punto.
- **Grigiare il modulo disattivato** (il default del browser). Grigio legge
  «rotto», e «rotto» è l'unica impressione che non ci possiamo permettere.

### Trappole trovate (verificate nel codice, non dedotte)

- **`Interattivi.tsx:261`** — `const anteprima = Boolean(token) && puoRispondere === false;`
  Quando è vero **sostituisce l'intero modulo** con una frase. Non è
  disabilitato: non è in pagina. È la riga che risponde alla domanda di Andrei
  «perché l'anteprima non mostra l'RSVP».
- **Le due superfici oggi fanno l'opposto**: nell'editor (`Tela.tsx:192`, nessun
  `token`, nessun `puoRispondere`) il modulo si disegna **intero** col solo
  tasto spento; sul link di anteprima **sparisce**. Vanno riportate alla stessa.
- **I campi condizionali non si vedrebbero mai in anteprima**:
  «Chi viene» e «Intolleranze» compaiono solo con `presente === true`
  (`Interattivi.tsx:345,356`), e in anteprima nessuno può scegliere. Cioè
  l'utente non vedrebbe proprio le parti che ha configurato. → in anteprima il
  modulo va mostrato **già su «Sì»**.
- **`.bottone:disabled { opacity: 0.55 }`** (`blocchi.css:355`) va neutralizzato
  dentro l'anteprima, o il tasto d'invio si presenta come guasto. E su Safari
  serve **`-webkit-text-fill-color`**: `color` da solo non toglie lo sbiadimento
  degli input disabilitati.
- **`Countdown` è il precedente da copiare** per «il programma sa che ora è»
  (`Interattivi.tsx:22-66`): server → trattini, `useEffect` → valori veri. Zero
  hydration mismatch, zero impatto cache. `Programma` invece è oggi
  presentazionale (`Presentazionali.tsx:81`) → va reso client. È l'unico costo
  strutturale della fetta.
- **`Programma.voci[].ora` è testo libero**, non un campo orario. Il degrado
  («non si accende niente») è una scelta, non un ripiego.
- **`FronteBusta` (`CartaBusta.tsx:53`) ha già `.busta__indirizzo`** — è il posto
  giusto sia per il nome dell'ospite (idea 1, approvata) sia per la fascetta.
  Ed è l'unico punto dove la busta si disegna: una prop, due superfici.

### Numeri misurati (calcolati, non stimati)

Contrasto sui valori reali di `temi.css`, soglia AA 4,5. **`--accento` e
`--primario-chiaro` passano su `--fondo` e `--carta`, NON su `--fondo-alt`**:

| | oliva | blu |
|---|---|---|
| `--accento` su `--fondo` | 4,52 | 4,53 |
| `--accento` su `--fondo-alt` | **4,13** | **4,18** |
| `--primario-chiaro` su `--fondo-alt` | **4,20** | **4,21** |
| `--testo-tenue` su `--fondo-alt` | 4,60 | 5,36 |
| `--primario` su `--fondo-alt` | 5,49 | 10,33 |

Conta perché **`.rsvp` è l'unica sezione su `--fondo-alt`** (`blocchi.css:297`),
cioè il blocco che stiamo riprogettando: la scritta «bozza» in oro sarebbe stata
sotto soglia. Oggi non è rotto niente (controllato: `.programma__ora:193`,
`.luogo__ora:211`, `.luogo__etichetta:209`, `.nota h3:290` stanno tutti su
`--fondo`/`--carta`), ma **il margine su `--fondo` è di 0,02**: chi schiarirà
l'oro «solo un po'» romperà l'accessibilità senza vedere differenza a schermo.
Script di calcolo: rifarlo con la formula WCAG sui valori di `temi.css`, non
fidarsi di questa tabella se i token cambiano.

### Fonti nuove di questo giro

- https://paperlesspost.zendesk.com/hc/en-us/articles/4410084225179-Previewing-Your-Card-or-Flyer
  — Paperless Post: anteprima **pulita**, «Email me a test / Text me a test»,
  nessun segno; si paga l'invio.
- https://www.greenvelope.com/faq — Greenvelope: preview completa (busta,
  RSVP, musica), illimitata, inviabile anche al partner. Nessun watermark.
  → Conferma che il nostro vantaggio non è il watermark ma **l'onestà
  tipografica**: la bozza come oggetto.

### Da verificare al prossimo giro

- Playwright resta assente (REGISTRO, `frontend`): **la verifica visiva è ancora
  impossibile**. Ho compensato misurando i colori, ma il bordo strappato e la
  fascetta andranno guardati su un telefono vero prima di dichiararli fatti.
- Le tre domande della Parte I a `frontend` (searchParams in `generateMetadata`,
  press-and-hold su iOS, costo del selettore di stato) sono ancora **senza
  risposta** in `DOMANDE.md`. La terza è ora meno urgente: la fetta dell'idea 3
  che ho scelto non ha bisogno del selettore.
- Restano **senza risposta mia** due domande di `marketing`: dove sta la landing
  pubblica, e dove va la firma «Creato con Inviti» senza rovinare l'invito.
  **La seconda si incrocia col lavoro di questo giro**: il piede dell'anteprima
  non pagata è il posto naturale per la firma, ed è gratis lì perché quella
  pagina non è di un cliente pagante. Da chiudere al prossimo incarico.

---

## 2026-08-24 — Incarico 3: la landing pubblica

Consegna: `../design-landing.md` (implementabile leggendola, §3 e §4 hanno i
dettagli non opzionali). Chiude le due domande di `marketing` rimaste aperte
alla fine dell'incarico 2: dove sta la landing, e dove va la firma.

### Le decisioni, col perché

1. **Landing su host pubblico, non su percorso.** `beta.andreievictoria.it` ha
   `basic_auth` su *ogni* percorso (domanda 12 di `DOMANDE-PER-ANDREI.md`):
   una landing lì dentro è invisibile ai motori e Meta non approva l'inserzione
   → i 30 € restano non spendibili. Va su `andreievictoria.it`, che ha già DNS
   pubblico e Let's Encrypt perché ci passa il webhook Stripe.
2. **`app/page.tsx` non è una home, è un bootstrap** (verificato: `useEffect` →
   `/api/eventi` → `router.replace('/e/{id}')`). Chi arriva da una pubblicità
   finirebbe dentro un editor desktop, su un telefono, con un invito vuoto.
   Resta e diventa `/crea`. La landing è nuova, statica, senza sessione.
3. **Regola della pagina: non descrive il prodotto, lo fa usare.** Sui testi di
   servizio i concorrenti italiani ci battono (sono artigiani con un umano
   dietro, incarico 1); sul «provalo adesso senza registrarti» no. Da qui il
   divieto di screenshot e mockup: quello che sembra un invito è disegnato da
   `FronteBusta`/`ListaBlocchi`. Rispetta gratis «un solo renderer».
4. **Hero = idea 1 applicata alla landing.** Campo «scrivi il nome di chi vuoi
   invitare» → il nome va su `.busta__indirizzo` e **`iniziali()`
   (`CartaBusta.tsx:4`) ricalcola il monogramma del sigillo sotto il dito**:
   è quel dettaglio, non una riga di testo, a dire «si personalizza». Il nome
   sta in `useState`, mai nel database → vincolo GDPR rispettato senza
   discussioni. Costo basso: i componenti prendono già le prop giuste.
5. **Firma «Creato con Inviti» → piede dell'anteprima non pagata**, mai
   sull'invito di chi ha pagato, e sulla landing non serve. Coerente con la
   regola dell'incarico 2: i segni stanno sull'imballaggio, mai sul contenuto.

### Scartato in questo giro

- **Video dell'apertura in autoplay nell'hero.** Se abbiamo la cosa vera che
  l'utente può *fare*, il filmato è un downgrade. E pesa su mobile.
- **Modulo email per la lista d'attesa.** Raccogliere indirizzi riapre il blocco
  GDPR per una lista che non sappiamo ancora usare → `wa.me` di Andrei, il
  contatto resta nel suo telefono e noi non conserviamo niente.
- **Landing come `/` dell'app.** Sembra più semplice, ma trascina cookie e
  chiamate API in una pagina che deve essere statica, e mette la pubblicità
  dentro l'host protetto da password.
- **Carosello di template, contatore «X inviti creati», parallasse.** Il primo
  è la gara che non possiamo vincere; il secondo è un numero che non abbiamo e
  che se basso fa danno; il terzo rompe l'inerzia dello scroll (già scartato).
- **Richiudere la busta dopo l'apertura.** Secondo colpo di scena a due secondi
  dal primo: contro la regola «il disvelamento sta in un punto solo».

### Da verificare al prossimo giro

- `backend`: il vhost pubblico senza `basic_auth` esiste e non ha toccato il
  webhook Stripe?
- `frontend`: ha letto §4? Senza neutralizzare `.bottone:disabled`
  (`blocchi.css:355`) e senza `-webkit-text-fill-color` su Safari, l'RSVP di
  esempio si presenta **come guasto** proprio nella sezione che deve convincere.
- La CTA verso il 401 è il rischio residuo: se qualcuno spedisce la landing con
  «Crea il tuo invito» che porta alla richiesta di password, abbiamo pagato dei
  clic per mostrare un muro.

### Seguito dell'incarico 3 — testi consegnati a `frontend`

`../design-landing-testi.md`: sette sezioni, copy definitivo, invito d'esempio
campo per campo. Tre decisioni nuove rispetto alla spec del mattino:

- **Il campo del nome sta appena sotto la piega, non dentro.** Nella prima
  schermata ci stanno firma, titolo, sottotitolo e la busta chiusa e ferma. Se
  ci infilo anche il campo, la busta si schiaccia e diventa un'icona: si perde
  esattamente la cosa che dovrebbe colpire. Prima l'oggetto, poi la scoperta
  che si può toccare.
- **`galleria` e `musica` fuori dall'esempio.** Vogliono un `asset_id` caricato
  e sull'host pubblico non ne abbiamo. È un buco di *materiale* (servono 3 foto
  con diritto d'uso), non di codice: non farlo risolvere a frontend inventando.
- **Niente link «Privacy»/«Termini» finché le pagine non esistono.** Un link al
  vuoto è peggio dell'assenza, e lì siamo già scoperti.

**Rischio intercettato (vale come regola, non come nota):** la landing sulla
rotta `/benvenuto` dello stesso container `web` è giusta e costa zero, ma se
l'apex serve quel container **senza `basic_auth`** allora
`andreievictoria.it/e/{id}` e `/i/{token}` diventano pubblici: **la password
della beta salta per via di un cambio fatto per la landing.** Sull'apex passano
solo `/benvenuto`, gli asset statici e il webhook; tutto il resto → redirect a
`beta.`. Se qualcuno in futuro «semplifica» quel vhost, riapre il buco.
