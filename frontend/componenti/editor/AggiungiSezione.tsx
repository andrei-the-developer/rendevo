"use client";

import { useId } from "react";

import type { Blocco, TipoBlocco } from "@/lib/tipi";

/** Una voce del menu: cosa si aggiunge e, se serve, con quale contenuto
 *  gia' scritto dentro. */
interface Voce {
  tipo: TipoBlocco;
  etichetta: string;
  descrizione: string;
  /** Solo per le scorciatoie: parte gia' compilata. */
  contenuto?: Record<string, unknown>;
  /** Chiave con cui riconoscerla nell'elenco (i preset condividono il tipo). */
  chiave: string;
}

/** Tipi che in un invito hanno senso una volta sola. Riproporli genererebbe
 *  due countdown o due moduli di risposta, che e' solo un modo di rompersi
 *  l'invito da soli. */
const UNICI: TipoBlocco[] = ["busta", "hero", "countdown", "musica", "rsvp"];

const VOCI: Voce[] = [
  { chiave: "testo", tipo: "testo", etichetta: "Testo",
    descrizione: "Un titolo e un paragrafo. Il mattone più versatile." },
  { chiave: "programma", tipo: "programma", etichetta: "Programma",
    descrizione: "La giornata ora per ora." },
  { chiave: "luogo", tipo: "luogo", etichetta: "Luogo",
    descrizione: "Indirizzo, orario e il link alla mappa." },
  { chiave: "galleria", tipo: "galleria", etichetta: "Galleria",
    descrizione: "Le vostre foto, in fila o a griglia." },
  { chiave: "nota", tipo: "nota", etichetta: "Nota",
    descrizione: "Un riquadro breve, staccato dal resto." },
  // Scorciatoia: una nota gia' intitolata. Il titolo non e' un dettaglio —
  // e' quello che fa comparire il disegno degli abiti nella sezione.
  { chiave: "nota-dress-code", tipo: "nota", etichetta: "Dress code",
    descrizione: "Una nota col disegno degli abiti già dentro.",
    contenuto: { titolo: "Dress code", corpo: "Elegante." } },
  { chiave: "nota-regali", tipo: "nota", etichetta: "Regali",
    descrizione: "Una nota per la lista o l'IBAN.",
    contenuto: { titolo: "Regali", corpo: "Il regalo più bello è la vostra presenza." } },
  { chiave: "countdown", tipo: "countdown", etichetta: "Countdown",
    descrizione: "Il conto alla rovescia fino al giorno." },
  { chiave: "rsvp", tipo: "rsvp", etichetta: "Risposte",
    descrizione: "Il modulo con cui gli invitati confermano." },
  { chiave: "musica", tipo: "musica", etichetta: "Musica",
    descrizione: "Il brano che parte all'apertura." },
  { chiave: "hero", tipo: "hero", etichetta: "Copertina",
    descrizione: "I nomi grandi, in cima all'invito." },
  { chiave: "busta", tipo: "busta", etichetta: "Busta",
    descrizione: "La busta chiusa che si apre all'inizio." },
];

export function AggiungiSezione({
  blocchi,
  onScegli,
  onChiudi,
}: {
  blocchi: Blocco[];
  onScegli: (tipo: TipoBlocco, contenuto?: Record<string, unknown>) => void;
  onChiudi: () => void;
}) {
  const idTitolo = useId();
  const presenti = new Set(blocchi.map((b) => b.tipo));
  const disponibili = VOCI.filter(
    (v) => !UNICI.includes(v.tipo) || !presenti.has(v.tipo),
  );

  return (
    <div
      className="velo-popup"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onChiudi();
      }}
    >
      <div className="popup" role="dialog" aria-modal="true" aria-labelledby={idTitolo}>
        <div className="popup__testata">
          <h2 id={idTitolo}>Aggiungi una sezione</h2>
          <button type="button" className="popup__chiudi" onClick={onChiudi} aria-label="Chiudi">
            ×
          </button>
        </div>

        <div className="popup__corpo">
          <div className="scelta-sezioni">
            {disponibili.map((v) => (
              <button
                key={v.chiave}
                type="button"
                className="carta-sezione"
                onClick={() => onScegli(v.tipo, v.contenuto)}
              >
                <strong>{v.etichetta}</strong>
                <span>{v.descrizione}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
