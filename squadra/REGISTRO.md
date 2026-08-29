# Registro delle decisioni — Andrei&Co

Solo decisioni che **vincolano il lavoro di altri agenti**. Non è un diario:
se una scelta riguarda solo te, sta nella tua memoria, non qui.

Formato: `## AAAA-MM-GG — [agente] titolo`, poi **cosa**, **perché**, **chi
vincola**.

---

## 2026-08-23 — [coordinamento] Stato di partenza della squadra

**Cosa**: la squadra nasce oggi. Prodotto già in produzione su
`https://andreievictoria222.it` (dominio non pubblico, CA interna di Caddy,
raggiungibile solo con voce manuale in `/etc/hosts`).

**Vincoli reali che valgono per tutti** — dettagli in `../PASSAGGIO_DI_CONSEGNE.md`:

1. **Stripe non è collegato.** Il prodotto **non sa incassare**. Un link
   permanente si abilita a mano nel database. → Nessuna campagna a pagamento ha
   senso prima che questo esista.
2. **Adempimenti GDPR non fatti.** Le RSVP raccolgono nomi di invitati e note
   alimentari (allergie: dato che sfiora il sanitario). → Blocco legale prima di
   aprire a utenti reali italiani, non un dettaglio rimandabile.
3. **Editor solo desktop.** Chi crea sta al PC; chi riceve l'invito è
   mobile-first. → Vincola marketing (dove mandi il traffico di chi crea) e
   design (due pubblici, due contesti d'uso).
4. **Storage S3/MinIO incompleto** (manca `boto3`, il bucket, la rotta `/media`).
   Oggi storage locale su bind mount. → Vincola qualunque funzione che carichi
   file in volume.
5. **Un solo renderer** (`Blocco.tsx` + `ListaBlocchi.tsx`) per ospite ed editor.
   → Vincola design e frontend: niente percorsi di rendering separati.

**Chi vincola**: tutti.

---

## 2026-08-23 — [backend] Il modello dati Stripe è già pronto: non servono migrazioni

**Cosa**: `Diritto` esiste dalla migrazione iniziale e
`Diritto.stripe_payment_intent` è **già `UNIQUE`** (`modelli.py:142-197`). Il
gating del link permanente è già implementato (`servizi.py:267-289`). Manca
invece *tutto* il codice Stripe: zero endpoint, `stripe` non è in
`requisiti.txt`, nessuna config `STRIPE_*`. Da costruire da zero, non da
completare.

**Perché conta**: l'idempotenza del webhook (Stripe può consegnare lo stesso
evento più volte) si appoggia gratis sul vincolo unique già esistente — non
serve inventare una tabella di deduplica.

**Chi vincola**: `backend` (non aprire migrazioni Alembic per questo).

---

## 2026-08-23 — [backend] Bloccante infrastrutturale: Stripe non può consegnare i webhook

**Cosa**: il dominio di produzione `andreievictoria222.it` non è in DNS pubblico
e usa la CA interna di Caddy. **I server di Stripe non lo risolvono e non si
fidano del suo certificato**: nessun webhook può arrivare.

**Perché conta**: senza webhook il pagamento non può registrare il diritto in
modo affidabile (il ritorno del browser non basta: l'utente può chiudere la
finestra). Il codice si potrebbe scrivere e provare solo in locale, mai in
produzione vera.

**Chi vincola**: `backend` (blocca F4) e `marketing` (blocca qualunque
monetizzazione). **Decisione di Andrei**, non tecnica: vedi `DOMANDE.md`.

**RISOLTO 2026-08-23**: vedi voce più sotto "[Andrei] DECISIONE: il webhook
Stripe passa da andreievictoria.it". `backend` è sbloccato su F4.

---

## 2026-08-23 — [backend] Le RSVP non sono né leggibili né cancellabili via API

**Cosa**: in `main.py` (16 rotte totali) **non esiste nessuna rotta `GET` per
leggere le RSVP raccolte, né alcuna rotta `DELETE`**. L'organizzatore non può
vedere le risposte dei propri invitati.

**Perché conta**: è un buco **funzionale** prima ancora che di conformità — il
prodotto raccoglie risposte che nessuno può leggere. Il campo `note` è
etichettato "Intolleranze o note sul menu" (`Interattivi.tsx:360`), quindi sono
anche i dati più delicati che trattiamo.

**Chi vincola**: `backend` (priorità), `frontend` (serve una UI per vederle),
`design` (come si presentano le risposte all'organizzatore).

---

## 2026-08-23 — [design] La busta animata NON è un differenziatore

**Cosa**: è il gesto fondante di Paperless Post dal 2009, e tutto il settore ha
già RSVP, countdown, mappa, galleria, musica. Non sono differenziazione, sono
manutenzione.

**Perché conta**: continuare a investire nel rendere l'apertura "più
spettacolare" è lavoro che non sposta niente.

**Chi vincola**: `design` (non rifare l'apertura per stupire) e `marketing`
(**non venderla come argomento principale**: il mercato la conosce già).

---

## 2026-08-23 — [design] Nella v1 i nomi degli ospiti NON entrano nel database

**Cosa**: l'idea del link personalizzato (`?a=Chiara`) tiene il nome **nel link**,
in mano a chi crea l'invito. Non lo salviamo.

**Perché conta**: salvare nomi di invitati attiva il blocco GDPR già registrato
sopra. Tenendoli fuori dal database, la funzione si può spedire subito senza
informativa e senza toccare lo schema.

**Chi vincola**: `backend` e `frontend` (nessuna migrazione, nessuna
persistenza per questa funzione).

---

## 2026-08-23 — [design] Quattro regole di interfaccia non negoziabili

**Cosa e perché**:
1. **Mai dipendere dalla vibrazione**: WebKit non espone `navigator.vibrate` —
   il buco è proprio su iPhone.
2. **La musica resta agganciata al gesto di apertura**, mai autoplay all'arrivo
   (92,3% degli utenti lo trova fastidioso; inoltre copre gli screen reader).
3. **`--display` solo per nomi e titoli, mai per un paragrafo**; nessun testo
   sopra `--decoro`/`--ornamento`.
4. **Niente catalogo di template**: due temi × due palette fatti benissimo,
   aggiunte una alla volta.

**Chi vincola**: `frontend` (1, 2, 3), chiunque aggiunga blocchi (3),
`marketing` (4 — **non promettere "40 modelli"**).

---

## 2026-08-23 — [frontend] Bug dormiente: il rewrite `/api` si congela al build

**Cosa**: `frontend/next.config.ts:3` risolve `API_INTERNA` **al momento del
build**, congelando il fallback `http://127.0.0.1:8000` dentro l'immagine.

**Perché conta**: oggi è innocuo **solo** perché il Caddyfile di sistema
intercetta `/api/*` prima che Next lo veda. Si romperebbe (500) se cambia la
topologia di rete, o testando il container `web` isolato — che è esattamente
come è stato scoperto.

**Chi vincola**: chiunque tocchi `next.config.ts`, la topologia Docker o la
configurazione Caddy.

---

## 2026-08-23 — [frontend] Playwright non è disponibile: niente verifica visiva

**Cosa**: la disciplina del progetto è "misura nel DOM, non fidarti dello
screenshot", ma **Playwright non è installato in nessun repo su questa
macchina** (girava nel venv del vecchio MVP `../inviti`, che qui non esiste).

**Perché conta**: finché non è rimesso in piedi, nessuno può *verificare*
davvero una modifica visuale — si torna a "sembra giusto", che in questo
progetto ha già prodotto bug reali.

**Chi vincola**: `frontend` e `design` (primo passo prima di costruire
qualunque cosa visuale nuova).

---

## 2026-08-23 — [frontend] Il costo del touch nell'editor è forse molto minore del previsto

**Cosa**: `Tela.tsx:57-76` lega **lo stesso handler** a `onClick` e
`onContextMenu`, e un tap genera un `click` sintetico su tutti i browser mobile
moderni. Quindi l'azione principale (aprire il popup) **potrebbe già funzionare
col dito**, senza codice nuovo.

**Perché conta**: `PASSAGGIO_DI_CONSEGNE.md` presenta "editor solo desktop" come
un buco strutturale. Se l'ipotesi regge, il residuo è ~1-2 giornate (affordance
CSS solo-hover in `guscio.css:209-243`, bersagli piccoli nel popup) invece di
3-5 per riscrivere `involucro()`.

**È un'IPOTESI NON VERIFICATA** — serve Playwright (vedi sopra) o un telefono
vero. **Chi vincola**: `marketing` (non promettere l'editor mobile finché non è
confermato) e `frontend`.

---

## 2026-08-23 — [marketing] Listino: 69 € matrimonio / 29 € compleanno, una tantum

**Cosa**: prezzo unico, IVA inclusa. **Mai abbonamento** al consumatore, **mai
prezzo per invitato**. Upsell "archivio 10 anni" +9 € offerto **dopo** il
pagamento.

**Perché**: non c'è ricavo ricorrente, quindi LTV = margine di una vendita.
Contribuzione netta (IVA 22% + Stripe 1,5% + 0,25 €): 39 €→31,13 · 69 €→55,27.
Con CPC Meta Italia 0,30–0,90 € e conversione 2–5%, il CAC è 12–30 €: **sotto i
~50 € il canale a pagamento è matematicamente chiuso** (a 39 € ogni vendita paga
solo il proprio click). Abbonamento = churn 100%. Prezzo per invitato
impossibile: consegniamo un link WhatsApp, non email — e punirebbe il cliente
migliore (matrimoni con molti invitati).

**Chi vincola**: `backend` (Stripe pagamento singolo, **niente Subscription**,
niente conteggio invitati; prevedere un secondo `Diritto` per l'upsell),
`frontend`, `design`.

---

## 2026-08-23 — [marketing] Il paywall sta sulla pubblicazione, non sulla creazione

**Cosa**: l'editor resta gratuito e senza registrazione. L'utente deve **vedere
il proprio invito finito** prima di pagare.

**Perché**: è già lo standard del settore (inviti.digital dice letteralmente
"si personalizza gratis, si paga quando pubblichi") — **l'anteprima gratis non è
un vantaggio competitivo, è il minimo sindacale**.

**Chi vincola**: `frontend`, `design`, `backend`.

---

## 2026-08-23 — [marketing] La pagina invitato porta una firma "Creato con Inviti"

**Cosa**: firma discreta e cliccabile sulla pagina che vedono gli ospiti, con
parametro di provenienza tracciabile.

**Perché**: ~100 estranei toccati per ogni invito venduto. È il canale di
acquisizione più economico che avremo — costa una riga di HTML. **Onestà
necessaria**: il coefficiente virale resta ben sotto 1, quindi non fa crescere
il prodotto da solo.

**Chi vincola**: `design` (non rovinare l'invito di un cliente pagante),
`frontend` (parametro di provenienza).

---

## 2026-08-23 — [marketing] Il concorrente da battere è la tipografia, non il digitale

**Cosa**: cartaceo 1,50–5 €/invito = **200–600 € per 100 invitati**. Il
matrimonio medio italiano costa 25.970 €: 69 € sono lo **0,27%** del budget.

**Perché conta**: il rischio non è sembrare cari, è **sembrare poco seri**. Due
comunicazioni separate: contro la carta si vince sul prezzo, contro il digitale
sull'emozione. Concorrente più pericoloso: **Zankyou/Matrimonio.com, che il sito
di nozze lo regala** (Premium 89 €).

**Chi vincola**: `marketing`, `design` (percezione di serietà).

---

## 2026-08-23 — [marketing] Il mercato si contrae: non pianificare su crescita

**Cosa**: ISTAT — 173.272 matrimoni nel 2024, **−5,9%**, e ancora **−5,9%** nei
primi 9 mesi 2025. Stagionalità: ~8 su 10 fra aprile e ottobre. L'acquisto
avviene a data −3 mesi (partecipazione) / −7 mesi (save the date) → **picchi
d'acquisto a marzo e giugno**; gennaio–marzo vale il 45–50% del budget annuo.

**Perché conta**: anno 1 realistico **43–87 vendite, 2.400–4.800 € di
contribuzione**. Non paga uno stipendio, e un budget Meta da 500 €/mese sarebbe
più grande del fatturato.

**Chi vincola**: tutti (aspettative), `marketing` (calendario).

---

## 2026-08-23 — [marketing] Requisiti trasversali prima di spendere

1. **Ordine di sblocco obbligatorio**: F0 dominio pubblico → F1 legale → F2
   Stripe → F3 misurazione funnel → F4 ponte mobile → F5 spesa. **Nessun euro di
   pubblicità prima di F3.**
2. **La misurazione del funnel è un requisito, non un extra**: eventi
   creato→personalizzato→anteprima→checkout→pagato, con analytics **senza
   cookie** auto-ospitato (evita il banner e riduce la superficie GDPR).
3. **Niente fasce di funzionalità prima delle prime 100 vendite** — non
   anticipare lavoro sul gating premium.
4. **Nessun claim su funzioni inesistenti, clienti o recensioni** (oggi mancano
   upload musica ed editor mobile confermato).

**Chi vincola**: tutti.

---

## 2026-08-23 — [Andrei] DECISIONE: il webhook Stripe passa da andreievictoria.it

**Cosa**: scelta l'**opzione 1** della domanda aperta da `backend`. Il dominio
pubblico `andreievictoria.it` viene riaperto **esclusivamente** per il percorso
`/api/stripe/webhook`. Tutto il resto del prodotto resta su
`andreievictoria222.it`, non pubblicato.

**Stato: già configurato e verificato** (Caddy, 2026-08-23):
- `https://andreievictoria.it/api/stripe/webhook` → `127.0.0.1:8000` (FastAPI),
  con certificato **Let's Encrypt reale** (scade 2026-11-21, rinnovo automatico).
- **Ogni altro percorso** su quel dominio risponde `404` da Caddy e **non
  raggiunge né l'app Next né il resto dell'API**. Verificato su `/`,
  `/api/salute`, `/api/eventi`, `/e/test`, `/media/*`.
- Log dedicato: `/var/log/caddy/andreievictoria-webhook.access.log`.

**Perché così**: Stripe deve risolvere il dominio e fidarsi del certificato per
consegnare i webhook. Esponendo solo quel percorso si sblocca il pagamento senza
ripubblicare il prodotto.

**Natura temporanea**: Andrei ha dichiarato che l'uso di `andreievictoria.it` è
**momentaneo**, per configurare e testare Stripe. Non è la scelta definitiva di
dominio pubblico.

**REGOLA DA NON ROMPERE**: nel blocco `andreievictoria.it` del Caddyfile non va
aggiunto nessun altro `handle`. Aggiungerne uno significa ripubblicare il sito
senza volerlo.

**Attenzione — questo NON sblocca il marketing**: `marketing` aveva indicato
"F0 dominio pubblico" come prerequisito, ma intendeva **il sito** raggiungibile e
indicizzabile. Qui è pubblico solo un endpoint tecnico: Google non indicizza
niente, Meta non approva niente, e la sequenza F0→F5 resta ferma a F0 per la
parte di acquisizione. **Questa decisione sblocca Stripe, non la vendita.**

**Chi vincola**: `backend` (può procedere con F4), `marketing` (nessun
cambiamento sul suo blocco).

---

## 2026-08-23 — [Andrei] Risposte alle domande aperte: 7 decisioni

Fonte: `DOMANDE-PER-ANDREI.md`, risposte in riga.

**3. Prezzo — SEMPLIFICATO**: **un solo prodotto, 69 € IVA inclusa**, punto.
Niente fascia compleanno a 29 €, niente upsell "archivio 10 anni" per ora.
→ Vincola `backend` (un solo prezzo, niente secondo `Diritto`: il bug del filtro
su `Diritto.tipo` resta reale ma non più urgente) e `marketing` (listino chiuso).

**4. GDPR — RINVIATO consapevolmente**: va nel backlog, **non bloccante ora**.
Obiettivo dichiarato: mettere in piedi l'app, testarla, **farla provare a beta
tester** con chiavi Stripe di **test**. → Resta un debito noto da chiudere prima
di invitati reali, non prima dei beta tester.

**6. Design — APPROVATA la busta indirizzata**: sì al parametro `?a=`, **e in
sua assenza l'invito deve essere generico** (requisito esplicito). Piace anche
il **press-and-hold** per aprire. Le idee 3 ("un link, tre vite") e 4 ("la carta
oltre la busta") **non sono state capite**: `design` deve rispiegarle in modo
più concreto. Intanto si procede col resto. → Vincola `design` e `frontend`.

**7. Anteprima — CAMBIO DI REQUISITO**: i 10 minuti erano un modo per spingere
all'acquisto. Va bene sostituirli con **segni/filigrana sull'invito** finché non
si paga, oppure RSVP disattivate. **Ma l'RSVP deve restare VISIBILE**
nell'anteprima (oggi non si vede affatto): chi crea deve vedere com'è l'invito
*se pagasse*. → Vincola `backend` (l'anteprima oggi nasconde l'RSVP: va mostrata
disabilitata), `frontend` e `design` (come si mostra "disattivato ma visibile").

**8. Budget — MOLTO più stretto del previsto**: **0 € per ricerca di mercato**
(si lavora con fonti gratuite). Per pubblicità/influencer: **~30 € in tutto**,
disponibili solo quando il prodotto sarà pronto e funzionante.
→ **Vincola pesantemente `marketing`**: il piano canali era costruito su ordini
di grandezza ben maggiori (CAC stimato 12–30 € *per vendita*). Con 30 € totali
la pubblicità a pagamento non è un canale: va ripensato tutto su leve gratuite.

**9. Dominio — resta privato**: si testa su `andreievictoria222.it`. Si espone
**solo** quando il prodotto sarà pronto, le feature testate e **la sicurezza
sistemata** — motivo dichiarato: timore di attacchi. → Conferma che `marketing`
resta bloccato su F0, e aggiunge un requisito: **una revisione di sicurezza è
prerequisito alla pubblicazione**.

**5. Fatturazione elettronica — DOMANDA RIMANDATA INDIETRO**: Andrei chiede
opzioni, pro/contro e rischi del rinviare. Serve una risposta prima di poterla
chiudere.

---

## 2026-08-23 — [design] Anteprima non pagata, idee 3 e 4 ridimensionate

Fonte: `design-direzione.md` Parte II (§7–§10), giro dopo le risposte di Andrei.

**I segni dell'anteprima stanno sull'imballaggio, mai sul contenuto.** Fascetta
`BOZZA / non ancora inviato` sulla **busta chiusa** + modulo RSVP **congelato a
colori pieni** (`<fieldset disabled>`). Nessun segno tocca nomi, foto o testo
degli sposi: niente filigrana diagonale, niente contenuto sfocato, niente
countdown di scadenza. Motivo: l'unica cosa che vendiamo è la percezione di
qualità — un segno sul contenuto insegna al cliente che il prodotto è brutto
proprio mentre gli si chiedono 69 €. Verificato che né Paperless Post né
Greenvelope segnano l'anteprima. → Vincola `frontend` e `marketing`.

**Durata dell'anteprima e segno di bozza sono UNA decisione sola.** Le 72 h
sono sicure *solo* perché la fascetta è riconoscibile anche da chi riceve il
link. Togliere la fascetta significa tornare ai 10 minuti.
→ Vincola `backend` (`config.py:26`) e `frontend`.

**Il paywall sta nell'editor, non sull'anteprima.** `[Vedi l'anteprima]` gratis,
`[Manda l'invito · 69 €]` primario. Sull'anteprima il prezzo **non compare mai**:
quel link può finire a sua madre. Quello che si compra non è un file, è il
permesso di spedirlo. → Coerente col REGISTRO `marketing`.

**Idea 3 ridotta a una fetta sola**: si costruisce **solo "il programma sa che
ora è"** (incrocio `Hero.data` × `voci[].ora`, schema del `Countdown` già
collaudato: server → trattini, `useEffect` → valori veri). Il resto (riordino
blocchi, chiusura RSVP, ringraziamento) richiede un selettore "Prima · Il giorno
· Dopo" nell'editor e la gestione del fuso: **rimandato a dopo Stripe**. Il
blocco è il selettore di stato, non l'animazione. → Vincola `frontend`.

**Idea 4 ridotta a tre CSS**: grana continua al 3–5%, taglio dorato, **bordo
strappato** (*deckle edge*) sul fondo dell'hero. Il **velo è ritirato da `design`
stesso**: `backdrop-filter` caro su fascia media, le alternative vogliono
animazioni da scroll (non Baseline) o un `IntersectionObserver` che non esiste,
ed è un secondo colpo di scena a due secondi dal primo.

**CORREZIONE alle "Quattro regole di interfaccia"**: misurati i contrasti reali
di `temi.css` — `--accento` su `--fondo-alt` = 4,13–4,18 e `--primario-chiaro`
su `--fondo-alt` = 4,20–4,21: **non passano**. Dentro `.rsvp` (unica sezione su
`--fondo-alt`, `blocchi.css:297`) si usano solo `--testo`, `--testo-tenue`,
`--primario`. Nota: `--accento` su `--fondo` passa **per 0,02** — chi schiarirà
l'oro "solo un po'" romperà l'accessibilità senza vedere differenza a schermo.
→ Vincola chiunque tocchi il CSS.

---

## 2026-08-23 — [marketing] Piano v2 sui vincoli reali (30 €, sito chiuso)

Fonte: `marketing-strategia.md` v2 (sostituisce la v1).

**A. Con 30 € la pubblicità non è un canale.** 30 € / ~0,60 € CPC = ~50 clic;
conversione realistica 0–1% (il traffico social è mobile all'80–90% e il nostro
editor è desktop) → 0 o 1 vendite. Il danno vero non è il denaro, è che con 50
clic non si distingue statisticamente l'1% dal 6%: **si compra rumore, non
informazione**. Meta esce dall'apprendimento a ~50 conversioni per gruppo di
inserzioni, e comunque non approva inserzioni verso un sito non pubblico.
Nemmeno l'influencer: 30 € = una Story da un nano-creator (1–3k follower) →
~0,1 vendite, mentre **il nostro costo marginale è zero**, quindi lo stesso post
si ottiene regalando un invito da 69 €. → Vincola `marketing`: niente piani che
presuppongano budget.

**B. Ordine di grandezza dell'anno 1 senza pubblicità**: 10–25 vendite,
550–1.400 € di contribuzione — **meno del contributo INPS fisso di un
commerciante** (4.549,70 €). → Vincola le decisioni fiscali (voce F).

**C. Senza un link condivisibile non esiste né marketing né beta.** Non è solo
la pubblicità a essere bloccata: `andreievictoria222.it` richiede una riga in
`/etc/hosts` **più** l'import della root CA di Caddy — impossibile sul telefono
di una sposa. Niente beta-tester, niente demo, niente test su WhatsApp.
→ Diventa la precondizione 0 di tutto il piano.

**D. La beta si recluta su eventi a ciclo corto, non su matrimoni.** Un
matrimonio di giugno 2027 manda gli inviti a marzo 2027: il feedback sul pezzo
che conta arriverebbe fra sette mesi. Un compleanno fra tre settimane testa il
90% delle stesse cose (stessa lista di blocchi, `MODELLI` in `blocchi.py`) e
risponde fra tre settimane. Composizione di 12: 7 eventi entro 60 giorni, 3
coppie 2027, 2 professionisti revisori; reclutarne ~25 per averne 12 attivi.

**E. Spegnere il campo "Intolleranze o note sul menu" per la durata della
beta** (`Interattivi.tsx:360`). È letteralmente il campo da 200.000 € del provv.
Garante 9980043. Costo zero, e non riapre la decisione di Andrei sul GDPR:
riduce solo l'esposizione mentre i tester mandano inviti a invitati **veri**.
→ Vincola `frontend` (serve un interruttore, non la rimozione del codice).

**F. Vendere a consumatori italiani NON richiede fattura.** Commercio
elettronico diretto B2C: fattura non obbligatoria salvo richiesta del cliente
(art. 22 DPR 633/72), scontrino/RT esonerati (art. 2 lett. oo DPR 696/1996), ma
**obbligo di annotare i corrispettivi giornalieri** entro il giorno non festivo
successivo (art. 24). Stripe non fa niente di tutto questo e **aggiunge** un
adempimento: dal 1/7/2025 fattura dall'entità irlandese → autofattura **TD17**
in reverse charge, mensile, forfettari inclusi. In beta con chiavi di test
l'obbligo è **zero**. → Vincola `backend`: il webhook deve salvare data/ora,
lordo, commissione, id transazione, email e **paese del cliente** (serve per
l'OSS oltre 10.000 €/anno di vendite B2C UE).

**G. Risposta a `design`: vince l'idea 1 (busta col nome), la priorità non
cambia.** L'idea 3 ha già fallito su un campione reale — Andrei stesso non l'ha
capita in una frase, mentre l'idea 1 è stata approvata senza spiegazioni. L'idea
1 agisce **prima del clic** (anteprima WhatsApp) e si dimostra in 5 secondi muti,
cosa che serve perché tutto il piano gratuito si appoggia su un video corto.
Due avvertenze: **non è un differenziatore tecnico** (Paperless Post personalizza
da anni) — il claim parla del nome, mai di "siamo gli unici"; e costa lavoro alla
coppia, quindi resta facoltativo col fallback generico. L'idea 3 **cambia
reparto**: il giorno dell'evento ~109 invitati riaprono lo stesso link, dov'è la
firma "Creato con Inviti" → è leva virale, non argomento di vendita.

---

## 2026-08-23 — [backend] Stripe implementato e verificato, bug `crea_link` chiuso

Fonte: `backend-piano.md` + `memoria/backend.md`. Chiavi di **test** fornite da
Andrei nel `.env`.

**Il pagamento esiste davvero.** `POST /api/eventi/{id}/pagamento` crea una
Checkout Session sul **Price già creato da Andrei nel cruscotto** (non
`price_data` inline), con `evento_id` in `metadata` e `client_reference_id`.
`POST /api/stripe/webhook` verifica la firma, gestisce
`checkout.session.completed` e scrive il `Diritto`, idempotente sul vincolo
`UNIQUE` già esistente su `stripe_payment_intent`.
→ **Vincola tutti**: da adesso si può assumere che il pagamento scriva il
`Diritto` da solo. Nessuno deve più inserirlo a mano nel database.

**Config non obbligatoria di proposito**: le tre righe `INVITI_STRIPE_*` in
`docker-compose.yml` sono senza `:?` (a differenza di `SEGRETO`/`DOMINIO`). Se
mancano, il resto del prodotto continua a funzionare e solo checkout/webhook
rispondono un errore esplicito (503).

**Bug chiuso**: `servizi.py:crea_link` ora filtra su
`Diritto.tipo == TIPO_LINK_PERMANENTE`. Prima bastava una riga qualunque
sull'evento, quindi un futuro upsell avrebbe sbloccato per errore il link
permanente.

**Prima infrastruttura di test del progetto**: `backend/tests/` — database
Postgres effimero, migrazioni Alembic reali, transazioni con SAVEPOINT. 9 test.
Non girano nativamente sull'host (niente `pip`/`pytest`, e il DB non espone la
5432): il comando esatto è in `memoria/backend.md`.
→ Vincola chiunque tocchi il backend: **i test esistono, vanno fatti girare**.

**Verifiche fatte, non dedotte** (ricontrollate dal coordinatore): 9/9 test
verdi; il test del bug **fallisce** se si ripristina la query vecchia; un test
chiama davvero l'API Stripe in test mode; flusso end-to-end contro il container
reale (402 → checkout → webhook firmato a mano → 201, webhook rispedito → una
sola riga `Diritto`, webhook senza firma o con firma inventata → 400).

**Scoperte che avrebbero rotto il primo pagamento vero**: da `stripe-python`
v12+ `StripeObject` **non eredita più da `dict`** — `.get()` lancia
`AttributeError` invece di tornare `None`. Un mock non l'avrebbe mai mostrato.
Inoltre `migrazioni/env.py` ignora l'URL passato via Alembic `Config` e usa
sempre `app.db.motore`.

**Resta non osservato**: un pagamento reale in cui è **Stripe stesso** a
consegnare il webhook all'endpoint pubblico. Ogni pezzo è verificato, l'ultimo
miglio no.

---

## 2026-08-24 — [Andrei] Quattro risposte: beta in linea, BOZZA, niente pacchetto concorrente, nessuna partita IVA

Fonte: risposte in chat di Andrei alle domande 10, 12, 13, 15 di
`DOMANDE-PER-ANDREI.md`.

**1. `beta.andreievictoria.it` è pubblico e funziona** (domanda 12, era 🔴).
Andrei ha creato il record DNS che mancava; il blocco Caddy lo aveva già scritto
`backend` il 2026-08-24. Verificato dal coordinatore, non dedotto: `A` →
169.58.224.54, certificato **Let's Encrypt vero** (`ssl_verify_result=0`, non
più `tls internal`), `/` e `/api/salute` → **401** senza credenziali, header
`x-robots-tag: noindex, nofollow, noarchive` presente, `caddy validate` valido,
container `api`/`web`/`db`/`redis` su e risposta 200 sugli upstream locali.
→ **Vincola tutti**: da adesso esiste un URL apribile da un telefono qualunque,
senza `/etc/hosts` e senza importare la CA. Cade il blocco che teneva ferme
beta-tester e demo. `andreievictoria222.it` resta com'è.
→ **Non verificato**: il caricamento completo dell'app *attraverso* l'host beta
con le credenziali — la password l'ha scelta Andrei e non è su disco, la prova
d'uso la fa lui.

**2. Attenzione, conseguenza non ovvia**: il `basic_auth` copre **tutto**
l'host, comprese le pagine invito `/i/<token>`. Un invitato che riceve il link
su WhatsApp si trova la richiesta di password. Va bene per far provare l'editor
a un tester, **non** per il giro vero "il tester manda l'invito a sua zia".
Quando servirà, si esentano `/i/*` e `/api/inviti/*` dal `basic_auth` — e da
quel momento chiunque abbia il token vede l'invito. È una decisione di Andrei,
aperta come domanda 17.

**3. La fascetta dice «BOZZA»** (domanda 10, chiusa). Come raccomandato da
`design`, con sotto in piccolo «non ancora inviato».
→ **Vincola** `design` e `frontend`: è quella la parola, non «ANTEPRIMA».

**4. I 30 € restano destinati alla pubblicità** (domanda 13, chiusa contro la
raccomandazione di `marketing`). Andrei: «inventiamo noi il meglio che possiamo
con quello che abbiamo». Niente acquisto del pacchetto `inviti.digital` da 29 €.
→ **Vincola** `marketing`: non riproporlo. Vincolo di fatto che resta: una
inserzione Meta ha bisogno di una pagina di destinazione **accessibile al
revisore**, e `beta.andreievictoria.it` risponde 401. Finché non esiste una
landing pubblica, i 30 € non sono spendibili comunque.

**5. Nessuna partita IVA** (domanda 15, chiusa). Esiste solo quella di un amico.
Proposta di Andrei: partire **gratis**, raccogliere feedback, mettere a pagamento
dopo. È compatibile con il piano già in corso — la beta gira su chiavi Stripe di
**test**, quindi nessun denaro cambia mano e nessun obbligo fiscale scatta.
→ **Vincola** `marketing`: la beta non è un canale di vendita, non costruirci
sopra previsioni di incasso. Il prezzo di 69 € (domanda 3) **non cambia**: si
sposta il momento in cui si incassa, non il listino.
→ **Punto fermo**: fatturare le nostre vendite con la partita IVA di un terzo
non è una scorciatoia utilizzabile — l'intestatario risulterebbe venditore di
un'attività non sua. Al primo euro vero serve una posizione propria (domanda 5).

---

## 2026-08-24 — [Andrei] SVOLTA: il sito è pubblico e gratuito, il pagamento esce dall'MVP

Fonte: messaggio di Andrei nel gruppo, 2026-08-24 sera. **Questa voce revoca
decisioni precedenti: leggila prima di riprendere qualunque lavoro.**

**Cosa ha deciso Andrei**, parole sue: «togliamo il dominio beta con
l'autenticazione del tutto», landing pubblica su `www.andreievictoria.it` con un
pulsante che porta su `/edit`, nell'editor un pulsante **Copia Link Invito**, e
«per ora rimuoviamo del tutto la parte del pagamento. Niente pagamento finché
non avremo utilizzatori». La strategia d'ingresso è l'uso gratuito e il
passaparola.

**Cosa cade** (non ridiscutetelo, è già deciso):
- La beta chiusa dietro password (domanda 12) e l'esenzione di `/i/*`
  (domanda 17): **non esistono più**, il problema che risolvevano è sparito.
- «Il paywall sta sulla pubblicazione, non sulla creazione» (voce marketing del
  2026-08-23): **sospesa**. Oggi non c'è nessun paywall da nessuna parte.
- La fascetta **BOZZA** decisa stamattina (domanda 10): **senza oggetto**. Serviva
  a marcare l'invito non pagato; non esiste più un invito non pagato. La parola
  resta scelta per quando servirà.
- I 69 € (domanda 3) **restano il listino futuro**, ma nessuno incassa niente
  adesso: non costruiteci sopra previsioni.

**Cosa NON cade**: il codice Stripe di `backend` (verificato, 9 test verdi)
**non si cancella**. Resta in repo e resta spento — senza le variabili
`INVITI_STRIPE_*` checkout e webhook rispondono 503 e il resto del prodotto
funziona, esattamente come era stato progettato. Rimuovere il pagamento
significa toglierlo **dal percorso dell'utente**, non buttare via due giorni di
lavoro che rimetteremo in piedi fra un mese.

**Fatto e verificato dal coordinatore stasera** (`/etc/caddy/Caddyfile`, backup
in `Caddyfile.bak-2026-08-24-pubblico`):
- `beta.andreievictoria.it` **rimosso**: l'handshake TLS ora fallisce (rc 35),
  non c'è più nessun muro di password.
- `andreievictoria.it` **e** `www.andreievictoria.it` servono il sito vero:
  `/api/*` e `/media/*` → :8000, `/_next/*` `/edit*` `/e/*` `/i/*` → :3000,
  `/` → landing statica in `/var/www/landing`.
- Verificato dopo il reload: `/api/salute` **200 pubblico**, `/i/<token>` e
  `/edit` rispondono dall'app Next (non da Caddy), `/` 404 perché la landing è
  ancora una cartella vuota, webhook Stripe ancora 400 senza firma, Guacamole
  intatto, `andreievictoria222.it` intatto.
- `X-Robots-Tag: noindex, nofollow` **tenuto** finché non esiste una landing
  vera: un editor vuoto indicizzato da Google non si disindicizza in giornata.
  È una riga, si toglie il giorno del lancio.
- **`www` non è ancora in DNS**: il blocco Caddy è pronto, il certificato
  arriva da solo quando Andrei crea il record. Oggi funziona l'apex.

**Due cose che questa svolta porta con sé**, non opinioni:
1. **Il problema fiscale sparisce del tutto** finché non si incassa: niente
   partita IVA, niente fattura, niente registro dei corrispettivi (domande 5 e
   15 congelate, non chiuse).
2. **Il problema GDPR smette di essere teorico.** Fin qui era rimandabile perché
   nessun utente reale entrava; da adesso entrano invitati italiani veri e le
   RSVP raccolgono nomi e **note su intolleranze** — il campo del provvedimento
   Garante 9980043. Il minimo indispensabile costa poco: **spegnere quel campo**
   (richiesta già aperta a `frontend`). Non blocca il lancio, va fatto insieme.

**Chi vincola**: tutti. `frontend` (landing, `/edit`, Copia Link Invito, campo
intolleranze), `backend` (via il gate sul link permanente), `design` (la landing
è il primo pezzo di prodotto che si vede), `marketing` (il canale d'ingresso non
è più la pubblicità né la beta chiusa: è il passaparola di chi usa il servizio
gratis).
