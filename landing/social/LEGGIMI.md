# social — le immagini che si vedono quando si incolla un link

Due file, stessa busta, due destinazioni diverse:

| file | dove va | chi lo chiede |
|---|---|---|
| `og.png` (42 KB) | `landing/og.png` -> `/var/www/landing/` | chi incolla `andreievictoria.it` |
| `og-invito.jpg` (21 KB) | `frontend/public/og-invito.jpg` | chi incolla un invito `/i/{token}` |

Il secondo e` piu` leggero perche' viene chiesto **molto** piu` spesso: e`
l'anteprima di ogni invito mandato su WhatsApp, e il crawler ha pochi secondi
per scaricarla prima di rinunciare e mostrare il rettangolo grigio.

Gli inviti mostrano la busta e **non** la foto di copertina di chi invita: chi
non ne ha caricata una restava senza immagine, un ritaglio a 1,91:1 di una foto
qualsiasi esce quasi sempre male, e l'anteprima con la foto degli sposi brucia
la sorpresa prima ancora che si apra il link.

`og.png` (1200x630) è quello che appare in WhatsApp, Telegram, Facebook e X
quando qualcuno incolla `andreievictoria.it`. Senza, appare un rettangolo
grigio — ed è il primo posto dove questo link verrà incollato.

**Non è disegnata a mano: è generata da `genera-og.py`.** Si rifà cambiando due
numeri quando cambia la palette, invece di riaprire un editor grafico.

```bash
cd /home/user/projects/inviti-v2
docker run --rm --user "$(id -u):$(id -g)" \
  -v /usr/share/fonts:/fonts:ro \
  -v "$PWD/landing/social:/lavoro" \
  -v "$PWD/landing/social:/uscita" \
  inviti-v2-api python /lavoro/genera-og.py
cp landing/social/og.png landing/og.png
cp landing/social/og-invito.jpg frontend/public/og-invito.jpg
rsync -a --delete --exclude LEGGIMI.md --exclude social/ landing/ /var/www/landing/
# og-invito.jpg entra nell'immagine del frontend: serve un rebuild
docker compose build web && docker compose up -d web
```

Perché quel comando: Pillow non è installato sull'host, ma è in `requisiti.txt`
del backend, quindi l'immagine si disegna dentro l'immagine `inviti-v2-api`.
`--user` serve o i file escono di proprietà di root e il `cp` fallisce.

Il carattere è **EB Garamond** (pacchetto `fonts-ebgaramond`, installato su
questa macchina il 2026-08-24). È un Garamond libero, parente stretto del
Cormorant che l'applicazione usa per i titoli: se manca, lo script si ferma
con un errore chiaro invece di ripiegare su un carattere qualsiasi.

Lo script disegna a 3x e poi rimpicciolisce: Pillow non fa antialiasing sulle
forme, e senza quel passaggio il sigillo avrebbe i bordi a scaletta.

## Perché verde oliva e oro (2026-08-26)

Il sigillo dell'immagine e quello della busta che si apre nell'invito hanno lo
stesso colore apposta: chi riceve il link su WhatsApp vede l'anteprima, tocca,
e ritrova la stessa busta. Erano diversi — anteprima rossa, busta verde della
palette — e lo stacco si notava.

Nell'app la ceralacca è **fissa**, non presa dalla palette: la cera vera non
cambia colore col tema. Il verde oliva vale in tre posti — immagine di
WhatsApp, sigillo dell'invito e favicon — e vanno cambiati tutti e tre
insieme, o l'anteprima in chat mostra un oggetto diverso da quello che si
apre poi.

**Attenzione agli indirizzi assoluti**: `index.html` ha `og:image` e `og:url`
scritti per intero, e dal 2026-08-26 devono puntare a
`home.andreievictoria.it`. Sull'apex quei file non ci sono più: lì c'è
l'invito.
