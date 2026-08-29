"use client";

import { useId } from "react";

import { ALTEZZE, FIORI, type Altezza, type Fiore } from "@/lib/tipi";

const ALTEZZE_NOMI: Record<Altezza, string> = {
  alto: "In alto",
  meta: "A metà",
  basso: "In basso",
};

const NOMI: Record<Fiore, string> = {
  mazzo: "Mazzo alto",
  ramo: "Ramo curvo",
  ghirlanda: "Ghirlanda",
  rododendro: "Rododendro",
  "rosa-crema": "Rosa crema",
  garofano: "Garofano",
  "rosa-inciso": "Rose incise",
  cesto: "Cesto inciso",
  "rosa-piena": "Rosa rossa",
  "rosa-magenta": "Rosa fucsia",
};

/** La scelta del fiore per un lato di una sezione.
 *
 *  Le anteprime sono gli stessi file che finiscono nell'invito, non delle
 *  icone: cosi' si sceglie guardando quello che si otterra'. */
export function ScegliFiore({
  lato,
  attuale,
  altezza,
  onScegli,
  onAltezza,
  onChiudi,
}: {
  lato: "sx" | "dx";
  attuale: string;
  altezza: string;
  onScegli: (fiore: string) => void;
  onAltezza: (altezza: Altezza) => void;
  onChiudi: () => void;
}) {
  const idTitolo = useId();

  return (
    <div
      className="velo-popup"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onChiudi();
      }}
    >
      <div className="popup popup--fiori" role="dialog" aria-modal="true" aria-labelledby={idTitolo}>
        <div className="popup__testata">
          <h2 id={idTitolo}>
            Fiori a {lato === "sx" ? "sinistra" : "destra"}
          </h2>
          <button type="button" className="popup__chiudi" onClick={onChiudi} aria-label="Chiudi">
            ×
          </button>
        </div>

        <div className="popup__corpo">
          <div className="scelta-fiori">
            {FIORI.map((f) => (
              <button
                key={f}
                type="button"
                className="carta-fiore"
                aria-pressed={attuale === f}
                onClick={() => onScegli(f)}
              >
                <span
                  className="carta-fiore__prova"
                  data-fiore={f}
                  data-lato={lato}
                  aria-hidden="true"
                />
                <span>{NOMI[f]}</span>
              </button>
            ))}
          </div>

          {/* L'altezza si sceglie solo quando un fiore c'e`: senza, sarebbero
              tre pulsanti che non spostano niente. */}
          {attuale && (
            <>
              <p className="scelta-altezza__titolo">A che altezza</p>
              <div className="scelta-altezza">
                {ALTEZZE.map((a) => (
                  <button
                    key={a}
                    type="button"
                    className="tasto-altezza"
                    aria-pressed={(altezza || "meta") === a}
                    onClick={() => onAltezza(a)}
                  >
                    {/* Uno schizzo della sezione con il fiore dove finira`:
                        tre parole non dicono dove va, un disegnino si`. */}
                    <span className="tasto-altezza__prova" data-altezza={a} aria-hidden="true">
                      <i />
                    </span>
                    {ALTEZZE_NOMI[a]}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="tasto-popup"
                style={{ marginTop: "0.9rem" }}
                onClick={() => onScegli("")}
              >
                Togli il fiore
              </button>
            </>
          )}

          <p style={{ margin: "0.75rem 0 0", fontSize: "0.85rem", color: "#7a7f82" }}>
            I fiori si vedono solo con il tema <strong>romantico</strong>. Se
            cambi tema restano scritti, ma non si disegnano.
          </p>
        </div>
      </div>
    </div>
  );
}
