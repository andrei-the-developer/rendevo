"""Genera le immagini segnaposto per un invito appena creato.

Nessuna foto stock: sono disegnate da zero con Pillow (gradiente più
un'icona a fotogramma), così non c'è alcuna questione di licenza — lo stesso
principio già seguito per il brano musicale incluso. Vanno rigenerate solo
se si cambia il loro aspetto:

    .venv/bin/python -m app.genera_segnaposto
"""

from pathlib import Path

from PIL import Image, ImageDraw

DEST = Path(__file__).resolve().parent / "assets_semina"
MISURE = {"grande": 1800, "media": 1000, "piccola": 480}

# Un tocco di tinta diverso per ogni tessera: la galleria non deve sembrare
# la stessa immagine incollata quattro volte.
TINTE = {
    "hero":       ((0.94, 0.92, 0.87), (0.80, 0.78, 0.70)),
    "galleria-1": ((0.95, 0.91, 0.89), (0.83, 0.76, 0.74)),
    "galleria-2": ((0.92, 0.93, 0.89), (0.78, 0.80, 0.73)),
    "galleria-3": ((0.93, 0.92, 0.94), (0.79, 0.78, 0.83)),
    "galleria-4": ((0.95, 0.93, 0.88), (0.84, 0.79, 0.68)),
}


def _sfumato(w: int, h: int, chiaro: tuple, scuro: tuple) -> Image.Image:
    base = Image.new("RGB", (w, h))
    disegna = ImageDraw.Draw(base)
    for y in range(h):
        t = y / h
        riga = tuple(
            round(255 * (chiaro[i] + (scuro[i] - chiaro[i]) * t)) for i in range(3)
        )
        disegna.line([(0, y), (w, y)], fill=riga)
    return base


def _icona_fotogramma(img: Image.Image) -> None:
    """Icona universale "immagine assente": cornice, montagna, sole."""
    w, h = img.size
    d = ImageDraw.Draw(img)
    lato = min(w, h)
    cx, cy = w / 2, h / 2 - lato * 0.02
    metà = lato * 0.17
    spessore = max(2, round(lato * 0.006))
    colore = tuple(round(c * 0.55) for c in img.getpixel((0, 0)))

    # Cornice arrotondata
    d.rounded_rectangle(
        [cx - metà, cy - metà * 0.76, cx + metà, cy + metà * 0.76],
        radius=metà * 0.12, outline=colore, width=spessore,
    )
    # Sole
    r = metà * 0.16
    d.ellipse(
        [cx - metà * 0.62, cy - metà * 0.42, cx - metà * 0.62 + r * 2, cy - metà * 0.42 + r * 2],
        outline=colore, width=spessore,
    )
    # Montagne
    base_y = cy + metà * 0.5
    d.line([
        (cx - metà * 0.8, base_y),
        (cx - metà * 0.15, cy - metà * 0.05),
        (cx + metà * 0.15, base_y - metà * 0.3),
        (cx + metà * 0.8, base_y),
    ], fill=colore, width=spessore, joint="curve")


def _tessera(nome: str, chiaro: tuple, scuro: tuple) -> None:
    grande_lato = MISURE["grande"]
    originale = _sfumato(round(grande_lato * 0.8), grande_lato, chiaro, scuro)
    _icona_fotogramma(originale)

    for etichetta, lato in MISURE.items():
        copia = originale.copy()
        copia.thumbnail((lato, lato), Image.LANCZOS)
        copia.save(DEST / f"{nome}-{etichetta}.jpg", "JPEG", quality=87, optimize=True)


def genera() -> None:
    DEST.mkdir(parents=True, exist_ok=True)
    for nome, (chiaro, scuro) in TINTE.items():
        _tessera(nome, chiaro, scuro)
    print(f"Segnaposto scritti in {DEST}")


if __name__ == "__main__":
    genera()
