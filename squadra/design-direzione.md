# Direzione visiva — cosa rende *Inviti* memorabile

`[design]` · 2026-08-23 · primo incarico

Andrei ha chiesto **cose eccezionali, che attirano l'attenzione**. Questo
documento non propone di rendere il prodotto più pulito: è già curato. Propone
**quattro cose che il mercato non fa**, con il costo dichiarato, e una
raccomandazione secca.

Tutto quello che segue è compatibile con i vincoli tecnici in fondo. Dove non
sono sicuro della fattibilità, l'ho scritto e ho lasciato la domanda a
`frontend`, non ho tirato a indovinare.

---

## 1. Cosa fa già il mercato (e quindi non ci distingue)

Ho guardato i prodotti veri, non i loro comunicati. Riassunto spietato.

### La busta animata **non è un vantaggio competitivo. È il minimo sindacale.**

Paperless Post ha costruito la propria reputazione sulla busta che si apre — è
*il* loro gesto, dal 2009. Greenvelope idem. La recensione di settore più
onesta che ho trovato la descrive così: *«when a guest opens a Paperless Post
invitation, they see a fairly standard envelope reveal — functional, but not
particularly cinematic»*.

Traduzione operativa: **la nostra busta con sigillo ci porta alla pari, non
avanti.** È fatta bene (il sigillo a bordo liscio con monogramma debossato è
più corretto del loro, che spesso è un francobollo generico), ma un invitato
italiano che ha già ricevuto un invito digitale in vita sua non dirà «questo
non l'ho mai visto». Dirà «ah, come quelli».

**Non buttiamola.** Andiamo oltre: le idee 2 e 4 sotto costruiscono *sopra* la
busta, invece di rifarla.

### Il resto della lista della spesa è saturo

Questi li ha **tutti**, ma proprio tutti, in Italia e fuori:

| Funzione | Chi ce l'ha già |
|---|---|
| RSVP con dashboard risposte | Paperless Post, Greenvelope, WithJoy, Il Nostro Sì, Partecipazioni Link, Nozziamo |
| Countdown | tutti |
| Mappa / Google Maps integrata | tutti |
| Galleria foto | tutti |
| Musica di sottofondo | quasi tutti (e quasi tutti la sbagliano — vedi §4) |
| Condivisione via WhatsApp con un link | è *il* claim di tutto il mercato italiano |
| «Ecologico, niente carta» | è il claim di *tutti*, letteralmente. Ha smesso di significare qualcosa |
| Guestbook / album foto degli ospiti | Il Nostro Sì (€95), Partiful (gratis) |
| QR code per il cartaceo | Il Nostro Sì |
| Template a catalogo | Il Nostro Sì dichiara 37 template + 172 disegni |

Se qualcuno propone una di queste come «l'idea che ci distingue», la risposta è
no: è manutenzione, non differenziazione.

### Dove il mercato italiano è invece debole (e questo ci riguarda)

I due riferimenti italiani principali **non sono prodotti self-serve, sono
servizi artigianali con un modulo davanti.**

- **Il Nostro Sì** (€10 / €65 / €95): mandi i materiali, loro costruiscono il
  sito, *«consegna in pochi giorni»*.
- **Partecipazioni Link** (€12 / €15 / €35–48): scegli il template, compili un
  modulo, ricevi una bozza, paghi, e loro pubblicano. *«Revisioni illimitate
  fino all'approvazione»* — cioè: c'è un umano dall'altra parte.

Noi diamo un editor che risponde **adesso**, senza registrazione. Questo è un
vantaggio reale, ma è un vantaggio di *prodotto* — è terreno di `marketing`,
non mio. **Nessuno di questi due, però, fa qualcosa di visivamente memorabile**:
sono siti-vetrina eleganti e statici. Il tetto estetico del mercato italiano è
basso. È qui che possiamo passare sopra a tutti.

### L'unico che ha fatto qualcosa di davvero nuovo, ha fatto l'opposto di noi

**Partiful** ha conquistato la Gen Z andando nella direzione contraria
all'eleganza: sfondi animati, meme, *«boops»* (reazioni tipo social sugli
RSVP), «sembra più una chat di gruppo che un invito». Vale la pena capirlo bene
perché insegna la lezione giusta: **non ha vinto essendo più bello. Ha vinto
essendo un oggetto sociale invece che un documento.** L'invito partecipava alla
festa.

È il principio che sta dietro alle idee 1 e 3.

---

## 2. Quattro idee forti

Non venti varianti. Quattro, ordinate per rapporto colpo/costo.

---

### Idea 1 — «La busta è indirizzata **a te**»

> Il link che arriva su WhatsApp può portare il nome dell'ospite. La busta non
> dice più «Giulia & Marco»: dice **«Chiara»**, scritto a mano sul fronte, come
> su una busta vera. E l'anteprima di WhatsApp, *prima ancora che qualcuno
> apra*, dice «Chiara, sei invitata».

**Cosa è, in concreto.** Il link permanente resta uno, ma accetta un suffisso
opzionale: `…/i/{token}?a=Chiara`. Chi crea l'invito, nell'editor, ha un
riquadro «Link per un ospite»: scrive un nome (o incolla un elenco), e ottiene
i link già pronti da copiare uno per uno in chat. Chi non lo usa non perde
niente: senza il parametro la busta resta esattamente com'è oggi.

Cosa cambia per l'ospite:
1. **Nell'anteprima WhatsApp** (`og:title`) compare il suo nome. Oggi lì c'è il
   titolo dell'evento, come per chiunque altro.
2. **Sul fronte della busta**, al posto dei nomi degli sposi, c'è il suo — in
   corsivo, leggermente storto, come l'indirizzo scritto a mano. I nomi degli
   sposi si spostano sul risvolto/sul retro, dove stanno anche su una busta di
   carta vera.
3. **Nel modulo RSVP**, il campo «Chi risponde» è già compilato.

**Perché colpisce — il meccanismo, non l'estetica.** Tre effetti sommati:

- **Il proprio nome è l'unico stimolo che buca l'attenzione selettiva**
  (*cocktail-party effect*). In una chat di WhatsApp piena di anteprime tutte
  uguali, l'unica riga che si legge davvero è quella che ti nomina.
- **Un oggetto indirizzato non è un annuncio, è un dovere sociale.** Il
  cartaceo lo sa da sempre: le ricerche sul direct mail misurano che una busta
  **indirizzata a mano** viene aperta dal ~99% dei destinatari contro il 15–21%
  della posta stampata, e alza le risposte di ~37%. Non è magia: una busta
  broadcast la puoi ignorare senza sentirti maleducato, una indirizzata no.
  **Questo è esattamente il problema numero uno dell'invito digitale**: un link
  in chat *sembra* un annuncio, quindi si può rimandare. Il nome lo trasforma
  in una lettera.
- **Effetto secondario, gratis: lo screenshot.** Un invitato che vede il
  proprio nome sulla busta lo fotografa e lo rimanda al partner o al gruppo.
  Nessuno screenshotta una busta con sopra il nome di qualcun altro. È
  distribuzione organica che nasce dal design, non dal marketing.

E un effetto molto concreto sulla conversione: il campo RSVP precompilato
toglie l'unico momento di attrito reale dell'intero flusso — **digitare su una
tastiera mobile.**

**Come si lega ai blocchi.** Non serve un nuovo tipo di blocco né una
migrazione. Il nome è un dato *della richiesta*, non *dell'evento*: la pagina
invitato lo legge da `searchParams` e lo passa come prop a `Sipario` →
`FronteBusta`, esattamente come già fa con `titoloFallback`. `Blocco.tsx` e
`ListaBlocchi.tsx` non si toccano. Il renderer resta uno solo: nell'editor la
prop semplicemente non arriva, e la busta si comporta come oggi.

**Costo: basso sul rendering, medio sull'editor.**
- Basso: prop opzionale + due varianti CSS sul fronte busta + prefill del campo
  RSVP. La pagina è già dinamica per token, quindi leggere `searchParams` non
  cambia la strategia di rendering.
- Medio: il pannello «genera i link per gli ospiti» nell'editor è UI nuova.
- **Attenzione GDPR, non aggirabile:** se i nomi restano solo nel link e non li
  salviamo, non abbiamo aggiunto nessun trattamento. **Se aggiungiamo l'elenco
  ospiti nel database, entriamo nel blocco legale già registrato dal
  coordinamento** (punto 2 del REGISTRO). → **La v1 non salva niente.** I nomi
  li tiene chi crea l'invito, nella propria testa o nel proprio telefono. Un
  campo di testo nell'editor che genera i link e li dimentica al refresh è
  volutamente «povero»: è la versione che possiamo spedire *senza aspettare
  l'informativa*.

---

### Idea 2 — «Il sigillo si rompe davvero» (gesto + suono)

> Oggi l'ospite tocca la busta e **guarda** un'animazione di 2,1 secondi.
> Domani l'ospite **preme e tiene premuto sul sigillo**: la cera si crepa sotto
> il dito, progressivamente, e si spezza con uno schiocco quando lascia.

**Cosa è.** Il gesto di apertura passa da *tap → guarda* a *premi → rompi*. Il
progresso della pressione (0→100% in ~600 ms) guida direttamente le crepe nella
cera: una, poi tre, poi la spaccatura. Al rilascio, il lembo si apre da solo e
la lettera esce — la sequenza che abbiamo già.

E il pezzo che nessuno in questo mercato fa: **il suono non è musica, è
foley.** Tre campioni brevissimi, in tutto meno di un secondo: lo scricchiolio
della cera, il fruscio della carta che scorre fuori dalla busta, il tonfo
morbido della lettera che si posa. La musica parte *dopo*, come oggi.

**Perché colpisce.**

- **Ciò che si guadagna vale più di ciò che si riceve.** Un'animazione che
  parte da sola è un video; un'animazione che risponde alla pressione del dito
  è **un oggetto**. È la stessa ragione per cui aprire un regalo è più bello di
  trovarlo aperto. Il costo dell'effetto è di ~600 ms di attesa attiva — e
  l'attesa *attiva* aumenta la percezione di valore, mentre l'attesa passiva la
  distrugge.
- **Il suono è il canale libero.** Tutti i concorrenti competono sul pixel;
  nessuno di quelli che ho guardato usa il suono per raccontare la *materia*.
  Un foley di cera che si spezza è la cosa più economica e più memorabile che
  possiamo aggiungere — e sappiamo già sintetizzare audio senza diritti di
  terzi (`strumenti/genera_brano.py` esiste già ed è stato scritto proprio per
  quello).
- **Ed è il momento giusto per farlo:** il clic di apertura è già il gesto che i
  browser pretendono per sbloccare l'audio. Non stiamo aggiungendo un permesso,
  stiamo usando meglio quello che abbiamo già.

**Come si lega ai blocchi.** Vive interamente dentro `Sipario.tsx` +
`CartaBusta.tsx` + le keyframe già esistenti in `blocchi.css`. Non tocca
`Blocco.tsx`, non tocca `ListaBlocchi.tsx`, non tocca il modello dati. È
l'idea più isolata delle quattro.

**Costo: medio.** L'animazione guidata dal progresso si fa con una custom
property animabile (`@property --crepa`) o interpolando una variabile dal
`pointermove`; non è difficile, è **fiddly**, e va provata su un iPhone vero —
non su un emulatore.

**Tre cose da non sbagliare, o l'idea diventa un danno:**
1. **Deve restare un `<button>`.** Tastiera e screen reader aprono con Invio,
   senza tenere premuto. Il press-and-hold è un *arricchimento* del click, mai
   un sostituto.
2. **Un tap normale deve funzionare lo stesso.** Chi tocca e stacca subito apre
   comunque, con la sequenza di oggi. Il press-and-hold non è scopribile: se è
   l'unico modo di entrare, abbiamo costruito una porta chiusa a chiave.
3. **`prefers-reduced-motion` e audio disattivato per default sotto il primo
   gesto** — il rispetto delle preferenze non è opzionale, è già gestito e non
   va perso.

---

### Idea 3 — «Un solo link, tre vite»

> Lo stesso URL, mandato una volta, **cambia da solo** tre volte: prima
> dell'evento, il giorno dell'evento, dopo. Il giorno del matrimonio l'invito
> non è più un invito: è la mappa, l'orario della prossima cosa che succede, e
> il numero da chiamare se ti perdi.

**Cosa è.** L'ordine e la visibilità dei blocchi diventano funzione di
`adesso`:

- **Prima** — come oggi: busta, hero, countdown, programma, luogo, RSVP.
- **Il giorno stesso** — l'RSVP si chiude («le risposte sono chiuse, ci vediamo
  fra 2 ore»), **luogo e mappa salgono in cima**, e nel programma la voce in
  corso è **evidenziata in tempo reale** («ORA — aperitivo in giardino»), con
  le voci passate attenuate.
- **Dopo** — il countdown sparisce, l'RSVP lascia il posto a un ringraziamento,
  e la galleria diventa il posto dove si guardano le foto.

**Perché colpisce.** Perché **è l'unica delle quattro idee che fa tornare
l'ospite.** Tutti gli altri inviti digitali, compresi i migliori, sono oggetti
a consumo singolo: li apri, rispondi, non li riapri mai più. Un invito che il
giorno del matrimonio diventa **utile** viene riaperto da ogni ospite, più
volte, proprio nel giorno di massima concentrazione sociale — cioè quando
duecento persone sono nello stesso posto e si scambiano informazioni. È lo
stesso motivo per cui Partiful ha vinto: l'invito **partecipa all'evento**
invece di annunciarlo.

Ed è la cosa più raccontabile che abbiamo: *«l'invito che il giorno del
matrimonio diventa la mappa»* è una frase che si ripete a voce. «Busta animata»
no.

Il pezzo singolo più forte, e di gran lunga il più economico, è **la voce del
programma evidenziata in tempo reale**. Da sola vale metà dell'idea.

**Come si lega ai blocchi.** Elegantemente, ed è il motivo per cui la propongo:
**non serve un renderer diverso, serve un array diverso.** `ListaBlocchi` riceve
già una lista ordinata; qui la lista viene derivata sul server da quella
salvata, in base alla data dell'evento. Zero nuovi tipi di blocco, zero
componenti nuovi (tranne l'evidenza sulla voce di programma, che è una classe).

**Costo: medio-alto.** Non per la resa — per tre problemi veri:

1. **Rompe la garanzia «chi crea vede quello che vedrà chi riceve».** Se
   l'invito ha tre stati e l'editor ne mostra uno, la promessa salta. →
   **L'editor deve avere un selettore di stato** («Prima · Il giorno · Dopo»),
   che rende `ListaBlocchi` la stessa e cambia solo l'input. Questo è metà del
   costo, e non è tagliabile.
2. **Il fuso e l'ora.** Lo stato lo decide il server (SSR), l'ospite può essere
   altrove. Per «prima/dopo» è irrilevante; per «adesso: aperitivo» no.
3. **La cache.** Una pagina il cui contenuto cambia con l'orologio non può
   essere cachata come una statica. → domanda per `frontend`.

**Nota onesta:** questa è l'idea con il ritorno più alto e il rischio più alto.
Non è quella da costruire questa settimana. È quella da mettere nel piano.

---

### Idea 4 — «Il foglio non finisce con la busta»

> **Osservazione verificata nel codice, non dedotta:** la grana della carta
> (`/ornamenti/grana.svg`) è applicata **solo in due punti** — il corpo della
> busta e la lettera dentro il sipario. Nel momento esatto in cui l'ospite apre
> l'invito, cioè quando finalmente guarda il *contenuto*, **la carta sparisce e
> torna a essere una pagina web.**

**Cosa è.** Portare la materia oltre il sipario, con tre dettagli e non con un
tema nuovo:

1. **La grana continua** sul fondo dell'invito, a intensità molto bassa
   (opacità ~0,03–0,05). Non deve *vedersi*: deve togliere quella piattezza da
   `#ffffff` che dice «browser».
2. **Il velo.** Il cartaceo di lusso 2026 sta andando su una cosa precisa:
   sovrapporre **carta velina traslucida su carta opaca**, e i designer la
   descrivono come un modo di *costruire suspense e mistero visivo*. La
   traduzione digitale non è un filtro sfocato: **la prima sezione dopo
   l'apertura si vede attraverso il velo, che scorre via mentre si scorre.**
   Il primo scroll diventa un secondo, piccolo disvelamento, invece che
   l'inizio di una pagina qualunque.
3. **Il bordo dorato.** I fogli di pregio hanno il taglio dorato (*gilded
   edge*): una linea sottilissima di `--accento` sul bordo della lettera. Costa
   una riga di CSS ed è il genere di dettaglio che si nota senza saperlo
   nominare.

**Perché colpisce.** Non colpisce come le altre tre: **fa il lavoro invisibile
di far sembrare caro quello che c'è già.** Il meccanismo è il transfer di
qualità materiale — la mente giudica il *contenuto* in base alla *superficie*
su cui è scritto, e lo fa prima di leggere. Concretamente, è l'idea che alza il
valore percepito **negli screenshot**, che sono il vero canale di
distribuzione di questo prodotto.

E c'è un secondo motivo, tattico: l'anno prossimo qualcuno copierà la nostra
busta (è copiabile). La coerenza materiale di tutta la pagina no: è cento
decisioni piccole, non una feature.

**Come si lega ai blocchi.** Interamente in `temi.css` + `blocchi.css`, su
token nuovi (`--grana-forza`, `--velo`). Il velo si aggancia a
`.blocco-guscio:first-of-type`, **non** a `.sezione` — per il motivo già noto:
nell'editor le sezioni non sono fratelli diretti, i gusci sì.

**Costo: basso.** È l'idea più economica delle quattro. Attenzione a due cose:
il velo con `backdrop-filter` è caro sui telefoni di fascia media (meglio un
gradiente opaco che scorre), e la grana va tarata **su entrambe le palette**:
quello che su avorio `oliva` è invisibile, su `blu` freddo può diventare
sporco.

---

## 3. Raccomandazione secca

**Se Andrei ne costruisce una sola nei prossimi giorni: la 1, la busta
indirizzata.**

Tre ragioni, in ordine di importanza.

1. **È l'unica che agisce prima dell'apertura.** Le altre tre premiano chi ha
   già toccato il link. La 1 lavora **nell'anteprima di WhatsApp**, cioè
   nell'unico punto dove oggi perdiamo persone senza saperlo e dove ogni
   concorrente italiano mostra la stessa identica cosa a tutti. Migliorare
   l'esperienza dopo l'apertura non serve a chi non ha aperto.
2. **È l'unica che sposta un numero, non un'impressione.** Nome sulla busta →
   più aperture; campo precompilato → meno abbandoni sul modulo mobile. Le
   altre tre migliorano il ricordo. Questa migliora il tasso di risposta, che è
   il motivo per cui un invito esiste.
3. **È la meno rischiosa da costruire.** Non tocca il renderer, non tocca lo
   schema, non richiede il database, non richiede l'informativa privacy
   (finché non salviamo i nomi — e nella v1 non li salviamo), non dipende da
   feature CSS di frontiera, e degrada in modo perfetto: senza il parametro,
   il prodotto è quello di oggi.

**Subito dopo, e distanziata:** la 4, perché costa poco ed è il fondo su cui
tutto il resto poggia. La 2 è quella che farà dire «wow» e va costruita quando
c'è tempo per provarla su telefoni veri. La 3 è la più importante per il
prodotto a sei mesi, e va pianificata, non improvvisata.

---

## 4. Cosa NON fare — le trappole di questo settore

Cose che sembrano belle, e che costano conversione, accessibilità o entrambe.

### Musica che parte da sola all'arrivo sulla pagina

**Il 92,3% degli utenti dichiara l'autoplay «fastidioso»; il 76% cerca di
zittirlo immediatamente.** Per screen reader è peggio: l'audio automatico
copre la voce sintetica e rende difficile trovare il comando per fermarlo.

**Qui siamo già a posto e non dobbiamo regredire**: la musica parte
sull'apertura della busta (un gesto dell'utente) e c'è un tasto fisso in basso
a destra per fermarla. Chi in futuro proporrà «facciamola partire subito, così
si sente prima» sta proponendo di peggiorare il prodotto.

### Qualunque cosa che dipenda dalla vibrazione

Sembra la conclusione naturale dell'idea 2 («e quando il sigillo si spezza, il
telefono vibra»). **Su iPhone non esiste**: WebKit non espone `navigator.vibrate`
e non ha intenzione di farlo — supporto globale ~77%, con il buco esattamente
dove sta il nostro pubblico di fascia alta. Le librerie che «sbloccano» le
haptics su iOS Safari sono trucchi non ufficiali che si rompono a ogni
aggiornamento. **Il feedback della rottura del sigillo dev'essere visivo e
sonoro, non tattile.**

### Corsivi e script per il testo di lettura

Il carattere calligrafico è la prima cosa che chiede chiunque parli di inviti.
Va benissimo per **i nomi** — che è dove sta oggi (`--display`) — ed è un
disastro per il corpo del testo: illeggibile a 15 px su un telefono al sole,
e particolarmente penalizzante per chi ha dislessia. **Regola: `--display` per
i nomi e i titoli, mai per un paragrafo.**

### Testo sopra il decoro

`--decoro` e `--ornamento` **non garantiscono 4,5:1**. Sono tinte chiare, nate
per rami e filetti. Ogni volta che qualcuno propone «il titolo in verde
chiaro sopra il ramo», la risposta è no: per il testo esistono
`--primario-chiaro` e `--accento`, che stanno a contrasto. Questa non è una
preferenza, è il limite non negoziabile del mandato.

### Scroll-jacking, parallasse, e «il libro che si sfoglia»

Sono le tre tentazioni classiche degli inviti digitali di fascia alta, e sono
tre modi diversi di rompere lo stesso oggetto: **lo scroll nativo del telefono.**
Su mobile l'inerzia dello scorrimento è muscolare — se la pagina la contende,
l'utente non pensa «che bello», pensa «è rotto». Il *page flip* in più ha il
problema di sembrare un PDF sfogliabile del 2011, che è esattamente l'opposto
del posizionamento.

**Il disvelamento va concentrato in un punto solo** (la busta, più il velo
dell'idea 4), e lo scorrimento va lasciato in pace.

### Il dark mode automatico sull'invito

`prefers-color-scheme` sull'invito **non deve** ribaltare la palette. Gli sposi
hanno scelto un colore; il telefono dell'invitato non ha voce in capitolo. (Su
homepage ed editor la questione è diversa e vale la pena riparlarne.)

### Ombre morbide dappertutto

Il gradiente-di-ombra generoso è la firma visiva del software SaaS. La carta
non ha ombre morbide: ha **un'ombra netta e corta** e un bordo che si vede.
Ogni `box-shadow` diffusa aggiunta «per dare profondità» avvicina l'invito a
una dashboard.

E il promemoria pagato con un bug reale: **`box-shadow` non accetta percentuali
sullo spread**, e un valore invalido in un layer annulla l'intera
dichiarazione, comprese le ombre valide accanto. Sempre `rem`/`px`.

### Il catalogo di template

Il Nostro Sì ne dichiara 37 (+172 grafiche). Non è una gara che possiamo
vincere e non è nemmeno la gara giusta: **due temi × due palette fatti
benissimo battono quaranta template mediocri**, perché il valore percepito non
sta nella scelta, sta nella qualità di quello che scegli. Il giorno in cui
aggiungiamo temi, si aggiungono uno alla volta e finiti — non a lotti.

---

## 5. Vincoli tecnici — verificati nel codice, non ricordati

Ho controllato invece di dedurre. Stato al 2026-08-23:

| Vincolo | Verifica |
|---|---|
| Un solo renderer | ✔ `Blocco.tsx:23` smista, `ListaBlocchi.tsx:46` è l'unica iterazione. Ospite (`app/i/[token]/page.tsx:95`) ed editor (`Tela.tsx:192`) chiamano lo stesso. |
| `.blocco-guscio + .blocco-guscio` | ✔ Ospite: `ListaBlocchi.tsx:59` avvolge in `.blocco-guscio`. Editor: `Tela.tsx:64` avvolge in `.blocco-guscio blocco-modificabile`. **Fratelli in entrambi.** `.sezione + .sezione` no. |
| Token su `[data-tema]` | ✔ `temi.css:66`, applicati su un `<div>` in `page.tsx:93`, non su `body`. |
| Tema × palette indipendenti | ✔ due attributi separati. Ogni idea sopra va provata su **tutte e quattro** le combinazioni. |
| Mobile-first + SSR | ✔ `generateMetadata` con `og:` a `page.tsx:35`. |
| `tabular-nums` sul countdown | ✔ già presente (`blocchi.css:139`) — il countdown non fa saltare il layout ogni secondo. |
| Controllo per fermare la musica | ✔ `.tasto-musica` è `position: fixed` (`guscio.css:6`) — raggiungibile ovunque. |

**Due cose trovate leggendo che non c'entrano con le idee, ma segnalo:**

1. **Il commento di `Sipario.tsx` è sbagliato.** Dice *«Lo usano sia la pagina
   invitato sia l'editor»* (righe 17-18), ma `Tela.tsx` non importa `Sipario`
   affatto: l'editor mostra la busta in linea, come descritto correttamente nel
   `PASSAGGIO_DI_CONSEGNE.md`. Il codice è giusto, la sua documentazione no —
   ed è il tipo di commento che porta il prossimo a costruire sulla premessa
   sbagliata.
2. **`node_modules` non è installato** in `frontend/`. Non ho potuto verificare
   contro i doc locali di Next 16.3.2 (che `AGENTS.md` chiede di leggere prima
   di scrivere codice). Le due questioni Next qui sotto restano **da
   verificare**, non date per buone.

---

## 6. Fonti

Concorrenti diretti:
- https://ilnostrosi.com/ — Il Nostro Sì (€10/€65/€95, servizio con consegna in giorni, 37 template, guestbook, tableau)
- https://partecipazionilink.it/ — Partecipazioni Link (€12/€15/€35–48, bozza + revisioni umane)
- https://vienialnostromatrimonio.it/ · https://nozziamo.it/ — altri italiani
- https://www.womangettingmarried.com/paperless-post/ — recensione Paperless Post 2026: envelope reveal *«functional, but not particularly cinematic»*, add-on a pagamento (liner, stamp, backdrop), ~$46–57 per 100 invitati
- https://www.lemonvite.com/blog/greenvelope-vs-paperless-post-lemonvite — Greenvelope vs Paperless Post vs Appy Couple
- https://www.invitedrop.com/blog/paperless-post-alternatives — panoramica del campo
- https://party.pro/partiful/ · https://www.invitedrop.com/blog/partiful-alternatives — Partiful, «boops», perché funziona

Cartaceo di fascia alta (2026):
- https://duallush.com/top-wedding-invitation-trends-for-2026-what-luxury-couples-are-choosing-now/ — velo/vellum a strati per «costruire suspense e mistero visivo»
- https://luckyonion.com/blogs/news/top-luxury-wedding-invitation-trends-for-2026
- https://todaysluxuryweddings.com/luxury-weddings/luxury-wedding-invitations-designers-stationery-2026/ — sigilli di cera oltre il monogramma; ritorno alla sobrietà

Meccanismi psicologici e dati:
- https://letterfriend.com/blog/study-how-effective-are-handwritten-envelopes-on-open-rates/ — busta indirizzata a mano: ~99% aperture vs 15–21%
- https://www.lettrlabs.com/post/envelope-handwriting — +37% di risposte (DMA)

Accessibilità e limiti tecnici:
- https://www.boia.org/blog/why-autoplay-is-an-accessibility-no-no — 92,3% trova l'autoplay fastidioso, 76% lo zittisce
- https://www.a11yproject.com/posts/never-use-auto-play/
- https://www.w3.org/WAI/standards-guidelines/act/rules/80f0bf/proposed/ — regola ACT sull'audio automatico
- https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API — niente `navigator.vibrate` su Safari/iOS (~77% globale)
- https://webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/ · https://caniuse.com/mdn-css_properties_animation-timeline_scroll — animazioni guidate dallo scroll: Safari 26+, Firefox ancora dietro flag a giugno 2026, ~84% globale, **non Baseline**
- https://nextjs.org/docs/app/api-reference/functions/generate-metadata — `searchParams` in `generateMetadata`, solo nei segmenti `page`

---
---

# Parte II — Rispiegazioni e progetto dell'anteprima

`[design]` · 2026-08-23 · secondo incarico

**Versione visiva (per Andrei, con i mockup):**
https://claude.ai/code/artifact/2453138f-5e43-4f59-bfe0-d2de53548e83

Andrei non ha capito le idee 3 e 4. È un mio fallimento di comunicazione, non
suo: le avevo descritte per metafore («tre vite», «la materia oltre la busta»)
senza mai dire cosa si vede sullo schermo. Qui sono riscritte con esempi
letterali, e in due punti **ritiro** quello che avevo proposto.

---

## 7. Idea 3, rispiegata — «lo stesso link, tre giorni diversi»

### L'esempio letterale

Giulia e Marco si sposano **sabato 13 giugno 2026, ore 16:00**. A marzo mandano
su WhatsApp **un link solo**: `…/i/x7k9p2`. Non ne manderanno mai un altro.
Chiara apre quell'unico link tre volte:

| Quando | Cosa vede Chiara, in ordine dall'alto |
|---|---|
| **15 marzo** | Busta → «Giulia & Marco» → countdown *90 giorni* → programma (16:00 Cerimonia · 17:30 Aperitivo · 20:00 Cena) → modulo RSVP |
| **13 giugno, 15:40** — è in macchina e non trova la chiesa | **Indirizzo e tasto «Apri in Maps» in cima** → «si comincia fra 20 minuti» → programma con **«16:00 Cerimonia — ORA»** evidenziato → «Le risposte sono chiuse» |
| **20 giugno** | «Grazie di essere stati con noi» → galleria foto → niente countdown, niente modulo |

Gli sposi non hanno rifatto nulla, non hanno mandato un secondo messaggio.
È la pagina che sa che giorno è.

### Perché conta (il meccanismo, non l'estetica)

Ogni invito digitale sul mercato — il nostro compreso — è **usa e getta**: si
apre, si risponde, non si riapre. Il giorno del matrimonio duecento persone si
scrivono «a che ora era l'aperitivo?» e la risposta è risalire la chat di due
mesi prima. Un invito che quel giorno **diventa utile** viene riaperto da tutti,
più volte, nel giorno di massima concentrazione sociale — e ogni riapertura
porta con sé la firma «Creato con Inviti» (cfr. REGISTRO, marketing).

### DECISIONE: si costruisce **solo** il programma che sa che ora è

Il resto dell'idea 3 (riordino dei blocchi, chiusura RSVP, ringraziamento) **è
rimandato**, non perché sia sbagliato ma perché costa tre cose che non abbiamo:
il selettore «Prima · Il giorno · Dopo» nell'editor (senza, salta la garanzia
fondante del prodotto), il fuso orario, e una pagina che cambia con l'orologio
= problema di cache.

**Il pezzo che si costruisce ora vale metà dell'idea a un decimo del costo, e —
verificato leggendo il codice — non rompe la garanzia:**

- `Countdown` (`Interattivi.tsx:22-66`) ha già esattamente questo schema: sul
  server rende `—`, poi `useEffect` mette i numeri veri. Zero disallineamento
  di hydration, zero impatto sulla cache. Il programma userebbe lo stesso
  schema, e in più è un componente **presentazionale** oggi (`Presentazionali.tsx:81`),
  quindi va reso client — è l'unico costo strutturale.
- **Nell'editor la voce non si accende semplicemente perché non è il giorno
  giusto.** Non serve nessun selettore di stato: chi crea continua a vedere
  quello che vedrà chi riceve, perché è *lo stesso componente con la stessa
  logica*, valutata su una data diversa. Questo è il motivo per cui questa
  fetta è spedibile e il resto no.
- Degrada in silenzio: `Programma.voci[].ora` è **testo libero** (`ora: string`).
  Se non è interpretabile (`"h 16"`, `"pomeriggio"`), non si accende niente.
  Non si rompe, non si scusa.

Serve `Hero.data` per sapere *quale giorno* sono quegli orari — ed è già un
campo `date` vero (confermato da `frontend` in `DOMANDE.md`).

**Costo dichiarato**: basso. Un componente da rendere client + un confronto di
orari + una classe CSS. Nessun blocco nuovo, nessuna migrazione, nessun
endpoint.

---

## 8. Idea 4, rispiegata — «la carta finisce quando si apre la busta»

### Non è una metafora, è un file

`/ornamenti/grana.svg` è la texture che dà alla busta l'aspetto della carta
invece del bianco piatto dello schermo. **È usata in due punti soli** —
`blocchi.css:472` (corpo della busta) e `blocchi.css:631` (la letterina).
Verificato con `grep`, sono le uniche due occorrenze nel progetto.

Quindi: per due secondi l'ospite ha in mano della carta, poi la busta scivola
via e **sotto c'è un sito**. Il momento in cui finalmente guarda il contenuto è
il momento in cui il prodotto smette di sembrare un oggetto.

### Le tre cose, in concreto

1. **La grana continua** sotto tutta la pagina, al 3–5% di opacità, su
   `[data-tema]` (che è dove sta già `background-color: var(--fondo)`,
   `blocchi.css:18-24`). Nessuno la vedrà coscientemente; quello che noterà è
   che la pagina non ha la piattezza che dice «browser».
2. **Il taglio dorato**: una linea di 1px di `--accento` sul bordo del foglio,
   come il taglio in oro dei biglietti di pregio. Una riga di CSS.
3. **Il bordo strappato** (*deckle edge*): la carta di cotone buona ha il bordo
   irregolare, non tagliato a lama — è il segno con cui in cartoleria si
   riconosce la carta cara. Applicato al bordo inferiore dell'hero
   (`.hero--senza-foto`, oggi una fascia di gradiente a taglio netto), l'invito
   smette di essere una fascia colorata e diventa **una striscia di carta
   appoggiata sopra**. Si fa con `mask-image` o `clip-path` — la stessa tecnica
   già usata per i rami del tema romantico (`temi.css:112`), non un pattern
   nuovo. **È il dettaglio che si fotografa**, e nessun concorrente ce l'ha.

### RITIRO il «velo»

Nella Parte I avevo proposto un velo di carta velina che scorre via al primo
scroll. **Lo ritiro io, prima che qualcuno lo costruisca:**
- `backdrop-filter` è caro sui telefoni di fascia media;
- l'alternativa (gradiente mosso dallo scroll) ha bisogno di animazioni legate
  allo scorrimento, **non Baseline** a metà 2026 (~84%), o di un
  `IntersectionObserver` che nel progetto **non esiste** (segnalato da
  `frontend` in `DOMANDE.md`);
- e soprattutto è **un secondo colpo di scena a due secondi dal primo**. La mia
  stessa regola dice: il disvelamento sta in un punto solo.

**Costo dichiarato**: il più basso di tutte le idee. Due token nuovi
(`--grana-forza`) e ~20 righe di CSS. **Attenzione**: la grana va tarata su
tutte e quattro le combinazioni tema × palette — quella che sull'avorio caldo è
invisibile, sul blu freddo legge «sporco».

---

## 9. L'anteprima non pagata

Requisito di Andrei (DOMANDE-PER-ANDREI §7): segni sull'invito finché non si
paga, **ma l'RSVP dev'essere visibile**, perché chi crea deve vedere com'è
l'invito *se pagasse*. Oggi non si vede affatto.

### Perché oggi non si vede — la riga esatta

`Interattivi.tsx:261`:

```
const anteprima = Boolean(token) && puoRispondere === false;
```

Quando è vero, il componente **sostituisce l'intero modulo** con una frase:
*«Questa è un'anteprima: il modulo non raccoglie risposte»*. Il modulo non è
disabilitato: non è proprio in pagina. Questo è il bug di prodotto da chiudere.

Da sapere: **nell'editor l'RSVP c'è già** — `Tela.tsx:192` non passa né `token`
né `puoRispondere`, quindi `anteprima` è falso e il modulo si disegna intero,
col solo tasto d'invio spento (`disabled={inCorso || !token}`). Le due
superfici oggi si comportano in modo opposto. Vanno riportate alla stessa.

### La scelta: **non una filigrana, una bozza di stampa**

Ricerca, non memoria: **né Paperless Post né Greenvelope segnano l'anteprima.**
La mandano pulita all'organizzatore («send a free test») e fanno pagare
l'**invio**. Il motivo per cui non li copiamo del tutto è che l'unica cosa che
vendiamo è la percezione di qualità: una scritta storta sopra i nomi degli
sposi insegna al cliente che il prodotto è brutto **proprio mentre gli chiediamo
69 €**. Ma senza nessun segno l'anteprima *è* il prodotto.

La soluzione non è software, è tipografia: quando mandi in stampa delle
partecipazioni ricevi prima **la bozza** — l'oggetto vero, con la fascetta del
tipografo attorno. Nessuno la confonde con la stampa finita, e nessuno pensa
che sia brutta.

> **REGOLA: i segni stanno sull'imballaggio, mai sul contenuto.**
> Nessun segno tocca i nomi, la foto o il testo degli sposi.

### Segno 1 — la fascetta sulla busta chiusa

Una fascetta di carta sull'angolo alto della busta **chiusa**: `BOZZA`
(maiuscoletto spaziato) e sotto, piccolo, *«non ancora inviato»*. Stessa carta
(`--fondo-alt`), stesso bordo (`--bordo`), stessa inclinazione della busta
(`-1.3deg` diventa `+8deg` per contrasto), colore del testo `--primario`
(**non** `--accento`: vedi §10).

Vive dentro `FronteBusta` (`CartaBusta.tsx:53`), che è già l'unico punto dove la
busta si disegna — quindi appare **sia** nel sipario dell'ospite **sia** nel
blocco in linea dell'editor, senza duplicare niente. Serve una prop nuova.
Sparisce da sola quando il link diventa permanente.

Si vede su **una schermata sola, per ~2 secondi**. È il segno più visibile che
proponiamo, ed è comunque su un oggetto e non su un testo.

### Segno 2 — il modulo congelato (non nascosto, non grigio)

- **Il modulo si mostra sempre**, avvolto in un `<fieldset disabled>` — HTML
  semantico, niente JS, e per uno screen reader è annunciato correttamente come
  non disponibile.
- **A colori pieni.** Il default del browser sbiadisce i controlli disabilitati:
  va annullato (`opacity: 1` e, su Safari, **`-webkit-text-fill-color`**, che è
  il modo in cui WebKit sbiadisce gli input disabilitati e che `color` da solo
  non sovrascrive). Grigio = rotto, e «rotto» è l'impressione da evitare a ogni
  costo. **`.bottone:disabled { opacity: 0.55 }` (`blocchi.css:355`) va
  neutralizzato dentro l'anteprima**, altrimenti il tasto d'invio si presenta
  proprio come «prodotto guasto».
- **Nell'anteprima il modulo si mostra già su «Sì».** Dettaglio trovato
  leggendo: i campi «Chi viene» e «Intolleranze o note sul menu» compaiono solo
  con `presente === true` (`Interattivi.tsx:345,356`). In anteprima nessuno può
  scegliere niente → **oggi quei campi non si vedrebbero mai**, cioè non si
  vedrebbero proprio le parti che l'utente ha configurato. Vanno mostrati tutti.
- **La frase cambia mestiere**: da *«non raccoglie risposte»* (vicolo cieco) a
  *«Così lo vedranno i tuoi invitati. Questa è una bozza: le risposte non
  arrivano ancora.»* — stessa informazione, ma dimostra invece di negare. È il
  cambiamento con più leva di tutto il lavoro.
- **Sull'anteprima non compare mai il prezzo.** Quel link può finire a tua
  madre: vede una bozza, non un cartellino. (E non si può nemmeno distinguere
  chi guarda: `invitoPubblico` non inoltra i cookie, `api-server.ts:38-40` —
  farlo renderebbe la risposta dipendente dalla sessione, che è un problema di
  cache che non vale la pena aprire per questo.)

### Dove decide di pagare

**Nell'editor, quando prova a fare la cosa per cui è venuto: mandarlo.**

```
[v14]  [Tema ▾]  [Colori ▾]  [Vedi l'anteprima]   ······   [ Manda l'invito · 69 € ]
```

- «**Vedi l'anteprima**» resta gratis e senza attrito (oggi si chiama
  «Anteprima 10 min», `Tela.tsx:140` — il nome va cambiato: la durata non è una
  funzione da vantare). Serve a innamorarsi del proprio invito.
- «**Manda l'invito · 69 €**» è il paywall, ed è l'unica frase onesta: quello
  che si compra non è un file, è **il permesso di spedirlo**. Coerente col
  REGISTRO («il paywall sta sulla pubblicazione, non sulla creazione»). Apre un
  riquadro con tre righe: il link non scade mai · le risposte arrivano davvero ·
  la fascetta «bozza» sparisce.
- **Dopo il ritorno dall'anteprima quel tasto si accende** (diventa primario).
  Chi torna nella scheda dell'editor avendo appena visto il proprio invito
  finito è nel momento di massimo attaccamento: è lì che si chiede.

### Conseguenza: i 10 minuti possono diventare 72 ore

**La durata e il segno sono una decisione sola, non due.** Con la fascetta
addosso e le risposte spente, l'anteprima non è un prodotto usabile gratis: è
una bozza riconoscibile **anche da chi la riceve**, e questo è ciò che rende
sicuro allungarla. 72 ore bastano per «mandalo a mia madre e sentiamo», che è
come si approva davvero un invito di matrimonio — in due. Se togliamo la
fascetta, i 10 minuti tornano necessari.

Costo backend già verificato da `backend` in `DOMANDE.md`: una riga
(`config.py:26`, `anteprima_minuti`).

### Cosa ho scartato per l'anteprima

- **Filigrana in diagonale su tutta la pagina.** Rovina la sola cosa che
  vendiamo, nel momento peggiore. E verrebbe fotografata.
- **Il conto alla rovescia visibile sull'anteprima** («scade fra 4 minuti»).
  Mette ansia a chi sta valutando un acquisto da 69 €, e l'ansia non fa comprare
  un oggetto sentimentale: fa chiudere la scheda.
- **Sfocare o coprire una parte dell'invito** (il classico «paywall che sfuma il
  testo»). Qui il contenuto è *dell'utente*, non nostro: nasconderglielo è
  ostile, non persuasivo.

---

## 10. Controllo inchiostri — trovato misurando

Calcolato (non stimato) sui valori reali di `temi.css`, soglia AA 4,5:

| Testo su fondo | oliva | blu | esito |
|---|---|---|---|
| `--accento` su `--fondo` | 4,52 | 4,53 | passa, **per 0,02** |
| `--accento` su `--carta` | 4,72 | 4,82 | passa |
| `--accento` su `--fondo-alt` | **4,13** | **4,18** | **non passa** |
| `--primario-chiaro` su `--fondo` | 4,59 | 4,57 | passa |
| `--primario-chiaro` su `--fondo-alt` | **4,20** | **4,21** | **non passa** |
| `--testo-tenue` su `--fondo-alt` | 4,60 | 5,36 | passa |
| `--primario` su `--fondo-alt` | 5,49 | 10,33 | passa |

Il REGISTRO dice che `--accento` e `--primario-chiaro` «stanno a 4,5:1 e portano
testo». **È vero su due fondi su tre.**

- **Perché ci riguarda adesso**: l'unica sezione dell'invito che sta su
  `--fondo-alt` è **l'RSVP** (`blocchi.css:297`), cioè esattamente il blocco che
  stiamo per riprogettare. La frase «Questa è una bozza» in oro sarebbe stata
  sotto soglia.
- **Regola che ne esce**: dentro `.rsvp` il testo può essere solo `--testo`,
  `--testo-tenue` o `--primario`. L'oro lì dentro fa solo bordi e filetti.
- **Oggi non è rotto niente** — controllato riga per riga: `--accento` è testo
  in `.programma__ora` (193) e `.luogo__ora` (211), `--primario-chiaro` in
  `.luogo__etichetta` (209) e `.nota h3` (290), tutti su `--fondo`/`--carta`.
  Ma il margine è di due centesimi: **chi un giorno schiarirà l'oro «solo un
  po'» romperà l'accessibilità senza vedere alcuna differenza a schermo.**
