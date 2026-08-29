#!/usr/bin/env python3
"""L'icona del sito: il sigillo di ceralacca col monogramma A&V.

Lo stesso oggetto che si vede sulla busta e nell'immagine di WhatsApp, cosi'
la scheda del browser, l'anteprima in chat e l'invito raccontano la stessa
cosa.

Disegnata a 512 e poi rimpicciolita: un'icona va vista a 16 pixel, e a quella
misura ogni dettaglio in piu' diventa sporco. Per questo il bordo colato della
cera qui e' piu' marcato che sulla busta grande — a 16 pixel un tondo liscio
non si distingue da un bollino qualunque.

    docker run --rm --user "$(id -u):$(id -g)" \
      -v "$PWD/frontend/public/ornamenti:/ornamenti:ro" \
      -v "$PWD/frontend/app:/uscita" \
      -v "$PWD/strumenti:/lavoro:ro" \
      inviti-v2-api python /lavoro/genera-favicon.py
"""

import math
import random

from PIL import Image, ImageDraw, ImageFilter

LATO = 512
S = 2                      # si disegna a 1024 e si scende a 512
L = LATO * S

CERA = (86, 101, 47)
CERA_SCURA = (48, 59, 22)
CERA_LUCE = (128, 144, 80)
ORO = (255, 228, 158)
ORO_SCURO = (176, 132, 56)

# Misure delle icone. 16/32/48 stanno nel .ico per la scheda del browser;
# 180 e' l'icona che iOS mette in schermata home; 512 serve al manifest.
MISURE_ICO = [16, 32, 48, 64, 128, 256]


def disegna() -> Image.Image:
    img = Image.new("RGBA", (L, L), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx = cy = L // 2
    r = int(L * 0.455)

    # Ombra sotto, corta: stacca il sigillo dallo sfondo della scheda, che
    # nei browser puo' essere chiaro o scuro.
    ombra = Image.new("RGBA", (L, L), (0, 0, 0, 0))
    ImageDraw.Draw(ombra).ellipse(
        [cx - r, cy - r + int(L * 0.02), cx + r, cy + r + int(L * 0.03)],
        fill=(0, 0, 0, 90),
    )
    img.alpha_composite(ombra.filter(ImageFilter.GaussianBlur(L * 0.02)))

    # Il bordo colato: gocce attorno al tondo. Seme fisso, icona riproducibile.
    caso = random.Random(20260826)
    for _ in range(22):
        ang = caso.uniform(0, math.tau)
        dist = r * caso.uniform(0.80, 0.92)
        rr = r * caso.uniform(0.20, 0.30)
        x, y = cx + math.cos(ang) * dist, cy + math.sin(ang) * dist
        d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=CERA_SCURA)

    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=CERA)
    # Riflesso in alto a sinistra: dice "questa cera e' bombata".
    # Riflesso piu' contenuto: a icona rimpicciolita un riflesso largo si
    # fonde col monogramma e sembra una macchia sola.
    d.ellipse(
        [cx - r * 0.60, cy - r * 0.68, cx - r * 0.04, cy - r * 0.14],
        fill=CERA_LUCE,
    )
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=CERA_SCURA, width=int(L * 0.012))
    # Cordolo interno inciso, come i sigilli veri. Sottile: a 16 pixel diventa
    # un anello grigio che mangia contrasto al monogramma.
    ri = int(r * 0.84)
    d.ellipse([cx - ri, cy - ri, cx + ri, cy + ri], outline=CERA_SCURA, width=int(L * 0.005))

    # Il monogramma, dalla maschera gia' ingrossata: quella sottile a 16 pixel
    # sparisce del tutto.
    mono = Image.open("/ornamenti/av-spesso.png").convert("RGBA")
    # Largo quanto la cera lo permette: sotto i 20 pixel il monogramma e' la
    # sola cosa che distingue questa icona da un bollino rosso qualunque.
    largo = int(L * 0.78)
    mono = mono.resize((largo, round(mono.height * largo / mono.width)), Image.LANCZOS)

    oro = Image.new("RGBA", mono.size, ORO + (255,))
    oro.putalpha(mono.getchannel("A"))
    # Incavo scuro sotto la lettera chiara: l'oro sembra impresso, non appoggiato.
    incavo = Image.new("RGBA", mono.size, ORO_SCURO + (255,))
    incavo.putalpha(mono.getchannel("A"))

    px, py = cx - mono.width // 2, cy - mono.height // 2
    img.alpha_composite(incavo, (px, py + max(1, int(L * 0.006))))
    img.alpha_composite(oro, (px, py))

    return img.resize((LATO, LATO), Image.LANCZOS)


if __name__ == "__main__":
    icona = disegna()

    # Il .ico multi-misura: Windows e i browser scelgono da soli quella giusta.
    icona.save("/uscita/favicon.ico", format="ICO",
               sizes=[(m, m) for m in MISURE_ICO])
    # iOS non legge il .ico: vuole un PNG suo, e senza trasparenza (la
    # appiattisce su nero, e un sigillo su nero non si vede).
    piatta = Image.new("RGB", icona.size, (250, 248, 241))
    piatta.paste(icona, (0, 0), icona)
    piatta.resize((180, 180), Image.LANCZOS).save("/uscita/apple-icon.png", optimize=True)
    icona.save("/uscita/icon.png", optimize=True)

    print("favicon.ico, apple-icon.png, icon.png")
