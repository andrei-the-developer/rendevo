/**
 * Il rumore della busta mentre la si tiene premuta.
 *
 * Sintetizzato con la Web Audio API invece di caricare un file: nessun asset
 * da ospitare, nessun diritto di terzi, e soprattutto nessun ritardo — il
 * suono deve partire nell'istante in cui il dito tocca, e un file da scaricare
 * arriverebbe dopo.
 *
 * La ricetta è rumore bianco dentro un passa-banda stretto: è il modo classico
 * di ottenere carta che si piega e ceralacca che scricchiola. Il volume sale
 * con la pressione, così il suono racconta quanto manca all'apertura.
 */

const DURATA_RUMORE = 2; // secondi di rumore in circolo

export interface Fruscio {
  /** Alza il volume: `intensita` va da 0 a 1. */
  intensita(v: number): void;
  /** Sfuma e libera tutto. Chiamarlo due volte non fa danni. */
  ferma(): void;
}

/** `null` se il browser non ha la Web Audio API: il resto continua a funzionare. */
export function avviaFruscio(): Fruscio | null {
  const Costruttore =
    typeof window === "undefined"
      ? undefined
      : window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
  if (!Costruttore) return null;

  let ctx: AudioContext;
  try {
    ctx = new Costruttore();
  } catch {
    return null;
  }
  // Su iOS il contesto nasce sospeso finché non c'è un gesto: qui il gesto
  // c'è (il dito è premuto), quindi riprenderlo è lecito.
  void ctx.resume().catch(() => {});

  const campioni = Math.floor(ctx.sampleRate * DURATA_RUMORE);
  const buffer = ctx.createBuffer(1, campioni, ctx.sampleRate);
  const dati = buffer.getChannelData(0);
  for (let i = 0; i < campioni; i++) dati[i] = Math.random() * 2 - 1;

  const sorgente = ctx.createBufferSource();
  sorgente.buffer = buffer;
  sorgente.loop = true;

  // ~2 kHz è dove sta il fruscio della carta: più in basso diventa vento,
  // più in alto diventa sibilo.
  const filtro = ctx.createBiquadFilter();
  filtro.type = "bandpass";
  filtro.frequency.value = 2000;
  filtro.Q.value = 0.8;

  const volume = ctx.createGain();
  volume.gain.value = 0;

  sorgente.connect(filtro).connect(volume).connect(ctx.destination);
  sorgente.start();

  let vivo = true;

  return {
    intensita(v: number) {
      if (!vivo) return;
      const forza = Math.max(0, Math.min(1, v));
      // Curva quadratica: all'inizio quasi non si sente, verso la fine cresce
      // in fretta. Lineare suonerebbe come una radio male sintonizzata.
      const g = 0.16 * forza * forza;
      volume.gain.setTargetAtTime(g, ctx.currentTime, 0.05);
      // Anche il timbro si stringe salendo: la carta che cede è più acuta.
      filtro.frequency.setTargetAtTime(1600 + 1400 * forza, ctx.currentTime, 0.08);
    },
    ferma() {
      if (!vivo) return;
      vivo = false;
      volume.gain.setTargetAtTime(0, ctx.currentTime, 0.04);
      window.setTimeout(() => {
        try {
          sorgente.stop();
        } catch {
          // già fermata: va bene così
        }
        void ctx.close().catch(() => {});
      }, 220);
    },
  };
}
