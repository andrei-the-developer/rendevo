# landing — la pagina pubblica

Sorgente della pagina pubblica su `https://home.andreievictoria.it`.

**Spostata il 2026-08-26**: la radice `andreievictoria.it` adesso e` l'invito
di Andrei e Victoria, che si manda agli invitati senza percorso. La pagina di
presentazione del prodotto vive su `home.`. **Statica**:
HTML, CSS, JS e immagini serviti direttamente da Caddy, nessun container, nessun
build server. Chi la scrive lavora qui dentro; `index.html` è la home.

Perché statica e non una seconda app Next: una landing non ha bisogno di SSR,
e così va online senza aggiungere un container, un build e un punto di rottura
in più. Se davvero servisse Next (per riusare i componenti del renderer, per
esempio), si può fare — chiedetelo a `backend`, non improvvisatelo: cambia il
blocco Caddy.

## Pubblicare

Il Caddy di sistema serve `/var/www/landing`, non questa cartella (`/home/user`
non è attraversabile dall'utente `caddy`). Per mandare online quello che c'è
qui:

```bash
rsync -a --delete /home/user/projects/inviti-v2/landing/ /var/www/landing/ \
  --exclude LEGGIMI.md
```

Nessun reload di Caddy: i file sono letti a ogni richiesta.

## Cosa sapere prima di scrivere la pagina

- **È pubblica davvero**: aperta a chiunque, nessuna password. Tutto quello che
  finisce qui è visibile al mondo. (Oggi c'è ancora un `X-Robots-Tag: noindex`
  sull'host, si toglie il giorno del lancio.)
- **FATTA il 2026-08-24 notte**: `index.html` e `robots.txt` esistono e sono
  online. Il pulsante punta a **`/edit`**, il servizio è **gratuito** e non si
  promette nessun prezzo futuro. I testi vengono da
  `../squadra/marketing-landing-testi.md`, tenendo solo le parti ancora vere
  dopo la rimozione del pagamento.
- **Due cose che mancano ancora**, entrambe segnalate ad Andrei:
  `og:image` (senza, il link incollato su WhatsApp mostra un rettangolo grigio)
  e il video della busta che si apre, che marketing indica come l'unica cosa
  che deve stare sopra la piega insieme al titolo.
- Il titolo proposto da marketing ("...che arriva con il suo nome sopra")
  **non è stato usato**: dipende dal nome dell'invitato nell'URL (`?a=Chiara`),
  che nel codice non c'è. Era marketing stesso a scrivere che in quel caso il
  titolo va cambiato, non pubblicato lo stesso.
- Se serve un `robots.txt` o un `favicon.ico`, mettili qui: vengono serviti
  dalla radice come qualunque altro file.
- Niente form che manda dati da nessuna parte senza dirlo a `backend`: oggi
  non esiste nessun endpoint pubblico per raccogliere email, e sull'host
  pubblico passa solo il webhook Stripe.
