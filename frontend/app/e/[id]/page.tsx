import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Tela } from "@/componenti/editor/Tela";
import { ErroreApi } from "@/lib/api";
import { aspetto, chiSono, mioEvento } from "@/lib/api-server";
import type { Evento } from "@/lib/tipi";

export const metadata: Metadata = {
  title: "Modifica l'invito",
  robots: { index: false, follow: false },
};

/** Il try/catch avvolge solo la chiamata: React non renderizza il JSX
 *  immediatamente, quindi un errore di render non verrebbe comunque
 *  intercettato qui. */
async function carica(id: string): Promise<Evento> {
  try {
    // Il cookie di sessione va inoltrato: è l'unico titolo di proprietà di
    // un invito creato senza registrarsi.
    return await mioEvento(id);
  } catch (e) {
    if (e instanceof ErroreApi && e.stato === 404) notFound();
    throw e;
  }
}

export default async function PaginaEditor(props: PageProps<"/e/[id]">) {
  const { id } = await props.params;
  // In parallelo: sono indipendenti.
  const [evento, registri, sessione] = await Promise.all([
    carica(id),
    aspetto(),
    chiSono(),
  ]);
  return <Tela iniziale={evento} aspetto={registri} utenteIniziale={sessione.utente} />;
}
