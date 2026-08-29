"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ErroreApi } from "@/lib/api";
import { reimpostaPassword } from "@/lib/api-client";

export function ModuloNuovaPassword({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [conferma, setConferma] = useState("");
  const [errore, setErrore] = useState<string | null>(null);
  const [inCorso, setInCorso] = useState(false);
  const [fatto, setFatto] = useState(false);

  async function invia(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setErrore(`La password deve avere almeno 8 caratteri (ne hai scritti ${password.length}).`);
      return;
    }
    // La conferma esiste per un motivo solo: qui non c'e' modo di accorgersi
    // di un errore di battitura, perche' subito dopo si entra senza rifare
    // il login. Un refuso si scoprirebbe fra una settimana.
    if (password !== conferma) {
      setErrore("Le due password non coincidono.");
      return;
    }
    setInCorso(true);
    setErrore(null);
    try {
      await reimpostaPassword(token, password);
      setFatto(true);
      // Il server ha gia' agganciato la sessione all'account: si entra
      // direttamente, senza far ridigitare la password appena scelta.
      router.replace("/edit");
    } catch (err) {
      if (err instanceof ErroreApi && err.stato === 400) {
        setErrore("Questo link non è più valido. Chiedine un altro dall'editor.");
      } else {
        setErrore(err instanceof Error ? err.message : "Non è stato possibile cambiarla.");
      }
      setInCorso(false);
    }
  }

  if (fatto) {
    return <p className="password-nota">Fatto. Ti porto nell&apos;editor…</p>;
  }

  return (
    <form className="modulo-password" onSubmit={invia}>
      {errore && (
        <p className="errore-popup" role="alert">
          {errore}
        </p>
      )}

      <label className="campo-popup">
        <span>Nuova password</span>
        <input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <small>Almeno 8 caratteri.</small>
      </label>

      <label className="campo-popup">
        <span>Ripetila</span>
        <input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={conferma}
          onChange={(e) => setConferma(e.target.value)}
        />
      </label>

      <button
        type="submit"
        className="tasto-popup tasto-popup--primario"
        disabled={inCorso}
      >
        {inCorso ? "Un momento…" : "Salva ed entra"}
      </button>
    </form>
  );
}
