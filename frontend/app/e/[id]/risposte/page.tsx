import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BarraRisposte } from "@/componenti/editor/BarraRisposte";
import { ErroreApi } from "@/lib/api";
import { chiSono, risposte } from "@/lib/api-server";
import { Elenco } from "./Elenco";
import type { Risposte } from "@/lib/tipi";

export const metadata: Metadata = {
  title: "Le risposte",
  robots: { index: false, follow: false },
};

async function carica(id: string): Promise<Risposte> {
  try {
    return await risposte(id);
  } catch (e) {
    // 404 anche per "non e` tuo": il backend non distingue apposta.
    if (e instanceof ErroreApi && e.stato === 404) notFound();
    throw e;
  }
}

export default async function PaginaRisposte(props: PageProps<"/e/[id]/risposte">) {
  const { id } = await props.params;
  // In parallelo: sono indipendenti, come nella pagina dell'editor.
  const [{ titolo, risposte: elenco, riepilogo }, sessione] = await Promise.all([
    carica(id),
    chiSono(),
  ]);

  return (
    <>
      <BarraRisposte eventoId={id} utenteIniziale={sessione.utente} />
      <main className="pagina-app pagina-risposte">
        <div className="risposte-testata">
          <h1>Le risposte</h1>
          {titolo && <p className="risposte-sottotitolo">{titolo}</p>}
        </div>

        {/* Il riepilogo prima dell'elenco: chi apre questa pagina vuole sapere
            quanti saranno a tavola, non leggere una lista. */}
        <div className="riepilogo">
          <div className="conteggio conteggio--forte">
            <strong>{riepilogo.ospiti}</strong>
            <span>{riepilogo.ospiti === 1 ? "persona a tavola" : "persone a tavola"}</span>
          </div>
          <div className="conteggio">
            <strong>{riepilogo.si}</strong>
            <span>{riepilogo.si === 1 ? "ha detto sì" : "hanno detto sì"}</span>
          </div>
          <div className="conteggio">
            <strong>{riepilogo.no}</strong>
            <span>{riepilogo.no === 1 ? "non viene" : "non vengono"}</span>
          </div>
          <div className="conteggio">
            <strong>{riepilogo.risposte}</strong>
            <span>{riepilogo.risposte === 1 ? "risposta" : "risposte in tutto"}</span>
          </div>
        </div>

        <Elenco eventoId={id} risposte={elenco} />
      </main>
    </>
  );
}
