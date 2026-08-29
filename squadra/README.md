# Andrei&Co — come funziona la squadra

Andrei + quattro agenti AI specializzati. Questo file spiega **come è fatta la
persistenza**, perché è la parte che si rompe se qualcuno non la capisce.

## La verità tecnica sulla persistenza

Un subagent **non è un processo che vive**: nasce, lavora, restituisce un
risultato, e il suo contesto sparisce. Non esistono agenti "sempre accesi" che
chiacchierano in background.

La continuità sta su disco, in due pezzi separati:

| Cosa | Dove | Cosa garantisce |
|---|---|---|
| **Identità** | `~/.claude/agents/*.md` | Il ruolo non cambia mai: richiami `marketing` e riparte lo stesso agente, stesso mandato, stessi limiti |
| **Memoria** | `squadra/memoria/*.md` | Ogni agente legge la propria memoria all'inizio e la riscrive alla fine — il marketing di domani sa cosa ha deciso quello di oggi |

Il protocollo di lettura/scrittura è **dentro la definizione di ogni agente**,
non è una buona intenzione: parte da sola a ogni incarico.

## I quattro agenti

| Agente | Modello | Se ne occupa |
|---|---|---|
| `marketing` | Opus | Posizionamento, canali a pagamento, influencer, pricing, funnel, monetizzazione |
| `design` | Opus | Direzione visiva, temi e palette, busta e sigillo, UX dell'editor, landing |
| `backend` | Sonnet | FastAPI, Postgres, Alembic, storage, sessioni, Stripe |
| `frontend` | Sonnet | Next.js, React, renderer a blocchi, editor, animazioni, CSS |

Il coordinamento lo fa Claude nella sessione principale: assegna gli incarichi,
mette in contatto gli agenti, e porta ad Andrei le decisioni che spettano a lui.

## I tre file condivisi

- **`REGISTRO.md`** — decisioni prese che **vincolano gli altri**. Ci si scrive
  solo quando una scelta limita il lavoro altrui. Non è un diario.
- **`DOMANDE.md`** — il dialogo asincrono. Un agente firma la domanda
  (`[design]`), un altro la trova al prossimo incarico e risponde sotto. È così
  che design e sviluppo si parlano senza essere vivi nello stesso momento.
- **`DOMANDE-PER-ANDREI.md`** — le domande che **solo Andrei** può chiudere:
  soldi, rischio legale, priorità di prodotto, accessi a servizi esterni. Tenute
  separate da `DOMANDE.md` apposta, così non si perdono in mezzo a quelle
  tecniche. Andrei risponde in riga, sotto ogni domanda.
- **`memoria/<agente>.md`** — memoria privata di ciascuno: cosa ha deciso,
  perché, cosa ha scartato e perché. **Le conclusioni senza il ragionamento
  sono inutili**: fra tre mesi nessuno ricorda perché un'idea era sbagliata, e
  la si rifà.

## Come si lavora (dentro una sessione e tra sessioni)

**Dentro una sessione** gli agenti possono davvero dialogare: il coordinatore
passa l'output dell'uno all'altro, o riapre un agente già avviato mantenendo il
suo contesto. Esempio tipico: `design` propone → `frontend` valuta il costo →
`marketing` dice se vale la pena → Andrei decide.

**Tra sessioni** il dialogo è asincrono via `DOMANDE.md`. Come un team umano
distribuito: si lascia la domanda scritta, la si trova il giorno dopo.

## Regola che tiene insieme tutto

Nessun agente promette quello che il prodotto non fa. Lo stato reale è in
`../PASSAGGIO_DI_CONSEGNE.md`, e va letto — non ricordato.
