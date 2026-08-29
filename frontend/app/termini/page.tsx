import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Termini");
  return {
    title: t("titolo"),
    robots: { index: false, follow: false },
  };
}

/** Statica apposta: sono termini legali, non contenuto che l'editor deve
 *  poter cambiare. Va aggiornata a mano, in tutte le lingue in
 *  `messages/*.json` (chiavi "Termini"), quando cambia qualcosa di
 *  sostanziale nel servizio. */
export default async function PaginaTermini() {
  const t = await getTranslations("Termini");

  return (
    <main className="pagina-app pagina-termini">
      <div className="termini-corpo">
        <h1>{t("titolo")}</h1>
        <p className="termini-agg">{t("ultimoAggiornamento")}</p>

        <p>{t("intro")}</p>

        <h2>{t("h1")}</h2>
        <p>{t("p1")}</p>

        <h2>{t("h2")}</h2>
        <p>{t("p2")}</p>

        <h2>{t("h3")}</h2>
        <p>{t("p3")}</p>
        <ul>
          <li>
            <strong>{t("p3Musica").split(".")[0]}.</strong>
            {" " + t("p3Musica").split(".").slice(1).join(".").trim()}
          </li>
          <li>
            <strong>{t("p3Foto").split(".")[0]}.</strong>
            {" " + t("p3Foto").split(".").slice(1).join(".").trim()}
          </li>
        </ul>
        <p>{t("p3Segnalazione")}</p>

        <h2>{t("h4")}</h2>
        <p>{t("p4")}</p>

        <h2>{t("h5")}</h2>
        <p>{t("p5")}</p>

        <h2>{t("h6")}</h2>
        <p>{t("p6")}</p>

        <h2>{t("h7")}</h2>
        <p>{t("p7")}</p>

        <h2>{t("h8")}</h2>
        <p>{t("p8")}</p>

        <h2>{t("h9")}</h2>
        <p>{t("p9")}</p>
      </div>
    </main>
  );
}
