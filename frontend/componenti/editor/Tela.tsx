"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";

import { Fiori } from "@/componenti/blocchi/Blocco";
import { ListaBlocchi } from "@/componenti/blocchi/ListaBlocchi";
import { applicaOperazioni, chiamaClient, esci } from "@/lib/api-client";
import type { Aspetto, Blocco, Evento, Operazione, TipoBlocco, Utente } from "@/lib/tipi";
import { AggiungiSezione } from "./AggiungiSezione";
import { ScegliCarattere } from "./ScegliCarattere";
import { ScegliFiore } from "./ScegliFiore";
import { SceltaInvito } from "./SceltaInvito";
import { Autenticazione } from "./Autenticazione";
import { Popup } from "./Popup";

type Stato = "pronto" | "salvataggio" | "errore";

/** Un blocco che in pagina non disegna niente.
 *
 *  Nota, Programma, Luogo, Galleria e Countdown restituiscono `null` quando
 *  sono vuoti: nell'editor diventavano un rettangolo alto due centimetri e
 *  completamente muto. Impossibile capire che li` c'era una sezione, e ancora
 *  meno che cliccandola si apriva.
 *
 *  Busta, musica e risposte non compaiono qui: la busta si disegna sempre, il
 *  modulo delle risposte pure, e la musica non ha nulla da mostrare in linea
 *  nemmeno quando e' configurata (il suo tasto e' fisso in basso a destra). */
function sezioneVuota(blocco: Blocco, asset: Evento["asset"]): boolean {
  // `Contenuto` e` un'unione discriminata: passare da `unknown` e` il modo
  // che TypeScript accetta per leggerla a campi, e qui va bene perche` ogni
  // campo viene comunque riletto con un valore di ripiego.
  const c = blocco.contenuto as unknown as Record<string, unknown>;
  const senza = (campo: string) => !String(c[campo] ?? "").trim();

  switch (blocco.tipo) {
    case "testo":
    case "nota":
      return senza("titolo") && senza("corpo");
    case "programma":
      return !(c.voci as unknown[] | undefined)?.length;
    case "luogo":
      return senza("nome");
    case "galleria":
      // Non basta che ci siano righe in `foto`: se l'asset e' stato eliminato
      // la galleria resta con un riferimento morto e non disegna nulla.
      return !(c.foto as { asset_id: string }[] | undefined)?.some(
        (f) => asset[f.asset_id],
      );
    case "countdown":
      return senza("data");
    case "hero":
      return senza("titolo") && !c.asset_id;
    case "musica":
      return !c.asset_id && !c.predefinito;
    default:
      return false;
  }
}

export function Tela({
  iniziale,
  aspetto,
  utenteIniziale,
}: {
  iniziale: Evento;
  aspetto: Aspetto;
  utenteIniziale: Utente | null;
}) {
  const [evento, setEvento] = useState(iniziale);
  const [titolo, setTitolo] = useState(iniziale.titolo);
  const [apertoId, setApertoId] = useState<string | null>(null);
  const [stato, setStato] = useState<Stato>("pronto");
  const [messaggio, setMessaggio] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [copiato, setCopiato] = useState(false);
  const [utente, setUtente] = useState(utenteIniziale);
  const [mostraAuth, setMostraAuth] = useState(false);
  /** `false` = nessuna aggiunta in corso. `null` = si inserisce in cima.
   *  Una stringa = si inserisce subito dopo quel blocco. */
  const [aggiungiDopo, setAggiungiDopo] = useState<string | null | false>(false);
  /** Il blocco che si sta trascinando, e dove finirebbe se si mollasse ora. */
  /** Quale lato di quale blocco si sta decorando. */
  const [fioreAperto, setFioreAperto] = useState<{ blocco: string; lato: "sx" | "dx" } | null>(null);
  const [trascinato, setTrascinato] = useState<string | null>(null);
  const [bersaglio, setBersaglio] = useState<number | null>(null);
  const bersaglioVivo = useRef<number | null>(null);

  const invia = useCallback(
    async (operazioni: Operazione[]) => {
      setStato("salvataggio");
      setMessaggio(null);
      try {
        const aggiornato = await applicaOperazioni(
          evento.id,
          operazioni,
          evento.versione,
        );
        setEvento(aggiornato);
        setStato("pronto");
        return aggiornato;
      } catch (e) {
        setStato("errore");
        const testo = e instanceof Error ? e.message : "Salvataggio non riuscito";
        setMessaggio(testo);
        throw e;
      }
    },
    [evento.id, evento.versione],
  );

  /** Il nome con cui l'organizzatore riconosce l'invito nel proprio elenco:
   *  si salva solo quando si esce dal campo, non a ogni tasto, per non
   *  scrivere un'operazione a lettera. */
  async function salvaTitolo() {
    const pulito = titolo.trim();
    if (pulito === evento.titolo) return;
    try {
      await invia([{ op: "titolo", titolo: pulito }]);
    } catch {
      // `invia` ha gia` messo l'errore in `messaggio`.
    }
  }

  /** Stessa cornice per ogni blocco, busta compresa: click sinistro o
   *  destro apre lo stesso popup — non c'è più una modalità di sola
   *  lettura nell'editor, si modifica sempre. Per vedere l'invito come lo
   *  vedrà l'ospite si apre il link dell'invito, non un interruttore qui. */
  function involucro(blocco: Blocco, reso: React.ReactNode) {
    const apri = (e: { preventDefault: () => void }) => {
      e.preventDefault();
      setApertoId(blocco.id);
    };
    return (
      <div
        className="blocco-guscio blocco-modificabile"
        data-nascosto={!blocco.visibile}
        data-trascinato={trascinato === blocco.id || undefined}
        onClick={apri}
        onContextMenu={apri}
      >
        {/* La targa e` anche la maniglia: si tiene premuto qui e si trascina
            su o giu`. `touchAction: none` toglie di mezzo lo scorrimento della
            pagina, che altrimenti vincerebbe sul trascinamento. */}
        <span
          className="targa-blocco targa-blocco--maniglia"
          onPointerDown={(e) => iniziaTrascinamento(e, blocco.id)}
          onPointerMove={muoviTrascinamento}
          onPointerUp={() => void concludiTrascinamento()}
          onPointerCancel={() => void concludiTrascinamento()}
          onClick={(e) => e.stopPropagation()}
          style={{ touchAction: "none" }}
          title="Tieni premuto e trascina per spostare la sezione"
        >
          <span className="targa-blocco__presa" aria-hidden="true" />
          {blocco.tipo}
          {!blocco.visibile && " · nascosto"}
        </span>
        {/* I due tasti tondi per appendere un fiore al lato della sezione.
            Solo col tema romantico: e` li` che i fiori si disegnano, e un
            tasto che non produce niente di visibile e` peggio di nessun
            tasto. `stopPropagation` o il click aprirebbe anche la modifica
            del blocco sotto. */}
        {evento.tema === "romantico" &&
          (["sx", "dx"] as const).map((lato) => (
            <button
              key={lato}
              type="button"
              className={`tasto-fiore tasto-fiore--${lato}`}
              data-scelto={
                (lato === "sx" ? blocco.contenuto.fiore_sx : blocco.contenuto.fiore_dx) || undefined
              }
              aria-label={`Fiori a ${lato === "sx" ? "sinistra" : "destra"} di questa sezione`}
              onClick={(e) => {
                e.stopPropagation();
                setFioreAperto({ blocco: blocco.id, lato });
              }}
            >
              +
            </button>
          ))}

        {sezioneVuota(blocco, evento.asset) ? (
          // I fiori vanno resi anche qui. Il segnaposto sostituisce il blocco
          // intero, fiori compresi: chi aggiungeva una sezione vuota apposta
          // per appenderci due fiori non vedeva niente, e sembrava che la
          // scelta non fosse stata salvata.
          <>
            <Fiori c={blocco.contenuto} />
            <p className="sezione-vuota">Sezione vuota. Clicca per configurare.</p>
          </>
        ) : (
          reso
        )}
      </div>
    );
  }

  const aperto = evento.blocchi.find((b) => b.id === apertoId) ?? null;
  const indice = aperto ? evento.blocchi.findIndex((b) => b.id === aperto.id) : -1;

  /** Il link dell'invito: uno solo, non scade, si manda a tutti.
   *
   *  Il server e' idempotente (`servizi.crea_link`), quindi premere il
   *  pulsante dieci volte restituisce sempre lo stesso indirizzo: chi lo ha
   *  gia' mandato su WhatsApp non si ritrova con un secondo link diverso.
   *
   *  La copia negli appunti puo' fallire e non e' colpa nostra: il browser la
   *  concede solo in contesti sicuri (in produzione c'e' HTTPS, ma non su un
   *  IP in chiaro) e Safari la nega se non e' figlia diretta di un click. Per
   *  questo l'URL viene comunque mostrato nella casella accanto, selezionabile
   *  a mano: il pulsante non lascia mai l'utente senza il suo link. */
  async function copiaLinkInvito() {
    setMessaggio(null);
    setCopiato(false);
    let url: string;
    try {
      const r = await chiamaClient<{ token: string }>(
        `/api/eventi/${evento.id}/link`,
        { method: "POST" },
      );
      url = `${window.location.origin}/i/${r.token}`;
    } catch (e) {
      setMessaggio(e instanceof Error ? e.message : "Non riesco a creare il link");
      return;
    }
    setLink(url);
    try {
      await navigator.clipboard.writeText(url);
      setCopiato(true);
      setTimeout(() => setCopiato(false), 2500);
    } catch {
      setMessaggio("Non riesco a copiare da solo: il link è qui accanto, copialo a mano.");
    }
  }

  /** Inserisce una sezione e apre subito la sua finestra di modifica.
   *
   *  Aprirla non e` un vezzo: una sezione nuova nasce vuota o con un
   *  segnaposto, e senza il popup l'utente si ritrova un riquadro anonimo in
   *  mezzo all'invito senza sapere che va riempito. */
  async function inserisci(tipo: TipoBlocco, contenuto?: Record<string, unknown>) {
    const dopo = aggiungiDopo === false ? null : aggiungiDopo;
    setAggiungiDopo(false);
    const prima = new Set(evento.blocchi.map((b) => b.id));
    try {
      const aggiornato = await invia([{ op: "inserisci", tipo, dopo, contenuto }]);
      const nuovo = aggiornato.blocchi.find((b) => !prima.has(b.id));
      if (nuovo) setApertoId(nuovo.id);
    } catch {
      // `invia` ha gia` scritto il messaggio d'errore nella barra.
    }
  }

  /** Il "+" fra un blocco e l'altro. Resta poco visibile finche` non ci si
   *  passa sopra: l'invito deve somigliare all'invito, non a un pannello di
   *  controllo pieno di pulsanti. */
  function separatore(dopo: string | null, chiave: string) {
    return (
      <div className="aggiungi-qui" key={`piu-${chiave}`}>
        <button
          type="button"
          className="aggiungi-qui__tasto"
          onClick={() => setAggiungiDopo(dopo)}
          aria-label="Aggiungi una sezione qui"
        >
          <span aria-hidden="true">+</span> Aggiungi sezione
        </button>
      </div>
    );
  }

  /** Trascinamento di una sezione, preso dalla targa col nome.
   *
   *  Nessuna libreria: si leggono i rettangoli dei blocchi a ogni movimento e
   *  si guarda in quale meta` di quale blocco sta il dito. Sono una dozzina di
   *  elementi, non una lista infinita — misurarli costa meno di aggiungere una
   *  dipendenza e il suo modello di dati.
   *
   *  `setPointerCapture` non e' opzionale: senza, appena il dito esce dalla
   *  targa (cioe' subito, visto che la targa e' alta un centimetro) gli eventi
   *  smetterebbero di arrivare e il trascinamento morirebbe al primo pixel. */
  function iniziaTrascinamento(e: React.PointerEvent<HTMLElement>, id: string) {
    e.preventDefault();
    e.stopPropagation();          // altrimenti il clic aprirebbe anche il popup
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setTrascinato(id);
    setBersaglio(null);
    bersaglioVivo.current = null;
  }

  function muoviTrascinamento(e: React.PointerEvent<HTMLElement>) {
    if (!trascinato) return;
    const gusci = Array.from(
      document.querySelectorAll<HTMLElement>(".tela--modifica .blocco-modificabile"),
    );
    let indice = gusci.length;
    for (let i = 0; i < gusci.length; i++) {
      const r = gusci[i].getBoundingClientRect();
      if (e.clientY < r.top + r.height / 2) {
        indice = i;
        break;
      }
    }
    bersaglioVivo.current = indice;
    setBersaglio(indice);
  }

  async function concludiTrascinamento() {
    const id = trascinato;
    const a = bersaglioVivo.current;
    setTrascinato(null);
    setBersaglio(null);
    bersaglioVivo.current = null;
    if (!id || a === null) return;

    const da = evento.blocchi.findIndex((b) => b.id === id);
    if (da < 0 || a === da || a === da + 1) return;   // non si e' mosso

    // `a` e` l'indice PRIMA di cui si vuole inserire, contato sulla lista che
    // contiene ancora il blocco trascinato. Tolto quello, l'indice di arrivo
    // scala di uno se si stava scendendo.
    const senza = evento.blocchi.filter((b) => b.id !== id);
    const arrivo = a > da ? a - 1 : a;
    const dopo = arrivo === 0 ? null : senza[arrivo - 1].id;

    await invia([{ op: "posiziona", blocco: id, dopo }]).catch(() => {});
  }

  async function scegliFiore(fiore: string) {
    if (!fioreAperto) return;
    const { blocco, lato } = fioreAperto;
    setFioreAperto(null);
    await invia([
      { op: "aggiorna", blocco, contenuto: { [`fiore_${lato}`]: fiore } },
    ]).catch(() => {});
  }

  /** L'altezza non chiude il pannello: si prova alto, si guarda, si prova
   *  basso. Chiuderlo a ogni scelta costringerebbe a riaprirlo ogni volta. */
  async function scegliAltezza(altezza: string) {
    if (!fioreAperto) return;
    const { blocco, lato } = fioreAperto;
    await invia([
      { op: "aggiorna", blocco, contenuto: { [`altezza_${lato}`]: altezza } },
    ]).catch(() => {});
  }

  async function disconnetti() {
    try {
      await esci();
      setUtente(null);
    } catch (e) {
      setMessaggio(e instanceof Error ? e.message : "Non riesco a uscire");
    }
  }

  return (
    <>
      <div className="barra-editor">
        <span className="barra-editor__stato">
          {stato === "salvataggio" && "Salvo…"}
          {stato === "pronto" && `v${evento.versione}`}
          {stato === "errore" && "Errore"}
        </span>

        <label className="rinomina-invito">
          <span className="scelta-tema__etichetta">Nome</span>
          <input
            value={titolo}
            placeholder="Invito senza nome"
            aria-label="Nome dell'invito, solo per te"
            title="Il nome con cui lo riconosci nel tuo elenco: non lo vede l'invitato"
            onChange={(e) => setTitolo(e.target.value)}
            onBlur={() => void salvaTitolo()}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
          />
        </label>

        {utente && <SceltaInvito correnteId={evento.id} />}

        <label className="scelta-tema">
          <span className="scelta-tema__etichetta">Tema</span>
          <span className="scelta-tema__caja">
            <select
              value={evento.tema}
              onChange={(e) => {
                void invia([{ op: "tema", tema: e.target.value }]).catch(() => {});
              }}
            >
              {aspetto.temi.map((voce) => (
                <option key={voce.id} value={voce.id} title={voce.descrizione}>
                  {voce.etichetta}
                </option>
              ))}
            </select>
          </span>
        </label>

        <label className="scelta-tema">
          <span className="scelta-tema__etichetta">Colori</span>
          <span className="scelta-tema__caja">
            <select
              value={evento.palette}
              onChange={(e) => {
                void invia([{ op: "palette", palette: e.target.value }]).catch(() => {});
              }}
            >
              {aspetto.palette.map((voce) => (
                <option key={voce.id} value={voce.id} title={voce.descrizione}>
                  {voce.etichetta}
                </option>
              ))}
            </select>
          </span>
        </label>

        <ScegliCarattere
          voci={aspetto.caratteri}
          valore={evento.carattere}
          onCambia={(id) => {
            void invia([{ op: "carattere", carattere: id }]).catch(() => {});
          }}
        />

        <Link href={`/e/${evento.id}/risposte`} className="tasto-barra">
          Risposte
        </Link>

        <button
          type="button"
          className="tasto-barra tasto-barra--principale"
          onClick={copiaLinkInvito}
        >
          {copiato ? "Copiato!" : "Copia link invito"}
        </button>

        <span className="barra-editor__spazio" />

        {link && (
          <>
            <span className="barra-editor__etichetta-link">Link da mandare</span>
            <input
              className="tasto-barra"
              readOnly
              aria-label="Link dell'invito"
              value={link}
              onClick={(e) => e.currentTarget.select()}
              style={{ minWidth: "18rem", textTransform: "none", letterSpacing: 0 }}
            />
          </>
        )}
        {messaggio && <span style={{ color: "#f0b8b2" }}>{messaggio}</span>}

        {utente ? (
          <div className="barra-editor__utente">
            <span className="barra-editor__email" title={utente.email}>
              {utente.email}
            </span>
            <button type="button" className="tasto-barra" onClick={disconnetti}>
              Esci
            </button>
          </div>
        ) : (
          <button type="button" className="tasto-barra" onClick={() => setMostraAuth(true)}>
            Accedi
          </button>
        )}
      </div>

      <p className="suggerimento-editor">
        Clic (sinistro o destro) su qualsiasi parte dell&apos;invito per
        modificarla. Quando è pronto, <strong>Copia link invito</strong> ti dà
        l&apos;indirizzo da mandare: aprilo tu stesso per vederlo come lo
        vedranno gli invitati.
      </p>

      <div
        className="tela tela--modifica"
        data-tema={evento.tema}
        data-palette={evento.palette}
        data-carattere={evento.carattere}
      >
        {/* Stessi componenti della pagina invitato, busta compresa: qui non
            c'è alcun sipario — la busta è solo il primo blocco della lista,
            mostrato chiuso e fermo. L'animazione di apertura resta
            un'esclusiva della pagina che riceve l'ospite. */}
        {/* Un "+" prima del primo blocco e uno dopo ognuno: si puo` infilare
            una sezione ovunque, non solo in fondo. */}
        {separatore(null, "cima")}
        <ListaBlocchi
          evento={evento}
          avvolgi={(blocco, i, reso) => (
            <>
              {bersaglio === i && <div className="segno-rilascio" aria-hidden="true" />}
              {involucro(blocco, reso)}
              {separatore(blocco.id, blocco.id)}
            </>
          )}
        />
        {bersaglio === evento.blocchi.length && (
          <div className="segno-rilascio" aria-hidden="true" />
        )}
        <div className="coda" />
      </div>

      {aperto && (
        <Popup
          blocco={aperto}
          primo={indice === 0}
          ultimo={indice === evento.blocchi.length - 1}
          asset={evento.asset}
          eventoId={evento.id}
          azioni={{
            chiudi: () => setApertoId(null),
            salva: async (patch) => {
              await invia([
                { op: "aggiorna", blocco: aperto.id, contenuto: patch },
              ]);
              setApertoId(null);
            },
            // Come salva, ma resta aperto: dopo un caricamento foto
            // l'utente spesso vuole caricarne un'altra prima di chiudere.
            impostaCampo: async (patch) => {
              await invia([
                { op: "aggiorna", blocco: aperto.id, contenuto: patch },
              ]);
            },
            sposta: async (direzione) => {
              await invia([{ op: "sposta", blocco: aperto.id, direzione }]);
            },
            nascondi: async (visibile) => {
              await invia([
                { op: "visibilita", blocco: aperto.id, visibile },
              ]);
            },
            elimina: async () => {
              await invia([{ op: "elimina", blocco: aperto.id }]);
              setApertoId(null);
            },
          }}
        />
      )}

      {aggiungiDopo !== false && (
        <AggiungiSezione
          blocchi={evento.blocchi}
          onScegli={(tipo, contenuto) => void inserisci(tipo, contenuto)}
          onChiudi={() => setAggiungiDopo(false)}
        />
      )}

      {fioreAperto && (
        <ScegliFiore
          lato={fioreAperto.lato}
          attuale={
            (evento.blocchi.find((b) => b.id === fioreAperto.blocco)?.contenuto[
              fioreAperto.lato === "sx" ? "fiore_sx" : "fiore_dx"
            ] as string) ?? ""
          }
          altezza={
            (evento.blocchi.find((b) => b.id === fioreAperto.blocco)?.contenuto[
              fioreAperto.lato === "sx" ? "altezza_sx" : "altezza_dx"
            ] as string) ?? "meta"
          }
          onScegli={(f) => void scegliFiore(f)}
          onAltezza={(a) => void scegliAltezza(a)}
          onChiudi={() => setFioreAperto(null)}
        />
      )}

      {mostraAuth && (
        <Autenticazione
          onChiudi={() => setMostraAuth(false)}
          onAutenticato={(u) => {
            setUtente(u);
            setMostraAuth(false);
          }}
        />
      )}
    </>
  );
}
