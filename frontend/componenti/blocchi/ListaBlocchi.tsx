import { Fragment, type ReactNode } from "react";

import type { Lingua } from "@/lib/lingue";
import type { Blocco as TBlocco, Evento, Hero, TipoBlocco } from "@/lib/tipi";
import { Blocco } from "./Blocco";

/** Avvolge un blocco. L'editor lo usa per aggiungere targa e click destro;
 *  la pagina invitato non lo passa affatto. */
export type Avvolgi = (
  blocco: TBlocco,
  indice: number,
  reso: ReactNode,
) => ReactNode;

/**
 * Unico posto che percorre la lista dei blocchi.
 *
 * Esiste perché l'ornamento fra le sezioni ha bisogno che i blocchi siano
 * fratelli nel DOM: se la pagina invitato li rendesse nudi e l'editor li
 * avvolgesse in un div, il selettore `+` funzionerebbe solo in una delle due
 * e il fregio comparirebbe all'ospite ma non a chi sta modificando. Con la
 * stessa struttura in entrambe, quel rischio non esiste.
 */
export function ListaBlocchi({
  evento,
  token,
  senzaAccompagnatori = false,
  lingua = "it",
  avvolgi,
  salta = [],
}: {
  evento: Evento;
  token?: string;
  /** Variante del modulo risposte senza la spunta "vengo accompagnato".
   *  Dipende dall'indirizzo da cui si e' arrivati, non dall'invito: lo stesso
   *  invito ha due link, uno che la mostra e uno che non la mostra. */
  senzaAccompagnatori?: boolean;
  /** Lingua dell'interfaccia. Il contenuto e' gia' tradotto a monte. */
  lingua?: Lingua;
  avvolgi?: Avvolgi;
  /** Tipi resi altrove: la busta la disegna il sipario, non il flusso. */
  salta?: TipoBlocco[];
}) {
  const visibili = evento.blocchi.filter((b) => !salta.includes(b.tipo));
  // Se la busta non ha un titolo proprio, mostra quello della copertina:
  // serve sia al sipario dell'ospite sia al blocco in linea dell'editor.
  const titoloHero = (
    evento.blocchi.find((b) => b.tipo === "hero")?.contenuto as Hero | undefined
  )?.titolo;

  return (
    <>
      {visibili.map((blocco, i) => {
        const reso = (
          <Blocco
            blocco={blocco}
            asset={evento.asset}
            token={token}
            senzaAccompagnatori={senzaAccompagnatori}
            lingua={lingua}
            titoloFallback={titoloHero}
          />
        );
        return avvolgi ? (
          <Fragment key={blocco.id}>{avvolgi(blocco, i, reso)}</Fragment>
        ) : (
          <div className="blocco-guscio" key={blocco.id}>
            {reso}
          </div>
        );
      })}
    </>
  );
}
