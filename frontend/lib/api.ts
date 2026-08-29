/* Parti condivise fra server e browser. Niente `next/headers` qui: questo
   modulo viene importato anche dai componenti client, e un import server-only
   fa fallire la build. Lato server sta in api-server.ts. */

/** Base pubblica, usata per og:url e per i link mostrati agli utenti. */
export const BASE_PUBBLICA =
  process.env.NEXT_PUBLIC_BASE_URL ?? "http://127.0.0.1:3000";

export class ErroreApi extends Error {
  constructor(
    readonly stato: number,
    messaggio: string,
  ) {
    super(messaggio);
  }
}

/**
 * Estrae il messaggio d'errore di FastAPI, che lo mette in `detail`.
 *
 * Attenzione al 422: li` `detail` non e` una stringa ma l'elenco dei campi
 * non validi, e un `String()` sopra un array di oggetti produce
 * "[object Object]" — che e` esattamente quello che l'utente si vedeva
 * comparire quando sbagliava a compilare un modulo.
 */
export async function erroreDa(risposta: Response): Promise<ErroreApi> {
  let messaggio = risposta.statusText;
  try {
    const corpo = await risposta.json();
    const dettaglio = corpo?.detail;
    if (Array.isArray(dettaglio)) {
      const messaggi = dettaglio
        .map((v: { msg?: string }) => v?.msg)
        .filter((m): m is string => typeof m === "string" && m.length > 0);
      if (messaggi.length > 0) messaggio = messaggi.join(". ");
    } else if (dettaglio) {
      messaggio = String(dettaglio);
    }
  } catch {
    // corpo non JSON: teniamo lo statusText
  }
  return new ErroreApi(risposta.status, messaggio);
}
