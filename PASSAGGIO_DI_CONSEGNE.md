# Passaggio di consegne

## Stato del deploy — 2026-08-23, server m2

**Live e verificato in HTTPS**: `https://andreievictoria222.it/` (homepage
200, `/api/salute` 200). Questa sezione è il posto dove guardare per lo
stato attuale — il resto del file racconta le decisioni di
prodotto/codice, non l'infrastruttura.

**Il dominio è cambiato lo stesso giorno**, su richiesta esplicita: prima
era `andreievictoria.it` (DNS pubblico, certificato Let's Encrypt reale),
poi spostato su `andreievictoria222.it` per non essere pubblicamente
raggiungibile. Dettagli che contano per chi tocca questa parte:
- `andreievictoria222.it` **non è in DNS pubblico** — funziona solo per
  chi ha una voce manuale nel proprio `/etc/hosts` (`169.58.224.54
  andreievictoria222.it`) o equivalente. Let's Encrypt non può validarlo
  (i suoi server non vedono quella voce), quindi il sito usa **la CA
  interna di Caddy** (`tls internal` nel Caddyfile) — certificato valido
  solo per chi ha importato la root CA locale
  (`/var/lib/caddy/.local/share/caddy/pki/authorities/local/root.crt`
  sul server) nel proprio trust store; altrimenti il browser segnala
  "non sicuro".
- `andreievictoria.it` (il dominio pubblico precedente) **è stato
  rimosso dal Caddyfile apposta** — non serve più l'app, una richiesta TLS
  con quell'SNI ora fallisce l'handshake invece di raggiungere il sito.
  Il certificato Let's Encrypt già ottenuto resta su disco ma non viene
  più rinnovato.
- **Il nome del dominio da solo non è un controllo di accesso**: chiunque
  scopra l'IP del server (`169.58.224.54`) può comunque connettersi
  impostando lo stesso SNI/Host header a mano (es. `curl --resolve`),
  esattamente come ho fatto io per testare. Non è stato aggiunto nessun
  allowlist IP o autenticazione — scelta esplicita di chi ha chiesto
  questo cambio, non una dimenticanza. Se in futuro serve un accesso
  davvero privato, quello è il pezzo da aggiungere (Caddy `remote_ip` o
  simile), non un altro cambio di dominio.
- `DOMINIO` nel `.env` di questa cartella e `NEXT_PUBLIC_BASE_URL` /
  `INVITI_ORIGINI_CORS` che ne derivano sono stati aggiornati e i
  container `api`/`web` ricreati di conseguenza.

**Topologia**: Caddy di sistema (`/etc/caddy/Caddyfile`, fuori da questo
repo, gestito da systemd) fa da reverse proxy con TLS automatico su
`:80`/`:443` verso i container Docker, che pubblicano solo su
`127.0.0.1` (nessuna porta esposta all'esterno se non 80/443 via Caddy).
`docker-compose.override.yml` in questa cartella descrive come:
- `proxy` (il Caddy incluso nel compose) resta dietro il profilo
  `bundled-proxy`, non parte — userebbe le stesse porte 80/443 del Caddy
  di sistema, che le ha già.
- `minio` resta dietro il profilo `s3` (vedi "Gap trovati" sotto).
- `api` gira con `INVITI_STORAGE=locale`, upload persistiti su bind mount
  `./dati-produzione/upload` (proprietario uid 10001, l'utente non-root
  del container — creata a mano, un volume Docker gestito non avrebbe
  avuto i permessi giusti al primo mount).

**Segreti**: `.env` in questa cartella (chmod 600, già in `.gitignore`,
generato con `openssl rand`) — `POSTGRES_PASSWORD`, `MINIO_USER`,
`MINIO_PASSWORD`, `SEGRETO`, `DOMINIO=andreievictoria222.it`. Chi riprende
il progetto su questa macchina li trova lì; su un'altra macchina vanno
rigenerati (`SEGRETO` nuovo invalida tutte le sessioni anonime esistenti).

**Due bug reali trovati analizzando il progetto per il deploy** (non
scelte di questo server — capiterebbero a chiunque usasse questi file
così come sono):
1. `docker-compose.yml`: il volume di `db` era montato su
   `/var/lib/postgresql/data`, ma `postgres:18-alpine` vuole un mount su
   `/var/lib/postgresql` (gestisce da sé la sottodirectory versionata) —
   con `.../data` il container va in crash loop al primo avvio. **Corretto
   direttamente nel file**, non nell'override: è un bug del compose, non
   una scelta di deploy.
2. `INVITI_STORAGE=s3` è cablato nel compose ma **`boto3` non è in
   `backend/requisiti.txt`** — il container `api` andrebbe in errore al
   primo upload. Mancano anche il bootstrap del bucket MinIO (nessun
   `mc mb` da nessuna parte) e una rotta `/media` su Caddy verso MinIO (il
   `Caddyfile` del progetto ha solo `/api/*` e il default). Deployato con
   `INVITI_STORAGE=locale` (verificato funzionante in sviluppo, vedi
   sotto) finché qualcuno non completa i tre pezzi mancanti e riattiva il
   profilo `s3`.

**Per rifare il deploy dopo una modifica**:
```bash
cd /home/user/projects/inviti-v2
sudo docker compose build            # ricostruisce le immagini cambiate
sudo docker compose up -d            # riavvia solo i container cambiati
sudo docker compose logs -f api web  # per controllare che sia partito bene
```
Migrazioni Alembic partono da sole all'avvio di `api` (`CMD` nel
Dockerfile). Log applicativi: `sudo docker compose logs`. Log HTTP di
Caddy: `/var/log/caddy/andreievictoria222.access.log`. Riavvio del solo
proxy: `sudo systemctl reload caddy` (config in `/etc/caddy/Caddyfile`,
**non** in questa cartella).

**Non toccato**: il vecchio MVP menzionato sotto (`../inviti`) non esiste
su questa macchina — nessun conflitto da gestire qui.


Questo documento è il punto di partenza per chiunque — persona o AI — riprenda
questo progetto senza aver visto la conversazione in cui è nato. `README.md`
spiega **come far girare il codice**; `ARCHITETTURA.md` è la proposta
originale (F0–F5) con cui è iniziato il progetto. Questo file racconta **cosa
è stato deciso, perché, e cosa manca** — la parte che altrimenti si perde.

Leggilo prima di toccare qualcosa. Poi apri `README.md` per i comandi.

## Cos'è

Una piattaforma di inviti digitali per eventi (matrimonio, compleanno, festa a
sorpresa), mercato italiano. Chi organizza crea un invito senza registrarsi,
lo personalizza in un editor visuale (click sinistro o destro su qualsiasi
parte), e ottiene un link da mandare su WhatsApp. Chi lo riceve apre una busta
con sigillo di cera, sente la musica, scorre i dettagli, risponde se ci sarà.

## Non è il primo tentativo

Esiste un **MVP precedente in `../inviti`** (fuori da questa cartella) —
FastAPI + Jinja2 + SQLite, un solo tipo di evento (matrimonio), niente
editing visuale. Funziona ancora, è in produzione di fatto, **non va toccato
né cancellato**. Questo progetto (`inviti-v2`) lo sostituirà quando sarà
pronto, ma finché non lo è, i due convivono. Se qualcuno chiede "perché due
cartelle di un progetto che sembra lo stesso", questa è la risposta.

Il motivo per cui l'MVP non è stato semplicemente estenso, invece di
riscritto: aveva lo schema del database cablato sul matrimonio (colonne come
`cerimonia_nome`, `ricevimento_ora`), Jinja produceva HTML già finito senza
un punto dove attaccare l'editing, e SQLite ammette un solo scrittore. Un
compleanno o un editor visuale ci sarebbero entrati a forza, non a schema.

## La decisione che regge tutto il resto

**Un evento non ha campi fissi: ha una lista ordinata di blocchi tipizzati.**
Ogni blocco è uno tra `busta`, `hero`, `testo`, `countdown`, `programma`,
`luogo`, `galleria`, `nota`, `musica`, `rsvp` — definiti come modelli Pydantic
in `backend/app/blocchi.py`, salvati come JSONB in Postgres. Un "matrimonio",
un "compleanno" e una "festa a sorpresa" sono semplicemente **liste diverse
degli stessi blocchi** (`MODELLI` in quel file) — non hanno mai richiesto
codice diverso, solo composizione diversa.

Aggiungere un tipo di evento oggi: una voce in `MODELLI`, zero righe di
codice altrove. Questo è il test che conta — se aggiungere qualcosa richiede
di toccare il renderer, la decisione a monte è sbagliata.

### Tema e palette sono due assi separati

Non "temi" nel senso di skin monolitiche: **il tema** (`sobrio` / `romantico`)
decide caratteri e ornamenti, **la palette** (`oliva` / `blu`) decide i
colori. Ogni combinazione è valida — un compleanno può avere il tema
romantico con la palette blu. Registro in `backend/app/blocchi.py`
(`TEMI`, `PALETTE`), token CSS in `frontend/app/temi.css`.

Gli ornamenti del tema romantico sono **maschere CSS**, non immagini
colorate: gli SVG in `public/ornamenti/` sono bianchi, il colore arriva da
`var(--ornamento)` via `mask-image`. Un ramo che cambia tinta con la palette
senza duplicare un file.

## Il renderer è uno solo, letteralmente

`frontend/componenti/blocchi/Blocco.tsx` smista `tipo → componente`.
`ListaBlocchi.tsx` percorre l'array di blocchi. Li usano **sia** la pagina
invitato (`app/i/[token]/page.tsx`, sola lettura, SSR) **sia** l'editor
(`componenti/editor/Tela.tsx`). Non esiste un secondo renderer da tenere
sincronizzato: se un blocco si vede in un modo, si vede in quel modo ovunque,
per costruzione, non per disciplina.

Questo principio ha già causato — e risolto — un bug reale: i primi
ornamenti fra sezioni usavano il selettore CSS `.sezione + .sezione`, che
funzionava sulla pagina invitato ma non nell'editor (dove ogni blocco è
avvolto in un `<div>` extra per il click-to-edit, rompendo la relazione di
fratellanza nel DOM). Soluzione: **`ListaBlocchi` è l'unico punto che
itera i blocchi**, e sia l'ospite sia l'editor gli passano la stessa
struttura — un parametro `avvolgi` opzionale per aggiungere il comportamento
di modifica, non un albero diverso.

### La busta: un caso speciale gestito con un parametro, non un ramo di codice

Sulla pagina invitato, la busta è un **sipario** (`Sipario.tsx`) che copre
tutto lo schermo, blocca lo scroll, e all'apertura anima sigillo → lembo →
lettera. Nell'editor, la busta è **un blocco come gli altri**, ferma, in
cima alla lista, modificabile con lo stesso click di tutto il resto —
**niente animazione, niente sipario**: quella resta un'esclusiva
dell'anteprima e della pagina che riceve l'ospite.

Il modo in cui questo resta un solo renderer: `Blocco.tsx` per il tipo
`"busta"` rende sempre `<FronteBusta>` davvero (non più `null`); chi vuole
escluderlo dal flusso normale — la pagina invitato, perché ci pensa
`Sipario` — passa `salta={["busta"]}` a `ListaBlocchi`. L'editor non passa
quel parametro, quindi la busta gli arriva nel flusso normale.

## Editing: operazioni, non un documento intero

`POST /api/eventi/{id}/operazioni` accetta un batch di operazioni
(`aggiorna`, `sposta`, `inserisci`, `elimina`, `visibilita`, `tema`,
`palette`), non un PUT del documento intero. Il client manda anche la
`versione` che credeva di avere; il server la confronta con quella vera
sotto `SELECT ... FOR UPDATE` e risponde 409 se sono diverse. Questo è
undo/redo futuro, autosave, e rilevamento conflitti — tutto gratis, perché
la forma dei dati lo permette, non perché sono stati costruiti a parte.

`posizione` sui blocchi è `numeric`, non `integer`: infilare un blocco tra
due esistenti costa la media delle loro posizioni (un solo `INSERT`), non
una rinumerazione di tutta la lista.

**Non esiste più una modalità "sola lettura" nell'editor.** All'inizio ce
n'era una (interruttore "Modifica attiva"), è stata rimossa: si è sempre
pronti a modificare, click sinistro o destro aprono lo stesso popup
(`involucro()` in `Tela.tsx` attacca lo stesso handler a entrambi). Per
vedere l'invito come lo vedrà un ospite si genera un'anteprima, non si
spegne un interruttore.

## Sessioni, account, e chi possiede cosa

Nessuna registrazione richiesta per iniziare: alla prima visita, un cookie
di sessione firmato (`sessioni.py`, HttpOnly/Secure/SameSite=Lax) viene
creato e un evento viene generato o ripreso — la logica sta in
`frontend/app/page.tsx`, **lato client apposta**: farlo lato server avrebbe
richiesto ritrasmettere a mano l'header `Set-Cookie` della nuova sessione
dal backend al browser (il fetch server-to-server di Next non lo fa da
solo), mentre lato client il browser lo gestisce già.

Un evento appartiene *o* a una sessione *o* a un utente, mai a nessuno dei
due — vincolo `CHECK` nel database, non solo nel codice applicativo
(`evento_ha_un_proprietario` in `modelli.py`).

**Login e registrazione** (`backend/app/auth.py` + rotte in `main.py`):
- Hash password con `hashlib.scrypt` della libreria standard — non
  bcrypt/passlib, non c'è motivo di aggiungere una dipendenza per questo.
  Verifica a tempo costante (`hmac.compare_digest`).
- Validazione email con una regex leggera, non `pydantic[email]` — evita
  `email-validator` come dipendenza per un controllo che non deve essere
  RFC 5322 completo.
- **La stessa funzione** (`collega_sessione_a_utente`) gestisce sia la
  registrazione sia il login: chi arriva con un invito anonimo già in
  corso non lo perde, viene trasferito con un `UPDATE`.
- Logout non ruota il cookie: azzera solo `sessione.utente_id`. La
  sessione anonima torna a essere quella dopo, semplicemente senza vedere
  più gli inviti dell'account.
- Rate limit sul login in memoria (8 tentativi / 10 minuti / IP) — se si
  passa a più worker va spostato su Redis (già nello stack, non ancora
  usato per altro).

**Non fatto, deliberatamente**: reset password, verifica email via posta,
un campo "nome" separato dall'email (l'intestazione mostra l'email per
intero), login social, gestione di più dispositivi/sessioni per lo stesso
utente.

## Link e anteprima

`link_condivisione.scade_il` è nullable: valorizzato = anteprima (10
minuti, gratis, non raccoglie risposte — pensata per chi crea l'invito,
non per gli ospiti), `NULL` = permanente (richiede una riga in `diritto`,
che oggi va inserita a mano nel database perché **Stripe non è ancora
collegato** — il modello dati è pronto, il webhook no). Un link scaduto
risponde `410`, non `404`: un invitato che trova un link morto deve
capire che è scaduto, non pensare che il sito sia rotto.

## Segnaposto, non spazi vuoti

Un invito appena creato non è vuoto: copertina e galleria partono già con
tessere segnaposto generate da zero con Pillow
(`backend/app/genera_segnaposto.py` — icona universale "immagine assente",
nessuna foto stock), sostituibili col click come qualunque altro campo.
Stesso principio per il brano musicale incluso di default
(`strumenti/genera_brano.py` — sintetizzato con la sola libreria standard,
zero diritti di terzi perché non deriva da nessuna registrazione esistente).

Effetto collaterale utile: avendo sempre una foto hero, `og:image` è
sempre popolato — un invito condiviso prima di essere personalizzato mostra
comunque un'anteprima su WhatsApp, non un link nudo.

## Perché certe cose sono come sono (decisioni minori ma non ovvie)

- **`box-shadow` non accetta percentuali per lo spread.** Un valore non
  valido in un layer manda a `none` *l'intera dichiarazione*, comprese le
  ombre valide accanto — bug reale incontrato costruendo il sigillo della
  busta. Sempre unità assolute (`rem`, `px`) per quel parametro.
- **Il sigillo di cera ha un bordo liscio, non dentellato.** Prima versione
  con `clip-path` a punte; la ricerca su sigilli editoriali reali (foto
  macro) ha mostrato che sono quasi tutti cerchi lisci con un profilo a
  "ciambella" (anello rialzato, disco incassato) e monogramma debossato
  (stesso colore della cera, rilievo dato da doppia ombra opposta, mai un
  colore a contrasto). Il codice attuale segue quello, non l'intuizione
  iniziale.
- **Niente linee fra le sezioni**, per richiesta esplicita — il bordo va
  agganciato a `.blocco-guscio + .blocco-guscio`, non a `.sezione +
  .sezione`, per lo stesso motivo dei fregi: nell'editor le sezioni non
  sono fratelli diretti nel DOM, gli involucri sì.
- **I colori decorativi e i colori di testo sono token separati**
  (`--decoro`/`--ornamento` contro `--primario-chiaro`/`--accento`): i
  primi non garantiscono 4.5:1 di contrasto e non devono mai portare
  testo sopra, i secondi sì e lo fanno.
- **Upload multipart usa un helper diverso da quello delle chiamate JSON**
  (`caricaAsset` in `api-client.ts`, non `chiamaClient`) — quest'ultimo
  forza sempre `Content-Type: application/json`, che romperebbe il
  boundary che il browser deve fissare da sé per un upload.
- **Gli hook di React non possono vivere dentro un `case` di uno
  `switch`.** È successo scrivendo la gestione della galleria nel popup
  (`useState`/`useRef` condizionali) — corretto estraendo un componente
  `CampoGalleria` a parte. Se compare di nuovo un errore
  `react-hooks/rules-of-hooks` su un componente con un grande `switch`
  sul tipo di blocco, la causa è quasi sempre questa.
- **Nessun MCP server installato per la ricerca sul design.** WebSearch,
  WebFetch e Playwright (già nel venv per i test) sono bastati per
  navigare siti reali e guardare screenshot veri — coerente con il
  regolamento aziendale sulle piattaforme SaaS di terze parti, che va
  comunque verificato prima di aggiungere qualunque nuova integrazione
  esterna (Stripe compreso, quando arriverà).

## Mappa dei file

```
backend/app/
  modelli.py       tabelle SQLAlchemy (Utente, Sessione, Evento, Blocco, Asset,
                    LinkCondivisione, Rsvp, Diritto)
  blocchi.py        blocchi tipizzati (Pydantic) + MODELLI (tipi di evento) +
                    TEMI/PALETTE (registro dell'aspetto)
  servizi.py        creazione eventi, applicazione delle operazioni, link
  auth.py           hash password, validazione email, trasferimento sessione→utente
  sessioni.py       cookie di sessione firmato
  storage.py        upload immagini/audio (locale in dev, S3/MinIO in prod)
                    + semina_immagine() per i segnaposto
  genera_segnaposto.py  script one-shot: rigenera le tessere in assets_semina/
  main.py           tutte le rotte HTTP (niente router separati, tutto qui)
  db.py, config.py  connessione DB, impostazioni da env

frontend/
  componenti/blocchi/   Blocco.tsx (smistamento), ListaBlocchi.tsx (l'unica
                        iterazione), Presentazionali.tsx + Interattivi.tsx
                        (i blocchi veri), Sipario.tsx + CartaBusta.tsx (la busta)
  componenti/editor/    Tela.tsx (l'editor), Popup.tsx (il modulo di modifica
                        per blocco), Autenticazione.tsx (login/registrazione)
  app/i/[token]/         pagina invitato — SSR, tag og:, Sipario montato
  app/e/[id]/            pagina editor
  app/page.tsx           bootstrap: crea o riprende un invito, poi redirect
  app/temi.css           palette (colori) + temi (caratteri, ornamenti)
  app/blocchi.css        stile dei blocchi — identico ospite/editor
  app/guscio.css         stile della cornice: barra editor, popup, home
  public/ornamenti/      SVG (maschere bianche) per fregi e rami
  public/musica/         il brano incluso, generato da strumenti/genera_brano.py
  lib/tipi.ts            tutti i tipi TypeScript, rispecchiano i modelli Pydantic
  lib/api-server.ts      chiamate dal server Next (inoltrano il cookie a mano)
  lib/api-client.ts      chiamate dal browser (cookie automatico)

strumenti/genera_brano.py   sintetizza il brano incluso (fuori da backend/
                             perché non è codice applicativo, è uno script
                             di build una tantum)
```

## Cosa manca, in ordine di probabile priorità

1. **Pagamenti (F4).** Il modello dati (`Diritto`) e il gating dei link
   permanenti esistono; Stripe no. Oggi un link permanente si abilita
   inserendo a mano una riga in `diritto`.
2. **Upload audio dall'editor.** Le foto si caricano dal popup, la musica
   caricata dall'utente no (si sceglie solo se usare il brano incluso).
3. **Adempimenti sui dati personali.** Le RSVP raccolgono nomi di
   invitati e note alimentari (intolleranze, allergie) che sfiorano dati
   sanitari. Informativa, base giuridica, cancellazione a evento concluso
   — da affrontare prima di aprire a invitati reali, non prima.
4. **Editor solo desktop.** Il click destro/sinistro per modificare non
   ha un equivalente touch (pressione lunga) — decisione presa
   esplicitamente per ora, non un difetto da correggere di sorpresa.
5. **Pulizia**: `frontend/public/*.svg` (file.svg, globe.svg, next.svg,
   vercel.svg, window.svg) sono i segnaposto di default di
   `create-next-app`, mai usati, mai rimossi.
6. **Nome utente.** L'intestazione mostra l'email per intero come identità;
   un campo nome separato non è mai stato richiesto né costruito.

## Come si verifica che qualcosa funzioni davvero

In questo progetto **non ci si è mai fidati di uno screenshot letto al
volo o di "dovrebbe funzionare"**: ogni funzionalità visuale è stata
verificata con Playwright (già installato nel venv di `../inviti`, non in
questo — vedi comandi in `README.md`) contro il sito realmente in
esecuzione, leggendo i valori CSS calcolati (`getComputedStyle`) quando il
dubbio era su un dettaglio preciso, non solo guardando la foto. Il bug del
`box-shadow` con percentuali (sopra) è stato trovato così, non a occhio.
Vale la pena mantenere questa disciplina: un'interfaccia "sembra giusta"
in uno screenshot molto più spesso di quanto sia effettivamente corretta.
