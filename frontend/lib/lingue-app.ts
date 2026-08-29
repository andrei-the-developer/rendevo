/** Le 5 lingue dell'interfaccia (non dell'invito pubblico, vedi
 *  `lingue.ts`: sono due sistemi diversi, uno per l'organizzatore, uno per
 *  l'invitato).
 *
 *  In un file a parte, senza `next/headers`: `i18n/request.ts` lo importa
 *  lato server, ma anche i componenti client (il selettore) devono
 *  conoscere l'elenco, e non possono importare niente che dipenda da
 *  `next/headers` senza rompere la build. */
export const LINGUE_SUPPORTATE = ["it", "en", "fr", "es", "de"] as const;
export type LinguaApp = (typeof LINGUE_SUPPORTATE)[number];
export const LINGUA_DEFAULT: LinguaApp = "it";

export function linguaSupportata(v: string | undefined | null): v is LinguaApp {
  return !!v && (LINGUE_SUPPORTATE as readonly string[]).includes(v);
}
