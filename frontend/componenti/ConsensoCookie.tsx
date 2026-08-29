"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const CHIAVE = "consenso-clarity";

/** Snippet ufficiale di Microsoft Clarity (installazione "Manual"): non solo
 *  accoda lo script, definisce anche `window.clarity` come una coda che
 *  funziona anche prima che lo script sia caricato — senza, una chiamata
 *  come `clarity('set', ...)` fatta troppo presto darebbe errore. */
function iniettaClarity(id: string) {
  if ((window as unknown as { clarity?: unknown }).clarity) return;
  /* eslint-disable */
  (function (c: any, l: Document, a: string, r: string, i: string) {
    c[a] =
      c[a] ||
      function () {
        (c[a].q = c[a].q || []).push(arguments);
      };
    const t = l.createElement(r) as HTMLScriptElement;
    t.async = true;
    t.src = "https://www.clarity.ms/tag/" + i;
    const y = l.getElementsByTagName(r)[0];
    y.parentNode!.insertBefore(t, y);
  })(window, document, "clarity", "script", id);
  /* eslint-enable */
}

/** Microsoft Clarity registra sessioni video (schermo, click, scorrimento):
 *  per il GDPR non parte prima di un consenso esplicito, non basta
 *  menzionarlo nei Termini. Stessa chiave di localStorage usata dalla
 *  landing statica (vedi landing/index.html): un solo consenso per tutto
 *  il sito, non uno per l'app e uno per la landing. */
export function ConsensoCookie({ clarityId }: { clarityId: string }) {
  const t = useTranslations("Cookie");
  const [scelta, setScelta] = useState<"accettato" | "rifiutato" | null>("accettato");

  useEffect(() => {
    const salvata = localStorage.getItem(CHIAVE);
    if (salvata === "accettato" || salvata === "rifiutato") {
      setScelta(salvata);
      if (salvata === "accettato" && clarityId) iniettaClarity(clarityId);
    } else {
      setScelta(null);
    }
  }, [clarityId]);

  if (!clarityId || scelta !== null) return null;

  function scegli(valore: "accettato" | "rifiutato") {
    localStorage.setItem(CHIAVE, valore);
    setScelta(valore);
    if (valore === "accettato") iniettaClarity(clarityId);
  }

  return (
    <div className="banner-cookie" role="region" aria-label={t("dettagli")}>
      <p>
        {t("testo")}{" "}
        <a href="/termini" target="_blank" rel="noopener noreferrer">
          {t("dettagli")}
        </a>
      </p>
      <div className="banner-cookie__azioni">
        <button type="button" className="tasto-popup" onClick={() => scegli("rifiutato")}>
          {t("rifiuta")}
        </button>
        <button
          type="button"
          className="tasto-popup tasto-popup--primario"
          onClick={() => scegli("accettato")}
        >
          {t("accetta")}
        </button>
      </div>
    </div>
  );
}
