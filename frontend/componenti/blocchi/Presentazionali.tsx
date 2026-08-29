/* Blocchi senza interattività. Nessun 'use client': funzionano sia dentro
   l'albero server della pagina invitato, sia dentro quello client
   dell'editor. È questo che rende identico ciò che vedono i due. */

import { Fragment } from "react";

import { dataLunga, separaNomi } from "@/lib/formato";
import { dizionario, type Lingua } from "@/lib/lingue";
import type {
  DatiAsset,
  Hero as THero,
  Luogo as TLuogo,
  Nota as TNota,
  Programma as TProgramma,
  Testo as TTesto,
} from "@/lib/tipi";

export type MappaAsset = Record<string, DatiAsset>;

export function urlImmagine(chiave: string, misura = "media"): string {
  return `/media/${chiave}-${misura}.jpg`;
}

function Nomi({ titolo }: { titolo: string }) {
  const parti = separaNomi(titolo);
  return (
    <h1 className="hero__nomi">
      {parti.map((parte, i) => (
        // La & deve essere un elemento flex a sé: annidata dentro lo span del
        // nome resterebbe incollata alla parola invece di centrarsi.
        <Fragment key={i}>
          {i > 0 && <span className="amp">&amp;</span>}
          <span>{parte}</span>
        </Fragment>
      ))}
    </h1>
  );
}

export function Hero({ c, asset, lingua = "it" }: { c: THero; asset: MappaAsset; lingua?: Lingua }) {
  const foto = c.asset_id ? asset[c.asset_id] : undefined;

  return (
    <header className={`hero ${foto ? "hero--con-foto" : "hero--senza-foto"}`}>
      {/* Sopra la foto, non sotto: "Ci sposiamo" e` l'annuncio, ed e' la prima
          cosa che deve leggersi. Grande come i titoli di sezione. */}
      {c.occhiello && <p className="hero__occhiello">{c.occhiello}</p>}

      {/* Intera, non ritagliata: il testo sta sotto la foto, non sopra. */}
      {foto && (
        // eslint-disable-next-line @next/next/no-img-element -- vedi Interattivi
        <img
          className="hero__foto"
          src={urlImmagine(foto.chiave, "grande")}
          alt={c.titolo}
          width={foto.larghezza ?? undefined}
          height={foto.altezza ?? undefined}
        />
      )}
      <div className="hero__testo">
        <Nomi titolo={c.titolo} />
        {c.sottotitolo && <p className="hero__luogo">{c.sottotitolo}</p>}
        {c.data && <p className="hero__data">{dataLunga(c.data, lingua)}</p>}
        {c.luogo && <p className="hero__luogo">{c.luogo}</p>}
      </div>
    </header>
  );
}

export function Testo({ c }: { c: TTesto }) {
  return (
    <section className="sezione sezione--stretta">
      {c.titolo && <h2>{c.titolo}</h2>}
      {c.corpo && (
        <p className={`pre-linea ${c.evidenza ? "testo--evidenza" : "testo__corpo"}`}>
          {c.corpo}
        </p>
      )}
    </section>
  );
}

export function Programma({ c }: { c: TProgramma }) {
  if (c.voci.length === 0) return null;
  return (
    <section className="sezione">
      {c.titolo && <h2>{c.titolo}</h2>}
      <ol className="programma">
        {c.voci.map((v, i) => (
          <li key={i}>
            <span className="programma__ora">{v.ora}</span>
            <div>
              <h3>{v.titolo}</h3>
              {v.descrizione && <p className="pre-linea">{v.descrizione}</p>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Luogo({ c, lingua = "it" }: { c: TLuogo; lingua?: Lingua }) {
  const t = dizionario(lingua);
  if (!c.nome) return null;
  return (
    // `sezione--luogo` toglie il respiro verticale della sezione: la scheda
    // ha gia` il suo, e due luoghi di fila finivano a mezzo schermo di
    // distanza l'uno dall'altro.
    <section className="sezione sezione--luogo">
      <div className="griglia-auto">
        <article className="luogo">
          <span className="luogo__filo" aria-hidden="true" />
          {c.etichetta && (
            <p className="luogo__etichetta etichetta">{c.etichetta}</p>
          )}
          <h3>{c.nome}</h3>
          {c.ora && <p className="luogo__ora">{t.ore_} {c.ora}</p>}
          <span className="luogo__fregio" aria-hidden="true" />
          {c.indirizzo && <p className="luogo__indirizzo pre-linea">{c.indirizzo}</p>}
          {/* Il backend ha già svuotato tutto ciò che non è http/https. */}
          {c.mappa && (
            <a
              className="bottone-lieve"
              href={c.mappa}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.apriMappa}
            </a>
          )}
        </article>
      </div>
    </section>
  );
}

/** Il dress code non e` un tipo di blocco a se': e` una `Nota` che l'utente
 *  intitola cosi'. Quindi lo si riconosce dal titolo, e non si aggiunge un
 *  blocco nuovo che tutti gli inviti gia' creati non avrebbero. */
const TITOLI_DRESS_CODE =
  /dress\s*code|abbigliament|come\s+vestirs|etichetta|ținut|tinut|ενδυματολογ|c[oó]digo de vestimenta|vestimenta/i;

/** Il disegno del dress code: abito lungo, smoking, scarpe.
 *
 *  Non e` un `<img>` ma un rettangolo colorato con una **maschera**: cosi` il
 *  tratto prende `--decoro` e cambia tinta insieme alla palette scelta
 *  dall'utente. Un'immagine normale resterebbe nera anche su un invito blu
 *  notte. Stessa tecnica dei rametti del tema romantico.
 *
 *  `aria-hidden`: dice la stessa cosa del titolo qui sopra, e ripeterla a chi
 *  usa un lettore di schermo non serve. */
function DisegnoDressCode() {
  return <span className="disegno-dress-code" aria-hidden="true" />;
}

export function Nota({ c }: { c: TNota }) {
  if (!c.corpo && !c.titolo) return null;
  const dressCode = Boolean(c.titolo && TITOLI_DRESS_CODE.test(c.titolo));
  return (
    <section className="sezione sezione--stretta">
      {/* `h2` figlio diretto della sezione, come in tutti gli altri blocchi:
          e` quello che fa valere `.sezione > h2` e quindi la stessa misura,
          la stessa spaziatura e lo stesso fregio del tema romantico. Prima
          era un `h3` dentro la nota, stilizzato come un'etichetta minuscola
          in maiuscolo: "Regali" e "Dress code" erano gli unici titoli
          dell'invito a non somigliare agli altri. */}
      {c.titolo && <h2>{c.titolo}</h2>}
      <div className={`nota ${dressCode ? "nota--dress-code" : ""}`}>
        {dressCode && <DisegnoDressCode />}
        <p className="pre-linea">{c.corpo}</p>
      </div>
    </section>
  );
}
