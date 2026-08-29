import type { Metadata } from "next";

import { API_INTERNA } from "@/lib/api-server";
import { ModuloNuovaPassword } from "./Modulo";

export const metadata: Metadata = {
  title: "Scegli una nuova password",
  robots: { index: false, follow: false },
};

/** Il link vale? Lo si chiede al server *prima* di mostrare il modulo.
 *
 *  Senza questo controllo l'utente compone una password nuova, la conferma, e
 *  scopre solo premendo Invia che il link era scaduto un'ora fa. */
async function valido(token: string): Promise<boolean> {
  try {
    const r = await fetch(
      `${API_INTERNA}/api/auth/password/verifica/${encodeURIComponent(token)}`,
      { cache: "no-store" },
    );
    if (!r.ok) return false;
    const dati = (await r.json()) as { valido: boolean };
    return dati.valido;
  } catch {
    return false;
  }
}

export default async function PaginaPassword(props: PageProps<"/password/[token]">) {
  const { token } = await props.params;
  const ok = await valido(token);

  return (
    <main className="pagina-app pagina-password">
      <h1>Scegli una nuova password</h1>
      {ok ? (
        <ModuloNuovaPassword token={token} />
      ) : (
        <>
          <p className="password-avviso">
            Questo link non è più valido: può essere scaduto (durano un&apos;ora)
            oppure essere già stato usato.
          </p>
          <p className="password-nota">
            Torna nell&apos;editor, apri <strong>Accedi</strong> e premi{" "}
            <strong>Ho dimenticato la password</strong> per farne mandare un altro.
          </p>
          <a className="tasto-ritorno" href="/edit">
            Vai all&apos;editor
          </a>
        </>
      )}
    </main>
  );
}
