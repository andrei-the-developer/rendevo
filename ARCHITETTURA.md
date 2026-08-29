# Inviti digitali — Architettura v2

Proposta del 22.08.2026. Versione consultabile:
<https://claude.ai/code/artifact/9dd33ad8-dacf-4fc9-84ab-998b8122c7fb>

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


L'MVP di prima vita in `../inviti` e **non va toccato**: resta utilizzabile
finché questo progetto non è pronto a sostituirlo.

## Decisioni prese

| Ambito | Scelta | Conseguenza |
|---|---|---|
| Rendering | Next.js, un solo renderer | Gli stessi componenti servono ospite ed editor |
| Link gratuito | Anteprima 10 minuti | Serve al creatore, non per invitare |
| Strategia | Progetto nuovo, cartella separata | L'MVP resta in piedi |
| Infrastruttura | Self-hosted | Verso l'esterno solo Stripe |
| Editor | Solo desktop, click destro | Pressione lunga su mobile rinviata |
| Adempimenti dati | Dopo sviluppo e test | Da chiudere prima di aprire a invitati reali |

## La decisione portante

Un evento non ha campi fissi ma una **lista ordinata di blocchi tipizzati**.
Matrimonio, compleanno e festa a sorpresa diventano tre liste di blocchi
predefinite più tre set di token di stile, sullo stesso motore.

Senza questo passaggio ogni nuovo tipo di evento è codice nuovo: è il motivo
per cui l'MVP non si estende, non la quantità di lavoro.

## Modello dati (PostgreSQL)

```
utente            id, email, hash_password, creato_il, email_verificata_il
sessione          id, utente_id?, creato_il, ultimo_uso, scade_il

evento            id, tipo, tema, stato, creato_il, aggiornato_il, versione
                  proprietario_utente_id?     -- uno dei due, mai nessuno
                  proprietario_sessione_id?   -- garantito da CHECK

blocco            id, evento_id, tipo, posizione numeric, contenuto jsonb, visibile
asset             id, evento_id, tipo, chiave_storage, larghezza, altezza, byte
link_condivisione id, evento_id, token, scade_il?, revocato_il, creato_il
rsvp              id, evento_id, link_id?, presente, referente, ospiti jsonb, note
diritto           id, evento_id, tipo, stripe_payment_intent, creato_il
```

Due dettagli non ovvi:

- `posizione` è `numeric`, non `integer`: per infilare un blocco tra due
  esistenti basta la media dei loro valori, con un solo `UPDATE` invece di
  rinumerare la lista a ogni spostamento.
- `scade_il` nullable è tutto il meccanismo dei link: valorizzato = anteprima,
  `NULL` = permanente.

Il contenuto dei blocchi è `jsonb` validato da un'unione discriminata Pydantic
sul campo `tipo`, così il JSON resta tipizzato invece di diventare una palude.

## Un renderer, due modalità

```
componenti/blocchi/Hero.tsx        ({ contenuto, modo })
componenti/blocchi/Galleria.tsx
componenti/blocchi/Programma.tsx

app/(ospite)/i/[token]/page.tsx    SSR, modo="lettura"
app/(editor)/e/[id]/page.tsx       modo="modifica"
```

Un componente per tipo di blocco, una prop `modo` che decide se disegnare i
controlli. È l'unico modo di garantire che admin e invitato vedano la stessa
cosa: due renderer separati divergono.

L'SSR non è un dettaglio — le anteprime dei link su WhatsApp leggono i tag
`og:` dall'HTML iniziale, e questi inviti si aprono quasi solo da telefono.

## Editing a operazioni

```
POST /api/eventi/{id}/operazioni

[{"op": "aggiorna", "blocco": "…", "campo": "titolo", "valore": "…"},
 {"op": "sposta",   "blocco": "…", "dopo": "…"},
 {"op": "elimina",  "blocco": "…"}]

→ { versione: 42, blocchi: [...] }
```

Operazioni e non PUT del documento intero: da qui arrivano undo/redo,
salvataggio automatico, UI ottimistica e rilevamento conflitti senza
costruirli separatamente.

### Deciso: editor solo desktop, click destro

L'editor si fa **solo per PC**, con il click destro. La pressione lunga è la
sostituzione prevista su mobile, ma è rinviata a dopo.

Conseguenza da tenere presente: **«solo desktop» vale per l'editor, non per
l'invito.** La pagina che vedono gli invitati resta mobile-first — è da telefono
che la aprono quasi tutti. Sono due modalità dello stesso renderer con due
pubblici diversi, e solo una delle due può permettersi di ignorare il mobile.

Azioni del popup, uguali per ogni blocco: modifica testo, sostituisci foto,
sposta su/giù, nascondi, elimina. Su/giù prima del trascinamento: meno codice e
nessuna libreria, e resta l'unica cosa che funzionerà già quando arriverà il
mobile.

## Da anonimo a registrato

Cookie `HttpOnly` `Secure` `SameSite=Lax` firmato. L'evento appartiene *o* a un
utente *o* a una sessione, mai a nessuno dei due (vincolo `CHECK`). Alla
registrazione una transazione trasferisce:

```sql
UPDATE evento
   SET proprietario_utente_id = :utente,
       proprietario_sessione_id = NULL
 WHERE proprietario_sessione_id = :sessione;
```

**Serve un link di recupero** mostrato subito dopo la creazione: se il cookie è
l'unico titolo di proprietà, cancellarlo significa perdere l'invito. Senza, la
prima segnalazione di supporto sarà questa.

## Link

| Tipo | `scade_il` | Raccoglie RSVP | Condizione |
|---|---|---|---|
| anteprima | ora + 10 min | no | sempre, gratis |
| permanente | `NULL` | sì | richiede riga in `diritto` |

Il diritto lo scrive il **webhook Stripe**, non il ritorno del browser: il
pagamento va registrato anche se l'utente chiude la finestra.

Link scaduto = `410` con una pagina che spiega cosa è successo, non un 404
secco: un invitato che trova un errore pensa che il sito sia rotto.

Nota: scegliendo l'anteprima invece dell'invito effimero, il problema delle
RSVP in ostaggio si risolve da sé — chi non paga non raccoglie risposte.

## Stack

**Backend** — FastAPI, SQLAlchemy, Alembic, Pydantic, Pillow (già collaudato:
riscrive gli upload e neutralizza i file travestiti).

**Dati** — PostgreSQL 16, Redis (sessioni, rate limiting), MinIO per gli
oggetti con derivate responsive generate all'upload.

**Frontend** — Next.js, TypeScript, Zustand per lo stato dell'editor, dnd-kit
solo in F2.

**Infrastruttura** — Docker Compose, Caddy per reverse proxy e TLS. Stripe
unico servizio esterno.

Due conseguenze a bilancio: **Node entra nello stack** (non è installato sulla
macchina attuale) e si passa da uno a due runtime; **Stripe è esterno** e con
Checkout ospitato i dati di carta non toccano i nostri server (PCI SAQ-A), ma
resta un trasferimento verso terzi da far passare dal regolamento aziendale.

## Fasi

| | | |
|---|---|---|
| F0 | Impalcatura | Compose, schema, migrazioni, auth minima |
| F1 | Blocchi e pagina ospite | Renderer React in sola lettura |
| F2 | Editor | Modalità modifica, popup, operazioni, undo |
| F3 | Sessioni anonime e account | Proprietà via cookie, trasferimento, recupero |
| F4 | Link, RSVP e pagamenti | Anteprima, permanenti, Stripe, risposte |
| F5 | Temi e tipi di evento | Compleanno, festa a sorpresa |

Primo taglio pubblicabile: **F4**. Prima non c'è un prodotto che sostituisca
l'MVP.

## Perché WhatsApp compare in un documento tecnico

Non è un'integrazione: è il canale con cui l'invito viene consegnato, e impone
due vincoli all'architettura.

Quando un link viene incollato in chat, WhatsApp scarica la pagina e costruisce
il riquadro di anteprima leggendo i tag `og:` — protocollo Open Graph, lo stesso
di iMessage, Telegram, Signal, Facebook e LinkedIn. Non serve codice specifico
per WhatsApp; serve rispettare lo standard.

1. **`og:image` deve essere un URL assoluto.** Un percorso relativo non è
   risolvibile da un crawler esterno. (Era un bug dell'MVP, corretto.)
2. **Il crawler non esegue JavaScript.** Legge l'HTML grezzo. Una SPA che monta
   il contenuto dopo il bundle gli presenta un guscio vuoto, e l'anteprima esce
   grigia e senza foto.

Il secondo punto è **l'unica vera ragione della scelta di Next.js con SSR** al
posto di una SPA. Senza SSR l'invito arriva in chat come link nudo.

Nota pratica: WhatsApp mette in cache le anteprime. Cambiare la foto di
copertina dopo la condivisione non aggiorna i messaggi già inviati.

## Rinviato

**Adempimenti sui dati personali** — le RSVP raccolgono nomi di invitati e note
alimentari («celiaco», «allergia») che sfiorano i dati sanitari. Informativa,
base giuridica e politica di cancellazione si affrontano **dopo lo sviluppo e i
test**, prima di aprire a invitati reali.

## Da decidere prima di F4

1. **Ciclo di vita del pagamento** — acquisto una volta sola o abbonamento? Se
   ricorrente, cosa accade a invito e risposte quando non si rinnova?
2. **Diritti sulla musica** — si accetta qualsiasi caricamento o si offre una
   libreria con licenza verificata?
