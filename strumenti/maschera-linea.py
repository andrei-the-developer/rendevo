#!/usr/bin/env python3
"""Da disegno a tratto (righe nere su carta) a maschera PNG per il CSS.

Perche' una maschera e non l'immagine: cosi' il disegno prende il colore della
palette scelta dall'utente (`background-color: var(--decoro)` + `mask`), come
gia' fanno i rametti del tema romantico. L'immagine cosi' com'e' sarebbe nera
su qualunque palette, e su un invito blu notte stonerebbe.

Nella maschera conta solo il canale alfa: 255 dove c'e' inchiostro, 0 dove c'e'
carta. Il colore dei pixel e' irrilevante (li lascio bianchi).

La carta di questi disegni e' ruvida e "sporca": senza una soglia, la texture
diventerebbe una nebbia grigia attorno alle figure.

    docker run --rm --user "$(id -u):$(id -g)" \
      -v "$PWD/inputs:/ingresso:ro" \
      -v "$PWD/frontend/public/ornamenti:/uscita" \
      -v "$PWD/strumenti:/lavoro:ro" \
      inviti-v2-api python /lavoro/maschera-linea.py "dress code 1.jpeg" dress-code
"""

import sys
from pathlib import Path

from PIL import Image, ImageOps

CARTA = 232      # sopra questo grigio e' carta: diventa trasparente
INCHIOSTRO = 90  # sotto questo e' tratto pieno: diventa opaco
LATO_MAX = 1000


def maschera(sorgente: Path, nome: str, uscita: Path) -> None:
    grigio = ImageOps.grayscale(Image.open(sorgente))

    # Allarga la gamma prima di tagliare: le foto di disegni non arrivano mai
    # a bianco pieno, e senza questo la soglia andrebbe tarata a mano ogni volta.
    grigio = ImageOps.autocontrast(grigio, cutoff=(0.4, 0.4))

    def alfa(v: int) -> int:
        if v >= CARTA:
            return 0
        if v <= INCHIOSTRO:
            return 255
        # Rampa fra i due: e' quella che tiene i bordi morbidi invece di
        # ritagliare il tratto a scaletta.
        return round(255 * (CARTA - v) / (CARTA - INCHIOSTRO))

    a = grigio.point(alfa)

    fuori = Image.new("RGBA", grigio.size, (255, 255, 255, 0))
    fuori.putalpha(a)

    riquadro = fuori.getbbox()
    if riquadro:
        fuori = fuori.crop(riquadro)

    if max(fuori.size) > LATO_MAX:
        k = LATO_MAX / max(fuori.size)
        fuori = fuori.resize((round(fuori.width * k), round(fuori.height * k)), Image.LANCZOS)

    uscita.mkdir(parents=True, exist_ok=True)
    dest = uscita / f"{nome}.png"
    fuori.save(dest, optimize=True)
    print(f"{nome}: {fuori.width}x{fuori.height}  {dest.stat().st_size // 1024} KB")


if __name__ == "__main__":
    file, nome = sys.argv[1], sys.argv[2]
    maschera(Path("/ingresso") / file, nome, Path("/uscita"))
