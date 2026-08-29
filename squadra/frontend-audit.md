# Audit onesto del client — `frontend`, 2026-08-23

Perimetro: `frontend/` di `inviti-v2`. Nessun codice toccato, nessun deploy.
Ho verificato lo stato reale in esecuzione (curl contro il sito live, con
pulizia dei dati di test creati) invece di fidarmi della documentazione. Dove
non ho potuto verificare in un browser vero (Playwright non è installato su
questa macchina — vedi "Limiti di questo audit"), lo dico esplicitamente.

---

## 1. Stato reale in esecuzione

Verificato in HTTPS con la CA interna di Caddy (`--cacert .../root.crt
--resolve andreievictoria222.it:443:127.0.0.1`):

- `GET /` → **200**, bootstrap client "Preparo il tuo invito…" (corretto:
  questa pagina non ha bisogno di SSR, redirige e basta — vedi §3).
- `GET /api/salute` → **200**, `{"stato":"ok"}`.
- `GET /i/{token}` (invito reale, creato e poi cancellato per il test) →
  **200**, HTML server-side con contenuto vero nel markup (non solo nel JSON
  di idratazione: `grep -o "Giulia"` lo trova nell'HTML grezzo). Tag verificati:
  `<title>`, `og:title`, `og:description`, `og:url`, `og:image` (URL assoluto,
  risolto e restituisce `200 image/jpeg`), `og:image:alt`, `og:locale`,
  `og:type`, `<meta name="robots" content="noindex, nofollow">`. **L'SSR
  funziona correttamente, i crawler delle chat vedono un'anteprima vera.**
- Metodo di verifica: ho creato un evento reale via API (`POST /api/eventi`),
  generato un link di anteprima (`POST /api/eventi/{id}/link`), scaricato
  `/i/{token}`, controllato i tag con `grep`, poi **cancellato** l'evento
  (`DELETE` via SQL diretto, cascade su blocco/asset/link_condivisione/rsvp/
  diritto — verificato nello schema) e i file caricati sul bind mount
  (`dati-produzione/upload/{id}/`). Non ho lasciato dati di test nel database
  di produzione.

### Una trappola reale trovata durante la verifica (non nel codice frontend, ma lo riguarda)

`curl` diretto contro `http://127.0.0.1:3000/api/salute` (bypassando Caddy)
**restituisce 500**, log del container: `Failed to proxy
http://127.0.0.1:8000/api/salute Error: connect ECONNREFUSED`. Causa: in
`frontend/next.config.ts:3` (`const API = process.env.API_INTERNA ??
"http://127.0.0.1:8000"`), il fallback viene **congelato nel build standalone**
(`output: "standalone"`) perché al momento di `docker compose build` la
variabile `API_INTERNA` non è passata come build arg — solo a runtime
(`docker-compose.yml:71`, corretto: `http://api:8000`, confermato con
`docker compose exec web printenv`). Oggi questo è **innocuo**: il Caddyfile
di sistema (`/etc/caddy/Caddyfile`) intercetta `/api/*` e `/media/*` **prima**
che raggiungano Next, quindi il rewrite rotto di Next non viene mai
esercitato in produzione. Ma è una trappola dormiente: se in futuro cambia la
regola di Caddy, o si prova a colpire il container `web` direttamente (come
ho fatto io per il test), `/api/*` risponde 500 invece di proxare. Non è
urgente, ma va scritto da qualche parte prima che qualcuno lo riscopra a caldo
in un incidente.

---

## 2. Mappa reale del frontend, con `file:riga` e solidità

### Renderer condiviso — **solido**

- `componenti/blocchi/Blocco.tsx:20-60` — smistamento `tipo → componente`,
  unico punto. Lo `switch` con `default: { const _mai: never = c; ... return
  null; }` (righe 52-58) è una guardia reale a compile-time: se il backend
  introduce un tipo che il frontend non conosce, TypeScript non compila finché
  non si aggiunge un case — non un fallback silenzioso a runtime.
- `componenti/blocchi/ListaBlocchi.tsx:23-66` — unica iterazione, parametro
  `avvolgi` opzionale per l'editor, `salta` per escludere la busta sulla
  pagina invitato. Il commento nel file (righe 14-22) spiega correttamente
  *perché* esiste (il bug storico `.sezione + .sezione`) — verificato che il
  bug non è tornato: `grep` su `app/*.css` non trova più quel selettore, solo
  `.blocco-guscio` (`temi.css:102,104-134`).
- `componenti/blocchi/Presentazionali.tsx` — nessun `"use client"`: gira sia
  server (pagina invitato) sia client (editor), come documentato. Codice
  pulito, funzioni pure, niente stato.
- `componenti/blocchi/Interattivi.tsx` — `"use client"` isolato correttamente.
  Nota di qualità: il carosello galleria (righe 68-173) fa un loop infinito
  con tre copie in fila e riposizionamento silenzioso allo scroll — tecnica
  corretta e già commentata (righe 75-78) per evitare flash/layout shift.
  `Musica` (righe 177-243) gestisce bene il vincolo "l'audio parte solo da un
  gesto utente" via `Apertura` context.

### Editor — **solido nella struttura, mai verificato su touch**

- `componenti/editor/Tela.tsx:57-76` (`involucro`) — punto esatto dove
  entrerebbe un comportamento touch. Oggi: stesso handler `apri` su
  `onClick` **e** `onContextMenu` (righe 66-67). Vedi §3, è il cuore della
  domanda sul touch.
- `componenti/editor/Popup.tsx` (630 righe) — un modulo per tipo di blocco,
  deliberatamente non generato da schema (commento riga 219-221, motivato:
  "una data vuole un date picker, un indirizzo no" — condivido, è la scelta
  giusta per un form con 10 tipi diversi). `CampoGalleria` (righe 113-217) è
  estratto a parte apposta per non violare `rules-of-hooks` dentro lo switch
  — la trappola documentata in memoria non si è ripresentata altrove: ho
  controllato ogni `case` in `CampiPerTipo` (righe 240-517), nessun hook
  condizionale.
- `componenti/editor/Autenticazione.tsx` — piccolo, pulito, un solo modulo
  login/registrazione con switch di modalità.

### Pagine e lib — **solido**

- `app/i/[token]/page.tsx` — SSR corretto, `generateMetadata` separato dal
  render (righe 35-67), gestisce `410` (scaduto) e `404` distintamente.
- `app/e/[id]/page.tsx` — carica in parallelo (`Promise.all`, riga 31-35),
  commento onesto sul perché il `try/catch` copre solo la chiamata e non il
  render (righe 14-16).
- `app/page.tsx` — bootstrap client-side, motivato (righe 9-16): evitare che
  ogni refresh crei un evento nuovo. `useRef` come guardia anti-doppio-fetch
  in `StrictMode` (riga 20), pattern corretto.
- `lib/api-client.ts`, `lib/api-server.ts`, `lib/api.ts` — separazione client/
  server pulita, `caricaAsset` separato da `chiamaClient` come da regola
  scritta in memoria (righe 19-21 di `api-client.ts`), verificato che non è
  stata reintrodotta la fusione.
- `lib/formato.ts` — parsing manuale delle date ISO (righe 13-17) invece di
  `new Date(iso)`, con motivazione corretta nel commento (fuso orario). Non
  ho trovato usi di `new Date("YYYY-MM-DD")` altrove nel codice che
  aggirerebbero questa disciplina.
- `lib/tipi.ts` — rispecchia i modelli Pydantic, nessun `any`, nessun cast
  pericoloso (verificato con grep su tutto `frontend/`: zero `: any` o `as
  any` in tutto il progetto).

### CSS — **solido, disciplinato**

- `app/temi.css` (149 righe) — due assi (`[data-tema]` / `[data-palette]`)
  separati come da decisione registrata, ornamenti come maschere CSS (righe
  111-115), non immagini colorate: cambiano tinta con la palette gratis.
- `app/blocchi.css` (693 righe), `app/guscio.css` (513 righe) — ho cercato
  esplicitamente la trappola nota (`box-shadow` con percentuale nello
  spread): non presente, l'unico `box-shadow` con `color-mix()`
  (`blocchi.css:336`) usa `color-mix` per l'opacità del colore, non per lo
  spread, che resta in `px`. `prefers-reduced-motion` gestito in due punti
  (`blocchi.css:382-388` globale, `:673` per un caso specifico) — buona
  disciplina, non un'aggiunta isolata.
- **Debolezza reale, non ipotetica**: `Popup.tsx` e `Tela.tsx` contengono
  stili inline sparsi (`style={{ minWidth: "18rem", ... }}` in `Tela.tsx:156`,
  vari `style={{ margin: 0, fontSize: ... }}` in `Popup.tsx`). Non è un bug,
  ma è l'unica incoerenza rispetto alla disciplina "tutto nei tre file CSS"
  seguita ovunque altrove — se qualcuno estende quei componenti copiando lo
  stile inline invece di aggiungere una classe, il debito cresce silenzioso.

### package.json — **minimale, come da regola**

Tre dipendenze runtime (`next`, `react`, `react-dom`), nessuna libreria UI,
nessuna libreria di animazione, nessuna libreria di drag&drop. Coerente con
"ogni aggiunta va giustificata". Questo significa anche che **qualunque cosa
di nuovo (drag riordino blocchi, gesture) va scritta a mano o giustifica una
prima dipendenza** — non c'è nulla di preesistente da riusare.

---

## 3. Il buco più grosso: editor e touch

### Cosa dice il codice, non cosa dice la leggenda

`involucro()` in `Tela.tsx:57-76` lega **lo stesso handler `apri`** sia a
`onClick` sia a `onContextMenu` (righe 66-67):

```
onClick={apri}
onContextMenu={apri}
```

Un **tap** su un touchscreen genera un evento `click` sintetico in tutti i
browser mobile moderni (non c'è più il ritardo storico dei 300ms, rimosso
dopo la presenza di `width=device-width` nel viewport, che c'è —
verificato nell'HTML servito). Questo significa che **tecnicamente il tap
dovrebbe già aprire lo stesso popup del click desktop**, senza una riga di
codice nuova per l'azione principale. Non è quello che dice
`PASSAGGIO_DI_CONSEGNE.md` ("il click destro non ha un equivalente touch") —
ma quel documento descrive bene un problema di *esperienza*, non
letteralmente un handler che non si attiva. Vale la pena correggere la
cornice del problema prima di stimarne il costo, perché cambia la stima di
un ordine di grandezza.

**Non ho potuto verificarlo in un vero browser mobile** (vedi limiti sotto),
quindi tratto questo come un'ipotesi solida ma non confermata — è il primo
passo da fare, non un'implementazione.

### Cosa invece è realmente debole per il touch (questo sì verificato leggendo CSS e JSX)

1. **Zero affordance visibile prima del tap.** Il bordo tratteggiato e
   l'etichetta del blocco (`app/guscio.css:209-243`, in particolare
   `.tela--modifica .blocco-modificabile:hover::after` riga 217 e
   `:hover > .targa-blocco` riga 243) esistono **solo su `:hover`**. Su
   touch non c'è hover: l'utente non ha alcun indizio visivo di cosa sia
   modificabile finché non ci tocca sopra per errore. Fix a basso costo:
   un fallback `@media (hover: none)` che renda il bordo/etichetta sempre
   (debolmente) visibili — stesso file, stessa zona di righe.
2. **Bersagli piccoli in `Popup.tsx`.** Il pulsante "×" per rimuovere una
   voce di programma (`Interattivi.tsx:380-382`, dentro la griglia
   `gridTemplateColumns: "6rem 1fr auto"`) e i controlli della galleria
   (`scheda-foto-popup__rimuovi`, `guscio.css:420-431`) non sono
   dimensionati per un dito (nessun `min-width`/`min-height` espliciti oltre
   al padding di default). Da notare in positivo: `.blocco-modificabile`
   (`guscio.css:207`) ha già `min-height: 2.75rem` — che è **esattamente**
   44px, la soglia minima raccomandata per bersagli touch (Apple HIG /
   Material) — sembra già pensata bene, ma è l'eccezione, non la regola nel
   resto dei controlli del popup.
3. **Nessun evento touch nel codice, in nessun file.** `grep -rn
   "onTouch\|onPointer\|PointerEvent" frontend/` non trova nulla. Se in
   futuro serve una vera pressione lunga distinta dal tap semplice (per
   esempio per un menu contestuale diverso dal tap-apre-editor), va scritta
   da zero — `onContextMenu` da solo **non è affidabile su mobile**: Android
   Chrome può emettere `contextmenu` su pressione prolungata su un `<div>`
   generico, iOS Safari in genere no (riserva quel gesto a link/immagini/testo
   selezionabile). Oggi questo non è un problema perché sinistro e destro
   fanno la stessa cosa — ma è il motivo per cui, se in futuro si
   *differenzia* di nuovo tap-normale da pressione-lunga, il codice andrebbe
   scritto con un timer su `onTouchStart`/`onPointerDown`, non contando su
   `contextmenu`.
4. **Bubbling non arrestato dentro i blocchi interattivi.** Nessun handler
   in `Interattivi.tsx` chiama `stopPropagation()`. Nell'editor, toccare la
   freccia del carosello (`Interattivi.tsx:131-138`, `161-168`) o un campo
   del form RSVP dentro un blocco fa scorrere/mettere a fuoco il controllo
   **e** fa risalire il click al `<div className="blocco-guscio
   blocco-modificabile">` che lo avvolge, aprendo comunque il popup di
   modifica sopra. Questo è vero anche con mouse oggi, non è specifico del
   touch — ma su schermo piccolo, con un dito che copre più area di un
   cursore, il problema di "tocco impreciso interpretato come voler
   modificare il blocco" è più frequente. Non è chiaro se sia un bug o
   intenzionale (coerente con "niente modalità sola lettura" — dentro
   l'editor nulla è mai davvero interattivo). Va deciso, non solo corretto.

### Costo stimato (onesto, in due scenari)

- **Se il tap-apre-popup funziona già** (ipotesi da verificare per prima
  cosa, costo ~0 — un test Playwright con viewport mobile e `page.tap()`
  contro `/e/[id]`): il lavoro restante è **polish**, non nuova
  architettura — affordance touch in CSS (§1 sopra, poche ore),
  ridimensionamento bersagli nel popup (§2, mezza giornata), decisione
  esplicita sul bubbling (§4, discussione + eventuale `stopPropagation`
  mirato). Ordine di grandezza: **1-2 giornate**, tutto CSS/JSX nei file
  esistenti (`Tela.tsx`, `guscio.css`, `Popup.tsx`), zero nuove dipendenze.
- **Se il tap NON apre il popup per qualche motivo non previsto** (es.
  interferenza fra `contextmenu` e `click` su qualche combinazione
  browser/versione Android): serve riscrivere `involucro()` con un
  `onTouchStart`/`onTouchEnd` espliciti e un `matchMedia("(hover: none) and
  (pointer: coarse)")` per condizionare il comportamento (stesso pattern già
  usato in `Sipario.tsx:56` per `prefers-reduced-motion` — non sarebbe una
  novità architetturale, seguirebbe uno stile già in uso nel codice). Ordine
  di grandezza: **3-5 giornate**, incluso testing su device/emulazione
  reali.

In entrambi gli scenari, il posto dove entra il codice resta lo stesso:
`Tela.tsx:57-76` (`involucro`) per la logica, `guscio.css:200-243` per
l'affordance visiva.

---

## 4. Debito tecnico da sistemare prima di costruirci sopra

1. **`frontend/public/*.svg` di `create-next-app`** (`file.svg`, `globe.svg`,
   `next.svg`, `vercel.svg`, `window.svg`) — confermato non referenziati da
   nessun file `.ts/.tsx/.css` (grep su tutto il progetto, zero risultati).
   5 file, ~3KB totali, rimozione a rischio zero. Priorità bassa mai una
   volta iniziato: costa un comando, non una giustificazione.
2. **Stili inline sparsi in `Tela.tsx` e `Popup.tsx`** (vedi §2 CSS sopra) —
   piccola incoerenza oggi, ma è il tipo di scelta che, copiata da chi
   aggiunge un nuovo blocco, diventa debito distribuito. Vale la pena una
   pulizia mirata (spostare in `guscio.css`) prima che design chieda
   variazioni su quei componenti.
3. **Il rewrite `/api` di Next congelato al valore di build** (§1) — non
   urgente perché Caddy lo bypassa, ma è un comportamento sorprendente che
   va scritto da qualche parte (questo file, o un commento in
   `next.config.ts`) prima che qualcuno lo riscopra durante un incidente o
   un cambio di topologia di rete.
4. **Nessun test automatico nel frontend.** Zero file `*.test.ts(x)`, zero
   configurazione Playwright/Vitest/Jest in questa cartella (`package.json`
   non ha `devDependencies` di test). La disciplina "verifica nel browser
   con Playwright" citata nel mandato **non è impostata in questo repository**
   — il venv menzionato in `PASSAGGIO_DI_CONSEGNE.md` era nel vecchio MVP
   `../inviti`, che **non esiste su questa macchina** (verificato:
   `ls /home/user/projects/inviti/` → "No such file or directory"). Per
   chiunque, me compreso in questo audit, "verificare nel browser" oggi
   significa o installare Playwright da capo, o affidarsi a curl + lettura
   di codice. Prima di costruire qualunque cosa visuale nuova (animazioni,
   touch), vale la pena rimettere in piedi questo strumento — è citato come
   pratica del progetto ma **non è più disponibile**.
5. **Nessuna UI per leggere le RSVP** — non è debito frontend in senso
   stretto (manca la rotta `GET` sul backend, vedi `squadra/memoria/backend.md`),
   ma quando arriverà andrà costruita una schermata che oggi non esiste in
   nessuna forma nemmeno abbozzata nell'editor.

---

## 5. Capacità di assorbire novità (per design/marketing)

**Nuovi tipi di blocco**: economico, per costruzione. Un tipo nuovo tocca
esattamente: `Blocco.tsx` (un `case`), `Popup.tsx` → `CampiPerTipo` (un
`case` + eventuale sotto-componente se servono hook, come `CampoGalleria`),
`ETICHETTE` in `Popup.tsx:22-33`, più CSS dedicato in `blocchi.css`. Nessuna
modifica a `ListaBlocchi.tsx` o `Tela.tsx`. Questo è il test che il
`PASSAGGIO_DI_CONSEGNE.md` stesso propone ("se aggiungere qualcosa richiede
di toccare il renderer, la decisione a monte è sbagliata") e regge:
verificato leggendo tutti i punti di switch, sono davvero solo quei due file.

**Soglia da tenere d'occhio**: `Popup.tsx` è già a 630 righe con 10 tipi.
Se design propone 4-5 blocchi in più, vale la pena spostare `CampiPerTipo`
in file separati per tipo (stesso principio già applicato a `CampoGalleria`,
non un cambio di architettura) — non è un problema oggi, lo sarebbe attorno
a 15+ tipi.

**Animazioni**: il pattern esiste già ed è buono — `@keyframes` +
`prefers-reduced-motion` come escape hatch (`blocchi.css:382-388,673`),
`matchMedia` in JS per casi che devono saltare l'animazione del tutto
(`Sipario.tsx:56`). Estendere animazioni *sullo stesso pattern* (es. nuove
transizioni sulla busta, nuovi micro-movimenti su hover) è a basso costo.
**Cosa manca del tutto**: qualunque animazione "all'ingresco nello scroll"
(scroll-reveal per sezione) richiederebbe `IntersectionObserver` — zero
infrastruttura oggi, andrebbe scritta da capo (non è difficile, ma è nuovo
codice client, non un'estensione di quello che c'è). Se design propone
animazioni scroll-triggered su più blocchi, è la prima cosa da preventivare
a parte, non da dare per scontata dentro "qualche animazione in più".

**Riordino blocchi via drag**: oggi il riordino è "su/giù" a bottone
(`Popup.tsx:603-606`, `azioni.sposta`). Un drag&drop reale sarebbe una
libreria nuova o parecchio codice a mano (gestione touch e mouse insieme,
accessibilità da rifare) — non stimarlo come piccola aggiunta se qualcuno lo
propone: è un pezzo di UI nuovo, non un'estensione.

---

## 6. Limiti di questo audit

- **Nessuna verifica in browser reale (Playwright non installato su questa
  macchina)** — vedi §4 punto 4. Tutte le affermazioni sul comportamento
  touch (§3) sono basate su lettura del codice e comportamento noto delle
  piattaforme, non su un test eseguito. È il primo item da fare prima di
  implementare qualunque cosa sul touch.
- Non ho controllato le performance (bundle size, Lighthouse) — fuori
  perimetro per un audit "cosa costa toccare il codice", ma se design
  propone asset pesanti (foto ad alta risoluzione, font aggiuntivi) andrebbe
  misurato a parte.
