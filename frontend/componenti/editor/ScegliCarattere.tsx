"use client";

import { useEffect, useRef, useState } from "react";

import type { VoceAspetto } from "@/lib/tipi";

/**
 * La scelta del carattere.
 *
 * Non e' un `<select>`: ogni voce deve essere scritta **nel carattere che
 * applica**, e i browser trattano `font-family` su `<option>` in modo
 * disomogeneo — Safari e i menu a tendina di Android la ignorano del tutto.
 * Un elenco costruito a mano e' l'unico modo per far vedere davvero quello
 * che si sta scegliendo, che qui e' tutto il punto.
 */
export function ScegliCarattere({
  voci,
  valore,
  onCambia,
}: {
  voci: VoceAspetto[];
  valore: string;
  onCambia: (id: string) => void;
}) {
  const [aperto, setAperto] = useState(false);
  const guscio = useRef<HTMLDivElement>(null);

  // Un clic fuori chiude. Senza, il menu resterebbe aperto sopra l'invito
  // mentre si prova a cliccarci dentro per modificarlo.
  useEffect(() => {
    if (!aperto) return;
    const fuori = (e: PointerEvent) => {
      if (!guscio.current?.contains(e.target as Node)) setAperto(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAperto(false);
    };
    document.addEventListener("pointerdown", fuori);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", fuori);
      document.removeEventListener("keydown", esc);
    };
  }, [aperto]);

  const scelto = voci.find((v) => v.id === valore) ?? voci[0];

  return (
    <div className="scelta-carattere" ref={guscio}>
      <span className="scelta-tema__etichetta">Carattere</span>
      <button
        type="button"
        className="scelta-carattere__tasto"
        aria-haspopup="listbox"
        aria-expanded={aperto}
        onClick={() => setAperto((a) => !a)}
      >
        <span className="anteprima-carattere" data-carattere={scelto?.id}>
          {scelto?.etichetta}
        </span>
        <span aria-hidden="true">▾</span>
      </button>

      {aperto && (
        <ul className="scelta-carattere__elenco" role="listbox">
          {voci.map((v) => (
            <li key={v.id}>
              <button
                type="button"
                role="option"
                aria-selected={v.id === valore}
                title={v.descrizione}
                onClick={() => {
                  setAperto(false);
                  if (v.id !== valore) onCambia(v.id);
                }}
              >
                {/* Scritta nel carattere che applica: e' l'unica anteprima
                    che conti. */}
                <span className="anteprima-carattere" data-carattere={v.id}>
                  {v.etichetta}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
