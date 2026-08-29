#!/usr/bin/env python3
"""Toglie lo sfondo alle illustrazioni floreali e le salva in PNG trasparente.

**Non** cancella "tutto il bianco".  Sarebbe la cosa ovvia ed e' anche quella
sbagliata: queste illustrazioni sono rose bianche e crema su fondo bianco, e
una selezione per colore le bucherebbe da parte a parte.

Qui si riempie a partire dai **bordi**: si parte dai pixel del perimetro e ci
si allarga finche' il colore resta simile.  Cosi' sparisce solo il fondo che
circonda il disegno, mentre i petali chiari — che sono chiusi dentro steli e
foglie — restano intatti perche' non sono raggiungibili dal bordo.

Uso (Pillow sta nell'immagine dell'API, non sull'host):

    docker run --rm --user "$(id -u):$(id -g)" \
      -v "$PWD/inputs:/ingresso:ro" \
      -v "$PWD/frontend/public/ornamenti/romantico:/uscita" \
      -v "$PWD/strumenti:/lavoro:ro" \
      inviti-v2-api python /lavoro/scontorna.py
"""

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

INGRESSO = Path("/ingresso")
USCITA = Path("/uscita")

SENTINELLA = (255, 0, 255)   # magenta: non compare in nessuna di queste immagini
TOLLERANZA = 34              # quanto puo' variare il fondo restando "fondo"
LATO_MAX = 1400              # oltre non serve: sono decorazioni, non fotografie


def scontorna(percorso: Path, nome: str) -> None:
    img = Image.open(percorso).convert("RGB")

    # Un bordo di un pixel del colore d'angolo: garantisce che il riempimento
    # parta da fuori anche se il disegno tocca il margine.
    fondo = img.getpixel((1, 1))
    con_bordo = Image.new("RGB", (img.width + 2, img.height + 2), fondo)
    con_bordo.paste(img, (1, 1))

    ImageDraw.floodfill(con_bordo, (0, 0), SENTINELLA, thresh=TOLLERANZA)

    # I fondi di questi file sono screenshot: hanno una fascia grigia e una
    # "targa" bianca dietro il disegno. Un secondo giro dai quattro angoli
    # prende anche quelle, se sono rimaste.
    l, a = con_bordo.size
    for punto in ((l - 1, 0), (0, a - 1), (l - 1, a - 1), (l // 2, 0), (l // 2, a - 1)):
        if con_bordo.getpixel(punto) != SENTINELLA:
            ImageDraw.floodfill(con_bordo, punto, SENTINELLA, thresh=TOLLERANZA)

    riempito = con_bordo.crop((1, 1, img.width + 1, img.height + 1))

    # Maschera: 0 dove e' stato riempito, 255 dove c'e' disegno.
    maschera = Image.new("L", img.size, 255)
    dati_r = riempito.load()
    dati_m = maschera.load()
    for y in range(img.height):
        for x in range(img.width):
            if dati_r[x, y] == SENTINELLA:
                dati_m[x, y] = 0

    # Mezzo pixel di sfumatura sul bordo: senza, il contorno resta a scaletta
    # e in pagina si vede una frangia bianca attorno ai petali.
    maschera = maschera.filter(ImageFilter.GaussianBlur(0.6))

    fuori = Image.new("RGBA", img.size)
    fuori.paste(img, (0, 0))
    fuori.putalpha(maschera)

    # Via il vuoto attorno: l'immagine si posiziona in pagina per i suoi bordi,
    # e un margine trasparente di 200px la sposterebbe di 200px.
    riquadro = fuori.getbbox()
    if riquadro:
        fuori = fuori.crop(riquadro)

    if max(fuori.size) > LATO_MAX:
        k = LATO_MAX / max(fuori.size)
        fuori = fuori.resize(
            (round(fuori.width * k), round(fuori.height * k)), Image.LANCZOS
        )

    USCITA.mkdir(parents=True, exist_ok=True)
    destinazione = USCITA / f"{nome}.png"
    fuori.save(destinazione, optimize=True)

    opachi = sum(1 for p in fuori.getdata() if p[3] > 8)
    percento = 100 * opachi / (fuori.width * fuori.height)
    print(f"{nome:14} {fuori.width}x{fuori.height}  disegno {percento:.0f}%  "
          f"{destinazione.stat().st_size // 1024} KB")


# Quale file diventa cosa. I nomi dicono la forma, non l'ordine di arrivo:
# servono a chi scrivera' il CSS della cornice.
NOMI = {
    "WhatsApp Image 2026-08-24 at 22.42.02.jpeg": "spigolo",
    "WhatsApp Image 2026-08-24 at 22.40.32.jpeg": "ghirlanda",
    "WhatsApp Image 2026-08-24 at 22.37.46.jpeg": "mazzo-alto",
    "WhatsApp Image 2026-08-24 at 22.40.32 (2).jpeg": "mazzo-tondo",
    "WhatsApp Image 2026-08-24 at 22.40.32 (1).jpeg": "corona",
}

if __name__ == "__main__":
    mancanti = [f for f in NOMI if not (INGRESSO / f).exists()]
    if mancanti:
        print("non trovo:", *mancanti, sep="\n  ", file=sys.stderr)
    for file, nome in NOMI.items():
        if (INGRESSO / file).exists():
            scontorna(INGRESSO / file, nome)
