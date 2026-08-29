import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import { LINGUA_DEFAULT, type LinguaApp, linguaSupportata } from "@/lib/lingue-app";

/** Il primo header `Accept-Language` che riconosciamo, in ordine di
 *  preferenza del browser. Senza libreria: il formato è sempre
 *  "it-IT,it;q=0.9,en;q=0.8", e a noi basta il prefisso di due lettere. */
function daAcceptLanguage(intestazione: string | null): LinguaApp | null {
  if (!intestazione) return null;
  for (const voce of intestazione.split(",")) {
    const codice = voce.split(";")[0]?.trim().slice(0, 2).toLowerCase();
    if (linguaSupportata(codice)) return codice;
  }
  return null;
}

export default getRequestConfig(async () => {
  const dalCookie = (await cookies()).get("locale")?.value;
  let locale: LinguaApp = LINGUA_DEFAULT;

  if (linguaSupportata(dalCookie)) {
    locale = dalCookie;
  } else {
    // Nessuna scelta esplicita ancora: la lingua del browser, non sempre
    // l'italiano — e` la richiesta esplicita di Andrei.
    const rilevata = daAcceptLanguage((await headers()).get("accept-language"));
    if (rilevata) locale = rilevata;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
