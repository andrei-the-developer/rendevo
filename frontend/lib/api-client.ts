import { erroreDa } from "./api";
import type { ChiSono, Evento, Operazione } from "./tipi";

/** Nel browser le chiamate passano da /api sullo stesso origin (vedi i
 *  rewrites in next.config): il cookie di sessione viaggia da solo. */
export async function chiamaClient<T>(
  percorso: string,
  opzioni: RequestInit = {},
): Promise<T> {
  const risposta = await fetch(percorso, {
    ...opzioni,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(opzioni.headers ?? {}) },
  });
  if (!risposta.ok) throw await erroreDa(risposta);
  // 204 = nessun contenuto. `json()` su un corpo vuoto solleva
  // "Unexpected end of JSON input", e chi chiamava vedeva un errore per una
  // richiesta andata a buon fine — e` successo davvero con la cancellazione
  // delle risposte.
  if (risposta.status === 204) return undefined as T;
  return risposta.json() as Promise<T>;
}

/** Upload multipart: niente Content-Type manuale, il browser deve fissare da
 *  sé il boundary. `chiamaClient` lo forzerebbe a application/json e
 *  romperebbe l'invio del file. */
async function carica<T>(percorso: string, corpo: FormData): Promise<T> {
  const risposta = await fetch(percorso, {
    method: "POST",
    credentials: "include",
    body: corpo,
  });
  if (!risposta.ok) throw await erroreDa(risposta);
  return risposta.json() as Promise<T>;
}

export interface AssetCaricato {
  id: string;
  tipo: string;
  chiave: string;
  larghezza: number | null;
  altezza: number | null;
}

export function caricaAsset(eventoId: string, file: File): Promise<AssetCaricato> {
  const corpo = new FormData();
  corpo.append("file", file);
  return carica<AssetCaricato>(`/api/eventi/${eventoId}/asset`, corpo);
}

export function registrati(
  email: string,
  password: string,
  codice?: string,
): Promise<ChiSono> {
  return chiamaClient<ChiSono>("/api/auth/registrati", {
    method: "POST",
    body: JSON.stringify({ email, password, codice: codice || undefined }),
  });
}

export function accedi(email: string, password: string): Promise<ChiSono> {
  return chiamaClient<ChiSono>("/api/auth/accedi", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/** Chiede il link per reimpostare la password. Risponde sempre allo stesso
 *  modo, esista o no l'indirizzo: e' voluto, vedi il backend. */
export function passwordDimenticata(email: string): Promise<{ messaggio: string }> {
  return chiamaClient<{ messaggio: string }>("/api/auth/password/dimenticata", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function reimpostaPassword(token: string, password: string): Promise<ChiSono> {
  return chiamaClient<ChiSono>("/api/auth/password/reimposta", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
}

export function esci(): Promise<{ ok: boolean }> {
  return chiamaClient<{ ok: boolean }>("/api/auth/esci", { method: "POST" });
}

export function applicaOperazioni(
  eventoId: string,
  operazioni: Operazione[],
  versione: number,
): Promise<Evento> {
  return chiamaClient<Evento>(`/api/eventi/${eventoId}/operazioni`, {
    method: "POST",
    body: JSON.stringify({ operazioni, versione }),
  });
}
