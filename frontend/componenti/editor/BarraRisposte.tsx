"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { SelettoreLingua } from "@/componenti/SelettoreLingua";
import { esci } from "@/lib/api-client";
import type { Utente } from "@/lib/tipi";
import { Autenticazione } from "./Autenticazione";
import { SceltaInvito } from "./SceltaInvito";

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
  const t = useTranslations("Barra");
  const [utente, setUtente] = useState(utenteIniziale);
  const [mostraAuth, setMostraAuth] = useState(false);
  const [messaggio, setMessaggio] = useState<string | null>(null);

  async function disconnetti() {
    try {
      await esci();
      setUtente(null);
    } catch (e) {
      setMessaggio(e instanceof Error ? e.message : t("erroreEsci"));
    }
  }

  return (
    <div className="barra-editor">
      <Link href={`/e/${eventoId}`} className="tasto-barra">
        {t("tornaAllInvito")}
      </Link>

      {utente && <SceltaInvito correnteId={eventoId} />}

      <SelettoreLingua />

      <span className="barra-editor__spazio" />

      {messaggio && <span style={{ color: "#f0b8b2" }}>{messaggio}</span>}

      {utente ? (
        <div className="barra-editor__utente">
          <span className="barra-editor__email" title={utente.email}>
            {utente.email}
          </span>
          <button type="button" className="tasto-barra" onClick={disconnetti}>
            {t("esci")}
          </button>
        </div>
      ) : (
        <button type="button" className="tasto-barra" onClick={() => setMostraAuth(true)}>
          {t("accedi")}
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
