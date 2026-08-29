"use client";

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
  const [modo, setModo] = useState<"accedi" | "registrati" | "dimenticata">("accedi");
  const [inviato, setInviato] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inCorso, setInCorso] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);
  const idTitolo = useId();

  /** I controlli li facciamo qui, in italiano, prima di partire.
   *
   *  Il server ha gli stessi limiti (email valida, password da 8 caratteri) ma
   *  li fa rispettare con un 422, e FastAPI risponde in inglese: "String should
   *  have at least 8 characters" davanti a un modulo italiano non e` un
   *  messaggio, e` un intoppo. Il 422 resta la rete di sicurezza. */
  function controlla(): string | null {
    if (!email.includes("@") || !email.includes(".")) {
      return "L'indirizzo email non sembra valido.";
    }
    if (modo === "dimenticata") return null;    // qui basta l'email
    if (modo === "registrati" && password.length < 8) {
      return `La password deve avere almeno 8 caratteri (ne hai scritti ${password.length}).`;
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
        setErrore("Esiste già un account con questa email. Passa ad Accedi.");
        setModo("accedi");
      } else if (err instanceof ErroreApi && err.stato === 429) {
        setErrore("Troppi tentativi di seguito. Aspetta qualche minuto e riprova.");
      } else if (err instanceof TypeError) {
        // fetch fallito: rete assente, non un rifiuto del server.
        setErrore("Non riesco a raggiungere il server. Controlla la connessione.");
      } else {
        setErrore(err instanceof Error ? err.message : "Operazione non riuscita.");
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
            {modo === "accedi" && "Accedi"}
            {modo === "registrati" && "Crea un account"}
            {modo === "dimenticata" && "Password dimenticata"}
          </h2>
          <button type="button" className="popup__chiudi" onClick={onChiudi} aria-label="Chiudi">
            ×
          </button>
        </div>

        {inviato ? (
          <div className="popup__corpo">
            <p className="auth-nota">{inviato}</p>
            <p style={{ fontSize: "0.85rem", color: "#666b6e", margin: 0 }}>
              Il link vale un&apos;ora. Se non arriva entro qualche minuto,
              controlla la posta indesiderata.
            </p>
          </div>
        ) : (
        <form onSubmit={invia}>
          <div className="popup__corpo">
            {errore && <p className="errore-popup" role="alert">{errore}</p>}

            <p className="auth-nota">
              {modo === "accedi" &&
                "L'invito che stai modificando resta al suo posto: accedendo lo ritrovi collegato al tuo account."}
              {modo === "registrati" &&
                "L'invito che stai modificando in questo browser verrà collegato al nuovo account, non perso."}
              {modo === "dimenticata" &&
                "Scrivi l'indirizzo con cui ti sei registrato: ti mandiamo un link per sceglierne una nuova."}
            </p>

            <label className="campo-popup">
              <span>Email</span>
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
              <span>Password</span>
              <input
                type="password"
                required
                minLength={8}
                autoComplete={modo === "accedi" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {modo === "registrati" && <small>Almeno 8 caratteri.</small>}
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
                Ho dimenticato la password
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
              {modo === "accedi" && "Non hai un account? Registrati"}
              {modo === "registrati" && "Hai già un account? Accedi"}
              {modo === "dimenticata" && "Torna ad Accedi"}
            </button>
            <button
              type="submit"
              className="tasto-popup tasto-popup--primario a-destra"
              disabled={inCorso}
            >
              {inCorso
                ? "Un momento…"
                : modo === "accedi"
                  ? "Accedi"
                  : modo === "registrati"
                    ? "Crea l'account"
                    : "Mandami il link"}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
