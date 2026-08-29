"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { chiamaClient } from "@/lib/api-client";
import type { Risposta } from "@/lib/tipi";

/** Data e ora in italiano.
 *
 *  `locale` **e** `timeZone` scritti a mano, tutti e due. Senza il locale la
 *  riga cambia formato; senza il fuso cambia l'ora — il server gira in UTC
 *  dentro il container e il browser sta a Roma, quindi la stessa risposta
 *  usciva "18:41" dal server e "20:41" nel browser. React se ne accorgeva e
 *  segnalava un errore di idratazione (#418) a ogni caricamento.
 *
 *  Roma fisso e non il fuso di chi guarda: queste ore servono a chi organizza
 *  la festa, e la festa e` in Italia. */
function quando(iso: string): string {
  return new Date(iso).toLocaleString("it-IT", {
    timeZone: "Europe/Rome",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** L'elenco delle risposte, con la cancellazione.
 *
 *  Client component perche' cancellare e' un'azione: il resto della pagina
 *  resta renderizzato sul server. Dopo la cancellazione si chiede a Next di
 *  rileggere la pagina (`router.refresh`), cosi' i conteggi in cima si
 *  aggiornano dallo stesso posto che li ha calcolati — invece di ricalcolarli
 *  qui e rischiare due numeri diversi.
 */
export function Elenco({
  eventoId,
  risposte,
}: {
  eventoId: string;
  risposte: Risposta[];
}) {
  const router = useRouter();
  const [inCorso, setInCorso] = useState<string | null>(null);
  const [errore, setErrore] = useState<string | null>(null);
  const [conferma, setConferma] = useState<string | null>(null);

  async function cancella(id: string) {
    setInCorso(id);
    setErrore(null);
    try {
      await chiamaClient(`/api/eventi/${eventoId}/risposte/${id}`, {
        method: "DELETE",
      });
      setConferma(null);
      router.refresh();
    } catch (e) {
      setErrore(e instanceof Error ? e.message : "Non riesco a cancellarla.");
    } finally {
      setInCorso(null);
    }
  }

  if (risposte.length === 0) {
    return (
      <p className="risposte-vuoto">
        Ancora nessuna risposta. Appena qualcuno apre il tuo invito e ti dice se
        ci sarà, lo trovi qui.
      </p>
    );
  }

  return (
    <>
      {errore && (
        <p className="password-avviso" role="alert">
          {errore}
        </p>
      )}
      <ul className="elenco-risposte">
        {risposte.map((r) => (
          <li key={r.id} className="risposta" data-presente={r.presente}>
            <div className="risposta__capo">
              <span className="risposta__nome">{r.referente}</span>
              <span className="risposta__esito">
                {r.presente ? "Ci sarà" : "Non ci sarà"}
              </span>
              <span className="risposta__quando">{quando(r.creato_il)}</span>
            </div>

            {r.presente && (
              <p className="risposta__ospiti">
                <span className="etichetta-riga">
                  {r.totale === 1 ? "Viene da solo:" : `In tutto ${r.totale}:`}
                </span>{" "}
                {[r.referente, ...r.ospiti].join(", ")}
              </p>
            )}

            {r.note && (
              <p className="risposta__note">
                <span className="etichetta-riga">Note sul menu:</span> {r.note}
              </p>
            )}

            {r.messaggio && <p className="risposta__messaggio">“{r.messaggio}”</p>}

            {/* Due passaggi, non uno: una risposta cancellata non torna, e il
                tasto sta accanto a righe che si scorrono in fretta. */}
            <div className="risposta__azioni">
              {conferma === r.id ? (
                <>
                  <span className="risposta__domanda">Cancellarla davvero?</span>
                  <button
                    type="button"
                    className="tasto-riga tasto-riga--pericolo"
                    disabled={inCorso === r.id}
                    onClick={() => void cancella(r.id)}
                  >
                    {inCorso === r.id ? "Cancello…" : "Sì, cancella"}
                  </button>
                  <button
                    type="button"
                    className="tasto-riga"
                    onClick={() => setConferma(null)}
                  >
                    Annulla
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="tasto-riga"
                  onClick={() => setConferma(r.id)}
                >
                  Cancella
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
