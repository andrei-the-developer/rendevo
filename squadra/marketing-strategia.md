# Inviti — Strategia di acquisizione e monetizzazione

**Versione 2 — 2026-08-23.** Questa versione **sostituisce** la v1 dello stesso
giorno. La v1 era costruita su un budget pubblicitario da centinaia di euro al
mese: Andrei ha chiarito che il budget totale è **30 €, una volta sola**, e che
il sito **resta chiuso** finché non è sicuro. Non è una limatura del piano
precedente: è un piano diverso, perché con 30 € la pubblicità non è un canale.

Quello che della v1 resta valido (concorrenti, stagionalità, aritmetica del
prezzo) è riportato qui dentro, non va cercato altrove. Quello che è stato
buttato è elencato in §10 con il motivo.

---

## 0. I quattro vincoli, e cosa implica ciascuno

| Vincolo (fonte) | Conseguenza operativa |
|---|---|
| **Prezzo unico 69 € IVA inclusa** (Andrei, DOMANDE-PER-ANDREI §3) | Listino chiuso. Niente 29 € compleanno, niente upsell archivio. Un solo messaggio, un solo prezzo da difendere. |
| **30 € di budget, in tutto** (Andrei, §8) | La pubblicità a pagamento **non esiste** come canale. Vedi §5 per i conti che lo dimostrano. |
| **0 € per ricerca di mercato** (Andrei, §8) | Tutto ciò che segue viene da fonti pubbliche e gratuite. Dove sto stimando invece di sapere, è scritto **stima**. |
| **Sito non pubblico finché non è sicuro** (Andrei, §9) | Niente SEO viva, niente Meta, niente landing indicizzabile. Ma — vedi §2 — questo blocca anche cose che Andrei probabilmente non ha in mente, tipo far provare il prodotto a chiunque. |

A questi si aggiunge il vincolo che Andrei ha già deciso di accettare:
**GDPR rimandato al backlog** (§4 delle risposte). Non lo rimetto in
discussione. In §6 propongo l'unica modifica gratuita che toglie la parte
tagliente del rischio senza rimandare niente di ciò che lui ha deciso di
rimandare.

---

## 1. Il numero onesto da cui parte tutto

Con zero spesa pubblicitaria, la crescita può venire solo da quattro sorgenti.
Le stimo una per una, esponendo la catena, così chi legge può contestarla.

**Contribuzione per vendita, scenario "partita IVA ordinaria con IVA":**
```
Prezzo al cliente                        69,00 €
− IVA 22% (69 / 1,22 = 56,56)           −12,44 €
− Stripe SEE 1,5% + 0,25 € su 69,00     − 1,29 €
= contribuzione netta                    55,27 €
```
**Scenario "regime forfettario"** (nessuna IVA in fattura, vedi §7):
```
69,00 − 1,29 (Stripe) = 67,71 € lordi
− imposta sostitutiva 5% su (69 × coefficiente 67%) ≈ − 2,31 €
= ~65,40 € prima dei contributi INPS
```
**+10 € a vendita** rispetto allo scenario con IVA. Non è un dettaglio
contabile: è il 18% di margine in più, e dipende da una scelta che si fa una
volta sola all'apertura della partita IVA. Vedi §7.

**Le quattro sorgenti, anno 1 senza un euro di pubblicità:**

1. **Rete personale + passaparola dei beta-tester** — è l'unica sorgente che
   funziona già domani. Stima: **5–15 vendite**. Non è un canale che scala, ma è
   il canale che esiste.
2. **Partnership con professionisti del wedding** — catena: si contattano 10
   planner/fotografi, ne rispondono 3–4 (stima: tasso di risposta a un contatto
   freddo e personale, 30–40%), ne accettano 2–3. Ciascuno fa 10–30 matrimoni
   l'anno (stima di settore, non verificata); di quelli, la quota di coppie
   disposte al digitale è il pezzo che non conosce nessuno — uso **10–20%**.
   → 2,5 planner × 15 matrimoni × 15% ≈ **4–7 vendite**.
3. **Firma virale sulla pagina invitato** — il matrimonio medio italiano ha
   ~109 invitati (25.970 € di budget / 238 € a invitato, Report Matrimoni 2026).
   Con 25 inviti venduti sono ~2.700 estranei che vedono la firma. CTR su una
   firma discreta: **stima 1–2%** → 27–54 visite; conversione visita→vendita
   **stima 2–3%** → **1–2 vendite**. Il coefficiente virale resta **molto sotto
   1**: non fa crescere niente da solo, ma costa una riga di HTML.
4. **SEO** — con lancio nel Q4 2026 e 4–8 mesi per posizionarsi, il traffico
   vero arriva **fra aprile e agosto 2027**, cioè **dopo** il picco d'acquisto di
   marzo. Contributo alla stagione 2027: **0–3 vendite**. Il grosso lo dà nel 2028.

**Totale anno 1 realistico: 10–25 vendite → 550–1.400 € di contribuzione.**

Questo numero va tenuto in mente leggendo tutto il resto, e in particolare §7:
**è più basso del contributo INPS fisso di un commerciante (4.549,70 € l'anno).**
Se l'inquadramento fiscale sbagliato costa più di quanto il prodotto incassa, la
scelta fiscale conta più di qualunque campagna. È il motivo per cui §7 è lunga.

---

## 2. Il blocco che viene prima di tutti gli altri: non abbiamo un link da mandare

Questo è il pezzo più importante del documento e non era chiaro nella v1.

Oggi il prodotto vive su `andreievictoria222.it`, che:
- **non è in DNS pubblico** — funziona solo per chi mette a mano una riga in
  `/etc/hosts` (`PASSAGGIO_DI_CONSEGNE.md`, §deploy);
- usa la **CA interna di Caddy** — chi non ha importato la root CA vede
  "connessione non sicura".

Conseguenze che vanno dette esplicitamente, perché non riguardano solo la
pubblicità:

- **Non possiamo far provare il prodotto a nessuno.** Un beta-tester dovrebbe
  modificare `/etc/hosts` e installare un certificato: sul telefono di una sposa
  è semplicemente impossibile. Il reclutamento beta di §6 **non parte** finché
  questo non cambia.
- **Non possiamo mostrare niente a un wedding planner.** Zero materiale
  dimostrabile.
- **Non possiamo testare la pagina invitato dove vive davvero**, cioè su
  WhatsApp, su telefoni veri, di persone vere.

E c'è un punto che tocca la ragione stessa per cui il sito è chiuso. Il
passaggio di consegne lo dice già, ma vale la pena ripeterlo perché cambia il
calcolo: **il nome del dominio non è un controllo di accesso.** Chiunque scopra
l'IP del server può raggiungere il sito impostando l'Host header a mano. Non è
stato aggiunto nessun allowlist né autenticazione. Quindi la configurazione
attuale ha, in un colpo solo, **la sicurezza di un sito pubblico e l'inutilità
commerciale di un sito spento**.

### La proposta (decisione di Andrei, non mia)

Un **sottodominio di beta separato** — es. `beta.andreievictoria.it` — con:
- DNS pubblico e certificato Let's Encrypt reale (niente avvisi del browser);
- **autenticazione HTTP di base su Caddy** (`basic_auth`): una sola coppia
  utente/password condivisa con i beta-tester;
- header `X-Robots-Tag: noindex` su tutte le risposte, così Google non indicizza
  niente anche se qualcuno linka la beta.

Cosa cambia rispetto a oggi: un attaccante anonimo trova un muro
**invece di** trovare l'applicazione. La superficie esposta diventa Caddy e la
sua auth, non FastAPI, non Next, non il database. È **più sicuro di adesso**, non
meno — e in più diventa condivisibile con una password.

Nota di rispetto del REGISTRO: la regola "nel blocco `andreievictoria.it` del
Caddyfile non va aggiunto nessun altro `handle`" **resta intatta**, perché questo
è un hostname diverso con un blocco proprio.

Costo: 0 €. Tempo: è configurazione di Caddy, la stima la deve dare `backend`.

**Senza questo, §6 non è eseguibile e §3 si riduce a metà.**

---

## 3. Cosa si costruisce ADESSO, a costo zero, con il sito chiuso

Regola che ho usato per selezionare: **entra in questa lista solo ciò che (a)
costa 0 €, (b) non richiede che qualcuno veda il sito, e (c) il giorno
dell'apertura è già finito e pronto.** Tutto il resto è lavoro fatto due volte.

### 3.1 La banca dei contenuti — la cosa più preziosa e la più noiosa

**Perché adesso**: la SEO ha una latenza di 4–8 mesi e il calendario italiano è
spietato — l'acquisto avviene a *data matrimonio − 3 mesi* (partecipazione) o
*− 7 mesi* (save the date), quindi i picchi di acquisto sono **marzo e giugno** e
il trimestre **gennaio–marzo vale il 45–50% dell'anno**. Un articolo scritto oggi
si posiziona a gennaio. **Un articolo scritto a gennaio serve al 2028.**

Si scrivono adesso, in `contenuti/` nel repo, e restano lì finché non c'è un
sito su cui pubblicarli:

- 8–10 articoli **informazionali**, non commerciali. Le query informazionali
  valgono più di quelle transazionali perché intercettano la coppia 2–3 mesi
  *prima*, quando sta ancora scegliendo **se** fare le partecipazioni di carta.
  Temi: quando si mandano le partecipazioni, cosa scrivere dentro, il galateo
  degli inviti, quanto costano davvero le partecipazioni (con i numeri veri:
  1,50–5 € a invito, **200–600 € per 100 invitati**), come si gestisce la
  conferma degli invitati, save the date sì o no.
- 1 pagina di **confronto onesto** carta vs digitale, che ammetta cosa si perde
  passando al digitale. Una pagina che ammette gli svantaggi si posiziona e si
  fa linkare; una pagina che dice solo bene di sé no.
- Il testo della **pagina di vendita**, la **FAQ**, e le due narrazioni separate:
  contro la carta si vince sul **prezzo**, contro il digitale sull'**emozione**.
  Mai mescolarle nello stesso messaggio.

**Avvertenza**: non ho volumi di ricerca verificati (servirebbe Keyword Planner o
Semrush, e il budget ricerca è 0 €). Il piano editoriale è quindi costruito sul
buon senso del ciclo d'acquisto, non su dati di volume. **Dichiaralo, non
fingere il contrario.**

**Da NON fare**: pubblicare questi articoli su Medium/Substack "intanto".
Costruisce l'autorità di dominio di qualcun altro e, quando li riporteremo sul
nostro sito, ci troviamo a competere con la nostra stessa copia. Terra in
affitto, non asset.

### 3.2 Il video di 20 secondi — il sostituto del link

Non possiamo mandare un link. **Possiamo mandare una registrazione dello
schermo**: la busta che si apre, il nome dell'invitato sul fronte, l'RSVP che si
compila. Costo: 0 €, è già tutto costruito.

Questo singolo file sblocca praticamente tutta la §3.3 e §3.4: è ciò che si
allega a un messaggio a un wedding planner, ciò che si posta su Instagram, ciò
che si manda a un potenziale beta-tester per convincerlo a partecipare.

Tre tagli, dallo stesso girato: 20 s verticale (social), 45 s con voce
(professionisti), 5 s muto in loop (anteprima nei messaggi).

**Vincolo di onestà (REGISTRO, §"nessun claim su funzioni inesistenti")**: il
video mostra solo ciò che esiste oggi. Niente upload musica dell'utente, niente
editor da telefono finché `frontend` non conferma che il tap funziona davvero.

### 3.3 La lista dei professionisti — relazioni, non contatti

La coppia italiana compra dal consigliato: il fornitore è il canale, non il
messaggio. La directory di Matrimonio.com è consultabile **gratis** e ha 69.000+
fornitori. Si costruisce adesso, a mano, un foglio con **40–60 nomi**, e per
ciascuno: categoria, città, se ha un sito, se cura l'estetica, se ha già
segnalato strumenti digitali ai clienti.

Ordine di priorità, e perché:
1. **Wedding planner** — decidono, non consigliano soltanto. Il loro guadagno è
   il tempo risparmiato sulla gestione degli RSVP, non lo sconto.
2. **Fotografi** — pubblicano tantissimo, hanno pubblico di coppie, e il loro
   contenuto è visivo come il nostro.
3. **Location e ristoranti** — vogliono i numeri degli invitati prima e
   correttamente. È letteralmente il nostro output.
4. **Grafici freelance di partecipazioni** — potenziali rivenditori: possono
   *aggiungere* il digitale a quello che già vendono.
   *(Le tipografie no: sono il concorrente, non il partner.)*

**Non si contatta nessuno adesso.** Senza qualcosa da mostrare (§3.2) e senza un
link (§2), un contatto freddo si brucia una volta sola. La lista si prepara, i
messaggi si scrivono, si spediscono il giorno in cui c'è il video e il link.

L'accordo da proporre, quando si aprirà: **sconto 10–15% ai loro clienti +
commissione 20–30% al professionista, zero fisso.** A 69 € significa cedere
14–21 € a vendita su una contribuzione di 55 €: resta positivo e non richiede un
euro anticipato. Serve un modo tecnico per attribuire la vendita → vedi le voci
per DOMANDE in appendice.

### 3.4 Presenza minima: esistere quando qualcuno ti cerca

Un planner che riceve un messaggio da uno sconosciuto **cerca il nome**. Se non
trova niente, non risponde. Serve il minimo indispensabile per non sembrare
inesistenti, e nient'altro:

- **Un profilo Instagram** con 9–12 post già pronti (i tagli del video, i
  dettagli del sigillo, i due temi, un carosello "quanto costano davvero le
  partecipazioni"). Costo 0 €. *Creazione account: decisione di Andrei, io non
  creo account.*
- **Scheda fornitore gratuita su Matrimonio.com.** La registrazione base è
  gratuita e produce una pagina pubblica indicizzata — cioè **una presenza
  online mentre il nostro sito è chiuso**. Da verificare se la registrazione
  richiede partita IVA: se sì, dipende da §7 e non è disponibile subito.
  **La versione Premium (500 €/anno) è fuori discussione**, oggi e per tutto
  l'anno 1.

**Aspettativa onesta**: un profilo Instagram nuovo, senza pubblicità, non porta
vendite. Porta **credibilità in fase di contatto**, che è un'altra cosa e serve
lo stesso. Non misurarlo sui follower.

### 3.5 Quello che NON si costruisce adesso, benché sembri ovvio

- **Una lista d'attesa.** Sembra la mossa da manuale, ed è sbagliata qui per due
  motivi concreti: (a) `backend` ha verificato che **non esiste nessuna
  infrastruttura email nel progetto** — zero SMTP, niente in `requisiti.txt` —
  quindi raccoglieremmo indirizzi che non possiamo contattare; (b) raccogliere
  email è un trattamento di dati personali, cioè esattamente l'adempimento che
  Andrei ha deciso di rimandare. Una lista d'attesa che non possiamo usare è
  rischio legale senza contropartita.
  **Al suo posto**: una lista **manuale** di persone che hanno detto sì a voce,
  tenuta da Andrei nei suoi contatti. Venti nomi veri valgono più di duecento
  email che nessuno può mandare.
- **Campagne, pixel, account pubblicitari.** Meta chiede un sito funzionante e
  conforme per approvare le inserzioni. Non c'è.
- **Il gating delle funzioni premium.** REGISTRO: niente fasce prima delle prime
  100 vendite.

---

## 4. Il giorno dell'apertura: cosa si accende, in che ordine

Precondizioni dichiarate da Andrei: API funzionanti, feature testate, sicurezza
sistemata. Aggiungo le mie: pagamento che incassa davvero (chiavi live), e il
minimo legale di §6.3 per gli invitati reali.

| Quando | Cosa si accende | Perché in quest'ordine |
|---|---|---|
| Giorno 0 | Pubblicazione degli **8–10 articoli** in blocco + sitemap + Search Console | Fa partire l'orologio dei 4–8 mesi. È l'unica cosa che perde valore ogni giorno che aspetta. |
| Giorno 0 | **Firma "Creato con Inviti"** attiva con parametro di provenienza | Ogni invito venduto prima che la firma esista è pubblico regalato a nessuno. |
| Giorno 0 | Misurazione del funnel (creato→personalizzato→anteprima→checkout→pagato), analytics **senza cookie** auto-ospitato | Senza, non sapremo mai quale delle quattro sorgenti di §1 ha funzionato. Auto-ospitato e senza cookie = niente banner, meno superficie GDPR. |
| Giorno 1–7 | **Messaggi ai 40–60 professionisti** di §3.3, uno alla volta, personalizzati | Ora c'è un link da mandare. È la sorgente n.2 di §1, la seconda per resa. |
| Giorno 1–7 | Scheda gratuita Matrimonio.com, profilo Instagram pubblico | Prova di esistenza per chi ci cerca dopo il messaggio. |
| Settimana 2+ | Pubblicazione di 1 articolo nuovo ogni 10–14 giorni | La costanza conta più della quantità. |
| Mai in anno 1 | Meta Ads, Google Ads, Premium Matrimonio.com, fiere | Vedi §5 e §10. |

**Finestra ideale di apertura**: **entro novembre 2026**. Motivo: la stagione si
decide a gennaio–marzo, e ai contenuti servono 4–8 mesi. Aprire a febbraio
significa perdere la stagione 2027 interamente sul canale organico. Se
l'apertura slitta oltre dicembre, non è un dramma — ma va saputo che si sta
scegliendo il 2028, non il 2027.

---

## 5. I 30 €: una raccomandazione sola

### 5.1 Cosa comprano davvero 30 € di pubblicità (i conti)

**Ipotesi Meta Ads.** CPC Italia 2026: 0,30–0,90 €, uso 0,60 € come valore di
lavoro; CPM ~10 €.
```
30 € / 0,60 € per clic            = 50 clic   (33 a 0,90 €; 100 a 0,30 €)
oppure 30 € a CPM 10 €            = 3.000 impressioni, una volta sola
```
Conversione clic→pagante su prodotti self-service: **stima 2–5%**, non
verificata sul nostro funnel — che non esiste ancora. Ma la stima va corretta al
ribasso per un motivo strutturale: **il traffico social è mobile all'80–90% e il
nostro editor è solo desktop.** Chi clicca da Instagram arriva su un editor che
non può usare. Uso quindi **0–1%**.
```
50 clic × 1%  = 0,5 vendite × 55,27 € = 27,6 € di contribuzione, contro 30 € spesi
50 clic × 3%  = 1,5 vendite          = 82,9 €  (scenario ottimistico irrealistico
                                       finché l'editor è desktop-only)
```
E il colpo di grazia non è il rendimento, è l'**informazione**: con 50 clic e 0
o 1 conversioni **non si distingue statisticamente un tasso dell'1% da uno del
6%**. Meta stessa esce dalla fase di apprendimento con ~50 conversioni per
gruppo di inserzioni: noi ne faremmo zero. Si spendono 30 € e non si impara
niente né sul canale né sul prodotto. E comunque Meta non approva inserzioni
verso un sito che non è pubblico.

**Ipotesi influencer.** Tariffe nano (1.000–10.000 follower) in Italia nel 2026:
**25–150 € a post statico, 15–75 € a Story, 50–300 € a Reel.** 30 € stanno sul
pavimento assoluto del mercato: comprano **una Story da un principiante con
1.000–3.000 follower**. Catena: 2.000 follower × 5–15% di reach sulle Story =
100–300 visualizzazioni; CTR sullo sticker link **stima 1–3%** = 1–9 clic; a
2–3% di conversione = **0,1 vendite**.

E soprattutto: **il nostro prodotto ha costo marginale ~zero.** Possiamo
regalare un invito da 69 € a un creator senza spendere un euro. Un accordo
"gifting" ottiene lo stesso post di una Story pagata 30 €, gratis. **Pagare 30 €
compra qualcosa che il regalo compra già a 0 €.**

**Conclusione**: nessuno dei due usi pubblicitari sopravvive all'aritmetica. Non
è pessimismo, sono 50 clic.

### 5.2 La raccomandazione

> **Spendere 29 € per comprare il pacchetto "Invito" da 29 € di inviti.digital**
> (il concorrente italiano strutturalmente più vicino a noi), diventando un loro
> cliente pagante per una volta.

**Perché questo e non altro.** I 30 € vanno spesi in ciò che né il lavoro
gratuito né il regalo possono produrre: **informazione chiusa dietro un
pagamento**. Comprando quel pacchetto vediamo, dall'interno, sei cose che oggi
non sappiamo e che stiamo indovinando:

1. **Il loro checkout completo** — quanti passaggi, cosa chiedono, cosa succede
   subito dopo il pagamento. È esattamente il pezzo che `backend` sta scrivendo
   adesso, e lo scriverebbe alla cieca.
2. **La sequenza di email post-acquisto** — invisibile da fuori. È il buco che
   ho segnalato come **il più costoso del nostro funnel** (non abbiamo l'email
   del cliente, quindi zero recupero). Vedere come lo risolve chi vende davvero
   vale più di qualunque ipotesi.
3. **Cosa consegna il prodotto pagato rispetto a cosa promette la vetrina.** Il
   REGISTRO dice già che la busta animata non è un differenziatore; questo
   acquisto dice **dove sta il differenziatore vero**, se c'è.
4. **Come hanno risolto il problema GDPR sull'RSVP** — informativa, consensi,
   e se raccolgono o no le note alimentari in campo libero. Un concorrente
   italiano vivo che tratta gli stessi dati è il precedente pratico più
   informativo che possiamo avere a 29 €.
5. **Che documento fiscale emettono per una vendita B2C da 29 €** — fattura,
   ricevuta, o niente. Non è un parere legale, ma è **prova di prassi di
   mercato** su esattamente la domanda §7. *(Il commercialista resta necessario:
   vedi §7.6.)*
6. Chiude la **trappola n. 7** della mia memoria: finora non ho mai provato un
   concorrente dall'interno, e l'ho sempre dichiarato. Dopo questo acquisto, i
   confronti che scriveremo in pagina di vendita sono verificati e difendibili
   invece che dedotti da una vetrina.

**Perché il pacchetto da 29 € e non quello matrimonio.** Il loro listino è
29/59 € (Invito), 69/99 € (Evento), 109/139 € (Ricordo), dove il primo numero è
per battesimi/compleanni/lauree e il secondo per matrimoni. **Il taglio
matrimonio costa 59 €, fuori budget.** Il flusso di acquisto, le email, il
pannello RSVP, l'informativa e il documento fiscale sono gli stessi: cambiano i
modelli grafici. Perdiamo la vista sui loro template da matrimonio; teniamo
tutto il resto. Va detto invece di far finta che sia equivalente.

**Quando spenderli**: quando il nostro flusso è testabile da capo a fondo (così
il confronto è utile), e **prima** di scrivere la pagina di vendita definitiva e
di chiudere l'impostazione fiscale. Cioè nella stessa settimana in cui parte la
beta di §6, non oggi.

**Rimangono 1 €.** Non cercare un uso per l'euro.

**Se Andrei rifiuta** perché ha detto che i 30 € sono per pubblicità o
influencer: la posizione va rispettata, ma allora la raccomandazione è
**non spenderli affatto** e tenerli. 30 € di inserzioni verso un sito che non
possiamo nemmeno far approvare a Meta sono 30 € bruciati con certezza; 30 € non
spesi restano 30 €. Non c'è una terza opzione pubblicitaria che funzioni a
questa cifra, e presentarne una sarebbe disonesto.

*(Alternativa più economica valutata e scartata: GuestlistOnline, evento singolo
19,99 €. Costa 9 € meno ma è uno strumento di lista invitati, non una
piattaforma di inviti a prezzo flat come noi: il suo checkout e il suo prodotto
ci somigliano meno, quindi insegnano meno per euro speso.)*

---

## 6. Reclutamento beta-tester

**Precondizione assoluta: §2.** Senza un link condivisibile con password, questa
sezione non è eseguibile. Non "è più difficile": non è eseguibile.

### 6.1 Chi cercare, e la scelta controintuitiva

L'istinto dice "cerchiamo coppie che si sposano". È **sbagliato per la beta**, e
il motivo è il tempo di ritorno:

- Una coppia che si sposa a giugno 2027 manda gli inviti a **marzo 2027**. Il
  suo feedback sul pezzo più importante — cosa succede quando 100 invitati veri
  aprono il link — arriva **fra sette mesi**.
- Chi organizza un compleanno fra tre settimane restituisce lo **stesso**
  feedback su busta, RSVP, telefoni veri e pagamento **fra tre settimane**.

Il prodotto è già la stessa lista di blocchi per matrimonio, compleanno e festa
(`MODELLI` in `blocchi.py`): **testarlo su un compleanno testa il 90% di ciò che
serve al matrimonio, dieci volte più in fretta.**

Composizione consigliata di 12 reclutati:
- **7 eventi a ciclo corto** entro 60 giorni (compleanno, laurea, battesimo,
  anniversario, festa) → misurano il flusso completo, in fretta, su invitati veri.
- **3 coppie in organizzazione** di matrimonio 2027 → misurano la disponibilità a
  pagare e il linguaggio, non il ciclo completo.
- **2 professionisti** (planner o fotografo) come revisori esperti → in dieci
  minuti vedono cosa stona a chi ha visto duecento inviti. Non testano il
  pagamento, testano il giudizio.

**Quanti**: per averne 12 attivi bisogna reclutarne ~25 (stima: metà dei
volontari non completa mai). Cinque utenti bastano a trovare la gran parte dei
problemi di usabilità, ma qui c'è un pagamento e una pagina ospite: servono più
persone e più dispositivi.

### 6.2 Dove trovarli, gratis, senza sito pubblico

**In ordine di resa attesa, che è anche l'ordine di rischio crescente:**

1. **La rete personale di Andrei.** WhatsApp, non un modulo. Chiunque in Italia
   ha, entro due gradi di distanza, qualcuno che organizza qualcosa nei prossimi
   due mesi. È il canale con il tasso di risposta più alto e l'unico che non
   richiede fiducia da costruire. **Da qui devono uscire almeno 8 dei 12.**
   Costo: zero. Attrito: zero.
2. **I professionisti della lista di §3.3**, ma con una domanda diversa da quella
   commerciale: non "vendi il nostro prodotto", ma **"me lo fai provare da una
   coppia tua e mi dici cosa non va?"**. Chiedere un parere ottiene risposta
   dove chiedere una vendita non la ottiene, e apre la relazione di §3.3 con il
   piede giusto.
3. **Gruppi Facebook di spose** (esistono e sono attivi, es. "Spose e Matrimoni
   2025 2026 2027") e la **community di Matrimonio.com** (c'è un thread "Nozze
   2027"). **Con tre avvertenze non negoziabili**:
   - quasi tutti questi gruppi **vietano l'autopromozione**: si legge il
     regolamento e **si scrive all'admin prima**, chiedendo il permesso. Un post
     rimosso brucia il gruppo per sempre;
   - si posta come **richiesta di aiuto** ("cerco 10 persone che provino
     gratis uno strumento e mi dicano cosa non funziona"), non come annuncio;
   - **la community di Matrimonio.com appartiene al gruppo Zankyou, che è un
     nostro concorrente diretto** (regala il sito di nozze, Premium 89 €).
     Promuovere lì un prodotto concorrente verrà rimosso. Serve per
     **ascoltare** che parole usano le spose, non per reclutare. Dirlo prima
     evita di perderci una settimana.
   - **Mai account falsi, mai finti clienti entusiasti.** Un solo episodio
     costa la reputazione dell'unico canale gratuito che abbiamo.

### 6.3 Cosa si offre, e cosa si chiede in cambio

**Si offre (niente soldi, e non servono):**
- **L'invito gratuito per sempre per il loro evento** — vale 69 €, ci costa
  praticamente zero. È l'offerta più forte che abbiamo proprio perché il costo
  marginale è nullo.
- **Un secondo evento gratuito in futuro** (il matrimonio, se hanno testato con
  un compleanno). Costa zero e trasforma un tester in un cliente futuro.
- **Linea diretta con chi lo costruisce**: quello che segnalano viene cambiato,
  e glielo si fa vedere cambiato. Per chi sta organizzando un evento e ha paura
  che qualcosa vada storto, questa è la parte che convince davvero.
- **Menzione tra i fondatori** su una pagina del sito, se la vogliono. Facoltativa.

**Non si offre**: denaro, buoni regalo, sconti su altro. Costano davvero e
attirano chi vuole il buono, non chi vuole il prodotto — cioè esattamente il
feedback sbagliato.

**Si chiede (il patto, scritto e concordato prima):**
1. Arrivare **fino in fondo al pagamento** usando la **carta di test di Stripe**.
   → **Va detto in modo esplicito e in chiaro che non verrà addebitato nulla e
   che la carta è finta.** Non è cortesia: chiedere a qualcuno di inserire i dati
   di una carta senza spiegare cosa succede è inaccettabile.
2. **Mandare l'invito ad almeno 5 invitati veri** e ottenere almeno **3 RSVP**.
   È l'unico modo di testare il prodotto dove vive: WhatsApp, telefoni altrui.
3. Rispondere a **tre domande**, dopo l'uso e mai prima:
   - dove ti sei bloccato o hai dovuto pensarci su;
   - cosa ti aspettavi di trovare e non c'era;
   - **l'avresti pagato 69 €? Se no, quanto, e cosa mancava?**
     (Chiedere il prezzo *prima* dell'uso produce risposte inventate.)
4. **Dispositivo e browser** usati per creare l'invito, e se hanno provato dal
   telefono. → È il dato che ci serve di più: misura quanto costa davvero
   l'editor desktop-only, che oggi è un'ipotesi.
5. Uno **screenshot o una registrazione** di qualsiasi cosa sembri rotta.

**Il patto va scritto in cinque righe e mandato prima che accettino.** Un tester
che sa cosa gli si chiede consegna; uno che lo scopre dopo sparisce.

### 6.4 Il minimo legale della beta — senza riaprire ciò che Andrei ha chiuso

Andrei ha deciso: GDPR nel backlog, non bloccante, prima si testa. **Non lo
rimetto in discussione.** Ma un fatto va messo agli atti, perché al punto 6.3.2
smette di essere teoria: **se un beta-tester manda l'invito a 5 invitati veri,
stiamo trattando dati personali di persone vere che non hanno accettato nulla.**
Beta-tester consenzienti sì; i loro invitati no.

Propongo **tre mitigazioni che costano zero e non rimandano niente di ciò che
Andrei ha deciso di rimandare**:

1. **Spegnere il campo libero "Intolleranze o note sul menu"** per tutta la
   durata della beta (`Interattivi.tsx:360`). È il campo che sfiora il dato
   sanitario, ed è **letteralmente** quello che è costato **200.000 €** a NH
   Italia (Garante, provv. 9980043 del 1/6/2023: allergie e intolleranze
   raccolte senza base giuridica idonea e con informativa incompleta). Toglierlo
   in beta elimina il rischio più affilato **al costo di una riga**, e non
   pregiudica niente: la funzione torna quando c'è l'informativa.
2. **Una pagina di informativa in italiano semplice**, anche breve, anche
   provvisoria: chi siamo, cosa raccogliamo, per quanto, come si cancella. Una
   pagina scritta male è enormemente meglio di nessuna pagina.
3. **Cancellare tutti i dati della beta alla fine**, dichiarandolo ai tester
   all'inizio. Costa una query e trasforma la beta in un trattamento a termine.

Non serve un avvocato per fare queste tre cose. Serve un avvocato per la domanda
grossa (titolare o responsabile?), che resta aperta e nel backlog, come deciso.

### 6.5 La beta in passi

| # | Passo | Chi | Precondizione |
|---|---|---|---|
| 0 | Sottodominio beta con password + `noindex` | backend + Andrei | — |
| 1 | Flusso completo funzionante in test: crea → personalizza → anteprima → checkout Stripe test → link permanente | backend | 0 |
| 2 | Le tre mitigazioni di §6.4 | backend/frontend | — |
| 3 | Girare il video di §3.2 e scrivere il patto in 5 righe | marketing | 1 |
| 4 | Prima ondata: 12–15 inviti dalla rete personale | Andrei | 3 |
| 5 | Due settimane di uso reale, con eventi che accadono davvero | tester | 4 |
| 6 | Raccolta e sintesi: cosa correggere prima dell'apertura | marketing | 5 |
| 7 | Acquisto concorrente da 29 € (§5.2) e confronto | Andrei/marketing | 1 |
| 8 | Seconda ondata: professionisti + coppie 2027 | marketing | 6 |

Durata realistica dalla precondizione 0: **4–6 settimane.**

---

## 7. Fatturazione elettronica: risposta alla domanda di Andrei

> **Non sono un commercialista.** Quella che segue è ricerca su fonti pubbliche,
> con i riferimenti normativi in chiaro perché siano controllabili. §7.6 elenca
> esattamente cosa deve confermare un professionista prima di incassare il primo
> euro vero.

### 7.1 La prima cosa da sapere: probabilmente NON dovete emettere fattura

È il punto che ribalta la domanda, e quasi nessuno lo sa.

Vendere un invito digitale a un consumatore italiano è **commercio elettronico
diretto** (il bene è immateriale e viaggia in rete). Per queste operazioni verso
consumatori finali:

- **Fattura**: **non obbligatoria**, salvo che il cliente la chieda **entro il
  momento di effettuazione dell'operazione** — art. 22 DPR 633/72. L'e-commerce
  è assimilato alle vendite per corrispondenza (Ris. AdE 274/E/2009).
- **Scontrino / ricevuta / registratore telematico**: **esonerati**, art. 2 lett.
  oo) DPR 696/1996, confermato dal DM 10.5.2019 per i servizi elettronici e le
  vendite a distanza.
- **Quello che invece è obbligatorio**: annotare i corrispettivi giornalieri
  (IVA inclusa) nel **registro dei corrispettivi** entro il giorno non festivo
  successivo (art. 24 DPR 633/72).

**Tradotto**: nello scenario normale, per una vendita da 69 € a una sposa
italiana, l'adempimento non è "emettere una fattura elettronica", è "**annotare
l'incasso**". La fattura elettronica scatta solo per chi la chiede — e allora sì,
va emessa via SdI con codice destinatario `0000000` e copia mandata al cliente
via email.

Questo cambia molto il peso della domanda: **l'obbligo di fatturazione
elettronica B2C non è il vero problema.** Il vero problema è §7.3.

### 7.2 Cosa fa Stripe, e soprattutto cosa NON fa

Va detto chiaro perché è la fonte di equivoci più comune:

- **Stripe NON è il venditore.** Non è "merchant of record": vende Andrei,
  Stripe incassa per conto suo. Tutti gli obblighi fiscali restano in capo a chi
  vende.
- **Stripe NON manda niente allo SdI per le vostre vendite.** Stripe Invoicing
  produce un PDF, non una fattura elettronica italiana. Nessuna integrazione con
  il Sistema di Interscambio.
- **Stripe non fa nemmeno più le proprie fatture via SdI.** Dal **1° luglio
  2025** Stripe ha spostato i clienti italiani sull'entità irlandese (Stripe
  Ireland Ltd): le fatture delle commissioni arrivano in PDF dall'estero.
  **Conseguenza operativa per Andrei, se avrà partita IVA**: quelle commissioni
  sono un acquisto di servizi dall'estero e richiedono **autofattura elettronica
  con tipo documento TD17 in reverse charge**, da inviare allo SdI entro il 15
  del mese successivo — e **vale anche per i forfettari**, che non detraggono
  l'IVA ma la versano con F24. È un adempimento **mensile**, piccolo ma reale,
  che spesso viene scoperto tardi.
- **Stripe Tax** (a pagamento) calcola l'IVA. Non emette fatture elettroniche
  italiane. Non risolve il punto sopra.

Quindi: **Stripe non toglie nessun adempimento. Ne aggiunge uno.**

### 7.3 Il problema vero non è la fattura, è l'inquadramento

Se la vendita di inviti è **abituale** — e un sito che vende 24/7 lo è per
definizione secondo la prassi corrente — **serve la partita IVA**. Il mito dei
"5.000 € di prestazione occasionale" è un equivoco: quella soglia è un **limite
contributivo INPS**, non un permesso di vendere senza partita IVA fino a
quell'importo. Ciò che conta è l'abitualità e l'organizzazione, non l'importo.

E qui c'è il numero che conta più di tutti gli altri di questo documento:

| Inquadramento | Contributi INPS | Effetto su 10–25 vendite/anno (§1) |
|---|---|---|
| **Impresa / commercio** (gestione commercianti) | **~4.549,70 € fissi l'anno**, dovuti anche a zero incassi | **Distruttivo.** 25 vendite = 1.725 € di ricavi contro 4.550 € di contributi. Si perde denaro vendendo. |
| **Attività professionale** (gestione separata) | **26,07% sul reddito**, nessun minimo fisso | Sostenibile. Su 25 vendite si versa qualche centinaio di euro, proporzionale. |

Con il regime forfettario (fino a 85.000 € di ricavi, imposta sostitutiva al
**5% per i primi 5 anni** di nuova attività) **non si applica l'IVA in fattura**:
è il motivo per cui in §1 lo scenario forfettario rende ~10 € in più a vendita.

**Questa — non la fattura elettronica — è la decisione che vale migliaia di
euro**, e dipende da come viene classificata l'attività (codice ATECO). Non è
una scelta libera: è tecnica, e la fa un commercialista guardando cosa vendete
davvero. È la prima domanda da porgli.

### 7.4 Le strade concrete, con pro e contro

**Strada A — Nessuna vendita reale: la beta resta in modalità test.**
Nessun euro incassato, nessun obbligo fiscale di alcun tipo. È **esattamente**
la situazione di oggi, ed è la ragione per cui questa domanda **non blocca
niente adesso**.
- *Pro*: costo zero, rischio zero, si può testare tutto il prodotto.
- *Contro*: non si valida la disponibilità a pagare (nessuno paga davvero), e
  non si può restare così per sempre.

**Strada B — Partita IVA in regime forfettario, con inquadramento da definire.**
La strada normale per chi comincia.
- *Pro*: nessuna IVA in fattura (+~10 €/vendita); imposta sostitutiva 5% per 5
  anni; contabilità semplificata; si può vendere legalmente e senza affanni.
- *Contro*: apertura + gestione con un commercialista (**stima**: 300–800 €
  l'anno, da verificare con preventivi veri); contributi INPS che possono essere
  fissi o proporzionali a seconda dell'inquadramento (§7.3); l'autofattura TD17
  mensile sulle commissioni Stripe (§7.2). Con 10–25 vendite l'anno, i costi
  fissi possono superare i ricavi: **è una decisione da prendere con i numeri di
  §1 sotto gli occhi**, non "perché si fa così".

**Strada C — Vendere sotto un soggetto che esiste già.** Se Andrei o un socio ha
già una partita IVA compatibile, si vende da lì.
- *Pro*: nessun costo fisso nuovo, nessun nuovo INPS, si parte subito.
- *Contro*: il codice ATECO deve coprire l'attività; il regime esistente
  potrebbe non essere il migliore; mescola due attività nella stessa contabilità.
  Da valutare in dieci minuti con il commercialista di quel soggetto — se questa
  strada è percorribile, è di gran lunga la più economica.

**Strada D — Un rivenditore che fa da venditore ufficiale** (marketplace/store
che vende in nome proprio e si prende gli obblighi fiscali).
- *Pro*: obblighi trasferiti.
- *Contro*: commissioni molto più alte di Stripe, si perde il rapporto col
  cliente, e non esiste un marketplace italiano adatto a un invito digitale
  su misura. **Scartata**, la cito solo per completezza.

**Strada E — Incassare senza partita IVA sperando che 10–25 vendite passino
per "occasionali".** La cito perché è la tentazione ovvia.
- *Contro*: contrasta con il criterio di abitualità (§7.3), e i rischi sono in
  §7.5. **Non la raccomando.**

### 7.5 Cosa si rischia davvero a rimandare

Distinguo i due casi, perché sono lontanissimi fra loro:

**Durante la beta in modalità test (oggi): rischio zero.** Nessun denaro
cambia mano, non esiste nessuna operazione da certificare. Non c'è niente da
rimandare, perché non c'è ancora niente da fare. **Questo è il punto che
risponde alla preoccupazione di Andrei: non state ignorando un obbligo, non ne
avete ancora nessuno.**

**Dal primo euro incassato davvero, invece:**

| Violazione | Sanzione | Fonte |
|---|---|---|
| Omessa o tardiva fatturazione (quando la fattura era dovuta, es. richiesta dal cliente) | **70% dell'imposta** dell'imponibile non documentato, **minimo 300 € per operazione** | art. 6 D.Lgs. 471/97 come riscritto dal D.Lgs. 87/2024, violazioni dal 1/9/2024 |
| Stessa violazione, senza effetti sulla liquidazione IVA (tipico dei forfettari) | **250 – 2.000 €** (per i forfettari si cita l'importo fisso di 250 € per operazione) | idem |
| Mancata dichiarazione di inizio attività (vendere senza partita IVA quando serviva) | **500 – 2.000 €** | art. 5 c. 6 D.Lgs. 471/97 |
| Omessa autofattura TD17 sulle commissioni Stripe | 70% dell'imposta (min. 250 €) o 5–10% dei corrispettivi (min. 300 €) secondo il caso | D.Lgs. 87/2024 |

A cui si aggiunge, e non è una sanzione ma è il vero costo: **il recupero delle
imposte non versate più interessi**, e il fatto che **ogni vendita non
documentata è una violazione a sé** — il minimo di 300 € si moltiplica per il
numero di operazioni, non per il numero di anni. Venti vendite non documentate
non sono un problema da 300 €.

Nota utile: esiste il **ravvedimento operoso** (art. 13 D.Lgs. 472/97), che
riduce le sanzioni se ci si mette in regola spontaneamente prima che l'Agenzia
contesti. Sbagliare e correggere presto costa molto meno che sbagliare e
aspettare. Questo rende il rischio gestibile, **non inesistente**.

**Un ultimo pezzo, per non scoprirlo dopo**: se qualche cliente non italiano ma
europeo compra, i servizi digitali B2C verso l'UE seguono l'IVA del paese del
cliente **oltre i 10.000 € annui complessivi** (regime OSS). Con 10–25 vendite
è lontanissimo, ma va saputo per non ignorarlo se un giorno la cosa funziona.

### 7.6 Raccomandazione operativa

1. **Adesso non fate niente e non è un rimando**: la beta gira con chiavi Stripe
   di **test**, nessun incasso, nessun obbligo. Confermato da §7.5.
2. **Prima di passare alle chiavi live**, un'ora sola con un commercialista.
   Non "una consulenza fiscale generica": queste **cinque domande precise**, in
   quest'ordine di importanza:
   - **Con che inquadramento va classificata la vendita di inviti digitali —
     impresa (gestione commercianti, ~4.550 € fissi) o attività professionale
     (gestione separata, 26,07% proporzionale)? Quale codice ATECO?**
     *(È la domanda che vale più di tutte le altre messe insieme: con 10–25
     vendite l'anno la risposta sbagliata rende l'attività strutturalmente in
     perdita — mostragli il numero di §1.)*
   - Confermi che per e-commerce diretto B2C basta il **registro dei
     corrispettivi**, senza fattura salvo richiesta (art. 22 DPR 633/72) e senza
     registratore telematico (art. 2 lett. oo DPR 696/1996)?
   - **Regime forfettario**: applicabile? Coefficiente di redditività? Aliquota
     5% per i primi 5 anni?
   - **Autofattura TD17** sulle commissioni Stripe Ireland: la gestisci tu o la
     devo fare io ogni mese? Serve l'iscrizione al VIES?
   - Con **10–25 vendite l'anno** (mostragli §1), **conviene aprire adesso**, o
     conviene aspettare un volume minimo? *(Domanda scomoda ma onesta: la
     risposta potrebbe essere "non ancora", e sarebbe un'informazione preziosa.)*
3. **Verifica prima se esiste già una partita IVA utilizzabile** (Strada C). Se
   sì, salta gran parte del problema.
4. **Cosa deve saper registrare il codice** — questo riguarda `backend` e va
   deciso ora perché è più facile registrare che ricostruire: per ogni pagamento
   servono **data e ora, importo lordo, commissione Stripe, identificativo della
   transazione, email del cliente, paese del cliente**. Il paese serve per l'OSS,
   l'email per l'eventuale fattura su richiesta. Sono tutti campi che Stripe
   restituisce già nel webhook: costa zero salvarli, costa caro ricostruirli.
5. **Aggiungere una riga alla pagina di pagamento**: "Se ti serve la fattura,
   scrivici prima di completare l'acquisto." Risolve l'unico caso in cui la
   fattura è obbligatoria (richiesta *entro* l'operazione) senza costruire niente.

**Cosa NON è coperto da questa analisi e va confermato da un professionista**:
l'inquadramento ATECO e la gestione INPS (§7.3), l'applicabilità del forfettario
al caso concreto, il trattamento esatto delle commissioni Stripe estere, e ogni
valutazione sul caso personale di Andrei (altri redditi, altre attività,
posizione contributiva). Io ho ricostruito la cornice normativa; la scelta
dentro la cornice non è roba mia.

---

## 8. Risposta a `design`: quale formula vende meglio in Italia

> Domanda in `DOMANDE.md`: «La busta con il nome dell'invitato sopra» (idea 1)
> oppure «L'invito che il giorno del matrimonio diventa la mappa» (idea 3)?

**Vince l'idea 1, e non è vicina. La priorità di `design` non cambia.**

Cinque motivi, dal più forte:

1. **L'idea 3 ha già fallito il test su un campione reale.** Andrei — la persona
   più vicina al prodotto al mondo — ha scritto testualmente: «Non ho capito che
   significa che l'invito cambia il giorno dell'evento». Se il fondatore non la
   capisce in una frase, una sposa che scorre Instagram non la capisce in un
   secondo. L'idea 1 non ha avuto bisogno di spiegazioni: è stata approvata
   nello stesso messaggio.
2. **L'idea 1 disinnesca l'unica obiezione che conta.** La barriera al passaggio
   carta→digitale non è il prezzo (69 € sono lo **0,27%** di un matrimonio da
   25.970 €): è «è impersonale, sembra sciatto, la nonna si offende». La
   partecipazione di carta si scrive a mano — «Alla gentile famiglia Rossi» — e
   la calligrafia sulla busta *è* il segnale di attenzione. Mettere il nome sulla
   busta digitale dice: **non perdi la cosa per cui pagavi la carta.** E poiché
   il mercato si contrae (ISTAT: −5,9% nel 2024, −5,9% nei primi 9 mesi 2025), la
   nostra crescita può venire **solo** dallo spostamento carta→digitale: parlare
   a quell'obiezione è parlare all'unico mercato disponibile.
3. **Agisce dove avviene la decisione: nell'anteprima di WhatsApp.** Il nome nel
   titolo si vede **prima del clic**. L'idea 3 consegna il suo valore **il giorno
   del matrimonio**, cioè mesi **dopo** l'acquisto: non si può mostrare in un
   annuncio, il compratore deve immaginarsela. Una promessa che il compratore
   deve immaginare converte molto meno di una che vede.
4. **Si dimostra in cinque secondi muti.** Serve per §3.2, dove tutto il piano
   gratuito si appoggia su un video corto. L'idea 3 richiede un prima/dopo e un
   orologio: non entra in cinque secondi.
5. **Costa meno da comunicare.** Una frase, nessun contesto, nessuna metafora.

**Due avvertenze oneste, che il messaggio deve rispettare:**

- **Non è un differenziatore tecnico e non va venduto come tale.** Paperless
  Post e altri personalizzano il destinatario da anni, e il REGISTRO dice già
  che la busta animata non differenzia niente. Il vantaggio è **comunicativo**,
  non un fossato. Quindi il claim deve parlare del **nome**, mai di "siamo gli
  unici a...". Niente frasi che non possiamo dimostrare.
- **Ha un costo d'uso reale**: un link per invitato significa più lavoro per la
  coppia, in un editor che oggi è **solo desktop**. Deve restare facoltativo, con
  il fallback generico che Andrei ha già preteso. Se generare 100 link diventa
  un lavoro da un'ora, la funzione si ritorce contro.

**Formula proposta per la comunicazione** *(mia proposta, non testata su
nessuno — trattala come un'ipotesi da verificare con i beta-tester di §6, dove
c'è la domanda "che parole useresti tu?"):*

> **«La partecipazione digitale che arriva con il suo nome sopra.»**

Il "suo" è il pezzo che lavora: sposta il soggetto dalla coppia all'invitato, che
è il modo in cui un invito viene letto davvero.

**E l'idea 3 non si butta: si sposta di reparto.** Il suo valore non è
persuadere chi compra, è che **il giorno del matrimonio ~109 invitati riaprono
lo stesso link** — cioè una seconda impressione gratuita, nel momento di massima
emozione, esattamente dove sta la firma "Creato con Inviti". **L'idea 3 è una
leva virale e di ricordo, non un argomento di vendita.** Va ripresa dopo
l'apertura e misurata come tale (riaperture del link il giorno dell'evento), non
prima.

---

## 9. Dati verificati e fonti

Tutto ciò che segue viene da fonti pubbliche gratuite, consultate il
**2026-08-23**. Dove c'è scritto **stima**, è mia e non ha una fonte.

| Cosa | Valore | Fonte |
|---|---|---|
| Matrimoni Italia 2024 | 173.272, −5,9%; primi 9 mesi 2025 ancora −5,9% | ISTAT |
| Stagionalità | ~8/10 fra aprile e ottobre, picchi giugno e settembre | ISTAT |
| Spesa media matrimonio | 25.970 €, 238 € a invitato (→ ~109 invitati) | Report Matrimoni 2026, Matrimonio.com |
| Tempi | consegna partecipazioni 2–3 mesi prima; save the date 6–8 mesi | Matrimonio.com |
| Partecipazioni di carta | 1,50–5 € a invito → 200–600 € per 100 invitati | Stampato e Spedito, Torino365 |
| CPC Meta Italia 2026 | 0,30–0,90 €; CPM ~10 € | Alessandro Mazza Digital |
| Budget minimo Meta consigliato | 5–10 €/giorno per testare; 25–50 €/giorno per uscire dall'apprendimento; 300–500 €/mese minimo realistico | oto.agency, tready.it, Alessandro Mazza Digital |
| Tariffe nano influencer IT 2026 | 25–150 € post statico, 15–75 € Story, 50–300 € Reel | Lessie, Influee |
| Stripe SEE | 1,5% + 0,25 € a transazione | stripe.com/pricing |
| Stripe e SdI | dal 1/7/2025 fatture da Stripe Ireland in PDF, **niente SdI**; per il cliente italiano scatta l'autofattura TD17 in reverse charge, forfettari inclusi | gtechgroup.it, autofattura.io |
| **Concorrenti (prezzi verificati 2026-08-23)** | | |
| inviti.digital | Invito 29 € (bambini) / 59 € (matrimonio); Evento 69/99 €; Ricordo 109/139 € (con hosting 10 anni); su misura da 349 €; +5 € per 10 anni di hosting | inviti.digital |
| Il Nostro Sì | "da 50 €" in vetrina; 65 € inviti / 95 € partecipazioni | ilnostrosi.com |
| GuestlistOnline | gratis fino a 50 invitati; **19,99 € evento singolo**, invitati illimitati | guestlistonline.com |
| Vieni al Nostro Matrimonio | 99 / 325 / 500 €, fatto a mano | vienialnostromatrimonio.it |
| Zankyou / Matrimonio.com | **sito di nozze gratis**, Premium 89 € — il concorrente più pericoloso | matrimonio.com |
| Matrimonio.com fornitori | registrazione base gratuita; Premium 500 €/anno | condizioni legali Matrimonio.com |
| **Fisco** | | |
| E-commerce diretto B2C | niente obbligo di fattura salvo richiesta del cliente (art. 22 DPR 633/72); esonero da scontrino (art. 2 lett. oo DPR 696/1996, DM 10.5.2019); obbligo di registro dei corrispettivi (art. 24 DPR 633/72) | Fiscomania, Agenda Digitale, Ris. AdE 274/E/2009 |
| Fattura B2C quando dovuta | via SdI, codice destinatario `0000000`, copia al cliente per email | Fattura24, Confcommercio |
| Sanzione omessa fatturazione | 70% dell'imposta, min. **300 €** per operazione; 250–2.000 € se non incide sulla liquidazione IVA | D.Lgs. 87/2024 su art. 6 D.Lgs. 471/97 |
| Sanzione omessa dichiarazione inizio attività | **500–2.000 €** | art. 5 c.6 D.Lgs. 471/97 |
| Ravvedimento operoso | riduce le sanzioni se si regolarizza spontaneamente | art. 13 D.Lgs. 472/97 |
| "Soglia 5.000 €" occasionale | **non** è un permesso a vendere senza partita IVA: è un limite contributivo INPS. Conta l'abitualità | Fiscozen, La Legge per Tutti |
| INPS gestione commercianti 2026 | **4.549,70 € fissi**/anno + ~24% oltre il minimale (18.808 €) | fonti previdenziali 2026 |
| INPS gestione separata 2026 | **26,07%** sul reddito, nessun fisso | idem |
| Regime forfettario 2026 | fino a 85.000 €; imposta sostitutiva **5% primi 5 anni** per nuove attività, poi 15%; niente IVA in fattura | Agenzia Entrate e guide 2026 |
| OSS servizi digitali B2C UE | IVA del paese del cliente oltre **10.000 €**/anno complessivi | Direttiva UE 2017/2455 |
| **Garante privacy** | **200.000 €** a NH Italia (provv. 9980043, 1/6/2023): allergie e intolleranze raccolte senza base giuridica idonea e con informativa incompleta | garanteprivacy.it |

**Fonti web consultate oggi** (URL completi): inviti.digital ·
guestlistonline.com/it · fiscomania.com/certificazione-corrispettivi-ecommerce ·
fattura24.com/guide-pratiche/fatturazione-elettronica/b2b-b2c ·
commercialistatelematico.com (sanzioni post D.Lgs. 87/2024) ·
fiscomania.com/sanzioni-dichiarazione-inizio-attivita-iva ·
gtechgroup.it (Stripe e SdI da luglio 2025) · autofattura.io/blog/autofattura-stripe ·
pyva.it e calcoloforfettario.it (INPS 2026) · fiscozen.it (soglia 5.000 €) ·
alessandromazzadigital.com (costi Meta 2026) · lessie.ai e influee.co (tariffe
influencer 2026) · community.matrimonio.com/forum/nozze-2027.

---

## 10. Cosa NON fare (e cosa è stato buttato dalla v1)

**Buttato dalla v1, con motivo:**
- **Il piano Meta Ads da 300–500 €/mese** — non esiste il budget. Non
  ridimensionarlo: a 30 € non è un canale più piccolo, è un altro fenomeno (§5.1).
- **Google Ads con test da 200–300 €** — stesso motivo.
- **Il listino a due prezzi 69/29 €** — Andrei ha chiuso su prodotto unico 69 €.
- **L'upsell "archivio 10 anni" +9 €** — rimandato da Andrei.
- **I 150 € per comprare due concorrenti** — negati. Sostituiti dall'acquisto
  singolo da 29 € di §5.2, che è la versione da un terzo del prezzo della stessa
  idea.
- **La lista d'attesa** — vedi §3.5: non abbiamo come contattarla e apre un
  trattamento di dati che è stato deciso di rimandare.

**Resta valido dalla v1 e non va riproposto in altra forma:**
- **Mai abbonamento** al consumatore (churn strutturale 100%).
- **Mai prezzo per invitato**: consegniamo un link WhatsApp, non spediamo email,
  quindi non sappiamo chi lo apre; e punirebbe il cliente migliore, i matrimoni
  con molti invitati.
- **Mai fasce di funzionalità** prima delle prime 100 vendite.
- **Mai fiere sposi** (600–1.980 € a evento).
- **Mai le tipografie come partner**: sono il concorrente.
- **Mai claim non verificabili**: funzioni che non esistono (upload musica,
  editor mobile finché `frontend` non lo conferma), numeri di clienti, recensioni.
- **Mai account falsi o finto entusiasmo** nei gruppi: brucia l'unico canale
  gratuito che abbiamo.
- **Non vendere la busta animata come argomento principale** — il mercato la
  conosce dal 2009 (REGISTRO, `design`).

---

## Appendice — Voci proposte per REGISTRO e DOMANDE

*Non ho toccato `REGISTRO.md`, `DOMANDE.md` né `DOMANDE-PER-ANDREI.md`: in
questo giro girano altri agenti in parallelo. Il coordinatore unisce.*

### Per `REGISTRO.md`

**A. [marketing] Con 30 € di budget la pubblicità non è un canale.**
Cosa: nessuna spesa su Meta/Google, ora né in anno 1. Perché: 30 € = ~50 clic a
CPC 0,60 €; con 0 o 1 conversioni non si distingue statisticamente l'1% dal 6%,
e Meta esce dall'apprendimento con ~50 conversioni per gruppo di inserzioni. Il
piano si regge su rete personale, partnership, firma virale, SEO. Chi vincola:
tutti (aspettative), `marketing`.

**B. [marketing] Anno 1 senza pubblicità: 10–25 vendite, 550–1.400 € di
contribuzione.** Perché conta: è **meno** del contributo INPS fisso di un
commerciante (4.549,70 €/anno). L'inquadramento fiscale pesa più di qualunque
scelta di canale. Chi vincola: tutti.

**C. [marketing] Senza un link condivisibile non esiste né marketing né beta.**
Cosa: il sottodominio di beta con password è la precondizione n. 0 di tutto.
Perché: `/etc/hosts` + CA interna rendono il prodotto immostrabile a chiunque
non sia sulla macchina. Chi vincola: `backend` (configurazione), `marketing`
(beta), Andrei (decisione).

**D. [marketing] La beta si recluta su eventi a ciclo corto, non su matrimoni.**
Cosa: ~7 su 12 tester con eventi entro 60 giorni. Perché: un matrimonio 2027
restituisce feedback fra 7 mesi; un compleanno fra 3 settimane, e testa il 90%
delle stesse cose (stessa lista di blocchi). Chi vincola: `marketing`, Andrei.

**E. [marketing] Il campo "Intolleranze o note sul menu" va spento per la
durata della beta.** Cosa: disattivare `Interattivi.tsx:360` finché non c'è
un'informativa. Perché: è il campo che ha fatto multare NH Italia per 200.000 €
(Garante, provv. 9980043). Costa una riga e non contraddice la decisione di
Andrei di rimandare il GDPR. Chi vincola: `frontend`, `backend`.

**F. [marketing] Vendere a consumatori italiani non richiede fattura, richiede
il registro dei corrispettivi.** Cosa: e-commerce diretto B2C — niente fattura
salvo richiesta del cliente entro l'operazione (art. 22 DPR 633/72), niente
scontrino (art. 2 lett. oo DPR 696/1996), obbligo di annotazione (art. 24).
Stripe **non** manda niente allo SdI e dal 1/7/2025 fattura da Stripe Ireland →
autofattura TD17 mensile a carico nostro. Chi vincola: `backend` (cosa
registrare al pagamento: data/ora, lordo, commissione, id transazione, email,
paese), Andrei (scelta fiscale). **Da confermare con un commercialista.**

**G. [marketing] Risposta a design: vince la busta col nome (idea 1); l'idea 3
si sposta da argomento di vendita a leva virale.** Chi vincola: `design`
(priorità confermata, nessun cambio), `marketing` (il claim parla del nome, mai
di esclusività).

### Per `DOMANDE.md`

**[marketing] → [backend]** — *Sottodominio di beta con password: quanto costa?*
Serve un hostname pubblico con Let's Encrypt, `basic_auth` di Caddy e
`X-Robots-Tag: noindex`, **senza** toccare il blocco `andreievictoria.it` (regola
del REGISTRO). È più sicuro di oggi (dove il dominio non è un controllo di
accesso) e sblocca beta e dimostrazioni. Fattibile? Quanto tempo?

**[marketing] → [backend]** — *Cosa salviamo al momento del pagamento?*
Per non doverli ricostruire dopo servono: data/ora, importo lordo, commissione
Stripe, id transazione, email cliente, **paese del cliente** (serve per l'OSS).
Stripe li restituisce già nel webhook. Si possono salvare tutti da subito?

**[marketing] → [frontend]** — *Si può spegnere il campo "Intolleranze o note
sul menu" con un interruttore di configurazione?* Serve spento in beta e
riacceso quando c'è l'informativa, senza rimuovere il codice.

**[marketing] → [frontend + design]** — *Quanto costa generare 100 link con
`?a=` senza farlo diventare un lavoro da un'ora?* La formula vincente (§8)
regge solo se generare i link personalizzati è veloce, in un editor che oggi è
solo desktop.

**[marketing] → [design]** — *Serve un modo per attribuire una vendita a un
professionista* (codice sconto o link dedicato), altrimenti la commissione
20–30% di §3.3 non è pagabile e la partnership non si può proporre.

### Per `DOMANDE-PER-ANDREI.md`

**🔴 Un sottodominio di beta con password: posso proporlo?**
Contesto: oggi il prodotto non è mostrabile a nessuno (serve `/etc/hosts` + CA
interna). Questo blocca la beta, non solo la pubblicità. Proposta:
`beta.<dominio>` con certificato vero, **una password condivisa** e `noindex`.
Un attaccante trova un muro invece dell'app: **più sicuro di adesso**, non meno.
Il blocco `andreievictoria.it` del webhook non si tocca.
Raccomandazione: sì. `RISPOSTA:`

**🟡 I 30 €: la mia raccomandazione è comprare il concorrente, non pubblicità.**
30 € di Meta = ~50 clic, 0 o 1 vendite, **zero apprendimento statistico**, e
Meta non approva inserzioni verso un sito non pubblico. 30 € a un nano
influencer comprano una Story (~100–300 visualizzazioni) — e possiamo ottenere
lo stesso post **gratis** regalando il prodotto, che ci costa zero.
Raccomandazione: **29 € per il pacchetto Invito di inviti.digital**, per vedere
dall'interno checkout, email post-acquisto, informativa privacy e documento
fiscale di un concorrente italiano vivo. Se preferisci restare sulla pubblicità,
allora la raccomandazione è **non spenderli**: 30 € non spesi valgono più di 30 €
bruciati. `RISPOSTA:`

**🟡 Fatturazione elettronica: la risposta alla tua domanda è §7.**
In breve: (1) in beta con chiavi di test **non hai nessun obbligo, non stai
rimandando niente**; (2) vendendo inviti digitali a consumatori italiani
**probabilmente non devi emettere fattura**, ti basta il registro dei
corrispettivi — la fattura scatta solo se il cliente la chiede; (3) **Stripe non
fa niente per te** e anzi dal luglio 2025 ti aggiunge un'autofattura TD17
mensile; (4) il problema vero non è la fattura, **è l'inquadramento**: gestione
commercianti = **4.549,70 € fissi l'anno**, gestione separata = 26,07%
proporzionale — con 10–25 vendite l'anno la differenza è fra un'attività
sostenibile e una in perdita strutturale. Prima di passare alle chiavi live,
un'ora con un commercialista con le cinque domande di §7.6. `RISPOSTA:`

**🟢 Serve una partita IVA già esistente?**
Se tu o un socio ne avete già una con ATECO compatibile, si può vendere da lì e
si salta gran parte dei costi fissi. Domanda da dieci minuti che può valere
migliaia di euro. `RISPOSTA:`
