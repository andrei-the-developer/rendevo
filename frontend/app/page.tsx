import { redirect } from "next/navigation";

/**
 * In produzione questa pagina non viene mai raggiunta: su
 * `rendevo.eu` è Caddy a servire la landing statica su `/`, e verso
 * Next arrivano solo `/edit`, `/e/*`, `/i/*` e `/_next/*`.
 *
 * Esiste per lo sviluppo su `localhost:3000`, dove non c'è nessun Caddy
 * davanti: senza, aprire la radice darebbe un 404 e sembrerebbe l'app rotta.
 */
export default function Radice() {
  redirect("/edit");
}
