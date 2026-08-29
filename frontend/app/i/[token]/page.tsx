import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { ListaBlocchi } from "@/componenti/blocchi/ListaBlocchi";
import { Sipario } from "@/componenti/blocchi/Sipario";
import { ErroreApi } from "@/lib/api";
import { invitoPubblico } from "@/lib/api-server";
import { CODICE_HTML, type Lingua } from "@/lib/lingue";
import type { Evento, Hero } from "@/lib/tipi";

// Rendevo non ha (ancora) un modo per l'invitato di scegliere la lingua
// dell'invito: era una proprieta' dell'indirizzo (/ro, /gr, /es) su un solo
// evento hardcoded, debito ereditato dal progetto originale. Qui resta fissa
// su "it" finche' non torna una vera funzione multi-lingua per-invito.
const LINGUA_FISSA: Lingua = "it";

/** Il crawler di WhatsApp non esegue JavaScript: questi dati devono essere
 *  già nell'HTML della prima risposta, ed è per questo che la pagina è
 *  renderizzata sul server. */
function riassunto(evento: Evento) {
  const hero = evento.blocchi.find((b) => b.tipo === "hero")?.contenuto as
    | Hero
    | undefined;
  const titolo = hero?.titolo?.trim() || "Sei invitato";
  return { titolo };
}

async function carica(token: string): Promise<Evento | "scaduto"> {
  try {
    return await invitoPubblico(token);
  } catch (e) {
    if (e instanceof ErroreApi && e.stato === 410) return "scaduto";
    if (e instanceof ErroreApi && e.stato === 404) notFound();
    throw e;
  }
}

export async function generateMetadata(
  props: PageProps<"/i/[token]">,
): Promise<Metadata> {
  const { token } = await props.params;
  const evento = await carica(token);

  if (evento === "scaduto") {
    return { title: "Link non più valido", robots: { index: false } };
  }

  // Caddy puo' riscrivere un indirizzo pubblico piu' corto su questo
  // percorso col token: se lo fa, dice anche qual era in questo header, cosi'
  // `og:url` riporta l'indirizzo che la gente ha davvero in mano.
  const intestazioni = await headers();
  const pubblico = intestazioni.get("x-invito-percorso");
  const lingua = LINGUA_FISSA;

  const { titolo } = riassunto(evento);
  // Niente data nell'anteprima: nella riga di WhatsApp c'e' spazio per poco,
  // e "17 ottobre 2026." se lo mangiava tutto senza dire niente che l'invito
  // non dica meglio da solo.
  const descrizione = "Facci sapere se ci sarai.";

  return {
    title: titolo,
    description: descrizione,
    // Un invito non va indicizzato: lo si raggiunge solo col link.
    robots: { index: false, follow: false },
    openGraph: {
      title: titolo,
      description: descrizione,
      url: pubblico || `/i/${token}`,
      type: "website",
      locale: "it_IT",
      // La busta col sigillo, sempre — non la foto di copertina dell'invito.
      //
      // Tre motivi. Chi non ha caricato nessuna foto restava senza immagine e
      // su WhatsApp vedeva il rettangolo grigio. Una foto qualsiasi ritagliata
      // a 1,91:1 esce quasi sempre male, e nell'anteprima non c'e' modo di
      // scegliere il ritaglio. E soprattutto: la sorpresa dell'invito e'
      // aprirlo, mentre l'anteprima con la foto degli sposi la brucia prima
      // ancora che si tocchi il link.
      //
      // Risolta contro metadataBase: i crawler vogliono l'assoluto.
      images: [
        {
          url: "/og-invito.jpg",
          width: 1200,
          height: 630,
          alt: "Una busta chiusa da un sigillo di ceralacca",
        },
      ],
    },
  };
}

export default async function PaginaInvito(props: PageProps<"/i/[token]">) {
  const { token } = await props.params;
  const evento = await carica(token);

  // Il link "semplice": chi arriva da /invito puo' solo dire se viene e come
  // si chiama, senza la spunta degli accompagnatori. E` una proprieta`
  // dell'indirizzo, non dell'invito: lo stesso invito ha due link.
  const intestazioni = await headers();
  const senzaAccompagnatori = intestazioni.get("x-invito-semplice") === "1";
  const lingua = LINGUA_FISSA;

  if (evento === "scaduto") {
    return (
      <main className="pagina-errore">
        <div>
          <h1>Questo link non è più valido</h1>
          <p>
            Era un link temporaneo e nel frattempo è scaduto. Chiedi a chi ti ha
            invitato di mandartene uno aggiornato.
          </p>
        </div>
      </main>
    );
  }

  const busta = evento.blocchi.find((b) => b.tipo === "busta") ?? null;
  const hero = evento.blocchi.find((b) => b.tipo === "hero")?.contenuto as
    | Hero
    | undefined;

  return (
    <div
      data-tema={evento.tema}
      data-palette={evento.palette}
      data-carattere={evento.carattere}
      data-lingua={lingua}
      lang={CODICE_HTML[lingua]}
    >
      <Sipario busta={busta} titoloFallback={hero?.titolo} lingua={lingua}>
        <ListaBlocchi
          evento={evento}
          token={token}
          senzaAccompagnatori={senzaAccompagnatori}
          lingua={lingua}
          salta={["busta"]}
        />
        <div className="coda" />
      </Sipario>
    </div>
  );
}
