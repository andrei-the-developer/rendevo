"use client";

import { useEffect } from "react";

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

/** SENZA BANNER PER SCELTA DI ANDREI, per ora: Clarity parte sempre, senza
 *  chiedere consenso. Non è la configurazione finale — il banner
 *  "Accetta/Rifiuta" (con le sue traduzioni in `messages/*.json` e lo
 *  stile `.banner-cookie` in `guscio.css`) torna quando lo si rimette qui,
 *  vedi la cronologia git di questo file per la versione con il gate. */
export function ConsensoCookie({ clarityId }: { clarityId: string }) {
  useEffect(() => {
    if (clarityId) iniettaClarity(clarityId);
  }, [clarityId]);

  return null;
}
