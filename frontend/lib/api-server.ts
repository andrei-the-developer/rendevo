import "server-only";

import { cookies } from "next/headers";

import { erroreDa } from "./api";
import type { Aspetto, ChiSono, Evento, ModelloEvento, Risposte } from "./tipi";

/** Lato server si parla all'API sulla rete interna; il browser passa dal proxy. */
export const API_INTERNA = process.env.API_INTERNA ?? "http://127.0.0.1:8000";

/**
 * In Next 16 `fetch` non è più cachato di default, ma lo dichiariamo
 * comunque: nessuna di queste risposte va mai riusata, perché l'invito
 * cambia a ogni modifica.
 */
async function chiama<T>(
  percorso: string,
  inoltraCookie = false,
): Promise<T> {
  const intestazioni = new Headers();

  if (inoltraCookie) {
    // La proprietà degli inviti anonimi sta nel cookie di sessione: senza
    // inoltrarlo il backend non riconosce chi sta chiedendo, e risponde 404.
    const negozio = await cookies();
    const serializzato = negozio.toString();
    if (serializzato) intestazioni.set("Cookie", serializzato);
  }

  const risposta = await fetch(`${API_INTERNA}${percorso}`, {
    headers: intestazioni,
    cache: "no-store",
  });
  if (!risposta.ok) throw await erroreDa(risposta);
  return risposta.json() as Promise<T>;
}

export function invitoPubblico(token: string): Promise<Evento> {
  return chiama<Evento>(`/api/inviti/${encodeURIComponent(token)}`);
}

export function mioEvento(id: string): Promise<Evento> {
  return chiama<Evento>(`/api/eventi/${encodeURIComponent(id)}`, true);
}

/** Le risposte ricevute. Inoltra il cookie: senza, il backend non sa di chi
 *  e` l'invito e risponde 404 anche al proprietario. */
export function risposte(id: string): Promise<Risposte> {
  return chiama<Risposte>(`/api/eventi/${encodeURIComponent(id)}/risposte`, true);
}

export function modelli(): Promise<{ modelli: ModelloEvento[] }> {
  return chiama<{ modelli: ModelloEvento[] }>("/api/modelli");
}

export function aspetto(): Promise<Aspetto> {
  return chiama<Aspetto>("/api/aspetto");
}

/** Solo per l'intestazione iniziale: da lì in poi lo stato di login si
 *  aggiorna via chiamate client, senza ricaricare la pagina. */
export function chiSono(): Promise<ChiSono> {
  return chiama<ChiSono>("/api/auth/chi_sono", true);
}
