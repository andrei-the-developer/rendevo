# Piano tecnico — Stripe e GDPR

Autore: agente `backend`, 2026-08-23. Analisi sul codice reale (non sul
PASSAGGIO_DI_CONSEGNE, che è stato usato solo come punto di partenza e
verificato riga per riga). Nessuna riga di codice toccata in questo giro.

---

## 1. Audit del codice esistente

### 1.1 Gating del link permanente e tabella `diritto`

- `backend/app/modelli.py:142-162` — `LinkCondivisione.scade_il` è
  `DateTime | None`. `NULL` = permanente, valorizzato = anteprima. La
  property `permanente` (161-162) è solo `scade_il is None`.
- `backend/app/modelli.py:183-197` — `Diritto`: `evento_id` (FK cascade),
  `tipo` (default `"link_permanente"`), `stripe_payment_intent`
  **già `unique, nullable`** (193-195). Questo campo unique è già
  un meccanismo di idempotenza pronto all'uso — vedi §2.3.
- `backend/app/servizi.py:267-289` (`crea_link`) — se `permanente=True`,
  cerca **una qualunque riga `Diritto` per `evento_id`** (269-271, non
  filtra su `tipo`: oggi non importa perché esiste un solo tipo, ma se
  in futuro si aggiungono altri diritti va filtrato esplicitamente). Se
  non trovata, `ErroreOperazione` → `main.py:331` la traduce in `402
  Payment Required`.
- Confermato via `grep -rn "Diritto("` che **nessun endpoint crea mai una
  riga `Diritto`**: oggi l'unico modo è un INSERT manuale nel DB, come
  scritto nel passaggio di consegne. Questo combacia col codice.
- `backend/migrazioni/versions/ba8fc983f7f3_schema_iniziale.py:80-90` — la
  tabella `diritto` col vincolo `UniqueConstraint('stripe_payment_intent')`
  è già in produzione dalla prima migrazione. **Non serve nessuna
  migrazione per far esistere questa tabella**: esiste già, per Stripe.

**Conclusione**: il gating è corretto e già pronto lato lettura. Manca
solo *chi scrive* la riga `Diritto` — cioè il webhook.

### 1.2 Cosa esiste e cosa manca davvero per Stripe

Verificato, non dedotto dal passaggio di consegne:

| Pezzo | Stato | Prova |
|---|---|---|
| Modello dati `Diritto` | Fatto | `modelli.py:183-197` |
| Vincolo unique per idempotenza | Fatto | `modelli.py:193-195` |
| Gating lettura (`crea_link`) | Fatto | `servizi.py:267-276` |
| 402 lato API | Fatto | `main.py:320-336` |
| Migrazione Alembic per `diritto` | Fatto (già in prod) | migrazione iniziale |
| Libreria `stripe` | **Assente** | non in `backend/requisiti.txt` (verificato per intero) |
| Config `STRIPE_*` | **Assente** | non in `config.py`, non in `.env.esempio`, non in `docker-compose.yml` |
| Endpoint crea sessione di pagamento | **Assente** | `grep "@app\."` su `main.py` non trova nulla di simile |
| Endpoint webhook | **Assente** | idem |
| Verifica firma webhook | **Assente** | nessun riferimento a `Stripe-Signature` nel repo |
| Esposizione stato "ha già un diritto" nel JSON evento | **Assente** | `_evento_json` (`main.py:99-129`) non interroga `Diritto` |

Quindi: il lavoro pendente è **interamente nuovo codice**, non
completamento di codice esistente. Il modello dati e il gating non vanno
toccati.

### 1.3 Dove vivono i dati personali delle RSVP e cosa manca per cancellarli/esportarli

- `backend/app/modelli.py:165-180` — tabella `rsvp`: `referente`
  (String160), `ospiti` (JSONB, lista di stringhe), `note` (Text),
  `messaggio` (Text), `presente` (bool), `link_id`, `evento_id`,
  `creato_il`. FK `evento_id` con `ondelete="CASCADE"` (170-171): **se
  l'evento viene cancellato, le RSVP spariscono da sole** — il DB è già
  corretto su questo punto specifico.
- `backend/app/main.py:418-448` (`invia_rsvp`) — unico endpoint che tocca
  questa tabella: `POST /api/inviti/{token}/rsvp`, **solo INSERT**.
  `ospiti` è troncato a 20 nomi da 160 caratteri (434), `note` a 500
  caratteri (444), `messaggio` a 1000 (445). Nessuna autenticazione
  richiesta (è la pagina pubblica dell'invitato) e **nessun rate limit**
  (a differenza del login in `main.py:72-84`) — non è GDPR in senso
  stretto ma è un buco di sicurezza (art. 32: misure tecniche adeguate)
  che vale la pena chiudere nello stesso giro.
- Il campo `note` non è generico: `frontend/componenti/blocchi/Interattivi.tsx:360`
  lo etichetta esplicitamente **"Intolleranze o note sul menu"** — conferma
  testuale, non supposizione, che lì dentro finiscono dati di salute
  (allergie/intolleranze), categoria particolare ex art. 9 GDPR.
- **Nessun endpoint legge le RSVP**: ho cercato ogni rotta con
  `grep -n "@app\." backend/app/main.py` — ce ne sono 16, nessuna è un
  `GET` sulle RSVP. Oggi **l'organizzatore stesso non ha modo di vedere
  le risposte che ha raccolto**, se non con una query diretta al DB.
  Questo è insieme un buco funzionale (il prodotto non serve a niente
  senza) e un problema di accountability GDPR (dati raccolti che nessuno
  nell'app può nemmeno mostrare, figurarsi esportare per un diritto di
  accesso art. 15).
- **Nessun endpoint cancella nulla**: zero rotte `DELETE` in tutto
  `main.py`. Non esiste cancellazione di RSVP singola, di evento, né di
  account utente. Il diritto all'oblio (art. 17) oggi non è implementabile
  da un utente in nessun modo, nemmeno manuale via API.
- **Non esiste una data-evento strutturata**: ho controllato
  `backend/app/blocchi.py:53-65` (`Hero.data`, `Countdown.data`) — sono
  campi `str` liberi ("ISO, il rendering la formatta" dice il commento,
  ma non è un `date` validato, vive dentro il JSONB del blocco, non è una
  colonna su `Evento`, non è indicizzato, non è garantito compilato). Una
  cancellazione automatica "a evento concluso" **non ha oggi nessun dato
  affidabile su cui agganciarsi** — serve decidere come risolvere questo
  (vedi §3).

---

## 2. Piano Stripe concreto

**STATO: FATTO (2026-08-23, terzo incarico)** — vedi
`squadra/memoria/backend.md` per il dettaglio verificato (test automatici +
`curl` reali contro il container). Codice in `backend/app/pagamenti.py`,
`backend/app/main.py` (`POST /api/eventi/{id}/pagamento`,
`POST /api/stripe/webhook`), fix del bug `crea_link`/`Diritto.tipo` in
`backend/app/servizi.py`. Diverso dal piano originale solo su un punto:
il Price è quello creato da Andrei nel cruscotto (`STRIPE_PRICE_ID`), non
`price_data` inline come ipotizzato qui sotto — sezione 2.5 punto 4 quindi
superata.

Fonti verificate con WebFetch sulla documentazione Stripe corrente
(agosto 2026): pagina Webhooks e Checkout — vedi Fonti in fondo.

### 2.1 Nuovi endpoint

1. **`POST /api/eventi/{evento_id}/pagamento`** (autenticato, stesso
   pattern di `_mio_evento` usato da `crea_link` in `main.py:320-336`).
   Crea una **Stripe Checkout Session** in modalità `payment` (one-time,
   non abbonamento):
   - `line_items`: un prezzo fisso configurato lato Stripe (Price ID) o
     `price_data` inline se si preferisce non gestire prodotti nel
     dashboard — da decidere con Andrei (§2.5).
   - `metadata={"evento_id": str(evento.id)}` **e**
     `client_reference_id=str(evento.id)` (ridondanza voluta: alcuni
     eventi Stripe espongono l'uno o l'altro più comodamente).
   - `success_url` → pagina editor con querystring, es.
     `.../e/{id}?pagamento=in_elaborazione` (non "riuscito": il pagamento
     non è ancora confermato lato nostro finché non arriva il webhook).
   - `cancel_url` → pagina editor senza modifiche.
   - Risponde `{"url": sessione.url}`, il frontend fa un redirect pieno
     del browser (Stripe Hosted Checkout: non serve integrare Stripe.js
     né esporre una publishable key).

2. **`POST /api/stripe/webhook`** (pubblico, nessuna sessione, verificato
   solo dalla firma Stripe). Deve:
   - Leggere il **corpo grezzo** (`await request.body()`), non un modello
     Pydantic — la firma è calcolata sui byte esatti ricevuti, qualunque
     ri-serializzazione la rompe.
   - Leggere l'header `Stripe-Signature`.
   - Verificare con `stripe.Webhook.construct_event(payload, sig_header,
     STRIPE_WEBHOOK_SECRET)`. Su `SignatureVerificationError` o payload
     non parsabile → `400` (mai `500`: un `500` fa ritentare Stripe
     all'infinito su un errore che non si risolverà mai da solo).
   - Gestire `checkout.session.completed`: estrarre `evento_id` da
     `session.metadata` (o `client_reference_id`), estrarre
     `session.payment_intent`, inserire `Diritto(evento_id=...,
     stripe_payment_intent=pi_id)`.
   - **Idempotenza**: non serve una tabella nuova per gli event id.
     `Diritto.stripe_payment_intent` è già `UNIQUE` (§1.1) — un secondo
     invio dello stesso evento (Stripe garantisce *at-least-once*, non
     *exactly-once*: la doc ufficiale lo dice esplicitamente, "gli
     endpoint possono ricevere lo stesso evento più volte") prova lo
     stesso INSERT, l'`IntegrityError` viene intercettato, si fa
     `rollback()` e si risponde comunque `200`. Il vincolo che già esiste
     nel modello dati fa tutto il lavoro.
   - Rispondere **`200` velocemente** anche per tipi di evento non
     gestiti (`else: pass`) — mai lasciare che Stripe ritenti per 3 giorni
     su eventi che non ci interessano.
   - Nessuna logica pesante nel corpo della richiesta: qui basta un
     INSERT, va bene farlo in linea (non serve una coda).

3. **Modifica a `_evento_json`** (`main.py:99-129`): aggiungere un flag
   tipo `"ha_link_permanente_sbloccato": bool` interrogando `Diritto` per
   `evento_id`, così l'editor può mostrare "genera link permanente"
   attivo/disattivo senza dover tentare e ricevere un 402.

### 2.2 Perché il diritto lo scrive il webhook e non il ritorno del browser

Coerente col mandato (`backend.md:50-52`) e verificato ora sulla doc
Stripe: `success_url` è **solo** un redirect del browser, non una
conferma di pagamento — un utente che chiude la scheda subito dopo aver
pagato non tornerebbe mai su quella pagina, e se scrivessimo `Diritto` lì
il pagamento andrebbe perso. Il webhook (2.1.2) è l'unica fonte di
verità: arriva dal server di Stripe indipendentemente da cosa fa il
browser dell'utente.

### 2.3 Cosa succede se il webhook arriva due volte

Già coperto in §2.1.2: vincolo unique + `IntegrityError` intercettato →
200 idempotente. Nessuna tabella di eventi processati necessaria per
*questo* caso d'uso specifico (un solo tipo di evento gestito, un solo
side-effect, chiave naturale già unica). Se in futuro si aggiungono altri
`Diritto.tipo` con logica diversa, va rivalutato caso per caso.

### 2.4 Migrazioni Alembic necessarie

**Nessuna per il modello `Diritto`** — esiste già (§1.1). Le uniche
migrazioni Stripe-correlate sarebbero:
- Se si aggiunge il flag `ha_link_permanente_sbloccato` come colonna
  calcolata persistita — **non necessario**, si può calcolare a ogni
  lettura con una query, zero migrazione.
- Nessun'altra colonna è richiesta dal flusso di pagamento in sé.

### 2.5 Cosa serve da Andrei — esplicito

1. **Un account Stripe attivo** (con KYC completato: dati fiscali di chi
   incassa, IBAN, ecc. — richiesti da Stripe stesso, non da noi).
2. **Decisione test vs live**: si consiglia di sviluppare e verificare
   tutto in modalità test (`sk_test_...`, `whsec_...` di test, tramite
   `stripe listen` in locale) prima di passare a `sk_live_...`.
3. **`STRIPE_SECRET_KEY`** (server-side, mai nel frontend) e
   **`STRIPE_WEBHOOK_SECRET`** (generato quando si registra l'endpoint
   webhook nel dashboard Stripe — uno per l'ambiente test, uno per live).
4. **Prezzo del link permanente**: importo, valuta (presumibilmente EUR).
   Da creare come `Price` nel dashboard Stripe oppure da passare come
   configurazione (`price_data` inline) — scelta da fare insieme.
5. **Un endpoint webhook pubblicamente raggiungibile in HTTPS con
   certificato valido per una CA pubblica** — **RISOLTO il 2026-08-23**:
   Andrei ha scelto l'opzione "sottodominio dedicato" (opzione 1 posta in
   `DOMANDE.md`). Il coordinatore ha configurato e verificato:
   **`https://andreievictoria.it/api/stripe/webhook`** → `127.0.0.1:8000`
   (FastAPI), certificato **Let's Encrypt reale** (scade 2026-11-21, rinnovo
   automatico). Ogni altro percorso su quel dominio risponde `404` di Caddy
   e non tocca né Next né il resto dell'API (verificato su `/`,
   `/api/salute`, `/api/eventi`, `/e/test`, `/media/*`). Dettagli completi:
   `REGISTRO.md`, voce "[Andrei] DECISIONE: il webhook Stripe passa da
   andreievictoria.it".
   **Questo è ora l'URL definitivo da usare in `POST /api/stripe/webhook`
   (§2.1.2) e da registrare nel cruscotto Stripe** — coincide esattamente
   col path già previsto in questo piano, nessun aggiustamento di rotta
   necessario. Uso di `andreievictoria.it` dichiarato **temporaneo** da
   Andrei (solo per configurare/testare Stripe): non è la scelta definitiva
   di dominio pubblico, e **non sblocca l'indicizzazione o il marketing**
   (vedi REGISTRO). `andreievictoria222.it` resta privato, invariato.
6. **Dati fiscali/fatturazione**: vendere a privati in Italia richiede
   quasi certamente fattura elettronica. Non è competenza di questo
   agente (non sono un commercialista né un avvocato) — segnalo solo che
   il codice del pagamento e l'obbligo fiscale sono due cose diverse e
   la seconda non è coperta da questo piano.

---

## 3. Piano GDPR minimo praticabile

Premessa esplicita: **non sono un avvocato**, quanto segue è cosa serve
*tecnicamente* nel codice per rendere possibili le cose che la legge
probabilmente richiede (accesso, cancellazione, minimizzazione, limite di
conservazione). La base giuridica, il testo dell'informativa, e se serve
un DPO o un registro dei trattamenti restano fuori dal mio ambito e vanno
verificati con qualcuno che abbia competenza legale.

### 3.1 Dati raccolti oggi, per verificarli davvero (§1.3)

`Rsvp`: `referente`, `ospiti` (nomi), `note` (esplicitamente
"intolleranze o note sul menu" — dato sanitario-adiacente), `messaggio`
libero. `Utente`: `email`, hash password. Nessun dato di pagamento
transita da noi (Stripe lo gestisce lato suo — un vantaggio: non tocca
mai il nostro DB, quindi non aggiunge obblighi PCI-DSS a carico nostro).

### 3.2 Per quanto tempo tenerli — la parte tecnicamente scoperta

Oggi **non c'è nessun meccanismo di scadenza per i dati RSVP**. Due
strade, in ordine di correttezza (e di costo):

**A — retention agganciata alla data reale dell'evento (corretta, più
lavoro)**: aggiungere una colonna strutturata `Evento.data_evento: date |
None` (migrazione Alembic nuova, nullable per non rompere gli eventi
esistenti). Va popolata quando l'utente imposta data/ora nel blocco
`hero` o `countdown` — questo tocca anche `servizi.py` (`_aggiorna`,
`main.py:132-143` di `servizi.py`) per sincronizzare la colonna quando
cambia il contenuto di quei blocchi specifici, e tocca il frontend per
mostrare/validare una data vera invece di una stringa libera. **Questo
pezzo non è di sola competenza backend**: la UI che raccoglie la data va
coordinata con l'agente frontend (domanda in coda). Poi un job
schedulato (script Python + cron esterno, non c'è ancora uno scheduler
nello stack) cancella le RSVP (o l'intero evento) N giorni dopo
`data_evento`.

**B — retention a tempo fisso dalla creazione (pragmatica, subito
implementabile)**: cancellare le RSVP N mesi dopo `Rsvp.creato_il` o
dopo `LinkCondivisione.creato_il` del link permanente, a prescindere
dalla data reale dell'evento. Meno corretto semanticamente ("a evento
concluso" richiederebbe sapere quando l'evento è concluso), ma
implementabile subito con lo schema attuale, zero migrazioni, zero
lavoro frontend.

Consiglio: **B come misura minima per aprire subito**, A come
correzione da fare quando il frontend ha spazio — vanno segnalate
entrambe ad Andrei come scelta di prodotto, non solo tecnica.

### 3.3 Cosa serve tecnicamente per la cancellazione a evento concluso

Indipendentemente da A o B:
1. Un **job schedulato** che gira periodicamente (cron esterno che invoca
   uno script, es. `backend/strumenti/pulisci_dati_scaduti.py`, sulla
   falsariga di `strumenti/genera_brano.py` già esistente come script
   one-shot fuori da `backend/app`) — nello stack c'è già Redis
   (`config.py:15`) ma non è usato per scheduling: non serve introdurre
   Celery per un job che gira una volta al giorno, un cron di sistema che
   chiama uno script Python è sufficiente e più semplice da verificare.
2. Le rotte `DELETE` mancanti (§1.3), da costruire comunque perché
   servono anche per il diritto di cancellazione **su richiesta**, non
   solo automatica:
   - `DELETE /api/eventi/{evento_id}/rsvp/{rsvp_id}` (organizzatore
     cancella una risposta singola, es. su richiesta dell'invitato)
   - `DELETE /api/eventi/{evento_id}` (cancella l'intero evento — il
     cascade FK su `blocco`, `asset`, `link_condivisione`, `rsvp`,
     `diritto` è già impostato correttamente in `modelli.py`, manca solo
     la rotta HTTP che invoca `db.delete(evento)`)
   - `DELETE /api/auth/utente` (diritto all'oblio sull'account — anche
     qui il cascade `Utente → Evento` è già `ondelete="CASCADE"`,
     `modelli.py:83`, manca solo la rotta)
3. Una **rotta di lettura per l'organizzatore** (`GET
   /api/eventi/{evento_id}/rsvp`) — prerequisito persino prima del GDPR:
   oggi il prodotto raccoglie dati che nessuno può vedere via API (§1.3).
   Senza questa, anche l'export per un diritto di accesso (art. 15) non
   ha una base da cui partire.

### 3.4 Cosa aggiungere al modello dati

- (Opzionale, solo per l'opzione A) `Evento.data_evento: date | None` —
  una migrazione Alembic minima, `nullable=True`, nessun `CheckConstraint`
  necessario.
- Nessun'altra colonna è strettamente necessaria per il minimo
  praticabile: cancellazione ed esportazione si appoggiano su tabelle già
  esistenti, mancano solo le rotte.

### 3.5 Sicurezza dei dati raccolti (art. 32, non solo diritti dell'interessato)

Segnalato in §1.3: `POST /api/inviti/{token}/rsvp` non ha alcun rate
limit, a differenza del login. Un token di invito trapelato (es. inoltrato
per errore, indicizzato da un crawler) permette oggi un flusso illimitato
di scritture. Vale la pena applicare lo stesso schema già usato per il
login (`main.py:67-84`) anche qui, nello stesso giro di lavoro.

---

## 4. Stima di sforzo (onesta, solo sviluppo backend)

| Pezzo | Stima | Note |
|---|---|---|
| Libreria `stripe` + config (`.env.esempio`, `docker-compose.yml`, `config.py`) | 0.5h | meccanico |
| `POST /api/eventi/{id}/pagamento` (Checkout Session) | 1-2h | dipende da price fisso vs `price_data` inline |
| `POST /api/stripe/webhook` + verifica firma + idempotenza | 3-4h | include test locale con `stripe listen` |
| Esporre stato diritto in `_evento_json` | 0.5-1h | query in più, nessuna migrazione |
| Test end-to-end con Stripe CLI in ambiente di test | 2h | **non sostituibile da "dovrebbe funzionare"**, per mandato |
| **Totale Stripe (sviluppo)** | **~1-1.5 giornate** | **esclude il bloccante DNS/TLS del webhook (§2.5.5), che non è lavoro di sviluppo ma di infrastruttura e può fermare tutto il resto se non risolto prima** |
| `GET /api/eventi/{id}/rsvp` (lettura organizzatore) | 1h | prerequisito minimo |
| `DELETE` rsvp / evento / utente | 2-3h | cascade DB già pronto, solo rotte + test |
| Rate limit su RSVP pubblica | 1h | riuso schema login |
| Colonna `Evento.data_evento` + migrazione (opzione A) | 1h backend | **più lavoro frontend non stimato qui**, da coordinare |
| Job di pulizia periodica + script + cron | 3-4h | include verifica reale, non solo scrittura |
| **Totale GDPR tecnico (opzione B, senza data_evento)** | **~1 giornata** | minimo praticabile per aprire |
| **Totale GDPR tecnico (opzione A completa)** | **~1.5-2 giornate backend + lavoro frontend a parte** | corretto ma richiede coordinamento |

Esclusi da ogni stima: informativa privacy, base giuridica, eventuale
DPA con Stripe, fattura elettronica — non tecnici, non di mia competenza.

---

## Fonti (Stripe, consultate agosto 2026)

- [Receive Stripe events in your webhook endpoint](https://docs.stripe.com/webhooks) — verifica firma (`stripe.Webhook.construct_event`, header `Stripe-Signature`, HMAC-SHA256, tolleranza timestamp 5 minuti), gestione duplicati (evento può arrivare più volte, deduplicare per event id o per id dell'oggetto correlato), retry automatici (fino a 3 giorni in produzione con backoff esponenziale), risposta 2xx rapida.
- [How Checkout works](https://docs.stripe.com/payments/checkout/how-checkout-works) — modalità hosted vs embedded per la sessione di pagamento one-time.
