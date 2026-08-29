# Landing pubblica — brief e testi pronti

`marketing` · 2026-08-24 · incarico 5
Per `design`, `frontend`, `backend`. I testi qui sotto sono **definitivi, da
incollare**: non sono segnaposto. Se un testo non vi convince ditelo a me, non
riscrivetelo — la coerenza del messaggio è l'unica cosa che tiene insieme
landing, annunci e messaggi ai professionisti.

---

## 1. Che lavoro fa questa pagina (uno solo)

**Non deve vendere.** Oggi non incassiamo (beta gratuita) e la webapp è dietro
password. La pagina ha **un solo compito**: far capire in cinque secondi cosa
riceve un invitato, e raccogliere chi vuole entrare nella beta.

Metriche di questa pagina, in ordine: (1) quante persone chiedono l'accesso,
(2) quanto tempo restano sopra la piega, (3) da dove sono arrivate. Non i like.

**Tre cose che sblocca appena esiste**, tutte già bloccate oggi:
- i **30 €** diventano spendibili — Meta controlla la pagina di destinazione;
- i creator e i professionisti hanno **dove mandare la gente**;
- chi riceve un nostro messaggio può **guardare chi siamo prima di rispondere**.

---

## 2. Il problema del pulsante, e come si risolve a costo zero

La landing manda alla webapp, che chiede una password. Se il pulsante dice
"Prova subito", il 100% di chi lo preme sbatte su una richiesta di credenziali:
peggio che non avere il pulsante.

**Soluzione durante la beta, zero infrastruttura:**
- **Pulsante principale — "Chiedi l'accesso alla beta"** → link `wa.me` verso il
  numero di Andrei (o `mailto:`), con messaggio precompilato: *"Ciao, vorrei
  provare Inviti per il mio evento"*. Nessun form, nessun database, nessuna
  email raccolta da noi, nessun adempimento nuovo. Chi risponde è già filtrato.
- **Link secondario, piccolo — "Ho già le credenziali"** →
  `https://beta.andreievictoria.it`. Serve ai tester e ai professionisti, non al
  pubblico.

**Il giorno che la webapp è pubblica**, il pulsante principale diventa "Crea il
tuo invito" e punta alla webapp. La pagina è già pronta, cambia una riga.

**Niente form di iscrizione a una lista d'attesa**: `backend` ha verificato che
non esiste nessuna infrastruttura email nel progetto. Raccoglieremmo indirizzi
che non possiamo contattare, aprendo un trattamento di dati per niente.

---

## 3. Tre trappole tecniche, prima di scrivere una riga di codice

**a) La pagina NON deve stare su `beta.andreievictoria.it`.** Quell'host ha
`basic_auth` su tutto e manda `X-Robots-Tag: noindex, nofollow, noarchive`
(verificato con `curl` oggi). Una landing lì nasce invisibile a Google e
protetta da password: esattamente il contrario di ciò che serve.

**b) Serve un host pubblico e indicizzabile.** Quello più economico esiste già:
`andreievictoria.it` ha **DNS pubblico e certificato Let's Encrypt reale**
(rinnovo automatico), e oggi risponde 404 su tutto tranne
`/api/stripe/webhook`. Aggiungere la landing su `/` costa una regola di Caddy e
zero euro. **Attenzione**: il REGISTRO dice che quel dominio è aperto
*esclusivamente* per il webhook — quindi la modifica va messa a registro come
cambio esplicito, non fatta di straforo. Il webhook non si tocca: è il pezzo che
fa funzionare i pagamenti.

**c) Il dominio che indicizziamo per primo ce lo teniamo.** Backlink e URL
indicizzati non si trasferiscono gratis, e la SEO ha 4-8 mesi di latenza:
cambiare dominio fra sei mesi vuol dire ricominciare. `andreievictoria.it` è il
nome di una coppia, non di un prodotto che vende inviti anche per compleanni e
lauree. **Se esiste anche solo l'ipotesi di un nome diverso, si decide adesso**,
prima che la pagina venga indicizzata. Non è una decisione mia.

**d) Il parametro di provenienza sul pulsante.** Ogni link in uscita dalla
pagina (WhatsApp, beta, professionisti) deve portarsi dietro `?fonte=`, e la
pagina deve conservare il `?fonte=` con cui è stata aperta. È lo stesso campo
già chiesto a `backend` per l'acquisto: senza, il giorno che spendiamo non
sappiamo quale canale ha prodotto cosa.

**e) La pagina va indicizzata da subito**, anche se il prodotto non è finito:
`robots.txt` permissivo, `<title>` e meta description scritti (sotto), Open
Graph con un'immagine — perché il primo posto dove questa pagina verrà
incollata è WhatsApp, e senza OG appare un rettangolo grigio.

---

## 4. Cosa possiamo dire, e cosa NON possiamo dire

Verificato su `PASSAGGIO_DI_CONSEGNE.md`, non a memoria.

**Vero, quindi dicibile**: blocchi busta, hero, testo, countdown, programma,
luogo, galleria, nota, musica, rsvp · la busta è un sipario a schermo intero con
sigillo di cera che si apre in animazione · c'è un brano musicale incluso di
default · l'invitato apre da telefono, senza scaricare niente e senza registrarsi
· il link si manda su WhatsApp · lo stesso strumento fa matrimoni, compleanni e
feste (stessa lista di blocchi) · un solo prezzo, invitati illimitati.

**Falso o non verificato, quindi vietato**:
- ❌ "decine di temi" — i temi sono **due** (`sobrio`, `romantico`) e le palette
  **due** (`oliva`, `blu`). Si dice "due stili, quattro combinazioni", oppure
  non si dà nessun numero.
- ❌ "siamo gli unici" / "il primo in Italia" — la busta animata è di Paperless
  Post dal 2009 ed è già a registro che **non è un differenziatore**.
- ❌ recensioni, numeri di clienti, "già usato da N coppie" — non esistono.
- ❌ "crea il tuo invito dal telefono" — **l'editor è solo desktop**. Va detto
  al contrario, in chiaro: *"si crea dal computer, si riceve dal telefono"*.
  Dirlo toglie traffico sbagliato e ci risparmia recensioni brutte.
- ⚠️ **Il nome dell'invitato nella busta** (`?a=Chiara`) è una decisione presa,
  **non ho verificato che sia già implementata**. È il titolo della pagina: se
  al momento della pubblicazione non funziona, **il titolo va cambiato**, non
  pubblicato lo stesso. Chi costruisce la pagina me lo conferma.

---

## 5. I testi, pronti da incollare

### Sopra la piega

**Titolo**
> La partecipazione digitale che arriva con il suo nome sopra.

*(Formula mia, non testata su nessuno. Il "suo" sposta il soggetto sull'invitato:
è la risposta all'unica obiezione vera del passaggio carta→digitale, "è
impersonale". La busta di carta si scrive a mano, e il nome **è** il gesto.)*

**Sottotitolo**
> Matrimoni, compleanni e feste. Chi lo riceve apre una busta con il sigillo,
> sente la musica, legge tutto e ti dice se ci sarà. Dal telefono, senza
> scaricare niente.

**Pulsante**
> Chiedi l'accesso alla beta

**Sotto il pulsante, piccolo**
> In questi mesi è gratuito. Ho già le credenziali →

**L'elemento visivo**: la cattura schermo di 15-20 secondi della busta che si
apre col nome dentro, in loop, muta, dentro la cornice di un telefono. È
l'unica cosa che deve stare sopra la piega insieme al titolo. Nessuna immagine
di repertorio, nessuna coppia generata dall'AI: si vede.

### Blocco 2 — perché

> Cento partecipazioni di carta costano fra 200 e 600 euro, si spediscono a
> mano, e due settimane prima ancora non sai quanti saranno a tavola.
>
> Un invito digitale si manda su WhatsApp in un minuto, si corregge se cambia
> l'orario, e le risposte arrivano da sole.

*(200-600 € è verificato: 1,50-5 € a invito, fonte Stampato e Spedito. È l'unico
numero della pagina e per questo deve restare esatto.)*

### Blocco 3 — come funziona, tre passi

> **1. Scegli lo stile.** Due caratteri, quattro combinazioni di colore. Da
> computer, con calma.
> **2. Scrivi quello che serve.** Data, luogo con la mappa, programma della
> giornata, foto, un brano che parte all'apertura, il conto alla rovescia.
> **3. Manda il link.** Ognuno lo apre dal telefono e risponde. Le risposte le
> vedi tu.

### Blocco 4 — cosa riceve chi è invitato

Elenco corto, ogni riga una cosa vera:
> La busta con il sigillo che si apre toccandola · il suo nome all'interno ·
> la musica · il conto alla rovescia · il programma ora per ora · il luogo con
> la mappa · le vostre foto · il pulsante per dire se ci sarà.

### Blocco 5 — il prezzo, senza giri

> **Durante la beta è gratuito.**
> Dopo: 69 € una volta sola, IVA inclusa. Nessun abbonamento, nessun costo per
> invitato, quanti ne vuoi.

*(Coerente con le decisioni già chiuse: listino 69 € (domanda 3), si parte
gratis (domanda 15). Dire il prezzo futuro adesso non è un impegno a incassare:
è ciò che dà valore alla cosa che stiamo regalando.)*

### Blocco 6 — chiusura onesta

> Lo stiamo ancora costruendo. Se ti va di provarlo prima degli altri e dirci
> cosa non funziona, scrivici: rispondiamo noi, non un modulo.
>
> **Chiedi l'accesso alla beta**

### Titolo del browser e descrizione (SEO)

> **title**: Inviti digitali per matrimoni, compleanni e feste — con il nome
> dell'invitato
> **meta description**: Partecipazioni digitali da mandare su WhatsApp. La busta
> si apre col nome di chi la riceve, con musica, programma, mappa e conferme di
> presenza. Un prezzo solo, invitati illimitati.
> **Open Graph**: stessa frase del titolo + un fermo immagine della busta
> aperta. Questa pagina finirà su WhatsApp: senza OG è un rettangolo grigio.

---

## 6. Cosa NON mettere nella pagina

- **Il modulo di iscrizione**: niente email da raccogliere finché non c'è nulla
  per spedirle.
- **Il tour completo di tutte le funzioni**: chi legge una landing decide in
  cinque secondi, non studia.
- **Il carosello di testimonianze**: non ne abbiamo, e inventarle è fuori
  discussione.
- **Il cookie banner con dieci categorie**: senza analytics e senza pixel non
  serve nulla. Se un giorno mettiamo il pixel di Meta, allora sì — e allora è
  un'altra conversazione.
- **Il countdown finto al lancio**: se poi slitta, l'abbiamo bruciata.

---

## 7. Cosa mi serve indietro

1. Da `design`: la struttura in sei blocchi regge visivamente? Se un blocco non
   sta in piedi, ditelo prima che lo scriva meglio.
2. Da chi la costruisce: conferma che il **nome dell'invitato nella busta**
   funziona davvero al momento della pubblicazione (vedi §4).
3. L'**host scelto**, per poterlo mettere nei messaggi ai professionisti e negli
   annunci: da lì in poi quel link va in giro e non si cambia più a cuor leggero.
