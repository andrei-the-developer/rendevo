# Domande per Andrei

Le domande che **solo Andrei può chiudere**: soldi, rischio legale, priorità di
prodotto, accessi a servizi esterni. Le domande tecniche fra agenti stanno in
`DOMANDE.md`, non qui.

**Come si usa**: scrivi la risposta nella riga `RISPOSTA:` sotto la domanda.
Alla sessione dopo, il coordinatore la legge, aggiorna `REGISTRO.md` e avvisa
gli agenti interessati. Le domande chiuse restano, con la data: servono a non
rifare lo stesso giro.

Legenda stato: 🔴 blocca lavoro · 🟡 serve presto · 🟢 quando vuoi · ✅ chiusa

---

## ✅ 1. Dominio per il webhook Stripe — CHIUSA 2026-08-23

Scelta l'**opzione 1**: `andreievictoria.it` esposto **solo** per
`/api/stripe/webhook`, resto del sito privato su `andreievictoria222.it`. Uso
temporaneo per configurare e testare Stripe. Già configurato e verificato.

---

## ✅ 2. Account Stripe — CHIUSA 2026-08-23

Hai creato l'account e scritto le due chiavi di **test** nel `.env`. Una nota:
avevi chiamato la seconda variabile `STRIPE_SIGNING_SECTER`; l'ho rinominata in
`STRIPE_WEBHOOK_SECRET`, che è il nome che il codice cercherà. Il valore non è
stato toccato. `backend` sta implementando Checkout e webhook adesso.

La checklist qui sotto resta: servirà di nuovo quando passerete a **live**.

### (checklist originale)

`backend` non può procedere senza queste cose, perché richiedono il **tuo**
account e la **tua** identità (KYC). Checklist verificata sulla documentazione
Stripe attuale (agosto 2026), passo per passo per chi non l'ha mai usato.

### Parti in modalità TEST, non live

Vuoi *testare* il pagamento prima: giusto, ed è anche l'unico ordine sensato.
In **modalità test** puoi fare tutto — creare sessioni di pagamento, pagare
con una carta finta, ricevere il webhook — **senza completare l'attivazione
dell'account** (niente IBAN, niente documenti, niente tempi di verifica). Il
webhook pubblico che il coordinatore ha già configurato
(`https://andreievictoria.it/api/stripe/webhook`) funziona **anche in
modalità test**: Stripe manda comunque una vera richiesta HTTPS a quell'URL,
solo con dati di pagamento finti. Non serve nessun tunnel locale (`stripe
listen`) per verificarlo in produzione: possiamo testare l'intero giro reale
da subito.

Si passa a **live** solo più avanti, quando vorrete incassare soldi veri (§
"Quando passerete a live" più sotto).

RISPOSTA-FATTO, il file .env è stato aggiornato, ora è da testare se tutto funzione

### Passo 1 — Crea l'account (se non esiste già)

Vai su **dashboard.stripe.com/register**, registrati con email e password.
Non serve completare il resto del modulo adesso: puoi lasciarlo a metà e
lavorare comunque in modalità test.

### Passo 2 — Assicurati di essere in modalità test

In alto nel cruscotto Stripe c'è un interruttore **"Modalità test" / "Test
mode"** (a volte chiamato "sandbox"). Deve essere **attivo**. Tutte le chiavi
e i dati che vedi mentre è attivo sono finti e separati da quelli reali: un
oggetto creato in test non esiste in live e viceversa.

### Passo 3 — Copia la chiave segreta (`STRIPE_SECRET_KEY`)

Menu **Sviluppatori → Chiavi API** ("Developers → API keys", o cerca "API
keys" nella barra di ricerca del cruscotto). Con la modalità test attiva vedi
due chiavi:
- **Chiave pubblicabile** (`pk_test_...`) — non segreta, non ci serve: usiamo
  la pagina di pagamento ospitata da Stripe (Checkout), non JavaScript
  lato browser.
- **Chiave segreta** (`sk_test_...`) — **questa è quella che devi copiare**.
  È l'unica delle due che va tenuta segreta: chiunque la ottenga può fare
  operazioni sul tuo account Stripe.

*(Nota tecnica facoltativa: Stripe oggi consiglia, per chi comincia da zero,
le "Restricted keys" — una chiave con permessi limitati solo a ciò che serve,
invece della chiave segreta con accesso completo. Per l'MVP la chiave segreta
normale va benissimo; se preferisci quella limitata, dimmelo e adatto la
richiesta.)*

### Passo 4 — Registra l'endpoint webhook e copia il suo secret (`STRIPE_WEBHOOK_SECRET`)

Questa è la chiave dove quasi tutti si bloccano: **non è la stessa cosa della
chiave segreta del Passo 3**, ed è specifica per ogni singolo endpoint.

1. Menu **Sviluppatori → Webhook** ("Developers → Webhooks").
2. **Aggiungi endpoint** ("Add endpoint").
3. URL endpoint: `https://andreievictoria.it/api/stripe/webhook`
4. Eventi da inviare — seleziona questi (bastano pochi clic, non serve
   capirli tutti):
   - `checkout.session.completed` — **obbligatorio**, è l'evento che dice
     "pagamento riuscito".
   - `checkout.session.async_payment_succeeded` e
     `checkout.session.async_payment_failed` — consigliati da Stripe anche
     se pagherete quasi solo con carta (dove non servirebbero): coprono
     metodi di pagamento che confermano in ritardo. Costano zero da
     aggiungere ora.
5. Salva. Stripe apre la pagina di dettaglio di quell'endpoint, dove trovi
   **"Signing secret"** con un pulsante **"Reveal"/"Rivela"**: è una stringa
   che comincia con `whsec_...`. **Questo è `STRIPE_WEBHOOK_SECRET`.**

Nota: se in futuro create anche un endpoint in modalità live, avrà un
`whsec_...` **diverso** — un secret per endpoint, non uno per account.

### Passo 5 — Scrivi le chiavi nel `.env` (non incollarle in chat)

Le chiavi non vanno mai scritte in chat, né qui né altrove: sono credenziali
vere anche in modalità test (danno accesso al tuo account Stripe). Aprile tu
un terminale sulla macchina ed esegui, sostituendo i due valori tra `<>` con
quelli appena copiati:

```bash
cat >> /home/user/projects/inviti-v2/.env << 'EOF'
STRIPE_SECRET_KEY=<incolla qui sk_test_...>
STRIPE_WEBHOOK_SECRET=<incolla qui whsec_...>
EOF
```

Il file è già `chmod 600` (solo tu puoi leggerlo) e già ignorato da git, non
serve altro. Oggi queste due righe non fanno ancora nulla da sole: il codice
che le legge (e la riga in `docker-compose.yml` che le passa dentro al
container come `INVITI_STRIPE_SECRET_KEY`/`INVITI_STRIPE_WEBHOOK_SECRET`,
stesso schema già usato per `SEGRETO` e `DOMINIO`) è il prossimo pezzo che
scrivo io. Quando è pronto, l'unico passo che resterà a te è **ricreare il
container `api`** perché legga le variabili nuove:

```bash
sudo docker compose up -d --force-recreate api
```

(`restart` non basta: le variabili d'ambiente si fissano alla creazione del
container, non a ogni riavvio.)

### Passo 6 — Una decisione di prodotto, non tecnica: prezzo nel cruscotto o nel codice?

Per il prezzo fisso (69 € matrimonio / 29 € compleanno, vedi domanda 3) ci
sono due strade equivalenti per Stripe:
- **Prezzo creato nel cruscotto** (Prodotti → Aggiungi prodotto, con un
  "Price" collegato): si vede nei report vendite di Stripe organizzati per
  prodotto, più leggibile per te.
- **Prezzo passato dal codice a ogni richiesta** (`price_data` inline):
  zero cliccare nel cruscotto, il prezzo vive solo nel nostro codice.

Non blocca lo sviluppo — posso iniziare con la seconda opzione (più veloce
da verificare) e passare alla prima in un secondo momento senza cambiare
niente lato database. Dimmi se hai una preferenza, altrimenti procedo così.

Ho già creaeto il prodotto che costa 69 euro su stripe, usiamo quello
SU stripe ho questi dati
Destination ID
we_1U7f27LzFoecDfNjvOLi4itl
Name
fascinating-brilliance
Endpoint URL
https://andreievictoria.it/api/stripe/webhook


### Quando passerete a live (non ora)

Per accettare pagamenti veri, Stripe richiede di **attivare l'account**:
dati dell'attività/persona, IBAN italiano su cui ricevere gli incassi, e
spesso un documento d'identità per la verifica (obblighi KYC imposti dai
regolatori, non da noi). Non è istantaneo — mettete in conto qualche giorno
di margine prima della data in cui volete davvero vendere. In quel momento
serviranno: una nuova chiave segreta `sk_live_...` (Passo 3, con
l'interruttore su "modalità produzione") e un **nuovo** endpoint webhook con
il suo `whsec_...` live (Passo 4 va ripetuto: gli endpoint test e live sono
separati). Il codice non cambia, cambiano solo le tre righe nel `.env`.

### Fuori da questa checklist

La fattura elettronica (domanda 5 più sotto) è un obbligo fiscale separato:
non blocca la scrittura del codice di pagamento, ma va deciso prima di
incassare il primo euro vero.

RISPOSTA:

---

## ✅ 3. Il prezzo — CHIUSA 2026-08-23 · un solo prodotto, 69 € IVA inclusa

`marketing` lo ha ricavato dall'aritmetica pubblicitaria, non dai concorrenti:
sotto i ~50 € il canale a pagamento è **matematicamente chiuso** (il CAC stimato
è 12–30 €, e a 39 € ogni vendita paga solo il proprio click). 69 € restano sotto
la soglia psicologica dei 99 € e sono lo 0,27% del budget di un matrimonio medio
italiano (25.970 €).

Include anche: **una tantum, mai abbonamento, mai prezzo per invitato**, e un
upsell "archivio 10 anni" +9 € offerto **dopo** il pagamento.

RISPOSTA:
C'è un solo prodotto, costa 69 euro iva inclusa. Il cliente finale paga 69 euro. Basta. In futuro vedremo se sarà il caso di cambiare.

---

## ✅ 4. GDPR — RIMANDATA 2026-08-23 · in backlog, non bloccante per la beta

Nessuno in squadra è avvocato, quindi questa non si chiude internamente.

La domanda da porre a un legale: **il titolare del trattamento dei dati degli
invitati è la coppia o siamo noi?** La proposta di `marketing` è: coppia
titolare, noi responsabili ex art. 28, con accordo accettato alla creazione.

Perché non è teoria: **Garante, provv. 9980043 del 1/6/2023 — 200.000 € a NH
Italia** per aver raccolto dati su **allergie e intolleranze** senza base
giuridica e con informativa incompleta. Il nostro campo si chiama letteralmente
"Intolleranze o note sul menu".

RISPOSTA:
Per ora ignoriamo e teniamo nel backlog delle cose da risolvere, non bloccanti. Ora mi interessa mettere su questa applicazione, testarla e farla provare a dei beta tester, con le chiavi api di stripe di test.
---

## 🟡 5. Fatturazione elettronica — RIMBALZATA A `marketing` 2026-08-23

`marketing` ha risposto (non è commercialista, e lo dichiara). In breve:

**La domanda era posta male.** Vendere inviti digitali a privati italiani è
"commercio elettronico diretto", e per il B2C la **fattura non è obbligatoria**
salvo che il cliente la chieda (art. 22 DPR 633/72); scontrino e registratore
telematico sono **esonerati**. L'obbligo vero è molto più leggero: **annotare
l'incasso nel registro dei corrispettivi** entro il giorno successivo (art. 24).

**Stripe non fa niente al posto tuo, e anzi aggiunge un adempimento**: dal
1/7/2025 fattura dall'entità irlandese, quindi le sue commissioni diventano
acquisto di servizi dall'estero → **autofattura TD17** in reverse charge,
mensile, forfettari inclusi.

**Il problema vero non è la fattura, è l'inquadramento.** Con 10–25 vendite
l'anno la differenza è enorme: come *impresa/commercio* i contributi INPS sono
**4.549,70 € fissi l'anno** — cioè 25 vendite (1.725 € di ricavi) non li
coprirebbero nemmeno; come *attività professionale* si paga il 26,07% sul
reddito, senza minimo. Da smontare un mito: la "soglia 5.000 €" della
prestazione occasionale **non è un permesso a vendere senza partita IVA**, è un
limite contributivo — conta l'abitualità, e un sito che vende 24/7 lo è.

**Rischi a rimandare adesso: zero.** In beta con chiavi di test nessun denaro
cambia mano, quindi non c'è alcun obbligo da rinviare. Dal primo euro vero
invece: omessa fatturazione 70% dell'imposta con **minimo 300 € per operazione**,
omessa dichiarazione di inizio attività **500–2.000 €** — e il minimo si conta
per operazione, non per anno. Esiste il ravvedimento operoso: correggere presto
costa molto meno.

**Cosa nessuno dice finché non è tardi**: in forfettario non si applica IVA in
fattura, quindi 69 € rendono ~65,40 € invece di 55,27 € → **+10 € a vendita**.

**Raccomandazione**: adesso non fare niente. Prima di passare alle chiavi live,
un'ora con un commercialista con cinque domande in ordine di valore —
(1) impresa o attività professionale, quale ATECO (vale più di tutte le altre
messe insieme); (2) conferma sul registro dei corrispettivi; (3) forfettario e
coefficiente; (4) TD17 sulle commissioni Stripe; (5) con 10–25 vendite l'anno
conviene aprire adesso o aspettare. **Prima ancora**: verifica se esiste già una
partita IVA utilizzabile — salterebbe gran parte del problema.

Va confermato da un professionista: ATECO e gestione INPS, applicabilità del
forfettario al tuo caso, trattamento delle commissioni estere.

**Ti resta da decidere**: se questa risposta ti basta per chiudere la domanda,
o se vuoi che si prepari il foglio di domande da portare al commercialista.

Vendere a consumatori italiani fa scattare obblighi fiscali (fatturazione
elettronica, corrispettivi). È fuori dalla competenza tecnica della squadra ma
va deciso **prima** di incassare il primo euro, perché può cambiare cosa il
codice deve registrare al momento del pagamento.

RISPOSTA:
Mi servono più dettagli, cosa dovrei dire? Quali sono le nostre possibilità? Pro e contro di ciascuna?
Problemi legali se le ignoriamo per ora? 
---

## ✅ 6. Priorità di design — CHIUSA 2026-08-23 · busta indirizzata `?a=` + press-and-hold

Seguito aperto: non ti erano chiare le idee 3 e 4, `design` le sta rispiegando
in concreto in questo giro.

`design` raccomanda la **busta indirizzata** (link con `?a=Chiara`: il nome
dell'ospite nell'anteprima WhatsApp e sul fronte della busta). Motivo: agisce
**prima dell'apertura**, dove oggi perdiamo gente senza saperlo — e il nome
resta nel link, quindi **non tocca il database e scavalca il blocco GDPR**.

Le alternative proposte: sigillo che si rompe davvero (press-and-hold), "un
link tre vite" (l'invito cambia il giorno dell'evento), carta che continua oltre
la busta.

RISPOSTA:
Ottimo con la possibilità di mandarlo alle singole persone con un parametro a= mi piace. In assenza di questo parametro l'invito deve essere genierico. 
Mi piace l'idea di press and gold per aprire. Non ho capito che significa che l'invito cambia il giorno dell'evento. Spiegati meglio ed intanto procediamo con gli altri lavori. che significa carta che continua oltre la busta?
---

## ✅ 7. Anteprima — CHIUSA 2026-08-23 · segni sull'invito + RSVP visibile ma disattivato

`design` sta progettando l'esperienza in questo giro.

`marketing` osserva che un invito di matrimonio **si approva in due**: 10 minuti
non bastano per "mandalo a mia madre e sentiamo". Proposta: 24–72 ore, con badge
"anteprima" e RSVP disattivate. È un cambio di prodotto, non solo tecnico.

RISPOSTA:
Ok, l'idea dei 10 minuti era solo per poi spingere le persone a comprarlo, a non poter usare il prodotto senza usarlo. Ma mi va bene anche mettere tipo dei segni sull'invito finchè la gente non paga, oppure disattivare RSVP. Ma vorrei comunque che il RSVP sia visibile cosi che l'utente vedrebbe come potrebbe essere un invito se lui pagasse. Ad oggi l'anteprima non mostra proprio RSVP.

---

## ✅ 8. Ricerca sui concorrenti — CHIUSA 2026-08-23 · 0 € ricerca, 30 € pubblicità in totale

`marketing` ha analizzato i concorrenti **solo dalle loro vetrine**, e lo
dichiara. Per verificare dall'interno il claim di differenziazione servirebbero
~150 € di acquisti reali. Senza, il piano editoriale resta parzialmente al buio.

RISPOSTA:
Lavoriamo al buio con le info che abbiamo a disposizione e gratis. Abbiamo 0 budged per ricerca di mercato. Avremmo però budget pubblicitario eventualmente, quando tutto sarà pronto, bello, funzionanote. Avremmo 30 euro da dedicare alle pubblcità o agli influencer quindi dovremmo decidere con attenzione dove investirli.

---

## ✅ 9. Dominio pubblico — CHIUSA 2026-08-23 · si espone solo a prodotto pronto e messo in sicurezza

Oggi `andreievictoria.it` espone solo il webhook, in via temporanea. Ma
`marketing` segnala che **finché il sito non è pubblico e indicizzabile,
l'acquisizione è a zero**: Google non indicizza niente, Meta non approva
campagne. La sequenza F0→F5 resta ferma a F0.

Non è urgente finché non vuoi vendere. Diventa il primo blocco quando vorrai.

RISPOSTA:
Intando usiamo questo sito non pubblico per testare. Non appena il prodoto sarà pronto, con chiamate api funzionanti, tutte le feature testate e la sicurezza del sito aggiustata, lo esponiamo, per ora non lo posso esporre pubblicamente per paura che lo attaccano.


---

## ✅ 10. La fascetta dell'anteprima — CHIUSA 2026-08-24 · «BOZZA»

Finché non paghi, l'invito porta una fascetta sulla **busta chiusa** (mai sul
contenuto: niente scritte sopra i nomi o le foto). Resta da scegliere la parola.

- **BOZZA** è il termine della tipografia italiana, quello che si usa per le
  partecipazioni vere: regge il posizionamento "carta, non software".
- **ANTEPRIMA** è la parola del software: più chiara a chi non ha mai avuto a
  che fare con una stamperia.

Raccomandazione di `design`: **BOZZA**, con sotto in piccolo «non ancora
inviato», che disambigua senza dover spiegare.

RISPOSTA: «Ok Bozzo». Si scrive **BOZZA**. A registro il 2026-08-24, vincola
`design` e `frontend`.

---

## ✅ 11. ID del prezzo Stripe — CHIUSA 2026-08-23

`backend` l'ha recuperato da solo interrogando l'API Stripe in sola lettura
(`price_1U7ex5...`) e l'ha scritto nel `.env`. Non devi fare niente.
La spiegazione qui sotto resta utile per quando creerai il prezzo **live**.

### (istruzioni originali)

Hai scritto di aver già creato il prodotto da 69 € su Stripe, e hai incollato
`we_1U7f27LzFoecDfNjvOLi4itl`: quello però è il **Destination ID del webhook**,
non il prezzo. Per far partire il pagamento serve l'ID del **Price**, che
comincia con `price_...`.

Dove si trova: cruscotto Stripe (modalità test attiva) → **Catalogo prodotti /
Products** → apri il prodotto da 69 € → nel riquadro **Prezzi / Pricing** c'è la
riga del prezzo con il suo ID `price_...` (di solito con un'icona per copiarlo).

Poi scrivilo tu nel `.env`, senza incollarlo in chat:

```bash
echo 'STRIPE_PRICE_ID=<incolla qui price_...>' >> /home/user/projects/inviti-v2/.env
```

RISPOSTA:

---

## ✅ 12. Sottodominio beta con password — SUPERATA 2026-08-24 sera · il sito è pubblico

`marketing` ha trovato un blocco che non avevamo visto: il sito chiuso non
impedisce solo la pubblicità, **impedisce di mostrare il prodotto a chiunque**.
Per aprire `andreievictoria222.it` servono una riga in `/etc/hosts` **più**
l'import del certificato interno di Caddy: sul telefono di una sposa è
impossibile. Quindi niente beta-tester, niente demo, niente prova su WhatsApp.

**E c'è un punto scomodo che va detto**: la configurazione di oggi non è
davvero protetta. Caddy decide cosa servire in base al nome che il browser
dichiara, non a chi sei — chiunque conosca l'IP del server può raggiungere il
sito impostando quel nome a mano. Non c'è né password né filtro sugli IP. Oggi
abbiamo il rischio di un sito pubblico senza averne i vantaggi.

Proposta: `beta.andreievictoria.it`, con DNS pubblico, certificato vero,
**password all'ingresso** (`basic_auth`) e istruzione ai motori di ricerca di
non indicizzare. Chi passa di lì trova un muro, non l'app: **più sicuro di
adesso**, e finalmente mostrabile a chi vuoi tu. Il blocco del webhook Stripe
non si tocca.

SUPERATA la sera stessa: Andrei ha deciso di togliere del tutto la password e
pubblicare il sito (vedi `REGISTRO.md`, voce "SVOLTA"). Il blocco
`beta.andreievictoria.it` è stato rimosso da Caddy. Quello che segue resta solo
come storia di come ci siamo arrivati.

RISPOSTA: sì, e il record DNS è stato creato da Andrei il 2026-08-24.
`https://beta.andreievictoria.it` **è in linea**: certificato Let's Encrypt
vero (niente più avvisi del browser, niente `/etc/hosts`), 401 senza
credenziali su ogni percorso, `noindex` per i motori di ricerca. Utente `beta`,
password scelta da Andrei. Verificato dal coordinatore lato server; il primo
accesso vero da telefono lo fa Andrei. Vedi anche la domanda 17.

---

## ✅ 13. I 30 € — CHIUSA 2026-08-24 · restano alla pubblicità, niente pacchetto concorrente

Raccomandazione unica: comprare per **29 €** il pacchetto di un concorrente
(`inviti.digital`) invece di fare pubblicità.

Il motivo: 30 € comprano ~50 clic, che con una conversione realistica dello
0–1% danno 0 o 1 vendite — ma soprattutto **non insegnano niente**, perché con
50 clic non si distingue l'1% dal 6%. E Meta non approva comunque inserzioni
verso un sito non pubblico. Nemmeno l'influencer regge: 30 € valgono una Story
da un principiante, mentre lo stesso post si ottiene **gratis** regalando un
invito (a noi costa zero).

29 € invece comprano informazione che nessun lavoro gratuito produce: com'è il
checkout completo (che `backend` sta scrivendo alla cieca proprio adesso), la
**sequenza di email dopo l'acquisto** — invisibile da fuori, ed è il nostro buco
più costoso — come hanno risolto il GDPR sull'RSVP e **che documento fiscale
emettono** per una vendita da 29 €.

Limite dichiarato: il taglio matrimonio costa 59 €, fuori budget. Si comprerebbe
quello da 29 € (compleanni): stesso checkout, stesse email, template diversi.

Se per te i 30 € sono vincolati alla pubblicità, la raccomandazione diventa:
**non spenderli**. 30 € non spesi valgono più di 30 € bruciati con certezza.

RISPOSTA: no al pacchetto del concorrente, i 30 € vanno in pubblicità.
«Inventiamo noi il meglio che possiamo con quello che abbiamo.» Deciso, non si
riapre. Resta però un vincolo di fatto, non un'opinione: Meta controlla la
pagina di destinazione prima di approvare un'inserzione, e oggi
`beta.andreievictoria.it` risponde 401 a chiunque. **Finché non esiste una
pagina pubblica dove far atterrare il traffico, quei 30 € non sono spendibili.**

---

## 🟡 14. Beta-tester: la proposta è NON partire dai matrimoni

`marketing` propone 12 tester così composti: **7 eventi entro 60 giorni**
(compleanni, lauree), 3 coppie che si sposano nel 2027, 2 professionisti che
fanno da revisori. Vanno invitate ~25 persone per averne 12 attive.

Il ragionamento: un matrimonio di giugno 2027 manda gli inviti a marzo 2027, e
il feedback sul pezzo che conta arriverebbe fra sette mesi. Un compleanno fra
tre settimane testa il 90% delle stesse cose e risponde fra tre settimane.

**Il grosso deve uscire dalla tua rete personale**: almeno 8 su 12, via
WhatsApp. Non è un dettaglio delegabile — è il passo 4 del piano e senza di te
non parte. In cambio si offre l'invito gratis per sempre (vale 69 €, a noi
costa zero), mai soldi né buoni regalo.

Tutto questo è **bloccato dalla domanda 12**: senza un link apribile da un
telefono, non c'è beta.

RISPOSTA:

---

## ✅ 15. Partita IVA — CHIUSA 2026-08-24 · non c'è, si parte gratis

Domanda secca, ma è quella che può far sparire gran parte del problema fiscale
descritto nella domanda 5. Se hai già una posizione aperta (tua o accessibile),
l'inquadramento potrebbe essere già risolto.

RISPOSTA: no. C'è un amico con partita IVA. Proposta di Andrei: partire
**gratis**, raccogliere feedback dalle persone, perfezionare, e mettere a
pagamento dopo.

Non cambia niente nel piano in corso e non blocca niente: la beta gira su chiavi
Stripe di **test**, nessun denaro cambia mano, nessun obbligo fiscale scatta.
Il listino (69 €, domanda 3) non si tocca: si sposta il *quando* si incassa.

Un punto da non lasciare implicito: **usare la partita IVA dell'amico per
fatturare le nostre vendite non è una strada percorribile** — non è un favore
tra amici, è lui che risulterebbe il venditore di un'attività che non è sua, con
il rischio addosso. Al primo euro vero serve una posizione tua (domanda 5).

---

## 🟡 16. Le tue chiavi Stripe di test sono finite in chiaro in una trascrizione

Te lo segnalo perché è giusto tu lo sappia, non perché ci sia un danno in corso.

Durante la verifica, `backend` ha lanciato un comando che elenca le variabili
d'ambiente del container per controllare che le chiavi fossero arrivate. Il
comando ha **stampato per intero `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET`**
nella trascrizione del suo lavoro (un file di log locale, sotto
`/tmp/claude-1001/...`). L'ha segnalato spontaneamente e non l'ha più rifatto:
dopo ha controllato solo prefisso e lunghezza.

**Quanto è grave**: poco. Sono chiavi di **test** (`sk_test_`), non toccano
denaro vero, e il file è sulla tua macchina. Ma restano credenziali del tuo
account Stripe.

**Cosa puoi fare**, se vuoi chiudere la questione: nel cruscotto Stripe
(modalità test) → Sviluppatori → Chiavi API c'è **"Roll key"/"Ruota"** per la
chiave segreta; per il webhook, l'endpoint ha un pulsante per rigenerare il
signing secret. Poi riscrivi i due valori nel `.env` e ricrei il container:

```bash
sudo docker compose up -d --force-recreate api
```

Non è urgente. Se decidi di lasciarle così, va bene: cambiale comunque **prima**
di passare alle chiavi live, che è il momento in cui contano davvero.

RISPOSTA:

---

## ✅ 17. La password della beta copre anche le pagine invito — DECADUTA 2026-08-24 sera

Conseguenza diretta di come è fatta la protezione (domanda 12): il `basic_auth`
vale per **tutto** `beta.andreievictoria.it`, comprese le pagine
`/i/<token>` che i tester manderanno ai loro invitati. Oggi la zia del tester
che apre il link su WhatsApp trova una richiesta di password, non l'invito.

Va benissimo per far provare **l'editor** a un tester. Non regge il pezzo che ci
interessa di più: il giro vero "il tester manda l'invito ai suoi ospiti e noi
guardiamo cosa succede" — che è metà del valore della beta.

Le due strade:
- **Lasciare tutto chiuso**: massima riservatezza, ma i tester provano solo la
  creazione, mai la ricezione. Si può dare la password ai loro ospiti, ma
  realisticamente lì il test si ferma.
- **Esentare `/i/*` e `/api/inviti/*`** dal `basic_auth`: l'editor resta dietro
  password, la pagina invito diventa aperta **a chi ha il token** (link lungo e
  non indovinabile, `noindex` resta). È come funzionerà in produzione comunque.

Raccomandazione del coordinatore: la seconda, ma **solo quando parte la beta
vera**, non prima — e in quel momento va spento il campo intolleranze (la
domanda già aperta a `frontend`), perché quello è l'unico dato delicato che
raccogliamo.

RISPOSTA:

Decaduta poche ore dopo essere stata scritta: senza password non c'è niente da
esentare, le pagine invito sono pubbliche come lo saranno in produzione. Resta
valida una sola riga di quanto sopra, e va portata avanti: **spegnere il campo
intolleranze** prima che entrino invitati veri.

---

## 🟡 18. Serve il record DNS per `www.andreievictoria.it`

L'unica cosa che manca per avere la landing sull'indirizzo che hai chiesto tu.
Il blocco Caddy è già scritto e attende: crea un record `A` (oppure un `CNAME`
verso `andreievictoria.it`) per `www`, puntato su `169.58.224.54`, e il
certificato lo prende Caddy da solo entro un minuto. Senza, funziona solo
`andreievictoria.it` senza `www`.

RISPOSTA:
