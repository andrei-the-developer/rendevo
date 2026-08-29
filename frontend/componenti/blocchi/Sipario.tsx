"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { avviaFruscio, type Fruscio } from "@/lib/fruscio";
import { dizionario, type Lingua } from "@/lib/lingue";
import type { Blocco, Busta as TBusta } from "@/lib/tipi";
import { Apertura } from "./Apertura";
import { FronteBusta } from "./CartaBusta";

/** Durata totale della sequenza di apertura, allineata alle animazioni CSS
 *  in blocchi.css: sigillo (0-420) → lembo (320-1220) → lettera (700-1950) →
 *  pausa per leggerla → dissolvenza del sipario (2100-2600).
 *
 *  Questo numero e' la fine di tutto: e' quando il sipario viene smontato e
 *  l'invito resta solo. I millisecondi qui sopra sono quelli "a velocita' 1":
 *  in CSS ognuno viene moltiplicato per `--lento`, che oggi vale 3. Se si
 *  cambia `--lento` va cambiato anche questo numero, o il sipario sparisce a
 *  meta' della sua dissolvenza. */
const DURATA_APERTURA = 7800;   // 2600 x --lento (3) in blocchi.css

/** La carica prima dell'apertura: la busta trema e il sigillo scricchiola,
 *  poi cede.
 *
 *  Prima questa fase durava quanto il dito restava premuto. Adesso basta un
 *  clic e parte da sola — la stessa animazione, ma nessuno deve piu' scoprire
 *  che andava tenuta premuta. Piu' corta di quei tre secondi apposta: una
 *  cosa che si guarda stanca prima di una che si fa. */
const DURATA_CARICA = 1200;

/**
 * Il sipario: una busta chiusa col sigillo, che all'apertura si schiude e
 * lascia il posto all'invito.
 *
 * Lo usano sia la pagina invitato sia l'editor, così chi modifica vede la
 * stessa apertura che vedrà l'ospite. Il clic serve a due cose insieme:
 * scoprire l'invito e — essendo un gesto dell'utente — permettere all'audio
 * di partire, cosa che i browser vietano senza interazione.
 */
export function Sipario({
  busta,
  titoloFallback,
  avvolgiCarta,
  lingua = "it",
  children,
}: {
  busta: Blocco | null;
  titoloFallback?: string;
  /** L'editor lo usa per rendere la busta modificabile col click destro. */
  avvolgiCarta?: (reso: ReactNode) => ReactNode;
  lingua?: Lingua;
  children: ReactNode;
}) {
  const t = dizionario(lingua);
  const [apertoAMano, setApertoAMano] = useState(false);
  const [inApertura, setInApertura] = useState(false);
  // 0 = nessuna pressione, 1 = pronta ad aprirsi. Guida sia la barra di
  // avanzamento sia quanto forte trema la busta.
  const [pressione, setPressione] = useState(0);

  const iniziata = useRef<number | null>(null);
  const fotogramma = useRef<number | null>(null);
  const fruscio = useRef<Fruscio | null>(null);

  // La musica lascia qui la sua funzione di sblocco: va chiamata dentro il
  // click. La musica poi parte da sola quando `aperto` diventa vero, cioe' a
  // busta aperta. Il perche' di questo giro sta in Apertura.tsx.
  const sbloccaMusica = useRef<(() => void) | null>(null);
  const registraSblocco = useCallback((sblocca: () => void) => {
    sbloccaMusica.current = sblocca;
  }, []);

  // Derivato invece di tenuto in stato: se la busta viene nascosta o
  // eliminata mentre si modifica, il sipario si alza da sé senza bisogno di
  // un effetto che rincorra la prop.
  const aperto = apertoAMano || busta === null;

  // Finché la busta è chiusa la pagina sotto non deve scorrere.
  useEffect(() => {
    if (aperto) return;
    const prima = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prima;
    };
  }, [aperto]);

  const chiudiFruscio = useCallback(() => {
    fruscio.current?.ferma();
    fruscio.current = null;
    if (fotogramma.current !== null) cancelAnimationFrame(fotogramma.current);
    fotogramma.current = null;
    iniziata.current = null;
  }, []);

  // Se il componente sparisce con il dito ancora giù, il rumore resterebbe
  // acceso e il contesto audio aperto.
  useEffect(() => chiudiFruscio, [chiudiFruscio]);

  function apri() {
    if (inApertura) return;
    chiudiFruscio();
    setPressione(0);
    setInApertura(true);
    // Chi ha chiesto meno animazioni salta la sequenza e passa subito.
    const ridotto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => setApertoAMano(true), ridotto ? 250 : DURATA_APERTURA);
  }

  /** Un clic e via: la carica parte da sola e in fondo apre.
   *
   *  Qui la musica viene solo **sbloccata**, non avviata: suonera' a busta
   *  aperta. Lo sblocco pero' deve stare qui, sincrono dentro il gestore del
   *  clic — e' l'unico istante in cui il browser di un telefono lo concede
   *  (vedi Apertura.tsx). */
  function carica() {
    if (inApertura || iniziata.current !== null) return;

    sbloccaMusica.current?.();
    fruscio.current = avviaFruscio();

    // Chi ha chiesto meno animazioni non deve stare a guardare: si apre e basta.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      apri();
      return;
    }

    iniziata.current = performance.now();
    const passo = (ora: number) => {
      if (iniziata.current === null) return;
      const p = Math.min(1, (ora - iniziata.current) / DURATA_CARICA);
      setPressione(p);
      fruscio.current?.intensita(p);
      if (p >= 1) apri();
      else fotogramma.current = requestAnimationFrame(passo);
    };
    fotogramma.current = requestAnimationFrame(passo);
  }

  const valore = useMemo(
    () => ({ aperto, registraSblocco }),
    [aperto, registraSblocco],
  );
  const contenuto = <Apertura.Provider value={valore}>{children}</Apertura.Provider>;

  if (busta === null || aperto) return contenuto;

  const c = busta.contenuto as TBusta;
  const scena = (
    <div
      className={`scena ${inApertura ? "scena--apre" : ""} ${pressione > 0 ? "scena--preme" : ""}`}
      style={{ "--pressione": pressione } as React.CSSProperties}
    >
      <button
        type="button"
        className="scena__tasto"
        onClick={carica}
        style={{ WebkitUserSelect: "none", userSelect: "none" }}
        aria-label={c.invito || t.apriInvito}
      >
        <FronteBusta c={c} titoloFallback={titoloFallback} lingua={lingua} decorativo />
      </button>

      <p className="scena__invito etichetta">
        {pressione > 0 ? t.siApre : c.invito || t.apriInvito}
      </p>
      {/* La barra esiste solo mentre si preme: ferma a zero sarebbe un
          elemento in piu` da capire prima ancora di aver toccato niente. */}
      {pressione > 0 && (
        <div className="scena__carica" aria-hidden="true">
          <span />
        </div>
      )}
      {c.nota && !pressione && <p className="scena__nota etichetta">{c.nota}</p>}
    </div>
  );

  return (
    <>
      <div className={`sipario ${inApertura ? "sipario--via" : ""}`}>
        {avvolgiCarta ? avvolgiCarta(scena) : scena}
      </div>
      {contenuto}
    </>
  );
}
