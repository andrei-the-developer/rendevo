# Inviti digitali v2

Piattaforma inviti multi-evento con editing sulla pagina stessa.
Leggi [ARCHITETTURA.md](ARCHITETTURA.md) per il perché delle scelte.

> **SVOLTA DEL 2026-08-24 — leggere prima del resto.** Decisione di Andrei:
> **il pagamento non esiste più.** Niente Stripe, niente 69 €, niente diritto
> da comprare: il link permanente è gratuito per tutti. La strategia dell'MVP è
> farlo usare, farlo conoscere e farlo passare di mano; il pagamento (e la
> burocrazia che si porta dietro) si affronta quando ci saranno utenti.
> Il codice Stripe è conservato in `backend/archivio-pagamenti/` con le
> istruzioni per rimetterlo — vedi il LEGGIMI lì dentro.
>
> Nello stesso giorno: `beta.andreievictoria.it` e la sua password sono
> spariti. Il sito è pubblico su `andreievictoria.it` e `www`, con la landing
> statica su `/` e l'editor su `/edit`.
>
> Aggiunto la notte del 24: **`/e/{id}/risposte`**, la schermata da cui il
> proprietario legge le conferme (`GET /api/eventi/{id}/risposte`, solo per
> chi possiede l'invito). Tolto dal modulo RSVP il campo libero "Due righe
> per noi"; il server accetta ancora `messaggio` e le risposte raccolte prima
> lo conservano.
>
> **2026-08-25 — accesso aperto, temporaneo.** Il controllo di proprietà
> sugli inviti è **disattivato**: chiunque conosca l'URL `/e/{id}` apre
> quell'invito, lo modifica e ne legge le risposte. Interruttore unico:
> `modifica_aperta` in `backend/app/config.py`, sovrascrivibile senza
> ricompilare con `INVITI_MODIFICA_APERTA=false` nel `.env`.
> **Va rimesso a False prima del lancio**: le pagine `/e/{id}/risposte`
> contengono nomi di invitati, cioè dati personali di terzi.
>
> **2026-08-26 — la radice e` un invito.** `andreievictoria.it` e
> `www.andreievictoria.it` servono direttamente l'invito di Andrei e Victoria
> (riscrittura Caddy verso `/i/<token>`, interna: nella barra resta il dominio
> nudo). Tutto quell'host e` `noindex`.
> La pagina pubblica del prodotto si e` spostata su
> **`home.andreievictoria.it`**, che richiede il record A `home`.
>
> **Due link per lo stesso invito (2026-08-26).**
> - `andreievictoria.it` — invito completo, con la spunta "vengo accompagnato".
> - `andreievictoria.it/invito` — stesso invito, senza quella spunta: chi
>   risponde da qui puo` solo dire se viene e come si chiama.
>
> E` una variante dell'**indirizzo**, non dell'invito: i blocchi sono gli
> stessi. Caddy riscrive entrambi su `/i/<token>` e passa due intestazioni —
> `X-Invito-Percorso` (per `og:url`) e `X-Invito-Semplice` (per la spunta).
>
> **Inviti tradotti (2026-08-26).** `/ro` rumeno, `/gr` greco, `/es` spagnolo.
> Stesso evento, stesso database, stesse risposte: la traduzione vive solo nel
> rendering (`frontend/lib/lingue.ts` per l'interfaccia,
> `frontend/lib/invito-tradotto.ts` per i testi degli sposi). **Il backend non
> e` stato toccato.**
>
> Il prezzo: le traduzioni non seguono l'editor. Se cambia un testo italiano,
> le altre tre lingue restano indietro finche' non si aggiorna quel file.
>
> Per il greco servono caratteri a parte (Noto Serif/Sans): nessuno dei
> caratteri scelti dall'utente ha l'alfabeto greco.
>
> **Tutto quello che sotto parla di Stripe, del prezzo o della beta protetta
> descrive com'era, non com'è.**


L'MVP funzionante di prima vive in `../inviti` e **non va toccato**: resta
utilizzabile finché questo progetto non è pronto a sostituirlo.

## Stato

| Fase | | Stato |
|---|---|---|
| F0 | Impalcatura, schema, migrazioni | fatto |
| F1 | Modello a blocchi, API, renderer | fatto |
| F2 | Editor: click sinistro o destro, popup, sposta/nascondi/elimina | fatto |
| F2b | Upload foto dall'editor | fatto (copertina + galleria) — audio ancora da fare |
| F3 | Registrazione, login e trasferimento degli inviti anonimi | fatto (essenziale — vedi sotto) |
| F4 | Link permanenti e pagamenti Stripe | modello dati pronto, manca Stripe |
| F5 | Temi, palette e tipi di evento | 3 tipi, 2 temi × 2 palette, busta |

Funziona già: creare un evento senza registrarsi, modificarlo col click
destro, scegliere tema e palette, generare un link di anteprima da 10
minuti, aprirlo come invitato — busta col sigillo, apertura animata e musica
che parte al clic.

## Avvio in sviluppo

Questa macchina non ha un demone Docker, quindi i servizi girano nativi.

```bash
./avvia-sviluppo.sh          # avvia Postgres e Redis, poi stampa le istruzioni

# in due terminali:
cd backend  && .venv/bin/python -m uvicorn app.main:app --reload --port 8000
cd frontend && npx next dev --hostname 0.0.0.0 --port 5000
```

Poi **http://localhost:5000** — non `127.0.0.1`, che Next tratta come origin
diverso e blocca l'HMR. La porta e la base pubblica stanno in
`frontend/.env.local`.

Prima volta:

```bash
python3 -m venv backend/.venv
backend/.venv/bin/pip install -r backend/requisiti.txt
(cd backend && .venv/bin/alembic upgrade head)
(cd frontend && npm install)
```

## Deploy

`docker-compose.yml` + `Caddyfile` descrivono lo stack self-hosted: Postgres,
Redis, MinIO, API, web e Caddy per TLS. Variabili richieste: `POSTGRES_PASSWORD`,
`MINIO_USER`, `MINIO_PASSWORD`, `SEGRETO`, `DOMINIO`.

Dietro Caddy l'API sta sotto `/api` sullo stesso dominio: nessun CORS, e il
cookie di sessione viaggia senza configurazione.

## Come è fatto

```
backend/app/
  modelli.py    tabelle SQLAlchemy
  blocchi.py    tipi di blocco Pydantic + modelli per tipo di evento
  servizi.py    creazione eventi, operazioni, link
  sessioni.py   cookie di sessione firmato
  storage.py    upload: disco in sviluppo, MinIO in produzione
  main.py       rotte

frontend/
  componenti/blocchi/   un componente per tipo di blocco — il renderer unico
  componenti/editor/    tela con click destro e popup
  app/i/[token]/        pagina invitato (SSR, tag og:)
  app/e/[id]/           editor
  app/temi.css          palette (colori) + temi (caratteri e ornamenti)
  public/ornamenti/     trame e fregi, un paio di SVG per tema
  public/musica/        il brano incluso (generato, vedi sotto)
strumenti/
  genera_brano.py       sintetizza il brano predefinito
```

### La busta e la musica

L'invito si apre da una busta col sigillo di cera (`componenti/blocchi/
Sipario.tsx` + `CartaBusta.tsx`). È un blocco come gli altri — tipo `busta`,
modificabile col click destro — ma non sta nel flusso delle sezioni: lo
disegna il sipario davanti alla pagina. Nasconderlo fa arrivare gli invitati
direttamente all'invito.

La busta è tutta CSS: falde ritagliate col `clip-path`, lembo che ruota su
`rotateX` con la prospettiva sul contenitore, sigillo con bordo dentellato.
Prende i colori e i caratteri dal tema, così aprendola il tema «compare».
La sequenza è sigillo → lembo → lettera → dissolvenza; la durata in
`DURATA_APERTURA` deve restare allineata alle animazioni in `blocchi.css`.

Il clic sulla busta è anche il gesto che sblocca l'audio: i browser non
lasciano partire la musica senza interazione dell'utente, quindi non esiste
un modo per farla suonare prima.

Il brano incluso è **sintetizzato da noi** con `strumenti/genera_brano.py`
(sola libreria standard, nessuna registrazione di partenza): non porta
diritti di terzi. Per rigenerarlo:

```bash
python3 strumenti/genera_brano.py
cd frontend/public/musica
lame --quiet -V4 -q 2 predefinito.wav predefinito.mp3
oggenc -Q -q 4 -o predefinito.ogg predefinito.wav && rm predefinito.wav
```

L'OGG è servito per primo perché si ripete senza il buchino che l'MP3 si
porta dietro dalla codifica; Safari non lo legge e usa l'MP3.

### Temi e palette

Sono **due dimensioni indipendenti**, e ogni combinazione è valida:

| | cosa porta | valori |
|---|---|---|
| tema | caratteri e ornamenti | `sobrio`, `romantico` |
| palette | colori | `oliva`, `blu` |

Il tema `sobrio` non aggiunge niente oltre alla tipografia, più un filetto
sotto i titoli. Il `romantico` mette due strisce di fiori nei margini
sinistro e destro e un rametto sotto i titoli.

**Gli ornamenti sono maschere CSS, non immagini colorate.** Gli SVG in
`public/ornamenti/` sono disegnati in bianco e usati come `mask-image`, con
il colore preso da `--ornamento`: così i fiori del tema romantico cambiano
tinta al cambio di palette senza duplicare un solo file. È il motivo per cui
non ci sono SVG per-palette.

Aggiungere una palette: un blocco di token sotto `[data-palette="nome"]` in
`app/temi.css` più una voce in `PALETTE` in `backend/app/blocchi.py`, che è
anche la validazione. Aggiungere un tema: idem sotto `[data-tema="nome"]` e
in `TEMI`.

I temi ritirati vanno in `ALIAS_TEMI` invece di essere cancellati, e la
migrazione rimappa le righe esistenti — `salvia`, `agrumi`, `allegro` e
`notte` sono confluiti in `sobrio`.

### Colori e leggibilità

`--primario-chiaro` e `--accento` portano **testo** (le ore del programma,
le etichette dei luoghi): stanno a 4,5:1 sul fondo. Per il decoro puro
esiste `--decoro`, più chiaro, e `--ornamento` per i fiori — su quei due non
va mai messo del testo.

Verifica: apri un invito e misura il contrasto reale nel DOM invece di
dedurlo dai token. Tutte e quattro le combinazioni passano AA.

### Nessuna linea fra le sezioni

Lo scorrimento è continuo: non ci sono bordi che segnino dove una sezione
finisce. Il ritmo lo dà lo spazio verticale (`--sezione-y`). Se rimetti un
bordo, rimetti anche il problema che i blocchi nell'editor sono avvolti in un
involucro, quindi `.sezione + .sezione` non scatta — va agganciato a
`.blocco-guscio + .blocco-guscio`.

### Niente schermata di scelta, sempre in modifica

`/` non mostra più un modello da scegliere: un client component (`app/
page.tsx`) controlla se la sessione ha già un invito (`GET /api/eventi`) e
lo riprende, altrimenti ne crea uno (matrimonio come partenza — il tipo
conta poco, si personalizza tutto dopo) e reindirizza a `/e/{id}`. Fatto
apposta lato client, non lato server: creare l'evento via server component
avrebbe richiesto ritrasmettere a mano l'header `Set-Cookie` della nuova
sessione anonima dal backend al browser — lato client il cookie lo gestisce
il browser stesso, senza alcun relay.

Nell'editor **non esiste più una modalità di sola lettura**: niente
interruttore "Modifica attiva", si è sempre pronti a modificare. Click
sinistro o destro aprono lo stesso popup — `involucro()` in `Tela.tsx`
attacca lo stesso handler a `onClick` e `onContextMenu`. Per vedere l'invito
come lo vedrà un invitato si passa dall'anteprima, non da un interruttore.

La busta è un blocco come gli altri, sempre in cima alla lista: niente
sipario, niente tasto "Rivedi la busta" (non serve più, la busta non si
richiude mai). **L'animazione di apertura resta un'esclusiva della pagina
invitato e dell'anteprima** — l'unico posto dove `Sipario` viene ancora
montato è `app/i/[token]/page.tsx`. Questo ha richiesto un piccolo
sdoppiamento in `Blocco.tsx`: il caso `"busta"` ora rende davvero
`<FronteBusta>` (prima tornava `null`, perché ci pensava sempre `Sipario`);
chi non vuole quel rendering — la pagina invitato — lo esclude passando
`salta={["busta"]}` a `ListaBlocchi`, come già faceva.

### Login e registrazione

Endpoint in `backend/app/auth.py` + rotte in `main.py`:
`POST /api/auth/registrati`, `POST /api/auth/accedi`, `POST /api/auth/esci`,
`GET /api/auth/chi_sono`.

- **Hash delle password**: `hashlib.scrypt` della libreria standard, non
  bcrypt/passlib — Python la offre già (compilata contro OpenSSL), non c'è
  motivo di aggiungere una dipendenza per questo. Verifica a tempo costante
  con `hmac.compare_digest`.
- **Validazione email**: una regex leggera (`auth.email_valida`), non
  `pydantic[email]` — evita di aggiungere `email-validator` per un controllo
  che non deve essere RFC 5322 completo.
- **Il trasferimento della bozza** (`auth.collega_sessione_a_utente`) è la
  stessa funzione sia per la registrazione sia per il login: chi accede su
  un browser con già un invito anonimo in corso non lo perde. Un `UPDATE`
  sposta gli eventi da `proprietario_sessione_id` a `proprietario_utente_id`
  e lega la sessione corrente all'account.
- **Logout**: `sessione.utente_id = None`. La sessione (e il suo cookie)
  restano gli stessi — non serve un nuovo cookie — ma da quel momento
  `/api/eventi` non mostra più gli inviti dell'account, solo quelli
  eventualmente creati dopo, in anonimato.
- **Rate limit sul login**: 8 tentativi ogni 10 minuti per IP, in memoria
  (stesso schema del limite RSVP dell'MVP precedente — se si passa a più
  worker va spostato su Redis, già nello stack ma non ancora usato qui).
  Stesso messaggio d'errore per email inesistente e password sbagliata:
  non si conferma quali email sono registrate.

**Non implementato**, deliberatamente fuori scope per ora: reset password,
verifica email, nome utente separato dall'email (l'intestazione mostra
l'email per intero), OAuth, gestione multi-dispositivo.

### Segnaposto di default

Un invito appena creato non è più vuoto: copertina e galleria partono già
con tessere segnaposto (disegnate da zero con Pillow, `backend/app/
genera_segnaposto.py` — nessuna foto stock, stesso principio del brano
incluso). Sostituibili col click destro come qualunque altro campo.

- `backend/app/assets_semina/` — le tessere già pronte (3 misure ciascuna),
  committate in git. Rigenerarle con
  `.venv/bin/python -m app.genera_segnaposto`.
- `storage.semina_immagine()` copia una tessera nello storage del nuovo
  evento (chiave propria, stessa forma di un upload vero) e
  `servizi.crea_evento()` la aggancia al blocco hero e ai quattro blocchi
  della galleria.
- L'upload vero e proprio (`componenti/editor/Popup.tsx`) usa
  `lib/api-client.ts::caricaAsset()` — un helper *separato* da
  `chiamaClient()`, perché quest'ultimo forza sempre
  `Content-Type: application/json`, che rompe un upload multipart (il
  browser deve fissare da sé il boundary).
- Le operazioni sulle foto sono **immediate**, non in attesa del tasto
  "Salva": la nuova azione `impostaCampo` del popup applica subito
  un'operazione `aggiorna` senza chiudere la finestra, così si possono
  caricare più foto di fila nella galleria prima di uscire.

Effetto collaterale positivo: avendo sempre una foto hero, `og:image` è
sempre popolato — un invito condiviso prima di essere personalizzato mostra
comunque un'anteprima su WhatsApp, non un link nudo.

### Rifinitura visiva (ricerca sul settore)

Tre ricerche in parallelo su prodotti reali (screenshot via Playwright, non
descrizioni a memoria) — internazionali (Paperless Post, Appy Couple, WithJoy),
italiani (Il Nostro Sì, Partecipazioni Link) e sigilli/ornamenti editoriali —
hanno portato a un ribaltamento concreto: **il sigillo di cera non deve avere
il bordo dentellato**. Le foto macro reali mostrano cerchi lisci con un
profilo a "ciambella" (anello esterno rialzato, disco interno incassato) e un
monogramma debossato — stesso colore della cera, rilievo dato da una doppia
ombra opposta, mai un colore a contrasto sopra.

Applicato in `app/blocchi.css`:

- **Sigillo**: via il `clip-path` a punte, dentro tre `box-shadow` inset
  concentrici per il profilo a ciambella, colore desaturato vicino al fondo
  (non un colore pieno), monogramma debossato, ombra portata netta e corta
  invece che diffusa. **Nota**: `box-shadow` non accetta percentuali per lo
  spread — un valore non valido in un layer manda a `none` l'intera
  dichiarazione, comprese le ombre valide accanto. Usare sempre un'unità
  assoluta (`rem`, `px`).
- **Imperfezione volontaria**: `rotate: -1.3deg` sulla busta chiusa —
  proprietà separata da `transform`, non confligge con hover/apertura.
- **Arco in cima alla lettera**: `border-radius` ellittico a due valori
  (`50% 50% … / 2.4rem 2.4rem …`), non maschere né SVG — nessun prodotto
  osservato chiude la carta con quattro angoli identici.
- **Grana della carta**: `public/ornamenti/grana.svg` (`feTurbulence` a
  bassissima opacità) come secondo `background-image` con
  `background-blend-mode: multiply` su lettera e dorso della busta.
- **`&` in oro a riflesso**: gradiente lineare clippato sul testo
  (`background-clip: text`) invece di un colore piatto.
- **Ornamento romantico ripensato**: non più due strisce di fiori che si
  ripetono lungo tutta la pagina, ma un **ramo asimmetrico per sezione**
  (`ramo-angolo.svg`), in alto a sinistra e in basso a destra (ruotato,
  non una fotocopia), che cambia a ogni sezione mentre si scorre — meno
  invasivo di una tappezzeria continua, coerente con quanto osservato nel
  mercato italiano (rami singoli asimmetrici, non griglie dense e simmetriche).

Segnalate ma **non implementate** (cambierebbero cose già decise altrove in
questa conversazione, quindi lasciate alla tua scelta): una terza palette
pesca/terracotta (il mercato italiano la usa molto, ma qui le palette sono
fissate a due), un font script opzionale per i nomi, un hint di scroll come
alternativa al tap sulla busta (il mercato italiano usa quasi sempre quello,
non un'apertura animata come la nostra), cornici ad angoli aperti per il
countdown, foto ad arco per i luoghi.

### Le tre cose da sapere prima di modificare

**Un solo renderer.** `componenti/blocchi/Blocco.tsx` smista tipo → componente
e `ListaBlocchi.tsx` percorre la lista; li usano sia la pagina invitato sia
l'editor. Se aggiungi un modo di renderizzare un blocco altrove, hai rotto la
garanzia che l'admin veda quello che vedrà l'ospite. `ListaBlocchi` esiste
proprio per questo: gli ornamenti fra sezioni hanno bisogno che i blocchi
siano fratelli nel DOM, e con due percorsi diversi comparivano solo da un
lato.

**I token del tema stanno su `[data-tema]`, non su `body`.** Le variabili CSS
scendono ai figli e non risalgono: `body { font-family: var(--ui) }` non
risolve e il testo cade su Times senza dire niente.

**`posizione` è `numeric`.** Per infilare un blocco tra due esistenti si fa la
media delle loro posizioni: un solo `UPDATE`, nessuna rinumerazione.

**L'SSR non è opzionale.** I crawler delle chat non eseguono JavaScript: i tag
`og:` devono stare nell'HTML della prima risposta. Spostare la pagina invitato
su rendering client fa arrivare l'invito su WhatsApp come link nudo.

## Verificato

Test end-to-end nel browser: creazione senza registrazione, click destro →
popup → salvataggio con avanzamento di versione, spostamento su/giù,
nascondi, elimina, modalità lettura identica all'invito, link di anteprima,
tag `og:` presenti nell'HTML server-side. Isolamento fra sessioni, conflitti
di versione (409), `javascript:` svuotato dai link mappa, gating del
pagamento (402), 404 contro 410 sui link.

Verificata anche la busta: sigillo e lembo nelle due palette,
sequenza di apertura, scroll bloccato a busta chiusa, musica che parte al
clic e non prima, sipario smontato alla fine.

Non ancora verificato: **come suona** il brano incluso — ne ho misurato
livelli e altezze (progressione Fa–Rem–Si♭–Do, RMS uniforme), ma non posso
ascoltarlo. Nemmeno il comportamento con più utenti in scrittura simultanea.
