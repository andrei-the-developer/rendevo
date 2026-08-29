# Landing — sequenza, testi veri, sopra la piega

`[design]` · 2026-08-24 · risponde a `frontend` («mandami la sequenza: quante
sezioni, in che ordine, headline e testi veri, e cosa si vede sopra la piega»).

Il *perché* di ogni scelta sta in `design-landing.md`. Qui c'è solo il
materiale da montare. **I testi fra virgolette sono definitivi: si copiano così
come sono.** Dove serve una decisione di Andrei l'ho segnato `⟨DA DECIDERE⟩` e
ho messo il ripiego da usare intanto.

Rotta: `/benvenuto`, come proposto da `frontend`. Il vincolo dell'host resta
(vedi §8 in fondo: se l'apex serve tutta l'app senza password, la beta non è
più protetta).

---

## Sopra la piega — cosa si vede nei primi due secondi

Su un telefono a 390×844, **senza scorrere**, ci sta esattamente questo e
nient'altro:

1. In alto a sinistra, piccola, la parola **`Inviti`** — carattere del titolo,
   colore `--primario`. Non è un logo, non è una barra: è una firma.
   **Nessun menu, nessuna voce di navigazione, nessun bottone in alto a destra.**
2. Titolo, due righe, allineato a sinistra sul gutter:

   > **Gli inviti che si aprono.**

3. Sottotitolo, tre righe al massimo, `--testo-tenue`:

   > «Inviti digitali per matrimoni, compleanni e feste. Si aprono come una
   > busta vera, si mandano su WhatsApp, si preparano in due minuti.»

4. **La busta chiusa**, centrata, che occupa il resto dell'altezza: sigillo di
   cera, monogramma, grana della carta. Ferma. Non fluttua, non pulsa, non ha
   una freccia animata sotto.
5. Sul fronte della busta, dove sta `.busta__indirizzo`: **«Per te»**.

Il campo di testo **sta appena sotto la piega** ed è la prima cosa che si
incontra scorrendo di un dito. È voluto: chi arriva vede prima l'oggetto, poi
scopre che può toccarlo. Se lo mettiamo dentro la piega, la busta si schiaccia
e diventa un'icona.

Ordine di comparsa (una dissolvenza sola, 400 ms, `prefers-reduced-motion`
la salta): firma e titolo insieme, poi la busta. **Il sigillo entra per ultimo,
150 ms dopo**, con una scala da 0.9 a 1. È l'unico movimento della pagina prima
del gesto dell'utente.

---

## Le sezioni, in ordine

Sette, contando l'hero e il piede. Chi le conta in un altro modo ne ha
aggiunta una: non aggiungerne.

### 1 · Hero interattivo

Quanto sopra, più il pezzo che sta appena sotto la piega:

- Etichetta del campo (visibile, non `placeholder`):
  > «Scrivi il nome di chi vuoi invitare»
- `placeholder` dentro il campo: `Anna`
- Bottone: **«Apri»**
- Sotto, riga piccola, `--testo-tenue`:
  > «Non serve registrarsi. Non salviamo niente.»

Comportamento: mentre si digita, il nome compare su `.busta__indirizzo` e
`iniziali()` ricalcola il monogramma sul sigillo. Al clic parte `Sipario`. Campo
vuoto → la busta dice «Per te» e si apre lo stesso.

Se il nome supera i 22 caratteri, la busta lo rimpicciolisce (non lo taglia).
Chi scrive «Famiglia Bertoldi e i suoi meravigliosi ospiti» sta provando a
romperlo: deve vedere che regge.

### 2 · L'invito d'esempio

Parte dietro la busta aperta e continua scorrendo. È un `Evento` costante
passato a `ListaBlocchi`. Blocchi, in quest'ordine: `hero`, `testo`,
`countdown`, `programma`, `luogo`, `nota`, `rsvp`.

Contenuto dell'esempio (definitivo, si copia):

- **hero** — occhiello «Ci sposiamo», titolo «Giulia & Marco»,
  sottotitolo «Vi aspettiamo», data `2027-06-12`, ora `16:30`,
  luogo «Villa Le Rondini, Fiesole»
- **testo** — titolo «Un giorno che vogliamo passare con voi», corpo:
  > «Dopo dieci anni, tre traslochi e un gatto, abbiamo deciso di farlo
  > davvero. Ci farebbe piacere avervi lì: senza cravatte obbligatorie e
  > senza discorsi lunghi.»
- **countdown** — stessa data e ora dell'hero,
  testo_finito «È oggi. Ci vediamo tra poco.»
- **programma** — titolo «Il programma»; voci:
  `16:30` «Cerimonia» — «In giardino, se non piove»;
  `18:00` «Aperitivo» — «Sulla terrazza»;
  `20:00` «Cena» — «Ai tavoli, il vostro nome è sul segnaposto»;
  `23:00` «Si balla»
- **luogo** — etichetta «Dove», nome «Villa Le Rondini»,
  indirizzo «Via Bolognese Vecchia 224, Fiesole (FI)», ora «16:30»
- **nota** — titolo «Una cosa sola», corpo:
  > «Il regalo più bello è che ci siate. Se proprio insistete, ne parliamo
  > di persona.»
- **rsvp** — titolo «Ci sarete?», scadenza `2027-05-01`,
  chiedi_ospiti `true`, chiedi_note `true`,
  etichetta_si «Ci saremo», etichetta_no «Non riusciamo»

**`galleria` e `musica` restano fuori dall'esempio**, e non è una dimenticanza:
vogliono un `asset_id` caricato, che sull'host pubblico non abbiamo. Se le
vogliamo servono tre foto vere di cui abbiamo il diritto d'uso — è un buco di
materiale, non di codice, e per ora la landing regge benissimo senza.

**Le annotazioni in margine.** Testo piccolo, `--testo-tenue`, allineato al
gutter, **fuori dalla carta dell'invito** — mai sopra. Su mobile stanno sopra il
blocco a cui si riferiscono, su desktop nel margine sinistro. Sono quattro,
non una per blocco:

- accanto al **countdown**: «Si aggiorna da solo, anche fra sei mesi.»
- accanto al **programma**: «La voce in corso si accende il giorno della festa.»
- accanto al **luogo**: «Il tasto apre le mappe del telefono di chi legge.»
- accanto all'**rsvp**: «Rispondono da qui. Tu leggi le risposte, senza fogli
  di calcolo.»

L'RSVP d'esempio va disegnato **già su «Sì»** (o i campi condizionali non si
vedono mai) e il tasto d'invio non deve sembrare guasto: dettagli in
`design-landing.md` §4. Sotto il tasto, riga piccola:
> «In questa pagina è solo un esempio: non parte nessuna risposta.»

### 3 · Il cambio d'abito

Subito dopo l'esempio, senza stacco di sfondo. Titolo di sezione:

> **Lo stesso invito, un'altra veste.**

Sotto, una riga:
> «Due caratteri, due colori. Si cambia in un tocco, anche dopo averlo mandato.»

Poi quattro pastiglie: `Romantico` · `Essenziale` sulla prima riga (tema),
`Oliva` · `Blu` sulla seconda (palette). Al tocco cambiano `data-tema` e
`data-palette` sul contenitore dell'esempio, che **si ricolora sul posto**.
Nessun ricaricamento, nessuna animazione oltre alla transizione dei colori.

⟨DA DECIDERE⟩ i nomi visibili dei due temi: uso «Romantico» ed «Essenziale»
perché sono i nomi già in casa. Se marketing ne vuole altri, si cambiano qui e
basta — non sono nel codice dei token.

### 4 · Come si fa

Titolo:
> **Tre minuti, tre passi.**

Tre righe numerate, una frase ciascuna, niente icone:

1. «Scrivi i vostri nomi, la data e il posto. Il resto c'è già.»
2. «Guardi come viene, e lo cambi finché ti piace.»
3. «Copi il link e lo mandi su WhatsApp. Chi lo riceve apre la busta.»

Sotto, riga piccola:
> «Chi lo prepara sta al computer. Chi lo riceve lo apre dal telefono.»

Quell'ultima riga non è un dettaglio tecnico messo lì per onestà: è il vincolo
dell'editor desktop (REGISTRO), detto prima che qualcuno lo scopra provando.

### 5 · Quanto costa

Titolo:
> **69 €, una volta.**

Sotto, tre righe corte:
> «Un invito, tutti gli ospiti che vuoi, nessun abbonamento.»
> «Il link resta vivo fino al giorno dopo la festa.»
> «Lo prepari e lo guardi gratis: si paga solo quando lo mandi.»

Niente tabella, niente confronto con i concorrenti, niente prezzo barrato.

### 6 · L'invito a entrare

Una riga sola, grande:
> **Provalo con i vostri nomi.**

Bottone: **«Crea il tuo invito»**.

⟨DA DECIDERE⟩ **dove porta.** Finché l'editor è dietro la password, non può
portare al 401: sarebbe un clic pagato per mostrare un muro. Ripiego da usare
intanto, e la mia raccomandazione: il bottone diventa **«Chiedi l'accesso alla
beta»** e apre un link `wa.me`. Non un modulo email — raccogliere indirizzi
riapre il blocco GDPR per una lista che non sappiamo ancora usare.
Serve il numero da Andrei; se non arriva, il bottone porta a `/` e ci
accontentiamo di non spendere in pubblicità finché non è pubblico.

Sotto il bottone, la **fascetta della bozza** (stesso oggetto tipografico
dell'anteprima) con dentro:
> «Siamo in prova. Stiamo facendo entrare le prime persone.»

### 7 · Piede

Tre righe piccole, `--testo-tenue`, su `--fondo-alt`:

- «Inviti — inviti digitali fatti in Italia.»
- ⟨DA DECIDERE⟩ contatto: la stessa cosa del bottone (`wa.me` o email).
- Spazio per «Privacy» e «Termini» **quando esisteranno**. Finché non ci sono,
  **non mettere i link**: un «Privacy» che porta a una pagina vuota è peggio
  di niente, e su questo tema siamo già scoperti.

Nessuna icona social: non abbiamo profili attivi da linkare.

---

## Cosa non va nella pagina

Detto qui perché in una landing arriva sempre da qualche parte:
niente barra di navigazione, niente pop-up dei cookie che non ci serve (la
landing non ne mette), niente chat in basso a destra, niente «scorri»
lampeggiante, niente testimonianze inventate, niente loghi di «come visto su»,
niente contatore di inviti creati, niente video in autoplay.

---

## 8 · L'avvertimento sull'host (per `backend`, quando risponde)

Sì all'apex `andreievictoria.it` sullo stesso container `web`, **ma non
esporre l'app intera lì sopra.** Se l'apex serve il container senza
`basic_auth`, allora `andreievictoria.it/e/{id}` e `andreievictoria.it/i/{token}`
diventano raggiungibili **senza password**: la protezione della beta salta, e
salta per via di un cambio fatto per la landing.

Quello che serve: sull'apex passano **solo** `/benvenuto`, gli asset statici
(`/_next/*`, `/ornamenti/*`, favicon) e il percorso del webhook Stripe che è già
lì. Tutto il resto sull'apex → redirect a `beta.andreievictoria.it`, che chiede
la password come oggi. `beta` resta com'è, non si tocca.

---

## 9 · Fusione con `marketing-landing-testi.md` (2026-08-24, sera)

`marketing` ha consegnato il suo deck lo stesso giorno. **Due documenti che si
dichiarano definitivi sono peggio di nessuno**: questa sezione dice quale vince
dove, e va letta prima di montare.

**Regola della fusione: le parole sono di `marketing`, la sequenza e il
comportamento sono miei.** Dove i due file dicono cose diverse sul *testo*,
vince `marketing-landing-testi.md`. Dove dicono cose diverse su *cosa si vede e
cosa si tocca*, vince questo file.

Quindi, in concreto:

- **Cadono i miei testi** del §2 (headline «Gli inviti che si aprono», il
  sottotitolo, il blocco prezzo, la chiusura): usare quelli di `marketing`.
  Restano miei: l'etichetta del campo, il bottone «Apri», le quattro note in
  margine, i microtesti dell'RSVP d'esempio — non hanno equivalente là.
- **Resta l'hero interattivo**, non la cattura schermo dentro la cornice di
  telefono (motivi sotto).
- **Sei blocchi diventano cinque**: il blocco 4 «cosa riceve chi è invitato»
  esce. È l'elenco a punti di quello che l'esempio scorrevole mostra dal vivo
  dieci centimetri più su: dire due volte la stessa cosa, la seconda peggio.
  Il suo contenuto è già distribuito nelle quattro note in margine.
- **Ordine finale**: hero interattivo · invito d'esempio con le note · cambio
  d'abito · blocco 2 (il costo della carta) · blocco 3 (tre passi) · blocco 5
  (prezzo) · blocco 6 (chiusura + CTA) · piede.
  Prima si prova, poi si argomenta: il blocco 2 dopo la dimostrazione, non prima.

### Perché l'hero resta dal vivo e non diventa un video

1. **Non abbiamo con cosa registrarlo.** Playwright è assente dal progetto
   (a registro): una cattura schermo pulita, in loop, di 15-20 secondi, oggi si
   fa a mano e si rifà a mano a ogni modifica del CSS. La pagina viva si
   aggiorna da sola perché **è** il prodotto.
2. **La cornice di telefono rimpicciolisce l'unica cosa che deve colpire.**
   Dentro un mockup la busta diventa un francobollo, e il sigillo — il dettaglio
   su cui abbiamo lavorato di più — non si legge più.
3. **Un video si guarda, una busta si apre.** Il gesto vale il triplo del
   filmato dello stesso gesto, e qui costa meno.
4. **Rende vero il titolo sulla pagina stessa**: il visitatore scrive un nome e
   lo vede comparire sulla busta. Il video mostrerebbe *un* nome, il nome di
   qualcun altro.

Sul resto del brief di `marketing` non ho obiezioni: apex pubblico, niente
modulo email, `?fonte=` sui link in uscita, i due claim vietati, l'immagine
Open Graph. **L'immagine OG sia un fermo immagine della busta vera** (basta uno
screenshot della nostra stessa pagina), non un'illustrazione.

### Il buco vero: `?a=Nome` non esiste nel codice

`marketing` chiedeva conferma che il nome dell'invitato nella busta funzioni.
**Non funziona: è una decisione presa, non codice scritto.** Verificato oggi —
in `app/i/[token]/page.tsx` non c'è nessun `searchParams`, e `FronteBusta` riceve
solo `titoloFallback={hero?.titolo}` (riga 94), cioè i nomi degli sposi, mai
quello dell'ospite.

Conseguenza, e non è aggirabile: il titolo di `marketing` («…che arriva con il
suo nome sopra») descrive **la pagina**, dove il nome lo scrive il visitatore,
ma non ancora **il prodotto**, dove l'invito che l'ospite riceve non porta il
suo nome. Delle due, una: o `?a=Nome` esce insieme alla landing, o il titolo
non si pubblica.

Il costo è basso — leggere il parametro nella pagina invitato e passarlo a
`FronteBusta`, che ha già `.busta__indirizzo` (`CartaBusta.tsx:76`) — ma resta
aperta la domanda a `frontend` sui `searchParams` in `generateMetadata` di
Next 16 senza rompere la cache, che è ancora senza risposta in `DOMANDE.md`.
