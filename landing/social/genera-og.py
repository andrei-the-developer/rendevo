#!/usr/bin/env python3
"""Genera l'immagine di anteprima (og:image) della landing.

Perche' uno script e non un file .png e basta: cosi' la si rifa' cambiando due
numeri quando cambia la palette, invece di ridisegnarla a mano. Va eseguita
dentro il container `api`, l'unico posto con Pillow:

Produce due file: `og.png` per la landing e `og-invito.jpg`, piu' leggero,
per le pagine invito. Il comando completo con i mount sta nel LEGGIMI accanto.

Tutto viene disegnato a 3x e poi rimpicciolito: Pillow non fa antialiasing
sulle forme, e senza questo passaggio i bordi del sigillo sarebbero seghettati.
"""

import math
import os
import random

from PIL import Image, ImageDraw, ImageFilter, ImageFont

LARG, ALT = 1200, 630          # misura richiesta da WhatsApp/Facebook/X
S = 3                          # fattore di sovracampionamento
L, A = LARG * S, ALT * S

FONDO_ALTO = (124, 139, 78)    # #7c8b4e
FONDO_MEDIO = (86, 101, 47)    # #56652f
FONDO_BASSO = (51, 59, 27)     # #333b1b
CARTA = (255, 253, 247)
CARTA_OMBRA = (244, 239, 226)
BORDO = (226, 221, 201)
# Piu' scuro del bordo normale: serve a reggere la miniatura di una chat.
BORDO_FORTE = (196, 187, 158)
CERA = (86, 101, 47)
CERA_SCURA = (54, 66, 26)
CERA_LUCE = (124, 139, 78)
ORO = (230, 215, 166)

FONT_DIR = "/fonts/truetype/ebgaramond"


def font(nome: str, dim: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(f"{FONT_DIR}/{nome}", dim)


def sfondo() -> Image.Image:
    """Sfumatura diagonale come l'intestazione della landing."""
    base = Image.new("RGB", (L, A))
    dis = ImageDraw.Draw(base)
    for y in range(A):
        t = y / A
        if t < 0.55:
            k = t / 0.55
            c = tuple(int(FONDO_ALTO[i] + (FONDO_MEDIO[i] - FONDO_ALTO[i]) * k) for i in range(3))
        else:
            k = (t - 0.55) / 0.45
            c = tuple(int(FONDO_MEDIO[i] + (FONDO_BASSO[i] - FONDO_MEDIO[i]) * k) for i in range(3))
        dis.line([(0, y), (L, y)], fill=c)

    # Vignettatura: scurisce i bordi e spinge l'occhio al centro.
    velo = Image.new("L", (L, A), 0)
    ImageDraw.Draw(velo).ellipse(
        [-L * 0.25, -A * 0.55, L * 1.25, A * 1.55], fill=120
    )
    velo = velo.filter(ImageFilter.GaussianBlur(120 * S // 3))
    base = Image.composite(base, Image.new("RGB", (L, A), (30, 36, 18)), velo)
    return base


def ombra(dis_su: Image.Image, riquadro, raggio, sfoca, opacita) -> None:
    strato = Image.new("RGBA", (L, A), (0, 0, 0, 0))
    ImageDraw.Draw(strato).rounded_rectangle(riquadro, raggio, fill=(0, 0, 0, opacita))
    dis_su.alpha_composite(strato.filter(ImageFilter.GaussianBlur(sfoca)))


def sigillo(dis: ImageDraw.ImageDraw, cx: int, cy: int, r: int) -> None:
    """La ceralacca: un tondo con il bordo colato, non un cerchio perfetto.

    Le gocce irregolari sono la differenza fra "sembra un bollino" e "sembra
    cera": un cerchio netto legge come un logo, non come qualcosa di versato.
    """
    caso = random.Random(20260824)         # seme fisso: immagine riproducibile
    for _ in range(26):
        ang = caso.uniform(0, math.tau)
        dist = r * caso.uniform(0.80, 0.94)
        rr = r * caso.uniform(0.20, 0.34)
        x, y = cx + math.cos(ang) * dist, cy + math.sin(ang) * dist
        dis.ellipse([x - rr, y - rr, x + rr, y + rr], fill=CERA_SCURA)

    dis.ellipse([cx - r, cy - r, cx + r, cy + r], fill=CERA)
    # Riflesso in alto a sinistra: dice "questa cera e' bombata".
    dis.ellipse(
        [cx - r * 0.72, cy - r * 0.78, cx + r * 0.10, cy - r * 0.05],
        fill=CERA_LUCE,
    )
    dis.ellipse([cx - r, cy - r, cx + r, cy + r], outline=CERA_SCURA, width=int(3 * S))
    # Cordolo interno inciso, come i sigilli veri.
    ri = int(r * 0.80)
    dis.ellipse([cx - ri, cy - ri, cx + ri, cy + ri], outline=CERA_SCURA, width=int(2 * S))


def iniziali(base: Image.Image, cx: int, cy: int, r: int) -> None:
    f = font("EBGaramond12-Regular.ttf", int(r * 1.05))
    strato = Image.new("RGBA", base.size, (0, 0, 0, 0))
    dis = ImageDraw.Draw(strato)
    testo = "AV"
    x0, y0, x1, y1 = dis.textbbox((0, 0), testo, font=f)
    px, py = cx - (x1 + x0) / 2, cy - (y1 + y0) / 2
    # Prima l'incavo scuro, poi la lettera chiara sopra e spostata di un pelo:
    # e' quello che fa sembrare le iniziali impresse nella cera invece che
    # stampate sopra.
    dis.text((px, py + 2.5 * S), testo, font=f, fill=CERA_SCURA)
    dis.text((px, py), testo, font=f, fill=ORO)
    base.alpha_composite(strato)


def disegna() -> Image.Image:
    base = sfondo().convert("RGBA")

    # La busta occupa il 65% della larghezza invece del 50%: nell'anteprima di
    # WhatsApp l'immagine si vede piccola, e mezza cornice di verde attorno era
    # spazio buttato. Proporzione di una busta vera, non un quadrato.
    bx0, by0 = int(210 * S), int(52 * S)
    bx1, by1 = int(990 * S), int(556 * S)
    raggio = int(10 * S)

    ombra(base, [bx0 + 6 * S, by0 + 14 * S, bx1 + 6 * S, by1 + 22 * S], raggio, 26 * S, 140)

    dis = ImageDraw.Draw(base)
    # Contorni piu' marcati: a 1200x630 ridotti alla miniatura di una chat, un
    # filo da un pixel spariva e la busta diventava una macchia chiara.
    spesso = max(1, int(2.2 * S))
    dis.rounded_rectangle([bx0, by0, bx1, by1], raggio, fill=CARTA,
                          outline=BORDO_FORTE, width=spesso)

    cx = (bx0 + bx1) // 2
    piega = int(by0 + (by1 - by0) * 0.62)

    # I due lembi laterali e il fondo, appena piu' scuri: danno spessore alla
    # carta. Ognuno con la sua cucitura disegnata, non solo il cambio di tono:
    # e' quello che rende leggibile la forma della busta in miniatura.
    dis.polygon([(bx0, by0), (cx, piega), (bx0, by1)], fill=CARTA_OMBRA)
    dis.polygon([(bx1, by0), (cx, piega), (bx1, by1)], fill=CARTA_OMBRA)
    dis.polygon([(bx0, by1), (cx, piega), (bx1, by1)], fill=(250, 246, 235))

    cucitura = max(1, int(1.6 * S))
    dis.line([(bx0, by0), (cx, piega)], fill=BORDO_FORTE, width=cucitura)
    dis.line([(bx1, by0), (cx, piega)], fill=BORDO_FORTE, width=cucitura)
    dis.line([(bx0, by1), (cx, piega)], fill=BORDO_FORTE, width=cucitura)
    dis.line([(bx1, by1), (cx, piega)], fill=BORDO_FORTE, width=cucitura)

    # Il lembo superiore, quello che il sigillo tiene chiuso.
    dis.polygon([(bx0, by0), (bx1, by0), (cx, piega)], fill=(252, 249, 240))
    dis.line([(bx0, by0), (cx, piega), (bx1, by0)], fill=BORDO_FORTE, width=spesso)

    r = int(74 * S)
    sigillo(dis, cx, piega, r)
    iniziali(base, cx, piega, r)

    # Firma in basso: chi vede l'immagine in una chat deve sapere dove andare.
    f = font("EBGaramondSC12-Regular.ttf", int(24 * S))
    testo = "andreievictoria.it"
    strato = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d2 = ImageDraw.Draw(strato)
    larg = d2.textbbox((0, 0), testo, font=f)[2]
    d2.text(((L - larg) / 2, int(586 * S)), testo, font=f, fill=(255, 253, 247, 210))
    base.alpha_composite(strato)

    return base.convert("RGB").resize((LARG, ALT), Image.LANCZOS)


if __name__ == "__main__":
    img = disegna()

    # Per la landing: PNG, che qui non costa niente (42 KB) ed evita di
    # ricomprimere un'immagine che potremmo voler ritoccare.
    img.save("/uscita/og.png", optimize=True)

    # Per gli inviti: JPEG **baseline** e piu' leggero.
    #
    # Perche' un file a parte e non lo stesso PNG: questa viene chiesta dal
    # crawler di WhatsApp ogni volta che qualcuno manda un invito, cioe'
    # spessissimo, e il crawler ha pochi secondi per scaricarla prima di
    # rinunciare e mostrare il rettangolo grigio. 20 KB contro 42.
    #
    # Baseline e non progressivo: il progressivo si vede bene in un browser,
    # ma qualche crawler lo digerisce peggio, e qui non c'e' nessun vantaggio
    # a rischiare.
    img.save("/uscita/og-invito.jpg", "JPEG", quality=84,
             optimize=True, progressive=False)

    for nome in ("og.png", "og-invito.jpg"):
        peso = os.path.getsize(f"/uscita/{nome}") // 1024
        print(f"scritto /uscita/{nome}  ({peso} KB)")
