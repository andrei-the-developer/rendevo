# Memoria — agente `backend`

Memoria privata. Si legge all'inizio di ogni incarico e si riscrive alla fine.
Scrivi **le conclusioni con il ragionamento**: senza il perché, fra tre mesi
l'idea sbagliata si rifà da capo.

Sezioni consigliate: *Decisioni prese* · *Scartato e perché* · *Numeri e fonti*
· *Trappole trovate*.

---

## 2026-08-23 — Primo incarico: audit + piano Stripe/GDPR (nessun codice toccato)

Incarico: produrre `squadra/backend-piano.md` verificato sul codice reale,
non ripetere alla cieca il passaggio di consegne. Fatto: nessuna modifica
al codice, solo lettura e un file di piano.

### Decisioni prese (di analisi, non di schema — non ho scritto codice)

- **Il modello dati `Diritto` non richiede nessuna migrazione per
  Stripe**: `stripe_payment_intent` è già `UNIQUE, nullable`
  (`modelli.py:193-195`, presente dalla migrazione iniziale
  `ba8fc983f7f3`). Questo vincolo, da solo, risolve l'idempotenza del
  webhook (evento duplicato → stesso INSERT → `IntegrityError` →
  rollback → 200 comunque). Non serve una tabella di "eventi processati"
  per il caso d'uso attuale (un solo tipo di diritto, un solo side
  effect). Se in futuro si aggiungono altri `Diritto.tipo`, rivalutare.
- **`crea_link` in `servizi.py:269-271` non filtra `Diritto.tipo`** —
  cerca una qualunque riga per `evento_id`. Oggi non è un bug (un solo
  tipo esiste), ma è una trappola per chi aggiunge un secondo tipo di
  diritto senza guardare qui.
- **Il diritto lo scrive il webhook, mai la `success_url`** — confermato
  contro la doc Stripe attuale: `success_url` è solo un redirect
  browser, non una prova di pagamento. Motivazione già nel mandato,
  ora verificata anche sulla doc esterna, non solo per principio.

### Trappole trovate (le più costose da re-scoprire)

- **Bloccante infrastrutturale per Stripe, non di sviluppo**: il dominio
  di produzione `andreievictoria222.it` non è in DNS pubblico e usa la
  CA interna di Caddy (non Let's Encrypt) — vedi
  `PASSAGGIO_DI_CONSEGNE.md` righe 14-22. Stripe non può consegnare
  nessun webhook a un endpoint che i suoi server non risolvono e di cui
  non si fidano il certificato. **Questo va risolto prima o in parallelo
  allo sviluppo del webhook**, altrimenti il codice si verifica solo in
  locale con `stripe listen` e mai in produzione reale. Segnalato come
  bloccante esplicito nel piano e girato come domanda (vedi report).
- **Il prodotto oggi raccoglie RSVP che nessuno può leggere via API**:
  ho controllato ogni rotta di `main.py` (`grep "@app\."`, 16 risultati)
  — zero `GET` sulle RSVP, zero `DELETE` di qualunque cosa in tutto il
  file. Prima ancora del GDPR, è un buco funzionale: l'organizzatore non
  vede le risposte che riceve, se non con una query diretta al DB.
- **Non esiste una data-evento strutturata**: `Hero.data` e
  `Countdown.data` (`blocchi.py:53-65`) sono stringhe libere dentro il
  JSONB del blocco, non colonne su `Evento`, non validate come data vera.
  Una cancellazione automatica "a evento concluso" non ha oggi nulla di
  affidabile a cui agganciarsi — serve o una colonna nuova
  (`Evento.data_evento`, coordinata col frontend) o accontentarsi di una
  retention a tempo fisso dalla creazione (meno corretta, subito
  implementabile, zero migrazioni).
- **`POST /api/inviti/{token}/rsvp` non ha rate limit**, a differenza del
  login (`main.py:67-84`). Un token trapelato permette scritture
  illimitate. Va chiuso nello stesso giro del lavoro GDPR, riusando lo
  stesso schema in-memory (con lo stesso limite noto: va su Redis con
  più worker, vedi lavoro noto in sospeso nel mandato).

### Numeri e fonti

- Stima onesta: Stripe ~1-1.5 giornate di sviluppo backend puro (esclude
  il bloccante DNS/TLS). GDPR tecnico minimo (retention a tempo fisso,
  senza toccare il frontend) ~1 giornata; versione corretta con
  data-evento strutturata ~1.5-2 giornate backend + lavoro frontend a
  parte.
- Fonti Stripe verificate con WebFetch (non a memoria): doc Webhooks
  (verifica firma, retry, deduplicazione) e Checkout (hosted vs
  embedded) — link nel piano.

### Scartato e perché

- Una tabella dedicata "eventi Stripe processati" per l'idempotenza:
  scartata perché il vincolo unique già esistente sul modello attuale
  basta, e aggiungerne una sarebbe un pezzo di schema in più da
  mantenere senza guadagno per l'unico flusso che esiste oggi.
- Celery/scheduler dedicato per la pulizia GDPR: scartato per ora, un
  cron di sistema che chiama uno script Python è sufficiente per un job
  che gira una volta al giorno; Redis è già nello stack ma non vale la
  pena introdurre una coda per questo.

Piano completo, con riferimenti `file:riga` e stime dettagliate:
`squadra/backend-piano.md`.

---

## 2026-08-23 — Secondo incarico: checklist Stripe per Andrei + risposte in coda (ancora nessun codice)

Incarico: Andrei ha scelto l'opzione 1 sul dominio del webhook (già
configurata e verificata dal coordinatore:
`https://andreievictoria.it/api/stripe/webhook` → FastAPI, Let's Encrypt
reale). Ho scritto la checklist operativa Stripe per Andrei in
`DOMANDE-PER-ANDREI.md` §2, risposto a 6 domande in coda in `DOMANDE.md`
(1 di `design`, 5 di `marketing`), aggiornato `backend-piano.md` §2.5.5 con
lo stato risolto del bloccante infrastrutturale. **Ancora nessuna riga di
codice Stripe scritta**: la disciplina resta "non verificato = non spedito",
e senza le chiavi di Andrei non potrei verificare nulla di un flusso di
pagamento.

### Decisioni prese (di analisi/comunicazione, non di schema)

- **La checklist Stripe raccomanda di partire in modalità test**, non live:
  verificato sulla doc Stripe attuale che in test si può fare l'intero giro
  (checkout + webhook) **senza completare l'attivazione/KYC dell'account**,
  e che il webhook pubblico già configurato **funziona anche in modalità
  test** (Stripe manda comunque richieste HTTPS vere all'URL registrato,
  solo con pagamenti finti) — quindi non serve `stripe listen`/tunnel
  locale per verificare l'integrazione end-to-end, si può testare contro
  l'endpoint reale da subito.
- **Le chiavi vanno nel `.env` di root senza prefisso `INVITI_`**
  (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`), stesso pattern già in uso
  per `SEGRETO`/`DOMINIO`/`POSTGRES_PASSWORD` — verificato leggendo
  `docker-compose.yml:51-59`: le variabili prefissate `INVITI_*` sono quelle
  che `config.py` (env_prefix `INVITI_`) legge *dentro* il container, ma
  arrivano lì tramite l'interpolazione `${VAR}` di Compose da variabili
  **senza prefisso** nel `.env` di root. Quando scriverò il codice Stripe,
  andranno aggiunte righe `INVITI_STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}` e
  `INVITI_STRIPE_WEBHOOK_SECRET: ${STRIPE_WEBHOOK_SECRET}` in
  `docker-compose.yml`, sulla falsariga delle righe 52-58 esistenti. Oggi
  Andrei può già scrivere le due righe nel `.env`: non fanno nulla finché
  quel pezzo di `docker-compose.yml` non esiste, ma non c'è rischio a
  prepararle in anticipo.
- **Raccomandato "richiedi login prima del checkout" (opzione A) invece di
  "email al checkout + magic link" (opzione B)** per il recupero
  dell'invito da un altro browser (domanda di `marketing`): A riusa
  interamente `auth.py` (`Utente`, `collega_sessione_a_utente`) a costo
  zero; B richiederebbe la prima infrastruttura di invio email del
  progetto (oggi **zero** riferimenti a SMTP in tutto il repo — verificato
  con grep), che non vale la pena costruire prima che la frizione di A si
  dimostri un problema reale nei numeri.

### Trappole trovate (nuove rispetto al primo incarico)

- **`crea_link` (`servizi.py:269-271`) non filtra `Diritto.tipo`**: già
  annotato nel piano del primo incarico come rischio futuro, ora
  confermato per iscritto a `marketing` come condizione esplicita per
  aggiungere un secondo `Diritto.tipo` (es. `archivio_10_anni`, upsell
  +9€). **Va corretto nello stesso commit** che introduce il secondo tipo,
  non "quando c'è tempo": altrimenti chi compra solo l'upsell sblocca
  anche il link permanente gratis, o viceversa.
- **Un secondo `Diritto.tipo` per retention estesa non basta da solo**: se
  "archivio 10 anni" deve davvero conservare i dati più a lungo, il futuro
  job di pulizia GDPR (`backend-piano.md` §3) dovrà leggerlo *prima* di
  cancellare RSVP/evento — altrimenti l'upsell pagato non avrebbe nessun
  effetto tecnico. Da tenere a mente quando si scriverà quel job, non solo
  quando si scriverà il webhook.
- **"RSVP disattivate durante l'anteprima" e "badge anteprima" sono già
  per metà fatti**: `main.py:409` espone già `puo_rispondere:
  link.permanente` e `main.py:426-429` risponde già `403` alle RSVP su
  link non permanenti. La domanda di `marketing` sui 10 minuti troppo
  corti si riduce quindi a **una riga di config**
  (`config.py:26`, `anteprima_minuti`), non a un pezzo di prodotto nuovo —
  utile saperlo per non sovrastimare quel lavoro in futuro.
- **Zero infrastruttura di analytics/tracking nello stack**: nessun
  servizio self-hosted in `docker-compose.yml`, nessuna tabella per eventi
  di funnel. Rilevante per **due** domande di `marketing` che sembravano
  scollegate (email al checkout → serve invio email; `?da=` sulla firma →
  serve un ricevitore di click) e in realtà condividono la stessa causa:
  **nessuna infrastruttura di comunicazione/osservabilità esiste ancora**
  oltre al DB e Redis. Se in futuro si decide di costruirne una (analytics
  self-hosted tipo Plausible/Umami), risolverebbe entrambe insieme — vale
  la pena valutarle come un solo pacchetto di lavoro, non due separati.

### Numeri e fonti

- Fonti Stripe verificate con WebFetch/WebSearch il 2026-08-23 (non a
  memoria, il cruscotto cambia): pagina "Clés API" (`docs.stripe.com/keys`)
  per la distinzione chiave pubblicabile/segreta/limitata e il flusso di
  attivazione live; pagina "Recevez les événements" (`docs.stripe.com/webhooks`)
  e "Traiter les commandes" (`docs.stripe.com/checkout/fulfillment`) per la
  registrazione dell'endpoint, gli eventi da selezionare
  (`checkout.session.completed` obbligatorio,
  `checkout.session.async_payment_succeeded/failed` consigliati) e la
  conferma che il signing secret (`whsec_...`) è per-endpoint, non per
  account. Nota: le pagine sono servite in francese dal fetch (localizzazione
  automatica lato Stripe), contenuto verificato comunque riga per riga.

### Scartato e perché

- Rispondere nel merito alla domanda GDPR titolare/responsabile (in
  `DOMANDE-PER-ANDREI.md` §4): esplicitamente fuori mandato, richiede un
  legale, non un agente tecnico. Non toccata.
- Scrivere già il codice del webhook o dell'endpoint di checkout: scartato
  perché non verificabile senza le chiavi vere di Andrei, e la disciplina
  di questo progetto vieta di spedire codice di pagamento non provato con
  `curl`/log reali.

Prossimo giro atteso: quando Andrei avrà scritto `STRIPE_SECRET_KEY` e
`STRIPE_WEBHOOK_SECRET` nel `.env` (vedi checklist), il lavoro è scrivere
`POST /api/eventi/{id}/pagamento` + `POST /api/stripe/webhook` secondo il
piano già in `backend-piano.md` §2, aggiungere `stripe` a `requisiti.txt`,
le due righe `INVITI_STRIPE_*` in `docker-compose.yml`, e verificare con un
pagamento di test reale contro l'endpoint pubblico prima di dichiararlo
fatto.

---

## 2026-08-23 — Terzo incarico: Stripe scritto, testato, verificato davvero

Le chiavi sono arrivate (`sk_test_...`, `whsec_...`, già col nome giusto nel
`.env`). Ho scritto tutto il codice Stripe mancante, corretto il bug
`crea_link`/`Diritto.tipo` già segnalato due volte in questa memoria, e
**verificato l'intero giro** (non solo test isolati: anche `curl` contro il
container reale). Codice in `backend/app/pagamenti.py` (nuovo),
`backend/app/main.py`, `backend/app/servizi.py`, `backend/app/config.py`,
`backend/requisiti.txt`, `docker-compose.yml`.

### Decisioni prese

- **Un modulo nuovo `pagamenti.py`**, non dentro `servizi.py`: tiene
  `import stripe` fuori dalla logica di dominio pura. `servizi.py` importa
  solo `TIPO_LINK_PERMANENTE` da lì (una stringa), zero dipendenza da
  Stripe per il resto del file.
- **Il Price è quello creato da Andrei nel cruscotto** (`price_1U7ex5Lz...`,
  prodotto "Invitation", 69,00 EUR, `one_time`), **non** `price_data`
  inline — richiesto esplicitamente da Andrei dopo il mio primo giro di
  piano (avevo previsto `price_data` come opzione più veloce, ma lui aveva
  già creato il prodotto). `STRIPE_PRICE_ID` è una config nuova
  (`config.py`), letta a runtime, mai cablata.
- **Ho trovato io il `price_id`**, non l'ho chiesto ad Andrei: Andrei aveva
  incollato in chat il `Destination ID` del webhook (`we_...`), non il
  price id — il coordinatore lo ha notato e mi ha corretto a metà lavoro.
  Invece di rimandare la palla ad Andrei per un giro a vuoto, ho interrogato
  l'API Stripe in sola lettura con la `sk_test_...` già in `.env`
  (`stripe.Product.list()` / `stripe.Price.list()`): un solo prodotto attivo,
  un solo prezzo, 6900 centesimi EUR, `price_1U7ex5LzFoecDfNjeX8gZ6CF`. Non è
  un segreto (non dà accesso a nulla da solo), quindi l'ho scritto io stesso
  in `.env` come `STRIPE_PRICE_ID`. Ho anche riletto il webhook endpoint
  registrato (`we_1U7f27LzFoecDfNjvOLi4itl`) via API: url corretto
  (`https://andreievictoria.it/api/stripe/webhook`), stato `enabled`, eventi
  giusti (`checkout.session.completed` + i due `async_payment_*`), api
  version `2026-07-29.dahlia` — l'ho pinnata anche nel nostro client
  (`pagamenti.py`) per coerenza.
- **`crea_sessione_checkout` ritorna l'oggetto Session intero**, non solo
  `.url`: `main.py` legge `.url` per il redirect, i test possono verificare
  anche `metadata`/`client_reference_id` senza una seconda chiamata API.
- **Le tre variabili `INVITI_STRIPE_*` in `docker-compose.yml` NON usano
  `${VAR:?...}`** come `SEGRETO`/`DOMINIO`: quelle due sono required perché
  l'app non funziona affatto senza (cookie di sessione, CORS). Stripe è
  diverso — se manca, tutto il resto del prodotto (editor, RSVP, asset) deve
  continuare a funzionare; solo checkout e webhook rispondono un errore
  esplicito (503/500). Motivo concreto: oggi manca ancora un modo pulito per
  gestire un secondo tipo di `Diritto`/prezzo senza toccare il compose, e
  bloccare l'intero container `api` per una var mancante di una feature
  opzionale sarebbe stato peggio del problema che risolve.

### Bug corretto: `crea_link` non filtrava su `Diritto.tipo`

Segnalato in questa stessa memoria (primo incarico) e in `DOMANDE.md`
(risposta del secondo incarico): `servizi.crea_link` cercava "una qualunque
riga `Diritto` per `evento_id`". Con un solo tipo in produzione era innocuo
per costruzione, ma **con un solo prodotto deciso da Andrei ("niente
upsell per ora", vedi `DOMANDE-PER-ANDREI.md` §3) non è più nemmeno un
rischio imminente** — l'ho corretto comunque perché il mandato lo chiedeva
esplicitamente nello stesso commit di Stripe, ed è a costo zero (un filtro
`WHERE` in più). Ora `crea_link(permanente=True)` cerca
`Diritto.tipo == "link_permanente"` esplicitamente
(`servizi.py`, vicino a riga 267).

**Il test che dimostra il bug esiste ed è stato fatto fallire apposta**:
`backend/tests/test_servizi_link.py::test_diritto_di_altro_tipo_non_sblocca_il_link_permanente`.
Ho verificato a mano, temporaneamente ripristinando la query senza filtro,
che il test fallisce (`DID NOT RAISE`) — poi ho rimesso il fix e rieseguito
tutta la suite (9/9 verdi). Non è un'affermazione, è nel log di questo
incarico.

### Trappole trovate (nuove, costose da riscoprire)

- **`stripe-python` v12+ (usiamo 15.4.0): `StripeObject` non eredita più da
  `dict`**. `.get(...)` sugli oggetti che arrivano dal webhook
  (`session.get("metadata")`) **non lancia un innocuo `None`, lancia
  `AttributeError: get`** — un 500 silenzioso in produzione al primo
  pagamento vero, se non l'avessi scoperto scrivendo un test che chiama
  *davvero* `stripe.Webhook.construct_event` su un payload vero invece di
  mockare l'oggetto. `__getitem__` invece funziona ancora su entrambi (dict
  e `StripeObject`): la soluzione è la funzione `_leggi()` in
  `pagamenti.py`, che prova l'accesso a chiave e tratta qualunque eccezione
  come "assente". **Lezione**: qualunque futuro codice che tocchi oggetti
  Stripe deve leggere con `oggetto["chiave"]`/`getattr`, mai `.get()`.
- **Un payload di webhook fatto a mano ha bisogno di `"object": "event"` in
  cima**: `stripe.Webhook.construct_event` legge `event.object` per
  distinguere eventi "v1" da "v2.core.event" *prima* di guardare `type`. Un
  payload di test senza quel campo fallisce con un `AttributeError`
  fuorviante (sembra un bug nostro, è solo un payload di test incompleto).
  Documentato nei commenti di `test_pagamenti.py`.
- **`migrazioni/env.py` ignora l'URL passato via
  `alembic.config.Config.set_main_option("sqlalchemy.url", ...)`**: importa
  direttamente `app.db.motore`, l'engine che l'app crea *a tempo di import*
  leggendo `impostazioni().database_url` una volta sola (`@lru_cache`).
  Scritto per l'app in produzione (un solo database, sempre lo stesso) ma è
  una trappola per chi prova a far girare le migrazioni contro un database
  diverso (es. di test) passando la config par programmaticamente: **non
  basta**, va impostata la variabile d'ambiente `INVITI_DATABASE_URL`
  *prima* che qualunque cosa importi `app.db` o chiami `impostazioni()` per
  la prima volta nel processo. Soluzione usata in
  `backend/tests/conftest.py`: impostare l'env var a livello di *modulo* di
  conftest (il primo file che pytest carica), non dentro una fixture.
- **`docker-compose.override.yml` mette `INVITI_STORAGE: locale`**
  sull'`api` di questo server, **sovrascrivendo** lo `s3` del compose
  canonico — combacia col passaggio di consegne (`boto3` non è installato)
  ma **non stava scritto in questa memoria prima d'ora**: se qualcuno guarda
  solo `docker-compose.yml` pensa che giri su MinIO. Il override è ben
  commentato lì dentro, ma repository questa nota qui perché è facile
  guardare solo il file canonico.

### Infrastruttura di test: prima volta in questo progetto

Non esisteva **nessun test** né `pytest` in `requisiti.txt`. Ho aggiunto
`backend/requisiti-test.txt` (`-r requisiti.txt` + `pytest==8.4.2`, non
`requisiti.txt` stesso: non è una dipendenza di produzione) e
`backend/tests/` (`conftest.py`, `test_servizi_link.py`,
`test_pagamenti.py`). Girano contro un **database Postgres effimero**
(creato/droppato per sessione di test, migrazioni Alembic reali applicate),
non contro sviluppo/produzione — ogni test in una transazione con SAVEPOINT
così i `commit()` veri che il codice fa (`servizi.crea_link`,
`pagamenti.gestisci_webhook`) non si propagano fra test.

**Non girano da soli sull'host**: niente `pip`/`pytest` installati nativamente
su questa macchina, e il database non espone la porta 5432 all'host (solo
alla rete Docker del progetto). Comando verificato per farli girare (nessun
segreto in chiaro nella shell history se si evita `set -x`):

```bash
cd /home/user/projects/inviti-v2
set -a; source .env; set +a
docker run --rm --network inviti-v2_default \
  -v /home/user/projects/inviti-v2/backend:/app -w /app \
  -e DATABASE_URL_ADMIN="postgresql+psycopg://inviti:${POSTGRES_PASSWORD}@db:5432/inviti" \
  -e INVITI_STRIPE_SECRET_KEY="${STRIPE_SECRET_KEY}" \
  -e INVITI_STRIPE_WEBHOOK_SECRET="${STRIPE_WEBHOOK_SECRET}" \
  -e INVITI_STRIPE_PRICE_ID="${STRIPE_PRICE_ID}" \
  python:3.13-slim \
  bash -c "pip install -q -r requisiti-test.txt && python -m pytest tests -v"
```

Uno dei 9 test (`test_crea_sessione_checkout_reale_contro_stripe_test_mode`)
chiama **davvero** l'API Stripe in modalità test (crea una Checkout Session
vera, la rilegge con una seconda chiamata indipendente) — richiede rete
verso `api.stripe.com`, che dentro questo sandbox funziona. Si auto-`skip`
se `STRIPE_SECRET_KEY`/`STRIPE_PRICE_ID` non sono nell'ambiente.

### Verificato anche fuori da pytest, contro il container reale

Rebuild (`sudo docker compose build api`) + ricreazione
(`sudo docker compose up -d --force-recreate api`), poi `curl` reali contro
`127.0.0.1:8000`: evento creato → `/link` con `permanente:true` → **402**
(nessun diritto) → `/pagamento` → **201** con un vero URL
`https://checkout.stripe.com/...` → webhook con firma HMAC calcolata a mano
(stesso schema Stripe: `t=<ts>,v1=<hmac-sha256("ts.payload")>`) → **200** →
`/link` con `permanente:true` ripetuto → ora **201** (link permanente vero) →
stesso evento webhook rispedito una seconda volta → **200**, una sola riga
`Diritto` in tabella (verificato via `psql` diretto) → webhook senza firma →
**400** → webhook con firma inventata → **400**. Evento di prova poi
cancellato dal DB di sviluppo (`DELETE FROM evento ...`, cascata pulita).

### Errore mio da segnalare, non nascondere

Durante la verifica ho lanciato `docker exec ... printenv | grep -i STRIPE`
per controllare che le variabili fossero arrivate al container **e l'output
è finito in chiaro nella trascrizione di questo incarico**, incluse
`STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET` per intero — esattamente quello
che il mandato dice di non fare mai. Non è successo di nuovo (dopo,
controlli solo su prefisso/lunghezza), ma è successo una volta e va detto ad
Andrei nel report, non solo scritto qui: sono chiavi di **test**, ma restano
credenziali vere, e la decisione se ruotarle spetta a lui.

### Cosa resta, esplicitamente non fatto

- **Non ho toccato `_evento_json`** per esporre "ha già il diritto": non
  richiesto da questo mandato, il piano lo suggeriva come rifinitura
  frontend-facing, non parte del giro Stripe minimo.
  - **Un pagamento vero end-to-end con consegna reale da Stripe** (non
  simulata a mano) resta da fare: serve un browser che completi davvero il
  Checkout hosted e Stripe che consegni il webhook da solo all'endpoint
  pubblico. Il codice è verificato pezzo per pezzo (checkout crea una
  sessione vera, il webhook accetta una firma vera e scrive il diritto), ma
  la catena intera "click reale → Stripe consegna da sola" non è stata
  osservata.

---

## 2026-08-24 — Quarto incarico: sottodominio beta con password (Caddy), bloccato sul DNS

Andrei ha approvato in chat la domanda 12 (`DOMANDE-PER-ANDREI.md`, era 🔴) e ha
scelto lui la password, incollandola nel gruppo Telegram. Ho configurato tutto
il lato server; manca solo un record DNS che non posso creare io.

### Fatto e verificato

Blocco `beta.andreievictoria.it` aggiunto a `/etc/caddy/Caddyfile` (il Caddy di
**sistema**, gestito da systemd — non il servizio `proxy` del compose, che resta
dietro il profilo `bundled-proxy` e non parte). Backup del file precedente in
`/etc/caddy/Caddyfile.bak-20260824-1537`.

- `basic_auth` utente `beta`, hash **bcrypt** da `caddy hash-password` — la
  password in chiaro non finisce su disco. Per cambiarla: rigenerare l'hash e
  sostituirlo nel blocco, poi reload.
- `/api/*` e `/media/*` → `127.0.0.1:8000`, tutto il resto → `127.0.0.1:3000`.
  Stessa forma del blocco `andreievictoria222.it`, che **non è stato toccato**.
- `X-Robots-Tag "noindex, nofollow, noarchive"` per i motori di ricerca.
- Il blocco `andreievictoria.it` (webhook Stripe + Guacamole) **non è stato
  toccato**: verificato dopo il reload che `/` risponde ancora 404 e
  `/api/stripe/webhook` ancora 400 su POST senza firma.

Verifica fatta con `tls internal` **temporaneo** nel blocco (senza DNS non c'è
certificato pubblico, quindi l'handshake non si completerebbe e non si potrebbe
provare niente), poi rimosso: `curl --resolve` senza credenziali → 401, con
credenziali sbagliate → 401, con quelle giuste → 200 e la home vera
(`<title>Inviti digitali</title>`); `/api/salute` → 401 senza password e
`{"stato":"ok"}` con; header `x-robots-tag` presente nella risposta.

### Trappola nuova (costa un reload fallito a chi non la sa)

**Un blocco Caddy con una direttiva `log { output file ... }` fa fallire il
reload se il file non esiste già ed è scrivibile da `caddy`**: errore
`open /var/log/caddy/<nome>.log: permission denied`, `systemctl reload` esce 1.
Non è distruttivo — Caddy tiene in piedi la configurazione vecchia — ma sembra
un errore di sintassi e non lo è. Soluzione: creare il file **prima** del
reload, `sudo touch` + `chown caddy:caddy` (o `chown --reference` di un log
esistente). Vale per qualunque blocco futuro.

### Il bloccante: DNS, e non è risolvibile da questa macchina

`beta.andreievictoria.it` è **NXDOMAIN**. Verificato: la zona di
`andreievictoria.it` sta su `ns1.register.it` / `ns2.register.it`, **non c'è
wildcard** (`xyzcasuale123.andreievictoria.it` non risolve) e in tutto il
progetto non esiste nessuna credenziale di registrar o token DNS
(`grep -rl -i "cloudflare|CF_API|dns_token|namecheap|aruba"` → zero). Quindi
serve **Andrei**, nel pannello di register.it: record `A`, nome `beta`, valore
`169.58.224.54` (l'IPv4 pubblico di questa macchina, lo stesso a cui punta già
`andreievictoria.it`).

Nel frattempo Caddy ritenta ACME con backoff crescente e logga
`NXDOMAIN ... check that a DNS record exists` — rumoroso ma innocuo, e non
tocca gli altri due siti. Quando il record esiste, `sudo systemctl reload caddy`
forza l'emissione immediata invece di aspettare il backoff.

### Bug trovato di striscio, verificato su una pagina vera: l'anteprima WhatsApp

`og:url` e `og:image` della pagina invito sono **assoluti** su
`NEXT_PUBLIC_BASE_URL`, oggi `https://andreievictoria222.it`. Controllato
creando un evento di prova e leggendo l'HTML servito:
`og:image content="https://andreievictoria222.it/media/.../hero-grande.jpg"`.
Quell'host è irraggiungibile da un telefono: **il beta-tester che condivide il
link su WhatsApp otterrebbe un'anteprima rotta**, cioè esattamente la cosa che
la beta deve testare. Evento di prova poi cancellato (`DELETE FROM evento`,
verificato `count(*) = 0`).

Rimedio, da fare **insieme** al cambio DNS, non prima (altrimenti si rompe
l'unico host oggi funzionante): `DOMINIO=beta.andreievictoria.it` nel `.env` e
`sudo docker compose up -d --force-recreate api web`. **Non serve un rebuild**:
verificato che nel chunk server la variabile è ancora una lettura a runtime
(`process.env.NEXT_PUBLIC_BASE_URL ?? "http://127.0.0.1:3000"`), Turbopack non
l'ha inlinizzata — cosa che con `NEXT_PUBLIC_*` non è affatto scontata e che
vale la pena ricontrollare dopo ogni aggiornamento di Next.
Nota collegata: `INVITI_ORIGINI_CORS` deriva dallo stesso `DOMINIO`, e
`sessioni.py:29` decide il flag `secure` del cookie da
`origini_cors[0].startswith("http://")` — con `https://beta...` resta `True`,
nessuna sorpresa.

### Deciso di non fare di mia iniziativa

La password copre **tutto** l'host, comprese le pagine invito `/i/<token>`:
un invitato deve conoscerla. Coerente con "beta chiusa", ma impedisce di
testare il giro vero verso un ospite reale. L'alternativa (esentare `/i/*`,
`/api/inviti/*` e gli statici dal `basic_auth`) rende quelle pagine pubbliche
per chiunque abbia il token — che è già il modello dei link, ma è una scelta di
prodotto, non mia. Proposta nel gruppo, non implementata.

### Sulla password

L'ha scelta e incollata Andrei nel gruppo Telegram: è quindi nella cronologia
della chat e nelle trascrizioni degli agenti. Gliel'ho detto e ha già detto che
la cambierà. Quando succederà, serve solo un nuovo `caddy hash-password` +
reload: non tocca nient'altro.

---

## 2026-08-24 (sera) — Beta online davvero + ospitalità della pagina pubblica

### La beta è viva

Andrei ha creato il record A. `beta.andreievictoria.it` → `169.58.224.54`,
certificato **Let's Encrypt vero** ottenuto da Caddy da solo (log
`certificate obtained successfully`, emittente `CN=YE2`, scadenza 22/11/2026),
password verificata **dall'internet pubblico**, non più con `--resolve`: 401
senza credenziali, 200 con. Il `tls internal` temporaneo del giro precedente
non serve più a nulla ed è già stato tolto.

Fatto il cambio che avevo annunciato: `DOMINIO=beta.andreievictoria.it` nel
`.env` (backup `.env.bak-20260824-*`, entrambi `chmod 600`) e
`sudo docker compose up -d --force-recreate api web`. **Nessun rebuild**, come
previsto. Verificato su una pagina invito vera che ora
`og:url`/`og:image` puntano a `https://beta.andreievictoria.it/...`. Evento di
prova cancellato (`count(*) = 0`).

### La scoperta che cambia una decisione aperta: il crawler non sa la password

Corretto l'URL, l'anteprima WhatsApp **resta rotta lo stesso**: `og:image` sta
dietro `basic_auth` e il crawler di WhatsApp/Telegram non può autenticarsi,
quindi riceve 401 e non mostra nulla. Fino a ieri "la password copre anche
`/i/*`" sembrava solo attrito per l'invitato; **non lo è**: rende non
testabile proprio il pezzo che la beta esiste per testare (mando il link,
l'altro lo apre dal telefono e risponde).

Se Andrei approva, la modifica è piccola e circoscritta: esentare dal
`basic_auth` **`/i/*`, `/media/*` e `POST /api/inviti/*/rsvp`** (le pagine
ospite e ciò che serve loro), lasciando dietro password editor, creazione,
pagamento e tutto il resto dell'API. Conseguenza da dire ad alta voce: da quel
momento chi ha il token apre l'invito senza password — che è già il modello dei
link (token illeggibile = capability), ma non è più "sito chiuso".

### Pagina pubblica: la conduttura, non la pagina

Andrei ha chiesto a backend+frontend+design una landing pubblica da cui si
arriva alla webapp. Ho fatto **solo la parte mia**, l'ospitalità:

- Vive su `andreievictoria.it`, l'host che era già pubblico e con certificato
  valido per il webhook Stripe. Nessun dominio nuovo da comprare, nessun DNS da
  aspettare.
- **File statici**, non una seconda app Next: nel blocco `andreievictoria.it`
  il `handle { respond 404 }` finale è diventato
  `handle { root * /var/www/landing; file_server }`. Motivo: una landing non ha
  bisogno di SSR, e così non aggiunge un container, un build e un punto di
  rottura. Se un giorno servisse Next per riusare i componenti del renderer, si
  cambia quel blocco — non è irreversibile.
- **La regola storica di quell'host regge**: niente dell'applicazione Inviti ci
  passa. Verificato dopo il reload: `/api/salute` → **404**, `/i/qualcosa` →
  **404**, `/api/stripe/webhook` → 400 (firma assente: corretto),
  `/guacamole/` → 200. L'app resta solo su beta, dietro password.
- **Cartella vuota = 404**: finché nessuno ci mette `index.html`, l'host resta
  muto com'era. Provato con un file finto (200) e poi rimosso (di nuovo 404).
  Scelta voluta: non pubblico io contenuti di prodotto su un dominio pubblico,
  non sono miei da decidere.
- Sorgente in `landing/` nel repo, con `LEGGIMI.md` che spiega tutto; il deploy
  è un `rsync` verso `/var/www/landing`. **Perché una copia e non un symlink**:
  `/home/user` è `drwxr-x---`, l'utente `caddy` (uid 999) non può attraversarlo.
  `/var/www/landing` è `user:www-data`, `2775` (setgid), così ci scrivo senza
  `sudo` e Caddy lo legge.

### Da proporre, non fatto

`/guacamole` (console SSH via browser, password + TOTP) sta **sullo stesso
hostname** che sta per diventare la pagina pubblica del prodotto. Oggi quel
dominio è già scansionato: nel log Caddy 1173 richieste da 80 IP distinti, con
tentativi su `/_ignition/execute-solution` (scanner Laravel) e ripetuti su
`/guacamole/api/tokens`. Non è un'emergenza e non l'ho toccato — ma prima di
mandarci traffico vero, spostare Guacamole su un hostname separato (o dietro
`remote_ip`) è la mossa giusta, e va decisa da Andrei perché è il suo accesso.
