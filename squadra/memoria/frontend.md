# Memoria — agente `frontend`

Memoria privata. Si legge all'inizio di ogni incarico e si riscrive alla fine.
Scrivi **le conclusioni con il ragionamento**: senza il perché, fra tre mesi
l'idea sbagliata si rifà da capo.

---

## 2026-08-23 — Primo incarico: audit onesto del client (nessun codice toccato)

Incarico: mappare il frontend con `file:riga`, valutare il costo del touch
nell'editor, verificare lo stato reale in esecuzione, segnalare debito
tecnico. Prodotto: `squadra/frontend-audit.md` (dettagliato, con citazioni
`file:riga` per ogni affermazione — non ripeterlo qui, questo file è il
riassunto ragionato per il *prossimo* incarico, non un secondo audit).

### Decisioni prese (di analisi)

- **Il renderer condiviso regge davvero**: ho controllato ogni punto di
  switch (`Blocco.tsx`, `Popup.tsx` → `CampiPerTipo`) e non ho trovato
  divergenze fra ospite ed editor. Zero `any`, zero cast pericolosi in
  tutto `frontend/` (grep confermato). Il codice è più pulito di quanto la
  media dei progetti a questo stadio lo sia — non è autocelebrazione nei
  commenti, è verificato riga per riga.
- **Il touch nell'editor è probabilmente meno rotto di quanto la
  documentazione lasci intendere.** `involucro()` in `Tela.tsx:57-76` lega
  lo STESSO handler sia a `onClick` sia a `onContextMenu`. Un tap genera un
  evento `click` sintetico su tutti i browser mobile moderni: quindi il tap
  dovrebbe già aprire il popup, senza bisogno di scrivere nulla di nuovo per
  l'azione principale. Questo **non l'ho potuto verificare in un browser
  reale** (Playwright non è installato su questa macchina — vedi sotto), ma
  è un'ipotesi solida basata sul comportamento noto della piattaforma. Se
  vera, cambia lo scope del lavoro touch da "nuova architettura di eventi"
  a "polish CSS + ridimensionamento bersagli" (1-2 giornate vs 3-5).
  **Prossimo passo per chiunque riprenda questo lavoro: verificarlo per
  primo con Playwright (`page.tap()` su un blocco in `/e/[id]`, viewport
  mobile) prima di stimare o scrivere codice.**
- Debito reale trovato, non solo quello già noto dal passaggio di consegne:
  il rewrite `/api` di `next.config.ts` usa un fallback che si **congela al
  build** (`output: "standalone"` + `output: "standalone"` non riceve
  `API_INTERNA` come build arg) → punta a `127.0.0.1:8000`, sbagliato.
  Oggi è innocuo perché il Caddyfile di sistema intercetta `/api/*` e
  `/media/*` prima che raggiungano Next (`handle /api/* { reverse_proxy
  127.0.0.1:8000 }` nel Caddyfile, non in questo repo). Verificato con
  `docker compose logs web` durante un test diretto su porta 3000
  (bypassando Caddy): `ECONNREFUSED 127.0.0.1:8000`, 500. Se la regola di
  Caddy cambia in futuro, questo si rompe silenziosamente.

### Scartato e perché

- Non ho tentato di installare Playwright per verificare il touch in questo
  giro: l'incarico era "audit, non implementare", e installare uno
  strumento di test è già un passo verso l'implementazione/verifica vera.
  Meglio segnalarlo come primo passo del prossimo incarico che farlo a
  metà qui.
- Non ho toccato gli SVG placeholder di `create-next-app`
  (`public/{file,globe,next,vercel,window}.svg`) anche se confermati
  sicuri da rimuovere (zero riferimenti in tutto il codice): l'incarico era
  audit, non pulizia. Costa un comando quando qualcuno deciderà di farlo.

### Numeri e fonti

- Verifica end-to-end reale: creato un evento di test via API live
  (`POST /api/eventi`), generato link anteprima, scaricato `/i/{token}`,
  confermato tutti i tag `og:` nell'HTML servito lato server, poi
  **cancellato** (evento via `DELETE ... CASCADE` in SQL diretto — lo
  schema ha `ON DELETE CASCADE` su asset/blocco/link_condivisione/rsvp/
  diritto, verificato con `\d evento` — e i file caricati sul bind mount
  `dati-produzione/upload/{id}/`). Nessun dato di test lasciato in
  produzione.
- Playwright NON è installato su questa macchina per `inviti-v2`. Il venv
  citato in `PASSAGGIO_DI_CONSEGNE.md` era nel vecchio MVP `../inviti`, che
  **non esiste su questa macchina** (verificato). La disciplina "verifica
  con Playwright, non a occhio" scritta nel mandato oggi non ha lo
  strumento a disposizione in questo repo — va rimesso in piedi prima di
  costruire qualunque cosa visuale nuova (touch, animazioni scroll).

### Trappole trovate (da non riscoprire)

- **`next.config.ts` rewrite `/api` congelato al build** (sopra) — se si
  cambia la topologia di rete o si testa il container `web` isolato,
  `/api/*` risponde 500 invece di proxare. Non è un bug del codice frontend
  in senso stretto, ma chiunque tocchi `next.config.ts` o la topologia
  Docker/Caddy deve saperlo.
- **Bordo tratteggiato + etichetta del blocco nell'editor sono solo
  `:hover`** (`guscio.css:209-243`) — su touch, zero indizio visivo di cosa
  sia modificabile prima di toccarlo. Se si lavora sul touch, questa è la
  prima cosa CSS da sistemare (fallback `@media (hover: none)`), non
  un dettaglio.
- **Nessun handler in `Interattivi.tsx` chiama `stopPropagation()`** —
  dentro l'editor, toccare un bottone interno a un blocco (freccia
  galleria, radio RSVP) fa risalire il click al `blocco-guscio` che lo
  avvolge e apre comunque il popup di modifica sopra. Vero anche col mouse
  oggi — non l'ho corretto perché non è chiaro se sia voluto (coerente con
  "niente modalità sola lettura": nulla è mai davvero interattivo
  nell'editor) o un difetto. Va deciso esplicitamente prima di toccarlo.
- **`box-shadow` con percentuale nello spread**: controllato di nuovo,
  la trappola storica non si è ripresentata. L'unico `box-shadow` con
  `color-mix()` (`blocchi.css:336`) usa `color-mix` per l'alpha del colore,
  non per lo spread (che resta `3px`, fisso). Sicuro.
- **`sudo docker compose exec db psql`**: l'utente/db non sono `postgres`/
  `root` (rotto di default), sono `inviti`/`inviti` (da `docker-compose.yml`
  righe 7,9). Risparmia un giro a chi deve fare query dirette per debug.
- **CA di Caddy non leggibile dall'utente non privilegiato**
  (`/var/lib/caddy/.local/share/caddy/pki/authorities/local/root.crt` è
  `Permission denied` per l'utente normale) — serve `sudo cat` +
  copiarlo altrove con permessi leggibili prima di passarlo a `curl
  --cacert`. Il comando suggerito nel mandato/incarico non funziona
  as-is per un utente non-root.

### Domande girate ad altri agenti (non scritte in DOMANDE.md — non è compito
mio in questo giro, riportate nel report finale al coordinatore)

- Risposta pronta per la domanda di `backend` su "serve una data-evento
  vera per la retention GDPR": dal lato frontend, `Hero.data` è già un
  campo `type="date"` compilato dall'utente nell'editor (`Popup.tsx:301`) —
  se backend vuole sincronizzare `Evento.data_evento` da lì, **non serve
  nessun lavoro frontend nuovo**, il dato esiste già e passa per lo stesso
  path di `aggiorna` che tutti gli altri campi usano. Il costo frontend
  esiste solo se si vuole un campo *dedicato e obbligatorio* separato da
  `Hero.data` (che oggi è opzionale e libero).
