# Memoria — agente `marketing`

Memoria privata. Si legge all'inizio di ogni incarico e si riscrive alla fine.
Scrivi **le conclusioni con il ragionamento**: senza il perché, fra tre mesi
l'idea sbagliata si rifà da capo.

---

# Incarico 5 — 2026-08-24 — Landing pubblica: brief e testi definitivi

Documento: `squadra/marketing-landing-testi.md`.

**Contesto**: RoD ha approvato la landing pubblica e l'ha chiesta a backend,
frontend e design insieme. La pagina che avevo proposto nell'incarico 4 esiste
come lavoro assegnato. Ho scritto **i testi definitivi da incollare**, non un
brief astratto: se il testo non arriva prima del codice, la pagina si riempie di
segnaposto e riscriverla dopo costa tre volte tanto.

## La decisione di prodotto che ho preso io (e il perché)

**Il pulsante non può dire "Prova subito"**: la landing manda a una webapp
protetta da password, quindi chi lo preme sbatte su una richiesta di credenziali.
- Pulsante principale: **"Chiedi l'accesso alla beta"** → link `wa.me`
  precompilato verso Andrei. **Zero infrastruttura**: nessun form, nessun
  database, nessuna email raccolta da noi, nessun adempimento nuovo, e chi
  scrive è già filtrato.
- Link secondario piccolo: **"Ho già le credenziali"** → `beta.andreievictoria.it`.
- Il giorno dell'apertura il pulsante diventa "Crea il tuo invito": **una riga**.
- **Niente form di lista d'attesa**: non esiste SMTP nel progetto (verificato da
  `backend` all'incarico 2). Raccogliere indirizzi che non possiamo contattare
  apre un trattamento di dati per niente.

## Le trappole tecniche segnalate (riusabili)

1. **Mai mettere una landing su `beta.*`**: ha `basic_auth` su tutto e manda
   `X-Robots-Tag: noindex, nofollow, noarchive`. Nasce invisibile e chiusa.
2. **Host più economico disponibile**: `andreievictoria.it` — DNS pubblico e
   **Let's Encrypt reale già attivo**, oggi 404 su tutto tranne
   `/api/stripe/webhook`. Aggiungere `/` costa una regola di Caddy. **Ma il
   REGISTRO dice "esclusivamente il webhook"** → va messo a registro come cambio
   esplicito, non fatto di straforo. Il webhook non si tocca.
3. **Il dominio che si indicizza per primo ce lo si tiene.** Backlink e URL
   indicizzati non si trasferiscono gratis e la SEO ha 4-8 mesi di latenza:
   cambiare dominio dopo sei mesi = ricominciare. `andreievictoria.it` è il nome
   di una coppia, non di un prodotto che fa anche compleanni e lauree. **Se si
   vuole un altro nome si decide prima dell'indicizzazione.** Non è mia.
4. `?fonte=` va conservato dalla pagina e riportato su **tutti** i link in
   uscita, non solo sull'acquisto.
5. **Open Graph obbligatorio**: il primo posto dove questa pagina verrà
   incollata è WhatsApp, e senza OG è un rettangolo grigio.
6. La landing va **indicizzata subito**, anche a prodotto non finito: la latenza
   SEO gioca a nostro favore solo se si comincia adesso.

## Il controllo di verità sui claim (fatto sul PASSAGGIO_DI_CONSEGNE, non a memoria)

Vero e dicibile: blocchi `busta, hero, testo, countdown, programma, luogo,
galleria, nota, musica, rsvp` · sipario a schermo intero con sigillo di cera ·
brano musicale incluso di default · l'invitato apre da telefono senza scaricare
e senza registrarsi · link via WhatsApp · stessa lista di blocchi per matrimoni,
compleanni e feste · prezzo unico, invitati illimitati.

**Vietato**:
- "decine di temi" — i temi sono **DUE** (`sobrio`, `romantico`), le palette
  **DUE** (`oliva`, `blu`). Si dice "due stili, quattro combinazioni" o niente.
- "siamo gli unici / primi in Italia" — la busta animata è Paperless Post dal
  2009, già a registro come **non differenziatore**.
- recensioni, numeri di clienti — non esistono.
- **"crea dal telefono"** — l'editor è desktop-only. Si scrive al contrario e in
  chiaro: **"si crea dal computer, si riceve dal telefono"**. Dirlo toglie
  traffico sbagliato e ci risparmia recensioni brutte.
- ⚠️ **Il nome dell'invitato nella busta (`?a=`) è il titolo della pagina ma non
  ho verificato che sia implementato.** Se il giorno della pubblicazione non
  funziona, **il titolo si cambia**, non si pubblica lo stesso. Ho chiesto
  conferma a chi costruisce.

## I testi (integrali nel documento §5)

Titolo: **«La partecipazione digitale che arriva con il suo nome sopra.»**
(formula mia, mai testata su nessuno — il "suo" sposta il soggetto
sull'invitato, ed è la risposta all'unica obiezione vera del passaggio
carta→digitale: "è impersonale").
Struttura in sei blocchi: sopra la piega (titolo + cattura schermo della busta,
in loop, muta, dentro una cornice di telefono) · perché (l'unico numero della
pagina: **200-600 € per cento partecipazioni di carta**, verificato) · tre passi
· cosa riceve l'invitato · prezzo detto senza giri (gratis in beta, 69 € dopo) ·
chiusura onesta ("lo stiamo ancora costruendo").

Da non mettere: modulo di iscrizione, tour di tutte le funzioni, testimonianze,
cookie banner (senza pixel non serve), countdown finto al lancio.

## Nota di routing

RoD ha nominato **tre** agenti in un messaggio solo (backend, frontend, design):
per la regola del router probabilmente **non ne ha svegliato nessuno**. Ho
taggato **@design** da solo — quello che deve partire per primo. Se la prossima
volta si ripete, vale la pena dirlo esplicitamente nel gruppo.

---

# Incarico 4 — 2026-08-24 — Pubblicità, video e confine delle mie mani

Documento: `squadra/marketing-pubblicita-e-produzione.md`.

**Contesto**: RoD (nel gruppo) ha chiesto di **smettere di ragionare sullo stato
tecnico di oggi** — "il sito è offline per scelta, i problemi li risolviamo" — e
di pianificare il giorno in cui il prodotto è finito. Richiesta legittima:
accettata senza rilitigare. Nel documento non si parla del 401.
Le domande erano quattro: compriamo pubblicità? paghiamo un freelancer per un
video? lo facciamo con l'AI? sei in grado di gestire campagne?

## Il confine delle mie mani (ripetilo ogni volta che serve)

**Faccio tutto tranne cliccare.** Niente browser, niente account: non apro
l'account pubblicitario, non inserisco un metodo di pagamento, non carico
creatività, non premo "pubblica". Faccio da solo e a costo zero: posizionamento,
**testi degli annunci in decine di varianti** (la leva più economica sul CPC),
copy della landing, piano editoriale e articoli, script del video secondo per
secondo, targeting, piano di misurazione, e la lettura dei numeri con la
decisione di spegnere/cambiare/raddoppiare.

**Come si colma**: Andrei pubblica, e mi passa **quattro numeri a settimana** —
spesa, clic, acquisti, incasso. Meglio ancora un CSV di Meta esportato in una
cartella del progetto: lo leggo da solo. Senza numeri io scrivo campagne ma non
*gestisco* niente, perché gestire vuol dire decidere sui numeri.

**L'API Marketing di Meta via `curl` con token nel `.env` è davvero fattibile**
(creare campagne, cambiare budget, mettere in pausa senza interfaccia). Non è
teoria. Ma il setup — app, token a lunga durata, permessi, manutenzione — **non
si ripaga sotto i ~1.000 €/mese di spesa**. Rimandata, non scartata. E dare un
token che muove soldi è comunque una decisione di Andrei.

## Le quattro cose vere prima di un euro (ordine non negoziabile)

1. Il pagamento funziona dall'inizio alla fine.
2. Esiste una pagina pubblica dove atterrare.
3. C'è un indirizzo email che spedisce davvero.
4. **Sappiamo da dove viene chi compra.** È il punto che salta sempre ed è quello
   che rende inutile tutto il resto: senza provenienza salvata con l'acquisto,
   dopo aver speso vediamo *quante* vendite ma non *quale canale* le ha fatte.

## Le soglie di spesa (decise prima, contestabili solo cambiando le ipotesi)

CPC Meta IT 2026 = 0,30-0,90 €, centro 0,60 €.
- **30 € → ~50 clic → zero informazione**: con 50 clic non si distingue l'1% dal 6%.
- **300 € → ~500 clic → la prima cifra che insegna qualcosa** (distingue 1% da 4%).
- 1.500 € → ~2.500 clic → ~50 conversioni, Meta esce dall'apprendimento.

**300 € in un colpo solo, non 30 € al mese per dieci mesi** — quello non impara
mai perché riparte ogni volta da numeri troppo piccoli.
Finestra: **gennaio-marzo** (45-50% degli acquisti dell'anno). Gli stessi 300 €
ad agosto valgono la metà.
**Regola di stop scritta prima**: contribuzione per vendita 55,27 € → se il CAC
supera 55 € il canale è chiuso e si smette (non si "ottimizza ancora un po'");
sotto 35 € si raddoppia.

## Il video: ho detto no a entrambe le opzioni proposte

Prezzi verificati 2026-08-24: freelance video IT **25 €/h** alle prime armi fino
a **149 €/h**; spot commerciale **300-800 €**; promo social 30-60s
**800-3.000 €**; video aziendale medio 350-1.000 € (ProntoPro, Cronoshare,
Bliss Agency). AI: ChatGPT Plus/Gemini ~**20 $/mese**, Runway da **15 $/mese**;
ad API Veo Fast 0,10-0,30 $/s, Sora 0,10-0,70 $/s (clip da 8s < 1 $).

**Raccomandazione: nessuno dei due per il video principale.** Il prodotto è
software, quindi la cosa che vende è **il software che si muove**: la busta che
si apre col nome dell'invitato, ripresa dallo schermo di un telefono, 15-20
secondi, senza voce. È una **cattura schermo**, la fa la squadra in un
pomeriggio, costa **0 €**.
- **Non l'AI** per quel video: dovrebbe inventarsi un'interfaccia che non esiste
  → claim falso, non lo firmo. Vale anche per i volti generati: in un settore
  dove si compra emozione si riconoscono, e il danno di credibilità supera il
  risparmio.
- **Non il freelancer adesso**: 500 € per filmare bene un messaggio non ancora
  validato è il modo più caro di scoprire che era sbagliato. Ha senso **dopo le
  prime ~100 vendite**, quando sappiamo quale frase converte.
- **Dove l'AI serve davvero e la userei subito**: decine di varianti del testo
  dell'annuncio, voce fuori campo e sottotitoli sulla cattura schermo, sfondi e
  texture per i temi, bozze degli articoli SEO poi riscritte a mano. Costo ~0.

## Di cosa ho bisogno (detto in chiaro, così non si ripete la domanda)

**Tecnico**, prima che il prodotto sia "finito": provenienza `?fonte=` salvata
con l'acquisto + paese del cliente dal webhook; evento di conversione sulla
pagina di grazie; una pagina pubblica; un'email che spedisce.
**Economico**: 0 € adesso; poi ~300 € una volta sola, non prima di gennaio.
**Accessi**: nessuno adesso.
**Modo di lavorare**: quattro cifre a settimana, o un CSV in una cartella.

## Chi ho svegliato e perché

**@backend**, per una cosa sola e tempestiva: salvare `?fonte=` insieme
all'acquisto e il **paese del cliente** dal webhook Stripe, **adesso che sta
scrivendo il codice Stripe**, perché dopo diventa una migrazione. Il paese serve
anche per l'OSS oltre i 10.000 €/anno. Nessun tracciamento sull'invitato finale:
la provenienza riguarda chi compra.

## Nota di metodo da non perdere

RoD ha ragione su una cosa e me la tengo: **stavo rispondendo troppo spesso
"non si può perché il sito è chiuso"**. Vero, ma detto tre volte diventa un alibi.
Il piano deve esistere completo per il giorno dell'apertura, e i vincoli si
citano una volta sola, dove servono a decidere.

---

# Incarico 3 — 2026-08-24 — Piano operativo freelancer e creator

Documento: `squadra/marketing-piano-creator.md`. Appunti di squadra:
`/home/user/squadra/marketing/appunti.md`.

## Cos'è cambiato dall'incarico 2

- **La beta ESISTE**: `https://beta.andreievictoria.it`, certificato vero, si
  apre da telefono. Il blocco n.1 dell'incarico 2 è caduto. **Verificato da me
  con `curl` il 2026-08-24**: `HTTP/2 401`, `www-authenticate: Basic realm`,
  `x-robots-tag: noindex, nofollow, noarchive`, `server: Caddy`. L'accesso
  autenticato **non l'ho fatto**: non ho la password in memoria e in chat non si
  scrive.
- **Domanda 13 CHIUSA da Andrei**: i 30 € restano alla pubblicità, niente
  acquisto di inviti.digital. → **La trappola 6 resta aperta**: continuiamo a
  non aver mai provato un concorrente dall'interno. Non ririproporre l'acquisto,
  è stato deciso; ma quando si parla di checkout, email post-acquisto o
  documento fiscale dei concorrenti, dichiarare sempre che è lettura di vetrina.
- **Domanda 15 CHIUSA**: nessuna partita IVA, si parte gratis. C'è un amico con
  P.IVA ma **non si usa per fatturare le nostre vendite** (davanti al fisco il
  venditore è lui, il rischio è suo). Conseguenza operativa diretta: **non
  possiamo pagare commissioni in denaro a nessuno**, quindi niente affiliazione.
- **Domanda 17 aperta**: il `basic_auth` copre **anche** `/i/<token>`, quindi
  l'invito che il tester manda a sua zia chiede la password. Devo rispondere.
- Nuovo fatto tecnico dal coordinatore: **Meta controlla la pagina di
  destinazione prima di approvare**, e la nostra dà 401 → i 30 € non sono
  spendibili finché non esiste una pagina pubblica. Argomento forte, riusarlo.

## La tesi del piano creator (il pezzo che vale)

**A prodotto chiuso, i creator non servono per la loro audience.** Non c'è
nessun posto dove far atterrare traffico: un post, una Story o un link in bio
puntano a una richiesta di password. Stesso blocco dei 30 €.
→ Si reclutano come **insider**, in privato, con una password: si comprano il
loro **giudizio**, il loro **evento** se ne hanno uno vicino, e il loro
**impegno preso adesso** e incassato il giorno dell'apertura.
Il tempo aiuta: i matrimoni 2027 si decidono gen-mar 2027, una relazione aperta
ad agosto 2026 è pronta; una aperta a febbraio è tardi.

## Il filtro sui nomi (vale sempre, riusalo)

Il 90% di ciò che esce cercando "wedding planner Italia" è **destination wedding
di lusso**: coppie straniere, 50k+ di budget, carta stampata a mano. **Pubblico
sbagliato** per un prodotto da 69 €, e non hanno nessun motivo di risponderci.
Entra in lista solo chi: lavora con **coppie italiane a budget normale**, è
**una persona sola o due** (ha bisogno di portfolio, che è ciò che possiamo
dare), ha un **contatto pubblico**, ed è **giovane come attività**.
Restano esclusi per sempre: tipografie (concorrente) e reclutamento dentro
Matrimonio.com/Zankyou (community di un concorrente).

**Il buco che ho dichiarato invece di riempire con nomi inventati**: la
categoria più preziosa è **chi organizza eventi che succedono fra tre settimane**
(18esimi, lauree, battesimi, feste bambini) — stessa logica della domanda 14, il
feedback torna in tre settimane invece che in sette mesi. Non ho un nome
verificato lì dentro. Si cerca su Instagram per località (`#18esimo`,
`#partyplanner` + città) guardando chi ha eventi datati nei post recenti.

## I cinque nomi (verificati sui loro siti pubblici il 2026-08-24)

Follower **non verificati sul profilo**, vengono da risultati di ricerca: da
guardare prima di scrivere.

1. **Behind Wed — Gradisca Portento**, wedding content creator (ex fotografa,
   15+ anni), Toscana, da 700 €. `behindwed.contentcreator@gmail.com`,
   IG `@behind.wed`. Sola, digital-first, sa girare verticale.
2. **Komoko Studio — Giulia Filippini**, grafica e calligrafa, Thiene (VI),
   fa corsi di calligrafia online. IG `@komoko.studio`, P.IVA pubblica.
   **Fa la carta**: è la prova più dura e la più informativa.
3. **Content Love** (Amedani Studio S.r.l.), Brescia, ~7 persone, si presenta
   come primo studio italiano di wedding content creation. In lista **proprio
   per misurare** se uno strutturato risponde: probabilmente no.
4. **Italea Wedding Planner** `@italea_wedding_planner`, Firenze, booking
   2026-2027, ~3,5k follower (da verificare).
5. **Annalisa** `@miaieventsplanner`, Trentino/Friuli/Veneto, ~1,5k (da
   verificare). La più piccola → **la più probabile a rispondere**.

**Ordine di invio 5-4-1-2-3**: si parte dai più piccoli, così se il messaggio è
sbagliato si brucia su chi vale meno. Cinque e non venti: venti messaggi identici
sono spam e bruciano il testo prima di sapere se funziona.

## L'offerta a quattro livelli (schema riusabile ogni volta che non c'è budget)

1. **Accesso gratis illimitato per tutto il 2027** — costo 0, in beta non
   incassiamo comunque.
2. **Nome + link del professionista in fondo a ogni invito delle sue coppie** —
   è **il vero pagamento**: ~109 invitati per invito, cioè distribuzione, che è
   la cosa che un freelance compra quando compra pubblicità. Costo 0 per noi.
   **Vincola prodotto** (piè di pagina con credito e link): non si promette
   finché Andrei non dà l'ok.
3. **Tema firmato col suo nome** — costa lavoro a `design`, quindi si offre solo
   a chi ha già risposto ed è entrato, mai a freddo.
4. **Percentuale sulle vendite — NON si offre.** Senza P.IVA non possiamo pagare
   commissioni, e promettere soldi futuri per iscritto non è una decisione mia.
   Risposta pronta se la chiedono: "oggi non vendiamo e non posso prometterti
   una percentuale; quando venderemo ne riparliamo e sarai il primo".

Mai: buoni regalo o gadget (attirano chi vuole il buono → feedback sbagliato),
"visibilità" senza un numero dietro.

## Il messaggio (testo integrale nel documento §4)

Cinque regole che lo tengono fuori dal cestino: **niente link** (un link che
chiede la password è peggio di nessun link); si chiede **un'opinione**, non un
favore; si dice subito **"non ti sto vendendo niente"**; si dà una **via
d'uscita** esplicita; **lo firma Andrei col suo nome**, mai un account brand.
Variante per chi lavora sulla carta: si mette l'obiezione sul tavolo *prima* che
la pensi lei ("ti scrivo proprio perché la carta la fai tu").
Nel secondo messaggio si chiede **il dispositivo usato**: è il modo gratuito di
misurare quanto costa l'editor desktop-only (trappola 3).
**Un solo sollecito, dopo 7 giorni.** Insistere brucia il contatto fino al 2027.

## Come si misura (esperimento a 14 giorni, soglie decise prima)

- **≥2 risposte su 5.** Sotto → **è il messaggio, non il canale**: si riscrive e
  si prova su 5 nomi nuovi, **non si allarga la lista con lo stesso testo**.
- **≥2 accessi veri.** Rispondono ma non entrano = l'attrito è il login stesso,
  serve il video da 20 secondi prima dell'accesso.
- **≥1 obiezione nuova.** Zero obiezioni nuove è **l'esito peggiore, peggio di
  un no**: vuol dire che sono stati gentili senza provare.
- **≥1 evento vero mandato a invitati veri** — oggi **impossibile** per la
  domanda 17 (il 401 copre `/i/<token>`). Va contato come bloccato, non come
  fallimento del piano.

**L'idea operativa da non perdere**: **cinque password diverse, una a testa**.
Il `basic_auth` di Caddy supporta più utenti e il log dice chi è entrato e
quando — misurazione a costo zero, senza analytics e senza tracciare gli
invitati. Senza questo, "ha detto sì" e "l'ha aperto" restano indistinguibili.

## La richiesta ad Andrei: una pagina pubblica statica

Una pagina sola, senza applicazione dietro (niente editor, niente database,
niente RSVP → nessuna superficie d'attacco applicativa). **Non riapre la domanda
9**, che parlava di esporre il prodotto.
Sblocca tre cose insieme: i **30 €** diventano spendibili (Meta guarda la
landing e trova un 401), un creator ha **dove mandare la gente**, e un
professionista che riceve il DM può **guardare chi siamo prima di rispondere** —
che è probabilmente **la ragione n.1 per cui i cinque messaggi potrebbero non
ricevere risposta**.

## Aggiunte allo scartato

- **Programma di affiliazione con commissione** — impossibile senza P.IVA.
- **Fiverr/Upwork e piattaforme freelance** — servono a *comprare* lavoro, non
  sono un canale di distribuzione.
- **Grandi nomi** (Enzo Miccio & co.) — non rispondono a una beta chiusa senza
  budget, e il loro pubblico non compra un invito da 69 €.
- **Post pubblico "cerchiamo tester"** — senza pagina pubblica non ha dove
  atterrare e brucia l'annuncio.
- **Pagare una Story con i 30 €** — già scartato, ora vale doppio: punterebbe a
  un 401.

## Da fare al prossimo incarico, in quest'ordine

1. **Andrei ha dato l'ok ai cinque messaggi?** Se sì, la prima cosa da guardare
   è il tasso di risposta contro la soglia (≥2 su 5), non i follower.
2. **Rispondere alla domanda 17** (esenzione di `/i/<token>` dal `basic_auth`).
   È rimasta a me e senza quella la beta non prova metà di ciò che deve provare.
3. **Il pagamento di test con la carta 4242** — è l'unico pezzo mai provato
   dall'inizio alla fine, e resta mio.
4. **Domanda 14** (composizione dei beta-tester) è ancora 🟡: serve la risposta
   di Andrei sulla sua rete personale, da lì devono uscire 8 tester su 12.
5. **Trovare 3-5 nomi nella categoria eventi-a-tre-settimane** (18esimi, lauree,
   battesimi): è il buco dichiarato di questo giro.
6. **Il video da 20 secondi** non esiste ancora ed è la dipendenza silenziosa di
   metà del piano gratuito.

---

# Incarico 2 — 2026-08-23 — Piano rifatto su budget 30 € + beta + fisco

**Andrei ha risposto alle domande e ha demolito metà del piano precedente.**
Documento riscritto: `squadra/marketing-strategia.md` **versione 2**, che
sostituisce la v1 (non è una revisione, è un altro piano).

## I vincoli veri, come li ha detti lui

| Vincolo | Parole di Andrei |
|---|---|
| Prezzo | «C'è un solo prodotto, costa 69 euro IVA inclusa» — niente 29 € compleanno, niente upsell |
| Budget | «Avremmo 30 euro da dedicare alle pubblicità o agli influencer» — **totali, non al mese** |
| Ricerca | «0 budget per ricerca di mercato» — i 150 € per i concorrenti sono negati |
| Sito | «Per ora non lo posso esporre pubblicamente per paura che lo attaccano» |
| GDPR | «Per ora ignoriamo e teniamo nel backlog, non bloccanti» |

## La scoperta più importante di questo giro

**Il sito chiuso non blocca solo la pubblicità: blocca il fatto di poter
mostrare il prodotto a chiunque.** `andreievictoria222.it` non è in DNS pubblico
e usa la CA interna di Caddy → per vederlo serve modificare `/etc/hosts` e
importare una root CA. Su un telefono è impossibile. Quindi:
niente beta-tester, niente demo a wedding planner, niente test su WhatsApp.

E il colpo che rende l'argomento vincente con Andrei: **la configurazione
attuale non è nemmeno sicura.** Il `PASSAGGIO_DI_CONSEGNE.md` lo dice già —
chiunque conosca l'IP raggiunge il sito impostando l'Host header a mano, non
c'è nessun allowlist né autenticazione. Quindi oggi abbiamo *la sicurezza di un
sito pubblico e l'inutilità di un sito spento*.

**Proposta**: sottodominio `beta.<dominio>` con DNS pubblico, Let's Encrypt,
`basic_auth` di Caddy e `X-Robots-Tag: noindex`. **Più sicuro di adesso**, e
condivisibile con una password. Non tocca il blocco `andreievictoria.it` del
webhook (regola del REGISTRO rispettata).
→ Se al prossimo incarico questo NON è stato fatto, **è ancora il blocco n. 1**:
non riscrivere il piano, insisti su questo.

## I 30 €: raccomandazione e aritmetica

**Raccomandazione: 29 € per comprare il pacchetto "Invito" di inviti.digital.**
Non pubblicità.

Perché la pubblicità è morta a questa cifra (i conti, da rifare se cambia il CPC):
- 30 € / 0,60 € CPC = **50 clic** (33 a 0,90 €, 100 a 0,30 €).
- Conversione realistica **0–1%**, non il 2–5% da benchmark, perché il traffico
  social è mobile all'80–90% e **il nostro editor è solo desktop**.
- → 0 o 1 vendite. Contribuzione 55,27 € contro 30 € spesi: testa o croce.
- **Il vero problema è l'informazione**: con 50 clic e 0–1 conversioni non si
  distingue l'1% dal 6%. Meta esce dall'apprendimento con ~50 conversioni per
  ad set: ne faremmo zero. Si spendono 30 € e non si impara niente.
- Meta comunque non approva inserzioni verso un sito non pubblico.

Perché nemmeno l'influencer:
- Tariffe nano IT 2026: **25–150 € post, 15–75 € Story, 50–300 € Reel**. 30 € =
  una Story da un principiante con 1–3k follower → 100–300 visualizzazioni →
  1–9 clic → **0,1 vendite**.
- E soprattutto: **il nostro costo marginale è ~zero**, quindi possiamo regalare
  un invito da 69 € e ottenere lo stesso post gratis. Pagare compra ciò che il
  regalo compra già a 0 €. *(Questo argomento vale sempre, riusalo.)*

Perché il concorrente: 29 € comprano **informazione chiusa dietro un pagamento**,
che né il lavoro gratuito né il regalo producono. Sei cose che oggi indoviniamo:
checkout completo, **sequenza email post-acquisto** (invisibile da fuori, ed è
il nostro buco più costoso), cosa consegna davvero il prodotto pagato, **come
hanno risolto il GDPR sull'RSVP**, **che documento fiscale emettono per una
vendita B2C da 29 €** (prova di prassi sulla domanda §7), e chiude la trappola
n.7 della vecchia memoria (non ho mai provato un concorrente dall'interno).

Dettaglio da non dimenticare: **il taglio matrimonio costa 59 €, fuori budget**.
Si compra il taglio da 29 € (bambini/compleanni): stesso checkout, stesse email,
stesso pannello, **diversi i template da matrimonio**. Dichiaralo, non fingere
che sia equivalente.

Se Andrei rifiuta perché "i 30 € sono per la pubblicità": la risposta corretta
è **non spenderli affatto**. Non esiste una terza opzione pubblicitaria che
funzioni a 30 €, e inventarne una sarebbe disonesto.

## Anno 1 senza pubblicità: 10–25 vendite (era 43–87 con budget)

Catena, da contestare se cambiano le ipotesi:
- rete personale + passaparola beta: **5–15**
- partnership professionisti: 10 contattati → 2–3 accettano × ~15 matrimoni ×
  10–20% di coppie aperte al digitale = **4–7**
- firma virale: 25 inviti × ~109 invitati = 2.700 impressioni × CTR 1–2% = 27–54
  visite × 2–3% = **1–2**
- SEO: con lancio Q4 2026 e 4–8 mesi di latenza, il traffico arriva **dopo** il
  picco d'acquisto di marzo 2027 → **0–3** nel 2027, il grosso nel 2028

**Totale 550–1.400 € di contribuzione.** Numero che serve soprattutto per il
fisco (sotto).

Contribuzione per vendita:
- con IVA: 69 − 12,44 (IVA 22%) − 1,29 (Stripe 1,5%+0,25) = **55,27 €**
- in **forfettario** (niente IVA in fattura): 69 − 1,29 − ~2,31 (5% su 69×67%)
  = **~65,40 €** → **+10 € a vendita**, cioè +18% di margine, per una scelta
  che si fa una volta sola.

## Fatturazione elettronica — la risposta che Andrei aspettava

**Il ribaltone**: la domanda era sbagliata. Vendere inviti digitali a
consumatori italiani è **commercio elettronico diretto**, e per il B2C:
- **fattura NON obbligatoria**, salvo richiesta del cliente *entro il momento
  dell'operazione* — art. 22 DPR 633/72 (assimilazione alle vendite per
  corrispondenza, Ris. AdE 274/E/2009);
- **scontrino/registratore telematico esonerati** — art. 2 lett. oo) DPR
  696/1996, confermato dal DM 10.5.2019;
- **obbligo vero**: annotare i corrispettivi giornalieri nel **registro dei
  corrispettivi** entro il giorno non festivo successivo — art. 24 DPR 633/72.

**Stripe non fa niente al posto nostro**: non è merchant of record, non manda
niente allo SdI, Stripe Invoicing fa PDF non fatture italiane. **E dal 1/7/2025
fattura da Stripe Ireland** → chi ha partita IVA deve fare **autofattura TD17 in
reverse charge, mensile, forfettari inclusi**. Stripe **aggiunge** un
adempimento, non ne toglie.

**Il problema vero non è la fattura, è l'inquadramento** (questo è il pezzo che
vale soldi veri):

| | INPS | Effetto su 10–25 vendite/anno |
|---|---|---|
| Impresa/commercio | **4.549,70 € FISSI/anno** | 25 vendite = 1.725 € di ricavi contro 4.550 € di contributi → **perdita strutturale** |
| Attività professionale | 26,07% sul reddito, **nessun minimo** | sostenibile |

Il mito da smontare: **la "soglia 5.000 €" della prestazione occasionale non è
un permesso a vendere senza partita IVA** — è un limite contributivo INPS. Conta
l'abitualità, e un sito che vende 24/7 è abituale.

Sanzioni se si incassa davvero senza mettersi in regola (D.Lgs. 87/2024, dal
1/9/2024): omessa fatturazione **70% dell'imposta, min. 300 € per operazione**
(250–2.000 € se non incide sulla liquidazione IVA; 250 € fissi per i
forfettari); omessa dichiarazione inizio attività **500–2.000 €** (art. 5 c.6
D.Lgs. 471/97). **Il minimo si moltiplica per operazione, non per anno.** Esiste
il ravvedimento operoso (art. 13 D.Lgs. 472/97): sbagliare e correggere presto
costa molto meno.

**In beta con chiavi di test il rischio è ZERO** — nessun denaro cambia mano,
non c'è nessun obbligo da rimandare. Detto così ad Andrei, che temeva di stare
ignorando qualcosa.

Extra da non scoprire dopo: **OSS**, IVA del paese del cliente sui servizi
digitali B2C UE oltre **10.000 €/anno**. Lontanissimo, ma per questo il webhook
deve salvare il **paese del cliente** da subito.

**Le 5 domande al commercialista** (in `marketing-strategia.md` §7.6), in ordine
di valore: inquadramento/ATECO (commercianti o gestione separata?) → conferma
sul registro dei corrispettivi → forfettario e coefficiente → TD17 su Stripe →
"con 10–25 vendite conviene aprire adesso o aspettare?".

**Non sono commercialista e l'ho scritto.** Ho ricostruito la cornice, non la
scelta dentro la cornice.

## Beta-tester — la scelta controintuitiva

**Non reclutare (solo) coppie che si sposano.** Un matrimonio di giugno 2027
manda gli inviti a marzo 2027: il feedback sul pezzo che conta arriva **fra
sette mesi**. Un compleanno fra tre settimane restituisce lo stesso feedback
**fra tre settimane**, e testa il 90% delle stesse cose perché il prodotto è la
stessa lista di blocchi (`MODELLI` in `blocchi.py`).
→ Su 12: **7 eventi entro 60 giorni, 3 coppie 2027, 2 professionisti revisori**.
Reclutarne ~25 per averne 12 attivi (stima: metà non completa).

Dove, gratis, in ordine di resa: (1) **rete personale di Andrei via WhatsApp** —
da qui devono uscire almeno 8 su 12; (2) i professionisti, ma chiedendo un
**parere**, non una vendita (apre meglio anche la relazione commerciale);
(3) gruppi Facebook spose — **regolamento, admin prima, post come richiesta di
aiuto**. Nota che mi ero perso: **la community di Matrimonio.com è del gruppo
Zankyou, cioè un concorrente diretto** → serve per ascoltare le parole delle
spose, non per reclutare. **Mai account falsi.**

Si offre (mai soldi, e non servono): invito gratis per sempre (vale 69 €, ci
costa ~0), un secondo evento gratis in futuro, linea diretta con chi lo
costruisce, menzione facoltativa fra i fondatori. **Niente buoni regalo**:
attirano chi vuole il buono, cioè il feedback sbagliato.

Si chiede, come patto scritto prima: (1) arrivare in fondo al checkout con
**carta di test Stripe — dicendo esplicitamente che è finta e che non si
addebita nulla**; (2) mandare l'invito a **≥5 invitati veri** e ottenere **≥3
RSVP**; (3) tre domande dopo l'uso, mai prima, inclusa «l'avresti pagato 69 €?»;
(4) **dispositivo e browser** usati — è il dato che misura quanto costa davvero
l'editor desktop-only; (5) screenshot dei bug.

**Il minimo legale della beta** (senza riaprire ciò che Andrei ha chiuso): se un
tester manda l'invito a 5 invitati veri, trattiamo dati di persone che non hanno
accettato niente. Tre mitigazioni a costo zero: **spegnere il campo
"Intolleranze o note sul menu"** (`Interattivi.tsx:360` — è letteralmente il
campo da 200.000 € di NH Italia), una pagina di informativa anche brutta, e
cancellare i dati a fine beta dichiarandolo prima. **Questa è la mossa
diplomatica del giro**: non contraddice la sua decisione, toglie il 90% del
rischio con una riga.

## Risposta a design: vince l'idea 1 (busta col nome)

Motivi, dal più forte:
1. **L'idea 3 ha già fallito su un campione reale**: Andrei ha scritto «non ho
   capito». Se il fondatore non la capisce in una frase, una sposa su Instagram
   non la capisce in un secondo. L'idea 1 è stata approvata senza spiegazioni.
2. Disinnesca **l'unica obiezione che conta** al passaggio carta→digitale
   («è impersonale»). La busta di carta si scrive a mano: il nome *è* il segnale
   di attenzione. E poiché il mercato cala del ~6% l'anno, lo spostamento
   carta→digitale è l'**unica** fonte di crescita disponibile.
3. Agisce **prima del clic**, nell'anteprima WhatsApp. L'idea 3 consegna il
   valore **il giorno del matrimonio**, cioè dopo l'acquisto: il compratore deve
   immaginarsela.
4. Si dimostra in **5 secondi muti** — e tutto il piano gratuito si appoggia su
   un video corto.

Avvertenze: **non è un differenziatore tecnico** (Paperless Post personalizza da
anni) → il claim parla del **nome**, mai di "siamo gli unici". E costa lavoro
alla coppia (un link per invitato, in un editor desktop): deve restare
facoltativo col fallback generico.

Formula proposta (**mia, non testata**): «**La partecipazione digitale che
arriva con il suo nome sopra.**» Il "suo" sposta il soggetto sull'invitato.

**L'idea 3 non si butta, cambia reparto**: il giorno del matrimonio ~109
invitati riaprono lo stesso link → è una **leva virale e di ricordo**, non un
argomento di vendita. Da riprendere dopo l'apertura e misurare come tale.

## Leve gratuite — cosa costruire adesso, cosa NON costruire

Regola di selezione: entra solo ciò che (a) costa 0 €, (b) non richiede che
qualcuno veda il sito, (c) il giorno dell'apertura è già finito.

**Sì**: banca di 8–10 articoli informazionali scritti **adesso** in `contenuti/`
(la SEO ha 4–8 mesi di latenza e il trimestre gen–mar vale il 45–50% dell'anno →
un articolo scritto a gennaio serve al 2028); **il video da 20 secondi** che
sostituisce il link mancante (sblocca outreach, Instagram e reclutamento);
la lista a mano di **40–60 professionisti** dalla directory gratuita di
Matrimonio.com (planner > fotografi > location > grafici; **mai tipografie**);
presenza minima (Instagram con 9–12 post pronti + scheda fornitore gratuita).

**No, benché sembri ovvio**:
- **La lista d'attesa.** `backend` ha verificato che **non esiste nessuna
  infrastruttura email** nel progetto: raccoglieremmo indirizzi che non possiamo
  contattare, aprendo un trattamento di dati che Andrei ha deciso di rimandare.
  Al suo posto: **lista manuale** di chi ha detto sì a voce.
- **Pubblicare i contenuti su Medium/Substack "intanto"**: costruisce l'autorità
  di qualcun altro e poi competiamo con la nostra stessa copia.

Apertura: **entro novembre 2026**, altrimenti si sta scegliendo il 2028 invece
del 2027 (contenuti + 4–8 mesi = gennaio–marzo).

---

# Scartato, e perché (non riproporlo) — cumulativo

Dalla v1, ancora valido:
- **Abbonamento al consumatore** — churn strutturale 100%. Avrà senso solo per i
  wedding planner (10–30 matrimoni l'anno): prodotto diverso, fase 3.
- **Prezzo per invitato** (Paperless Post, Greenvelope, Evite) — funziona solo se
  sei tu a consegnare; noi mandiamo un link WhatsApp e non sappiamo chi lo apre.
  Punirebbe il cliente migliore (matrimoni con molti invitati, il Sud).
- **Fasce di funzionalità** prima delle prime 100 vendite — gating costruito
  prima di sapere se qualcuno paga.
- **Prezzare a 29–39 €** — chiude il canale a pagamento per aritmetica.
- **Fiere sposi** — 600–1.980 € a evento. Il calendario resta utile come
  indicatore temporale (gen-feb, poi ott).
- **Tipografie come partner** — sono il concorrente.
- **Vendere la busta animata come argomento principale** — Paperless Post dal
  2009 (REGISTRO, `design`).

Aggiunto in questo giro:
- **Meta Ads e Google Ads, in qualunque forma** — non a 30 €. Non è un canale
  più piccolo, è un altro fenomeno.
- **Upsell archivio 10 anni +9 €** — rimandato da Andrei (prodotto unico).
- **Listino a due prezzi 69/29 €** — chiuso da Andrei.
- **150 € per due concorrenti** — negati; sostituiti dall'acquisto singolo da 29 €.
- **Marketplace/rivenditore che fa da venditore ufficiale** (per scaricare gli
  obblighi fiscali) — commissioni alte, si perde il cliente, e in Italia non
  esiste un marketplace adatto a un invito su misura.
- **GuestlistOnline 19,99 €** come acquisto-concorrente alternativo — costa 9 €
  meno ma è uno strumento di lista invitati, non una piattaforma flat come noi:
  insegna meno per euro speso.

---

# Numeri e fonti (verificati 2026-08-23, da rifare fra 6 mesi)

| Cosa | Valore | Fonte |
|---|---|---|
| Matrimoni Italia 2024 | 173.272, −5,9%; primi 9 mesi 2025 ancora −5,9% | ISTAT |
| Stagionalità | ~8/10 fra apr-ott, picchi giugno e settembre | ISTAT |
| Spesa media | 25.970 €, 238 €/invitato → **~109 invitati** | Report Matrimoni 2026 |
| Tempi d'acquisto | partecipazioni −2/3 mesi, save the date −6/8 mesi → picchi **marzo e giugno**; gen–mar = 45–50% dell'anno | Matrimonio.com |
| Cartaceo | 1,50–5 €/invito = **200–600 € per 100 invitati** | Stampato e Spedito |
| CPC Meta IT 2026 | 0,30–0,90 €; CPM ~10 € | Alessandro Mazza Digital |
| Budget minimo Meta | 5–10 €/gg per testare, 25–50 €/gg per uscire dall'apprendimento, 300–500 €/mese minimo | oto.agency, tready.it |
| **Nano influencer IT 2026** | **25–150 € post · 15–75 € Story · 50–300 € Reel** | Lessie, Influee |
| Stripe SEE | 1,5% + 0,25 € | stripe.com/pricing |
| **Stripe e SdI** | dal **1/7/2025** fattura da Stripe Ireland in PDF, **niente SdI** → **autofattura TD17** mensile a nostro carico, **anche forfettari** | gtechgroup.it, autofattura.io |
| **inviti.digital** | Invito **29 €** bambini / **59 €** matrimonio · Evento 69/99 € · Ricordo 109/139 € · su misura da **349 €** · +5 € hosting 10 anni | inviti.digital |
| Il Nostro Sì | "da 50 €"; 65 € inviti / 95 € partecipazioni | ilnostrosi.com |
| GuestlistOnline | gratis ≤50 invitati; **19,99 €** evento singolo illimitato | guestlistonline.com |
| Vieni al Nostro Matrimonio | 99 / 325 / 500 €, fatto a mano | vienialnostromatrimonio.it |
| **Zankyou/Matrimonio.com** | **sito di nozze GRATIS**, Premium 89 € — il più pericoloso, **e possiede la community dove stanno le spose** | matrimonio.com |
| Matrimonio.com fornitori | registrazione base gratuita; Premium 500 €/anno | condizioni legali |
| E-commerce diretto B2C | fattura solo su richiesta (art. 22 DPR 633/72); esonero scontrino (art. 2 oo DPR 696/1996, DM 10.5.2019); **registro corrispettivi** (art. 24) | Fiscomania, Ris. AdE 274/E/2009 |
| Fattura B2C se richiesta | SdI, codice destinatario **`0000000`**, copia al cliente via email | Fattura24, Confcommercio |
| Sanzione omessa fattura | **70% dell'imposta, min. 300 €/operazione**; 250–2.000 € se non incide su liquidazione IVA | D.Lgs. 87/2024 su art. 6 D.Lgs. 471/97 |
| Sanzione omessa apertura P.IVA | **500–2.000 €** | art. 5 c.6 D.Lgs. 471/97 |
| "Soglia 5.000 €" | **NON** è un permesso: è un limite contributivo INPS. Conta l'abitualità | Fiscozen, La Legge per Tutti |
| **INPS commercianti 2026** | **4.549,70 € fissi** + ~24% oltre minimale 18.808 € | fonti previdenziali 2026 |
| **INPS gestione separata 2026** | **26,07%**, nessun fisso | idem |
| Forfettario 2026 | ≤85.000 €; **5% per 5 anni** (nuove attività), poi 15%; **niente IVA in fattura** | guide 2026 |
| OSS | IVA del paese del cliente oltre **10.000 €/anno** (servizi digitali B2C UE) | Dir. UE 2017/2455 |
| Garante privacy | **200.000 €** a NH Italia (provv. 9980043, 1/6/2023) per allergie/intolleranze senza base giuridica | garanteprivacy.it |

---

# Trappole (aggiornate)

1. **L'anteprima gratis non è un vantaggio competitivo** — inviti.digital dice
   letteralmente "si personalizza gratis, si paga quando pubblichi".
2. **Il buco più costoso del funnel: non abbiamo un'email.** Proprietà in un
   cookie di sessione; cambio dispositivo = invito perso. `backend` ha risposto:
   raccomanda **richiedere account prima del checkout** (riusa codice
   esistente, zero infrastruttura) perché **non esiste nessun SMTP** nel progetto.
3. **Editor desktop + traffico mobile = soldi bruciati.** Con 30 € non compriamo
   traffico, quindi il danno oggi è teorico — ma **è la ragione per cui la
   conversione stimata scende a 0–1%** in §5.1, e il beta-tester deve dirci da
   che dispositivo ha creato l'invito.
4. **Il mercato cala del ~6% l'anno, due anni di fila.** Crescita solo da
   carta→digitale. Mai proiezioni su un mercato in crescita.
5. **Non ho volumi di ricerca verificati** e non li avrò (budget ricerca 0 €).
   Il piano editoriale è costruito sul ciclo d'acquisto, non su dati di volume.
   **Dichiaralo ogni volta.**
6. **Non ho provato i concorrenti dall'interno** — la raccomandazione sui 30 €
   serve esattamente a chiudere questa trappola. Finché non è chiusa, i confronti
   sono letture di vetrine.
7. **La quota di adozione del digitale (5–10%) resta la stima più fragile**:
   nessuna fonte la misura.
8. **Nuova**: la community di Matrimonio.com **appartiene a un concorrente**
   (gruppo Zankyou). Non usarla per reclutare o promuovere: verrà rimosso.
   Serve per ascoltare.
9. **Nuova**: `andreievictoria.it` espone **solo** `/api/stripe/webhook` e il
   REGISTRO vieta di aggiungere altri `handle` a quel blocco. Qualunque proposta
   di esposizione deve usare **un hostname diverso**, o viene giustamente
   respinta.

---

# Stato lasciato — 2026-08-23 (incarico 2)

- Riscritto `squadra/marketing-strategia.md` (v2, 999 righe): sostituisce la v1.
- **NON** ho toccato `REGISTRO.md`, `DOMANDE.md`, `DOMANDE-PER-ANDREI.md` —
  altri agenti in parallelo, il coordinatore unisce. **7 voci per REGISTRO
  (A–G), 5 domande fra agenti e 4 domande per Andrei** sono in appendice al
  documento e nel report finale.
- Nessun acquisto, nessun contatto, nessun account creato, zero speso.

## Da verificare al prossimo incarico, in quest'ordine

1. **Esiste il sottodominio di beta con password?** Se no, è ancora il blocco
   n.1 e non c'è altro da pianificare. Non riscrivere il piano: insisti.
2. **Andrei ha risposto sui 30 €?** Se ha comprato inviti.digital, il primo
   lavoro è il **confronto dall'interno** (checkout, email post-acquisto,
   informativa RSVP, documento fiscale) e l'aggiornamento della trappola 6.
3. **Ha parlato con un commercialista?** La risposta su
   commercianti-vs-gestione-separata cambia il conto economico più di qualunque
   canale.
4. **È stato spento il campo intolleranze per la beta?** (voce E del REGISTRO)
5. Se la beta è partita: raccogliere **il dato sui dispositivi** — è la misura
   che dice se l'editor desktop-only è un problema vero o un'ipotesi.
6. Sono state recepite le voci dell'incarico 1? In particolare: ponte mobile,
   durata anteprima (Andrei ha già risposto: segni/filigrana + RSVP visibile ma
   disattivata), parametro di provenienza sui link.

---

# Incarico 1 — 2026-08-23 — archivio

Il piano originale (69/29 €, canali con budget Meta 300–500 €/mese, sequenza
F0–F5, prima ondata influencer) è **superato dall'incarico 2**. Quello che vale
ancora è stato riportato sopra; il resto è storia. Se serve il ragionamento
completo sul prezzo 69 €: partiva dal CAC 12–30 € a CPC 0,60 € e conversione
2–5%, da cui «sotto i ~50 € il canale a pagamento è matematicamente chiuso».
**Quel ragionamento ha eletto 69 € ed è ancora la difesa migliore del prezzo**,
anche se oggi il canale a pagamento non esiste per mancanza di budget e non per
aritmetica.
