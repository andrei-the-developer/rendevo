import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import {
  Cormorant_Garamond,
  Great_Vibes,
  Italiana,
  Jost,
  Noto_Sans,
  Noto_Serif,
  Parisienne,
  Pinyon_Script,
  Playfair_Display,
  Tangerine,
} from "next/font/google";

import { ConsensoCookie } from "@/componenti/ConsensoCookie";
import { BASE_PUBBLICA } from "@/lib/api";
import "./temi.css";
import "./blocchi.css";
import "./guscio.css";

// I font si auto-ospitano alla build: nessuna chiamata a Google a runtime,
// che è anche quello che ci chiede il vincolo self-hosted.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});
// Serif alto e stretto: il carattere del tema romantico.
const italiana = Italiana({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-italiana",
  display: "swap",
});
// I caratteri scelti dall'utente per i titoli. Anche questi auto-ospitati
// alla build: sono sette famiglie in piu' nel bundle dei font, ma sono file
// piccoli e vengono scaricati solo quando la pagina li usa davvero.
const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});
const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-great-vibes",
  display: "swap",
});
const pinyon = Pinyon_Script({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pinyon",
  display: "swap",
});
const parisienne = Parisienne({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-parisienne",
  display: "swap",
});
// Tangerine ha un'asta molto sottile: serve anche il grassetto, o ai corpi
// piccoli sparisce.
const tangerine = Tangerine({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-tangerine",
  display: "swap",
});

// Per il greco: nessuno dei caratteri sopra ha l'alfabeto greco — ne' i
// serif ne' i corsivi calligrafici. Senza questi due, la pagina /gr
// ripiegherebbe sul carattere di sistema, diverso da dispositivo a
// dispositivo. Noto e` la famiglia fatta apposta per coprire gli alfabeti.
const notoSerif = Noto_Serif({
  subsets: ["latin", "greek"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-noto-serif",
  display: "swap",
});
const notoSans = Noto_Sans({
  subsets: ["latin", "greek"],
  weight: ["300", "400", "500"],
  variable: "--font-noto-sans",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
  // Senza metadataBase un og:image relativo è un errore di build, e per i
  // crawler delle chat serve comunque assoluto.
  metadataBase: new URL(BASE_PUBBLICA),
  title: "Inviti digitali",
  description: "Crea un invito, condividi un link, raccogli le risposte.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messaggi = await getMessages();
  const variabili = [
    cormorant.variable, italiana.variable, jost.variable,
    playfair.variable, greatVibes.variable, pinyon.variable,
    parisienne.variable, tangerine.variable,
    notoSerif.variable, notoSans.variable,
  ].join(" ");

  return (
    <html lang={locale} data-scroll-behavior="smooth">
      <head>
        {/* Il sipario si alza col JavaScript: senza, resterebbe chiuso per
            sempre e l'invito sarebbe irraggiungibile. */}
        <noscript>
          <style>{".sipario{display:none!important}"}</style>
        </noscript>
      </head>
      <body className={variabili}>
        <NextIntlClientProvider locale={locale} messages={messaggi}>
          {children}
          {/* Letto qui, lato server, e passato come prop: e' l'unico modo per
              cui un valore d'ambiente arrivi al browser senza che debba
              essere gia' presente al momento della build (che qui gira
              senza le variabili del `.env`, solo `docker compose up` le
              inietta). */}
          <ConsensoCookie clarityId={process.env.CLARITY_ID ?? ""} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
