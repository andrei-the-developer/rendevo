"use client";

import { useTranslations } from "next-intl";
import { useId, useState } from "react";

import { accedi, passwordDimenticata, registrati } from "@/lib/api-client";
import { ErroreApi } from "@/lib/api";
import type { Utente } from "@/lib/tipi";

/** Login e registrazione nello stesso modulo, con un solo interruttore fra
 *  i due — sono la stessa cosa vista dai due lati, non due schermate. */
export function Autenticazione({
  onAutenticato,
  onChiudi,
}: {
  onAutenticato: (utente: Utente) => void;
  onChiudi: () => void;
}) {
  const t = useTranslations("Auth");
  const [modo, setModo] = useState<"accedi" | "registrati" | "dimenticata">("accedi");
  const [inviato, setInviato] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inCorso, setInCorso] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);
  const idTitolo = useId();

  /** I controlli li facciamo qui, nella lingua dell'interfaccia, prima di
   *  partire.
   *
   *  Il server ha gli stessi limiti (email valida, password da 8 caratteri) ma
   *  li fa rispettare con un 422, e FastAPI risponde sempre in italiano: un
   *  messaggio in un'altra lingua dell'interfaccia non e` un messaggio, e`
   *  un intoppo. Il 422 resta la rete di sicurezza. */
  function controlla(): string | null {
    if (!email.includes("@") || !email.includes(".")) {
      return t("erroreEmailNonValida");
    }
    if (modo === "dimenticata") return null;    // qui basta l'email
    if (modo === "registrati" && password.length < 8) {
      return t("errorePasswordCorta", { n: password.length });
    }
    return null;
  }

  async function invia(e: React.FormEvent) {
    e.preventDefault();
    const problema = controlla();
    if (problema) {
      setErrore(problema);
      return;
    }
    setInCorso(true);
    setErrore(null);
    try {
      if (modo === "dimenticata") {
        const { messaggio } = await passwordDimenticata(email);
        setInviato(messaggio);
        return;
      }
      const risposta =
        modo === "accedi" ? await accedi(email, password) : await registrati(email, password);
      if (risposta.utente) onAutenticato(risposta.utente);
    } catch (err) {
      // 409 = email gia` registrata. E` l'errore piu` facile da prendere, ed e`
      // anche l'unico che si risolve da solo cambiando modo: glielo diciamo.
      if (err instanceof ErroreApi && err.stato === 409) {
        setErrore(t("erroreEmailEsistente"));
        setModo("accedi");
      } else if (err instanceof ErroreApi && err.stato === 429) {
        setErrore(t("erroreTroppiTentativi"));
      } else if (err instanceof TypeError) {
        // fetch fallito: rete assente, non un rifiuto del server.
        setErrore(t("erroreRete"));
      } else {
        setErrore(err instanceof Error ? err.message : t("erroreGenerico"));
      }
    } finally {
      setInCorso(false);
    }
  }

  return (
    <div
      className="velo-popup"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onChiudi();
      }}
    >
      <div
        className="popup popup--auth"
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitolo}
      >
        <div className="popup__testata">
          <h2 id={idTitolo}>
            {modo === "accedi" && t("titoloAccedi")}
            {modo === "registrati" && t("titoloRegistrati")}
            {modo === "dimenticata" && t("titoloDimenticata")}
          </h2>
          <button type="button" className="popup__chiudi" onClick={onChiudi} aria-label={t("chiudi")}>
            ×
          </button>
        </div>

        {inviato ? (
          <div className="popup__corpo">
            <p className="auth-nota">{inviato}</p>
            <p style={{ fontSize: "0.85rem", color: "#666b6e", margin: 0 }}>
              {t("inviatoNota")}
            </p>
          </div>
        ) : (
        <form onSubmit={invia}>
          <div className="popup__corpo">
            {errore && <p className="errore-popup" role="alert">{errore}</p>}

            <p className="auth-nota">
              {modo === "accedi" && t("notaAccedi")}
              {modo === "registrati" && t("notaRegistrati")}
              {modo === "dimenticata" && t("notaDimenticata")}
            </p>

            {modo === "registrati" && (
              <p className="auth-nota" style={{ fontSize: "0.78rem" }}>
                {t.rich("consensoTermini", {
                  link: (chunks) => (
                    <a href="/termini" target="_blank" rel="noopener noreferrer">
                      {chunks}
                    </a>
                  ),
                })}
              </p>
            )}

            <label className="campo-popup">
              <span>{t("email")}</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            {modo !== "dimenticata" && (
            <label className="campo-popup">
              <span>{t("password")}</span>
              <input
                type="password"
                required
                minLength={8}
                autoComplete={modo === "accedi" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {modo === "registrati" && <small>{t("passwordSuggerimento")}</small>}
            </label>
            )}

            {modo === "accedi" && (
              <button
                type="button"
                className="auth-collegamento"
                onClick={() => {
                  setModo("dimenticata");
                  setErrore(null);
                }}
              >
                {t("passwordDimenticataLink")}
              </button>
            )}
          </div>

          <div className="popup__azioni">
            <button
              type="button"
              className="tasto-popup"
              onClick={() => {
                setModo((m) => (m === "registrati" ? "accedi" : m === "accedi" ? "registrati" : "accedi"));
                setErrore(null);
              }}
            >
              {modo === "accedi" && t("vaiARegistrati")}
              {modo === "registrati" && t("vaiAAccedi")}
              {modo === "dimenticata" && t("tornaAccedi")}
            </button>
            <button
              type="submit"
              className="tasto-popup tasto-popup--primario a-destra"
              disabled={inCorso}
            >
              {inCorso
                ? t("inCorso")
                : modo === "accedi"
                  ? t("bottoneAccedi")
                  : modo === "registrati"
                    ? t("bottoneRegistrati")
                    : t("bottoneDimenticata")}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
