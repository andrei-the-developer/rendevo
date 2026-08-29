"use client";

import Link from "next/link";
import { useState } from "react";

import { esci } from "@/lib/api-client";
import type { Utente } from "@/lib/tipi";
import { Autenticazione } from "./Autenticazione";

/** La stessa barra scura dell'editor, ridotta a quello che serve qui: si
 *  torna all'invito e si vede chi ha fatto login. Senza, questa pagina era
 *  l'unica dell'app senza intestazione, e da qui non si capiva nemmeno se si
 *  era ancora autenticati. */
export function BarraRisposte({
  eventoId,
  utenteIniziale,
}: {
  eventoId: string;
  utenteIniziale: Utente | null;
}) {
  const [utente, setUtente] = useState(utenteIniziale);
  const [mostraAuth, setMostraAuth] = useState(false);
  const [messaggio, setMessaggio] = useState<string | null>(null);

  async function disconnetti() {
    try {
      await esci();
      setUtente(null);
    } catch (e) {
      setMessaggio(e instanceof Error ? e.message : "Non riesco a uscire");
    }
  }

  return (
    <div className="barra-editor">
      <Link href={`/e/${eventoId}`} className="tasto-barra">
        Torna all&apos;invito
      </Link>

      <span className="barra-editor__spazio" />

      {messaggio && <span style={{ color: "#f0b8b2" }}>{messaggio}</span>}

      {utente ? (
        <div className="barra-editor__utente">
          <span className="barra-editor__email" title={utente.email}>
            {utente.email}
          </span>
          <button type="button" className="tasto-barra" onClick={disconnetti}>
            Esci
          </button>
        </div>
      ) : (
        <button type="button" className="tasto-barra" onClick={() => setMostraAuth(true)}>
          Accedi
        </button>
      )}

      {mostraAuth && (
        <Autenticazione
          onChiudi={() => setMostraAuth(false)}
          onAutenticato={(u) => {
            setUtente(u);
            setMostraAuth(false);
          }}
        />
      )}
    </div>
  );
}
