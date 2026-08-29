#!/usr/bin/env python3
"""Genera il brano strumentale predefinito.

Sintetizzato da zero con la sola libreria standard: non deriva da nessuna
registrazione esistente, quindi non porta diritti di terzi. Timbro da
carillon (fondamentale più due armoniche, decadimento rapido) su un tappeto
di archi appena accennato.

Uso:  python3 genera_brano.py           # scrive predefinito.wav
"""

import array
import math
import wave
from pathlib import Path

FC = 44100          # frequenza di campionamento
BPM = 66
BATTUTE = 8
USCITA = Path(__file__).resolve().parent.parent / "frontend" / "public" / "musica"

sec_battito = 60.0 / BPM
sec_battuta = sec_battito * 4
durata = sec_battuta * BATTUTE


def nota(semitoni: float) -> float:
    """Frequenza in temperamento equabile, riferita al La 440."""
    return 440.0 * (2 ** (semitoni / 12.0))


# Fa maggiore: F - Dm - Bb - C, due volte. Progressione quieta, senza tensioni.
# Semitoni relativi al La 440; il -21 porta il Do centrale nella zona giusta.
ACCORDI = [
    ("F",  [-16, -12, -9, -4]),      # Fa La Do Fa
    ("Dm", [-19, -16, -12, -7]),     # Re Fa La Re
    ("Bb", [-23, -16, -11, -4]),     # Si♭ Fa Re Fa
    ("C",  [-21, -14, -9, -2]),      # Do Sol Do Sol
] * 2

# Arpeggio in croma: sale e ridiscende, come una scatola musicale.
DISEGNO = [0, 1, 2, 3, 2, 1, 0, 1]

sinistra = array.array("d", [0.0]) * int(durata * FC + FC)
destra = array.array("d", [0.0]) * int(durata * FC + FC)


def carillon(inizio: float, freq: float, ampiezza: float, pan: float) -> None:
    """Una nota di carillon: attacco brevissimo, coda che si spegne."""
    tau = 0.85
    lunghezza = int(2.6 * tau * FC)
    i0 = int(inizio * FC)
    attacco = int(0.004 * FC)
    for n in range(lunghezza):
        t = n / FC
        inv = math.exp(-t / tau)
        # Le armoniche si spengono prima della fondamentale: è ciò che dà
        # il "tin" iniziale invece di un suono di organo.
        s = (
            math.sin(2 * math.pi * freq * t) * inv
            + 0.30 * math.sin(2 * math.pi * freq * 2 * t) * math.exp(-t / (tau * 0.5))
            + 0.12 * math.sin(2 * math.pi * freq * 4 * t) * math.exp(-t / (tau * 0.3))
        )
        if n < attacco:
            s *= n / attacco
        v = s * ampiezza
        j = i0 + n
        if j < len(sinistra):
            sinistra[j] += v * (1.0 - pan) * 0.5
            destra[j] += v * (1.0 + pan) * 0.5


def tappeto(inizio: float, freqs: list[float], ampiezza: float) -> None:
    """Accordo tenuto sotto l'arpeggio, con entrata e uscita morbide."""
    lunghezza = int(sec_battuta * FC)
    i0 = int(inizio * FC)
    rampa = int(0.35 * FC)
    for n in range(lunghezza):
        t = n / FC
        s = sum(math.sin(2 * math.pi * f * t) for f in freqs) / len(freqs)
        # Vibrato lentissimo: evita che il tenuto suoni sintetico e fermo.
        s *= 1.0 + 0.03 * math.sin(2 * math.pi * 0.7 * t)
        inv = min(1.0, n / rampa, (lunghezza - n) / rampa)
        v = s * ampiezza * inv
        j = i0 + n
        if j < len(sinistra):
            sinistra[j] += v * 0.5
            destra[j] += v * 0.5


for b, (nome, gradi) in enumerate(ACCORDI):
    t_battuta = b * sec_battuta

    # tappeto: le tre voci acute dell'accordo, un'ottava sotto
    tappeto(t_battuta, [nota(g - 12) for g in gradi[1:]], 0.055)

    # basso della battuta
    carillon(t_battuta, nota(gradi[0] - 12), 0.16, 0.0)

    # arpeggio in croma
    for k, passo in enumerate(DISEGNO):
        t = t_battuta + k * sec_battito / 2
        grado = gradi[passo]
        # L'ultima battuta scende di volume: prepara il ricongiungimento
        # con l'inizio quando la traccia riparte in loop.
        calo = 1.0 if b < BATTUTE - 1 else 1.0 - 0.55 * (k / len(DISEGNO))
        amp = (0.20 if k % 2 == 0 else 0.13) * calo
        pan = -0.35 if k % 2 == 0 else 0.35
        carillon(t, nota(grado + 12), amp, pan)
        if k == 0:
            carillon(t, nota(grado), amp * 0.55, 0.0)

# Taglio esatto sulla battuta: il loop non deve avere silenzio in mezzo.
fine = int(durata * FC)
sinistra = sinistra[:fine]
destra = destra[:fine]

# Dissolvenza incrociata fra coda e testa: l'anello di ripetizione diventa
# impercettibile invece di dare un colpo secco.
inc = int(0.6 * FC)
for n in range(inc):
    peso = n / inc
    sinistra[fine - inc + n] = sinistra[fine - inc + n] * (1 - peso) + sinistra[n] * peso
    destra[fine - inc + n] = destra[fine - inc + n] * (1 - peso) + destra[n] * peso

picco = max(max(abs(v) for v in sinistra), max(abs(v) for v in destra))
guadagno = 0.72 / picco

campioni = array.array("h")
for n in range(fine):
    campioni.append(int(max(-1.0, min(1.0, sinistra[n] * guadagno)) * 32767))
    campioni.append(int(max(-1.0, min(1.0, destra[n] * guadagno)) * 32767))

USCITA.mkdir(parents=True, exist_ok=True)
percorso = USCITA / "predefinito.wav"
with wave.open(str(percorso), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(FC)
    w.writeframes(campioni.tobytes())

print(f"{percorso}  {durata:.1f}s  picco originale {picco:.2f}")
