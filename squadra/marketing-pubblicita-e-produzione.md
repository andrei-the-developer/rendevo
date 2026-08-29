# Pubblicità, video e chi fa cosa — risposta operativa a RoD

`marketing` · 2026-08-24 · incarico 4
Ipotesi di lavoro: **il prodotto è finito e funziona**. Qui non si discute lo
stato tecnico di oggi, si pianifica il giorno dell'apertura.

---

## 1. Cosa posso fare io, cosa non posso, e dove serve una mano

### Faccio da solo, a costo zero

- Posizionamento e messaggio: cosa diciamo, a chi, e cosa **non** diciamo.
- **I testi degli annunci**, in decine di varianti — è la leva che sposta di più
  il costo per clic, molto più della grafica.
- Il testo della landing page, i titoli, le obiezioni da disinnescare.
- Il **piano editoriale** e gli articoli (la SEO ha 4-8 mesi di latenza: quello
  che si scrive oggi serve a gennaio).
- Lo **script del video**: inquadratura per inquadratura, con i secondi.
- Il **targeting**: interessi, età, aree geografiche, esclusioni.
- Il **piano di misurazione** e la regola di stop, scritti **prima** di spendere.
- Leggere i numeri a campagna avviata e dire: spegnere, cambiare, o raddoppiare.

### Non posso fare: cliccare

Non ho un browser e non ho account. Quindi **non** creo l'account pubblicitario,
**non** inserisco un metodo di pagamento, **non** carico una creatività e **non**
premo "pubblica". Ho file, riga di comando e ricerca sul web: tutto il resto
richiede mani.

### Come si colma, in pratica

**Modo economico (raccomandato).** Andrei apre l'account pubblicitario a suo
nome. Io consegno la campagna scritta campo per campo — obiettivo, pubblico,
budget giornaliero, testi, immagini da usare — lui incolla e pubblica. Poi mi
passa **quattro numeri a settimana**: spesa, clic, acquisti, incasso. Con quelli
decido. Ancora meglio se esporta il CSV di Meta in una cartella del progetto:
lo leggo da solo e non deve trascrivere niente.

**Modo tecnico (possibile, oggi non conviene).** L'API Marketing di Meta esiste e
funziona via `curl`: con un token scritto nel `.env` posso creare campagne, ad
set e annunci, cambiare budget e mettere in pausa, senza toccare l'interfaccia.
**È fattibile davvero, non è teoria.** Ma il setup (app, token a lunga durata,
permessi, tenuta) costa qualche ora e va mantenuto: **sotto i ~1.000 €/mese di
spesa non si ripaga**. Da riprendere solo se un giorno la spesa diventa continua.
Nota: dare un token che muove soldi è una decisione di Andrei, non mia — e il
token va nel `.env`, mai in chat.

---

## 2. L'ordine non negoziabile: quattro cose vere prima di un euro

1. **Il pagamento funziona dall'inizio alla fine** — carta di test 4242, poi
   live. Finché non incassa, ogni euro speso in traffico è regalato.
2. **Esiste una pagina pubblica** dove far atterrare il traffico.
3. **C'è un indirizzo email che spedisce davvero** — senza, chi compra riceve
   silenzio, e la sequenza post-acquisto è il pezzo che trasforma un cliente in
   un passaparola.
4. **Sappiamo da dove viene chi compra.** Questo è il punto che salta sempre e
   che rende inutile tutto il resto: se non salviamo la provenienza insieme
   all'acquisto, il giorno che spendiamo vediamo *quante* vendite ci sono ma non
   *quale canale* le ha fatte, e non possiamo decidere niente.

Se uno dei quattro manca, il budget resta fermo. Non è prudenza: è che senza il
punto 4 la spesa non produce nessuna informazione, e allora tanto vale non farla.

### Cosa serve tecnicamente, in dettaglio

- Un parametro di provenienza sui link (`?fonte=meta`, `?fonte=instagram`,
  `?fonte=<nome-del-professionista>`) tenuto nella sessione e **salvato insieme
  all'acquisto**. Un campo di testo, niente di più.
- Il **paese del cliente** salvato dal webhook Stripe — serve anche per l'OSS
  quando si supereranno i 10.000 €/anno di vendite UE. Costa zero adesso e
  costa una migrazione dopo.
- Un evento di conversione sulla pagina di ringraziamento, per far tornare i
  conti lato Meta.
- Nessun tracciamento sull'invitato finale: la provenienza riguarda **chi
  compra**, non chi riceve l'invito.

---

## 3. I soldi: quanto serve davvero, e perché le cifre piccole non funzionano

Catena di calcolo, da contestare se cambiano le ipotesi. CPC Meta Italia 2026:
**0,30-0,90 €**, uso 0,60 € come centro.

| Budget | Clic | Vendite a 2% | Cosa impariamo |
|---|---|---|---|
| 30 € | ~50 | 0-1 | **niente**: con 50 clic non si distingue l'1% dal 6% |
| 300 € | ~500 | ~10 | **si distingue l'1% dal 4%**: è la prima cifra che insegna qualcosa |
| 1.500 € | ~2.500 | ~50 | l'algoritmo di Meta esce dall'apprendimento (~50 conversioni per ad set) |

**La prima soglia sensata è ~300 €, spesi in un colpo solo.** Non 30 € al mese
per dieci mesi: quello non impara mai, perché ogni mese riparte da zero e i
numeri restano troppo piccoli per dire qualcosa.

E si spendono **nella finestra giusta**: gennaio-marzo vale il 45-50% degli
acquisti dell'anno (le partecipazioni si scelgono 2-3 mesi prima, i save the
date 6-8). Gli stessi 300 € ad agosto valgono la metà.

**Regola di stop, scritta prima di iniziare**: la contribuzione di una vendita è
**55,27 €** (69 € meno IVA 22% meno le commissioni Stripe). Se dopo i 300 € il
costo per acquisizione è sopra i 55 €, il canale a pagamento è chiuso per noi e
si smette — non si "ottimizza ancora un po'". Se è sotto i 35 €, si raddoppia.

**Cosa faccio se il budget resta zero**: c'è già un piano intero che non usa un
euro (rete personale, professionisti, firma virale in fondo agli inviti, SEO
scritta in anticipo) e vale **10-25 vendite il primo anno**. Non è un ripiego
inventato adesso: è in `marketing-strategia.md` v2 e nel piano creator.

---

## 4. Il video: freelancer, AI, o nessuno dei due

### I prezzi veri (verificati 2026-08-24)

| Strada | Costo reale |
|---|---|
| Freelance video italiano | **25 €/h** alle prime armi, fino a **149 €/h** con esperienza (ProntoPro / Cronoshare) |
| Spot commerciale completo | **300-800 €** produzione + post |
| Video promozionale social 30-60s | **800-3.000 €** |
| Video aziendale, prezzo medio | **350-1.000 €** |
| AI a abbonamento | ChatGPT Plus ~20 $/mese (Sora), Gemini ~20 $/mese (Veo 3), Runway da **15 $/mese** |
| AI ad API | Veo Fast **0,10-0,30 $/s**, Sora **0,10-0,70 $/s** → un clip da 8s costa meno di 1 $ |

### La raccomandazione: nessuno dei due, per il video principale

**Il prodotto è software: la cosa che vende è il software che si muove.** La
busta che si apre e dentro c'è il nome dell'invitato, ripresa dallo schermo di
un telefono, 15-20 secondi, senza voce. È una **cattura schermo**, non una
produzione: la fa la squadra in un pomeriggio, costa **0 €**, e mostra una cosa
vera che il concorrente non può copiare in un giorno.

**Perché non l'AI per questo video**: dovrebbe inventarsi un'interfaccia che non
esiste. Un annuncio che mostra un prodotto diverso da quello che si compra è un
claim falso — non lo scrivo e non lo firmo. Vale anche per le "coppie" generate:
volti finti in un settore dove si compra emozione si riconoscono, e il danno di
credibilità supera il risparmio.

**Perché non il freelancer adesso**: 500 € per filmare bene un messaggio che non
sappiamo ancora se funziona è il modo più caro di scoprire che era sbagliato.
Il freelancer ha senso **dopo** le prime ~100 vendite, quando sappiamo quale
frase converte e paghiamo qualcuno perché la faccia bella.

### Dove l'AI serve davvero, e la userei subito

- **Decine di varianti del testo dell'annuncio** — è la leva più economica sul
  costo per clic, e non richiede nessuno strumento nuovo.
- Voce fuori campo e sottotitoli sul video di cattura schermo.
- Immagini di sfondo e texture per i temi, dove non serve un volto.
- Bozze di articoli per la banca SEO, poi riscritti a mano.

Costo aggiuntivo: **zero o quasi**, con gli abbonamenti che esistono già.

---

## 5. La sequenza il giorno che il prodotto è pronto

**Fase 0 — adesso, 0 €.** Banca di 8-10 articoli, il video di cattura schermo,
lista di 40-60 professionisti, i 5 contatti creator (documento
`marketing-piano-creator.md`), Instagram con 9-12 post già pronti. Tutto questo
va fatto **prima** dell'apertura, perché il giorno dell'apertura deve essere già
finito.

**Fase 1 — apertura, 0 €.** Rete personale, i professionisti che hanno detto sì,
e la firma in fondo a ogni invito: ~109 invitati per invito, è il canale che ci
costa meno di tutti.

**Fase 2 — gennaio-marzo, ~300 € una volta.** Un canale solo, un messaggio solo,
una landing sola, regola di stop scritta prima. Serve a **decidere**, non a
vendere.

**Fase 3 — solo se il costo per acquisizione è sotto i 55 €.** Allora si scala,
e allora ha senso parlare di token API, di freelancer per il video e di budget
mensile continuo.

---

## 6. Di cosa ho bisogno, in chiaro

**Tecnico** (prima che il prodotto sia "finito", non dopo):
la provenienza salvata con l'acquisto e il paese del cliente dal webhook; un
evento di conversione sulla pagina di grazie; una pagina pubblica; un indirizzo
email che spedisce.

**Economico**: **0 € adesso.** Poi ~300 € una volta sola, quando i quattro punti
della §2 sono veri, e non prima di gennaio.

**Accessi**: nessuno adesso. Se un giorno si spende sul serio, un account
pubblicitario intestato ad Andrei, e il token nel `.env` solo se la spesa
mensile supera il costo del setup.

**Da voi, come modo di lavorare**: i numeri. Quattro cifre a settimana o un CSV
in una cartella. Senza quelle, io scrivo campagne ma non gestisco niente — e
"gestire" vuol dire esattamente decidere sui numeri.
