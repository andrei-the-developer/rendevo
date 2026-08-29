"use client";

/* Blocchi che hanno bisogno del browser: timer, scroll, stato di un modulo.
   Un componente client si può usare dentro un albero server, quindi la pagina
   invitato resta renderizzata sul server tranne questi punti. */

import { useCallback, useEffect, useRef, useState } from "react";

import { chiamaClient } from "@/lib/api-client";
import { dataBreve, istante } from "@/lib/formato";
import { dizionario, type Lingua } from "@/lib/lingue";
import type {
  Countdown as TCountdown,
  Galleria as TGalleria,
  Musica as TMusica,
  Rsvp as TRsvp,
} from "@/lib/tipi";
import { useApertura } from "./Apertura";
import { type MappaAsset, urlImmagine } from "./Presentazionali";

// ------------------------------------------------------------------ countdown

export function Countdown({ c, lingua = "it" }: { c: TCountdown; lingua?: Lingua }) {
  const t = dizionario(lingua);
  const bersaglio = istante(c.data, c.ora);
  const [resta, setResta] = useState<number | null>(null);

  useEffect(() => {
    if (bersaglio === null) return;
    const tic = () => setResta(bersaglio - Date.now());
    tic();
    const t = setInterval(tic, 1000);
    return () => clearInterval(t);
  }, [bersaglio]);

  if (bersaglio === null) return null;

  // Al primo render lato server non conosciamo l'ora del client: mostriamo i
  // trattini, così il markup del server e quello del browser combaciano.
  const s = resta === null ? null : Math.max(0, Math.floor(resta / 1000));
  const finito = s !== null && s <= 0;

  const celle: [string, number | null][] = [
    [t.giorni, s === null ? null : Math.floor(s / 86400)],
    [t.ore, s === null ? null : Math.floor((s % 86400) / 3600)],
    [t.minuti, s === null ? null : Math.floor((s % 3600) / 60)],
    [t.secondi, s === null ? null : s % 60],
  ];

  return (
    <section className="sezione" aria-label={t.tempoRimanente}>
      {finito ? (
        <p className="testo--evidenza" style={{ textAlign: "center" }}>
          {c.testo_finito}
        </p>
      ) : (
        <div className="countdown">
          {celle.map(([nome, valore]) => (
            <div key={nome}>
              <b>{valore === null ? "—" : valore}</b>
              <span>{nome}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ------------------------------------------------------------------- galleria

export function Galleria({ c, asset, lingua = "it" }: { c: TGalleria; asset: MappaAsset; lingua?: Lingua }) {
  const t = dizionario(lingua);
  const pista = useRef<HTMLDivElement>(null);
  const foto = c.foto.filter((f) => asset[f.asset_id]);
  const carosello = c.scorrimento === "carosello" && foto.length > 1;

  // Ciclo infinito: tre copie in fila, si scorre sulla centrale e quando si
  // sborda si rientra di una copia. Il contenuto è identico, il salto non si
  // vede. Le copie stanno già nel markup del server: costano poco e così non
  // c'è né sfarfallio né spostamento di layout all'hydration.
  const copie = carosello ? 3 : 1;

  useEffect(() => {
    const el = pista.current;
    if (!el || copie !== 3) return;

    let larghezzaSet = 0;
    let riposizionando = false;
    let attesa: number | undefined;

    /** Il salto da una copia all'altra.
     *
     *  Lo snap va spento per l'istante del salto: con `scroll-snap-type`
     *  attivo il browser, appena vede cambiare `scrollLeft`, ci "riaggancia"
     *  la foto piu' vicina con una sua animazione — ed e' quello lo strappo
     *  che si sentiva. */
    const salta = (x: number) => {
      riposizionando = true;
      const snap = el.style.scrollSnapType;
      el.style.scrollSnapType = "none";
      el.scrollLeft = x;
      requestAnimationFrame(() => {
        el.style.scrollSnapType = snap;
        riposizionando = false;
      });
    };

    const riposiziona = () => {
      if (riposizionando || larghezzaSet <= 0) return;
      const sl = el.scrollLeft;
      if (sl < larghezzaSet * 0.5) salta(sl + larghezzaSet);
      else if (sl > larghezzaSet * 1.5) salta(sl - larghezzaSet);
    };

    /** Misura le tre copie. `riparti` solo al primo giro: a ogni `resize`
     *  rimettere lo scorrimento all'inizio era il difetto peggiore, perche'
     *  sul telefono `resize` scatta quando la barra degli indirizzi si
     *  nasconde — cioe' proprio mentre si sta scorrendo, e la galleria
     *  tornava di colpo alla prima foto. */
    const misura = (riparti: boolean) => {
      const nuova = el.scrollWidth / 3;
      if (nuova <= 0) return;
      const cambiata = Math.abs(nuova - larghezzaSet) > 1;
      if (riparti || larghezzaSet <= 0) {
        larghezzaSet = nuova;
        salta(larghezzaSet);
        return;
      }
      if (!cambiata) return;            // la barra si e' solo nascosta: fermi
      // Le foto hanno cambiato misura davvero (rotazione dello schermo):
      // conserva il punto in cui si era, in proporzione.
      const dentro = (el.scrollLeft % larghezzaSet) / larghezzaSet;
      larghezzaSet = nuova;
      salta(larghezzaSet + dentro * larghezzaSet);
    };

    const alloScroll = () => {
      if (riposizionando) return;
      // Se si e' arrivati davvero al fondo non c'e' tempo di aspettare:
      // li' il dito troverebbe un muro.
      const fine = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft <= 1 || el.scrollLeft >= fine - 1) {
        riposiziona();
        return;
      }
      // Altrimenti si aspetta che lo scorrimento si fermi. Spostare
      // `scrollLeft` mentre il dito trascina, o mentre l'inerzia corre,
      // ammazza l'inerzia: e' il motivo per cui lo scorrimento sembrava
      // frenare da solo a meta' strada.
      window.clearTimeout(attesa);
      attesa = window.setTimeout(riposiziona, 140);
    };

    // `scrollend` e' esattamente questo evento, dove esiste; il timer resta
    // per Safari, che non ce l'ha ancora.
    const suFine = () => riposiziona();

    misura(true);
    el.addEventListener("scroll", alloScroll, { passive: true });
    el.addEventListener("scrollend", suFine);
    const alResize = () => misura(false);
    window.addEventListener("resize", alResize);

    // Le foto arrivano con `loading="lazy"`: finche' non sono decodificate la
    // larghezza totale puo' cambiare, e con essa il punto di rientro.
    const osservatore = new ResizeObserver(() => misura(false));
    osservatore.observe(el);

    return () => {
      window.clearTimeout(attesa);
      el.removeEventListener("scroll", alloScroll);
      el.removeEventListener("scrollend", suFine);
      window.removeEventListener("resize", alResize);
      osservatore.disconnect();
    };
  }, [copie, foto.length]);

  if (foto.length === 0) return null;

  const passo = () => {
    const el = pista.current;
    const primo = el?.firstElementChild as HTMLElement | null;
    if (!el || !primo) return 200;
    // Il distanziamento viene da una variabile CSS: darlo per scontato a 12px
    // faceva sbagliare il passo di qualche pixel a ogni freccia, e dopo cinque
    // scatti la foto non era piu' centrata.
    const gap = parseFloat(getComputedStyle(el).columnGap || "12") || 12;
    return primo.getBoundingClientRect().width + gap;
  };

  const elenco = Array.from({ length: copie }, () => foto).flat();

  return (
    <section className="sezione">
      {c.titolo && <h2>{c.titolo}</h2>}
      <div className="galleria-guscio">
        {carosello && (
          <button
            type="button"
            className="freccia freccia--sx"
            aria-label={t.fotoPrecedente}
            onClick={() => pista.current?.scrollBy({ left: -passo(), behavior: "smooth" })}
          >
            &lsaquo;
          </button>
        )}
        <div
          ref={pista}
          className={`galleria ${carosello ? "" : "galleria--griglia"}`}
          tabIndex={0}
          role="region"
          aria-label={t.galleria}
        >
          {elenco.map((f, i) => {
            const a = asset[f.asset_id];
            return (
              <figure key={`${f.asset_id}-${i}`} aria-hidden={i >= foto.length}>
                {/* eslint-disable-next-line @next/next/no-img-element --
                    le derivate responsive le genera il backend all'upload, e
                    next/image blocca gli IP locali (self-hosted). */}
                <img src={urlImmagine(a.chiave, "media")} alt={f.didascalia || ""} loading="lazy" />
                {f.didascalia && <figcaption>{f.didascalia}</figcaption>}
              </figure>
            );
          })}
        </div>
        {carosello && (
          <button
            type="button"
            className="freccia freccia--dx"
            aria-label={t.fotoSuccessiva}
            onClick={() => pista.current?.scrollBy({ left: passo(), behavior: "smooth" })}
          >
            &rsaquo;
          </button>
        )}
      </div>
    </section>
  );
}

// --------------------------------------------------------------------- musica

export function Musica({ c, asset, lingua = "it" }: { c: TMusica; asset: MappaAsset; lingua?: Lingua }) {
  const t = dizionario(lingua);
  const caricato = c.asset_id ? asset[c.asset_id] : undefined;
  // Senza un file caricato suona il brano incluso: sintetizzato da noi, quindi
  // senza diritti di terzi.
  const incluso = !caricato && c.predefinito;
  const audio = useRef<HTMLAudioElement>(null);
  const [suona, setSuona] = useState(false);
  const { aperto, registraSblocco } = useApertura();

  /** Vero da quando la musica deve suonare davvero. Serve a distinguere il
   *  `play()` di sblocco da quello vero: se il primo si risolve tardi non
   *  deve mettere in pausa la musica che nel frattempo e' partita. */
  const vuoleSuonare = useRef(false);

  const avvia = useCallback(() => {
    const el = audio.current;
    if (!el) return;
    vuoleSuonare.current = true;
    el.muted = false;
    el.volume = 0.55;
    if (!el.paused) {
      setSuona(true);
      return;
    }
    // Se il browser rifiuta comunque, il tasto resta in pausa senza errori
    // in console: l'invitato puo' accenderla a mano.
    el.play().then(() => setSuona(true)).catch(() => setSuona(false));
  }, []);

  /** Lo sblocco, da chiamare dentro il click sulla busta.
   *
   *  Parte muta e si ferma subito: non si sente niente, ma da quel momento il
   *  browser considera l'elemento autorizzato e lascera' partire il `play()`
   *  vero quando la busta finisce di aprirsi. Vedi Apertura.tsx. */
  const sblocca = useCallback(() => {
    const el = audio.current;
    if (!el || vuoleSuonare.current) return;
    el.muted = true;
    el.play()
      .then(() => {
        if (vuoleSuonare.current) {
          el.muted = false;      // la busta si e' aperta nel frattempo
          return;
        }
        el.pause();
        el.currentTime = 0;
        el.muted = false;
      })
      .catch(() => {
        el.muted = false;
      });
  }, []);

  useEffect(() => {
    registraSblocco(sblocca);
  }, [registraSblocco, sblocca]);

  // La partenza vera: quando la busta e' aperta e l'invito e' scoperto.
  useEffect(() => {
    if (aperto) avvia();
  }, [aperto, avvia]);

  if (!caricato && !incluso) return null;

  const alterna = () => {
    const el = audio.current;
    if (!el) return;
    if (el.paused) avvia();
    else {
      el.pause();
      setSuona(false);
    }
  };

  const etichetta = c.titolo_brano || (incluso ? t.branoIncluso : "");

  return (
    <>
      <audio ref={audio} loop preload="auto">
        {incluso ? (
          <>
            {/* OGG per primo: si ripete senza il buchino che l'MP3 si porta
                dietro dalla codifica. Safari non lo legge e usa l'MP3. */}
            <source src="/musica/predefinito.ogg" type="audio/ogg" />
            <source src="/musica/predefinito.mp3" type="audio/mpeg" />
          </>
        ) : (
          <source src={`/media/${caricato!.chiave}`} />
        )}
      </audio>
      <button
        type="button"
        className="tasto-musica"
        aria-pressed={suona}
        aria-label={suona ? t.fermaMusica : t.ascoltaMusica}
        onClick={alterna}
      >
        <span className="onde" aria-hidden="true">
          <i /><i /><i />
        </span>
        {etichetta && <span className="etichetta-musica">{etichetta}</span>}
      </button>
    </>
  );
}

// ----------------------------------------------------------------------- rsvp

export function Rsvp({
  c,
  token,
  senzaAccompagnatori = false,
  lingua = "it",
}: {
  c: TRsvp;
  token?: string;
  /** Il link "semplice": chi arriva da li' puo' solo dire se viene e come si
   *  chiama. Non e' una proprieta' dell'invito ma dell'indirizzo usato, e per
   *  questo arriva come prop e non dal contenuto del blocco. */
  senzaAccompagnatori?: boolean;
  lingua?: Lingua;
}) {
  const t = dizionario(lingua);
  const [presente, setPresente] = useState<boolean | null>(null);
  const [accompagnato, setAccompagnato] = useState(false);
  const [inviato, setInviato] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);
  const [inCorso, setInCorso] = useState(false);

  async function invia(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token || presente === null) return;
    const modulo = new FormData(e.currentTarget);
    setInCorso(true);
    setErrore(null);
    try {
      await chiamaClient(`/api/inviti/${token}/rsvp`, {
        method: "POST",
        body: JSON.stringify({
          presente,
          referente: String(modulo.get("referente") ?? ""),
          // Solo se ha spuntato "vengo accompagnato": altrimenti la casella
          // non esiste nemmeno, e il server conta il referente da solo.
          // Il campo e' a riga singola, ma chi porta due persone scrive
          // "Anna, Luca" senza pensarci: separiamo su virgola e a capo.
          ospiti: accompagnato
            ? String(modulo.get("ospiti") ?? "")
                .split(/[,\n;]/)
                .map((r) => r.trim())
                .filter(Boolean)
            : [],
          note: String(modulo.get("note") ?? ""),
          // Il campo libero "Due righe per noi" e' stato tolto dal modulo su
          // richiesta di Andrei. Il server accetta ancora `messaggio` e le
          // risposte raccolte prima lo conservano: da qui parte vuoto.
          messaggio: "",
        }),
      });
      setInviato(true);
    } catch (err) {
      setErrore(
        err instanceof Error ? err.message : t.erroreInvio,
      );
    } finally {
      setInCorso(false);
    }
  }

  return (
    <section className="sezione sezione--stretta rsvp" id="rsvp">
      <h2>{c.titolo}</h2>

      {inviato ? (
        <p className="esito">
          <strong>{t.grazie}</strong>
          {t.rispostaArrivata}
        </p>
      ) : (
        <>
          {c.scadenza && (
            <p style={{ textAlign: "center", fontStyle: "italic" }}>
              {t.rispondiEntro(dataBreve(c.scadenza, lingua))}
            </p>
          )}
          <form className="modulo" onSubmit={invia}>
            <fieldset className="scelta">
              <legend className="etichetta">{t.laTuaRisposta}</legend>
              {[
                { valore: true, testo: c.etichetta_si },
                { valore: false, testo: c.etichetta_no },
              ].map(({ valore, testo }) => (
                <label className="pillola" key={String(valore)}>
                  <input
                    type="radio"
                    name="presente"
                    required
                    checked={presente === valore}
                    onChange={() => {
                      setPresente(valore);
                      if (!valore) setAccompagnato(false);
                    }}
                  />
                  <span>{testo}</span>
                </label>
              ))}
            </fieldset>

            <label className="campo">
              <span className="etichetta">{t.chiRisponde}</span>
              <input
                type="text"
                name="referente"
                maxLength={160}
                required
                autoComplete="name"
                placeholder={t.nomeCognome}
              />
            </label>

            {/* Chiesto solo a chi viene: a chi non viene non serve.
                La spunta prima della casella e` il punto: la maggior parte
                degli invitati viene da sola, e a quelli il campo dei nomi non
                va nemmeno mostrato — vedendolo si mettono a compilarlo con il
                proprio nome, che il server aggiunge gia` da se'. */}
            {c.chiedi_ospiti && !senzaAccompagnatori && presente === true && (
              <>
                <label className="spunta">
                  <input
                    type="checkbox"
                    checked={accompagnato}
                    onChange={(e) => setAccompagnato(e.target.checked)}
                  />
                  <span>{t.vengoAccompagnato}</span>
                </label>

                {accompagnato && (
                  <label className="campo">
                    <span className="etichetta">{t.chiVieneConTe}</span>
                    {/* Una riga sola, identica al campo del nome sopra: chi
                        risponde porta quasi sempre una persona, e un'area di
                        testo alta quattro righe gli chiedeva un elenco che
                        non ha. Se sono piu' di uno li separa con la virgola. */}
                    <input
                      type="text"
                      name="ospiti"
                      maxLength={320}
                      autoFocus
                      autoComplete="off"
                      placeholder={t.nomeCognome}
                    />
                  </label>
                )}
              </>
            )}

            {c.chiedi_note && presente === true && (
              <label className="campo">
                <span className="etichetta">{t.noteMenu}</span>
                <textarea name="note" rows={2} maxLength={500} />
              </label>
            )}

            {errore && <p role="alert" style={{ color: "#a8524a" }}>{errore}</p>}

            <button className="bottone" type="submit" disabled={inCorso || !token}>
              {inCorso ? t.invio : t.inviaRisposta}
            </button>
          </form>
        </>
      )}
    </section>
  );
}
