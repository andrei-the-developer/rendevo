/* Unico punto di smistamento tipo → componente.
   Lo usano sia la pagina invitato sia l'editor: se un blocco si vede in un
   modo, si vede in quel modo in entrambi. Non esiste un secondo renderer. */

import type { Lingua } from "@/lib/lingue";
import type { Blocco as TBlocco } from "@/lib/tipi";
import { FronteBusta } from "./CartaBusta";
import { Countdown, Galleria, Musica, Rsvp } from "./Interattivi";
import { Hero, Luogo, type MappaAsset, Nota, Programma, Testo } from "./Presentazionali";

export interface PropsBlocco {
  blocco: TBlocco;
  asset: MappaAsset;
  /** Presente solo sulla pagina invitato: abilita l'invio della risposta. */
  token?: string;
  /** Nasconde la spunta "vengo accompagnato" nel modulo risposte. */
  senzaAccompagnatori?: boolean;
  /** Lingua delle parole scritte dentro i componenti. */
  lingua?: Lingua;
  /** Titolo dell'hero, di riserva se la busta non ha un titolo proprio. */
  titoloFallback?: string;
}

/** I fiori ai lati della sezione.
 *
 *  Vivono qui e non nell'editor perche' devono vedersi identici nei due posti:
 *  sono decorazione dell'invito, non un aiuto alla modifica.
 *
 *  Il fiore di destra e' lo stesso file ribaltato con `scaleX(-1)`: due
 *  copie speculari dello stesso disegno ai due lati leggono come una cornice,
 *  la stessa immagine ripetuta identica legge come una svista. */
export function Fiori({ c }: { c: TBlocco["contenuto"] }) {
  const sx = c.fiore_sx;
  const dx = c.fiore_dx;
  if (!sx && !dx) return null;
  return (
    <>
      {sx && (
        <span
          className="fiore fiore--sx"
          data-fiore={sx}
          data-altezza={c.altezza_sx || "meta"}
          aria-hidden="true"
        />
      )}
      {dx && (
        <span
          className="fiore fiore--dx"
          data-fiore={dx}
          data-altezza={c.altezza_dx || "meta"}
          aria-hidden="true"
        />
      )}
    </>
  );
}

export function Blocco({ blocco, asset, token, senzaAccompagnatori, lingua, titoloFallback }: PropsBlocco) {
  const c = blocco.contenuto;

  return (
    <>
      <Fiori c={c} />
      <PerTipo
        blocco={blocco}
        asset={asset}
        token={token}
        senzaAccompagnatori={senzaAccompagnatori}
        lingua={lingua}
        titoloFallback={titoloFallback}
      />
    </>
  );
}

function PerTipo({ blocco, asset, token, senzaAccompagnatori, lingua, titoloFallback }: PropsBlocco) {
  const c = blocco.contenuto;

  switch (c.tipo) {
    // Sulla pagina invitato la busta è il sipario davanti a tutto — la
    // disegna Sipario, e ListaBlocchi la esclude dal flusso (`salta`).
    // Nell'editor invece non c'è alcun sipario: è solo un blocco come gli
    // altri, mostrato chiuso, modificabile con lo stesso click di tutti.
    case "busta":
      return (
        <div className="blocco-busta-inline">
          <FronteBusta c={c} titoloFallback={titoloFallback} lingua={lingua} />
        </div>
      );
    case "hero":
      return <Hero c={c} asset={asset} lingua={lingua} />;
    case "testo":
      return <Testo c={c} />;
    case "countdown":
      return <Countdown c={c} lingua={lingua} />;
    case "programma":
      return <Programma c={c} />;
    case "luogo":
      return <Luogo c={c} lingua={lingua} />;
    case "galleria":
      return <Galleria c={c} asset={asset} lingua={lingua} />;
    case "nota":
      return <Nota c={c} />;
    case "musica":
      return <Musica c={c} asset={asset} lingua={lingua} />;
    case "rsvp":
      return <Rsvp c={c} token={token} senzaAccompagnatori={senzaAccompagnatori} lingua={lingua} />;
    default: {
      // Se il backend introduce un tipo che il frontend non conosce ancora,
      // non buttiamo giù la pagina: quel blocco semplicemente non si vede.
      const _mai: never = c;
      void _mai;
      return null;
    }
  }
}
