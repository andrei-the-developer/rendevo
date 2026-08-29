"use client";

import { useEffect, useRef, useState } from "react";

import { caricaAsset } from "@/lib/api-client";
import type { Blocco, Contenuto, DatiAsset, VoceProgramma } from "@/lib/tipi";
import { urlImmagine } from "../blocchi/Presentazionali";

type MappaAsset = Record<string, DatiAsset>;

export interface AzioniPopup {
  salva: (patch: Record<string, unknown>) => Promise<void>;
  /** Come salva, ma non chiude il popup: per un caricamento foto l'utente
   *  spesso vuole restare e caricarne altre, o vedere subito l'anteprima. */
  impostaCampo: (patch: Record<string, unknown>) => Promise<void>;
  sposta: (direzione: "su" | "giu") => Promise<void>;
  nascondi: (visibile: boolean) => Promise<void>;
  elimina: () => Promise<void>;
  chiudi: () => void;
}

const ETICHETTE: Record<string, string> = {
  busta: "Busta chiusa",
  hero: "Copertina",
  testo: "Testo",
  countdown: "Countdown",
  programma: "Programma",
  luogo: "Luogo",
  galleria: "Galleria",
  nota: "Nota",
  musica: "Musica",
  rsvp: "Risposte",
};

const MAX_FOTO_GALLERIA = 12;

function Campo({
  etichetta,
  children,
}: {
  etichetta: string;
  children: React.ReactNode;
}) {
  return (
    <label className="campo-popup">
      <span>{etichetta}</span>
      {children}
    </label>
  );
}

/** Upload di una singola immagine con anteprima. Il caricamento avviene
 *  subito al cambio file — non aspetta il tasto "Salva" del resto del
 *  popup — perché coinvolge già di per sé una richiesta di rete. */
function CampoFoto({
  etichetta,
  assetAttuale,
  eventoId,
  onCaricata,
}: {
  etichetta: string;
  assetAttuale: DatiAsset | undefined;
  eventoId: string;
  onCaricata: (assetId: string) => Promise<void>;
}) {
  const [inCorso, setInCorso] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function scegli(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setInCorso(true);
    setErrore(null);
    try {
      const caricato = await caricaAsset(eventoId, file);
      await onCaricata(caricato.id);
    } catch (err) {
      setErrore(err instanceof Error ? err.message : "Caricamento non riuscito.");
    } finally {
      setInCorso(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="campo-popup">
      <span>{etichetta}</span>
      <div className="campo-foto">
        <div className="campo-foto__anteprima">
          {assetAttuale ? (
            // eslint-disable-next-line @next/next/no-img-element -- anteprima nell'editor, non nell'invito
            <img src={urlImmagine(assetAttuale.chiave, "piccola")} alt="" />
          ) : (
            <span className="campo-foto__vuota">Nessuna foto</span>
          )}
        </div>
        <label className="tasto-popup campo-foto__scegli">
          {inCorso ? "Carico…" : assetAttuale ? "Sostituisci" : "Carica"}
          <input ref={inputRef} type="file" accept="image/*" hidden
            disabled={inCorso} onChange={scegli} />
        </label>
      </div>
      {errore && <p className="errore-popup" role="alert">{errore}</p>}
    </div>
  );
}

/** Upload del brano. Stessa forma di `CampoFoto` — carica subito, senza
 *  aspettare "Salva" — ma senza anteprima visiva: di un file audio non c'e'
 *  niente da guardare, e un lettore dentro il popup si metterebbe a suonare
 *  sopra la musica dell'invito che sta gia' andando.
 *
 *  Caricare un brano **spegne** `predefinito`: tenere acceso "usa il brano
 *  incluso" dopo aver caricato il proprio farebbe suonare quello sbagliato,
 *  ed e' esattamente l'errore che l'utente non capirebbe. */
function CampoAudio({
  assetAttuale,
  eventoId,
  onCaricato,
}: {
  assetAttuale: DatiAsset | undefined;
  eventoId: string;
  onCaricato: (assetId: string) => Promise<void>;
}) {
  const [inCorso, setInCorso] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function scegli(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setInCorso(true);
    setErrore(null);
    try {
      const caricato = await caricaAsset(eventoId, file);
      await onCaricato(caricato.id);
    } catch (err) {
      setErrore(err instanceof Error ? err.message : "Caricamento non riuscito.");
    } finally {
      setInCorso(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="campo-popup">
      <span>File del brano</span>
      <div className="campo-audio">
        <span className="campo-audio__stato">
          {assetAttuale ? "Brano caricato" : "Nessun file caricato"}
        </span>
        <label className="tasto-popup">
          {inCorso ? "Carico…" : assetAttuale ? "Sostituisci" : "Carica"}
          <input
            ref={inputRef}
            type="file"
            /* Il server accetta MP3, M4A e OGG e li riconosce dalla firma del
               file, non dall'estensione: qui si filtra solo per non far
               scegliere all'utente qualcosa che verra' rifiutato dopo. */
            accept="audio/mpeg,audio/mp4,audio/x-m4a,audio/ogg,.mp3,.m4a,.ogg"
            hidden
            disabled={inCorso}
            onChange={scegli}
          />
        </label>
      </div>
      {errore && <p className="errore-popup" role="alert">{errore}</p>}
    </div>
  );
}

/** Titolo, disposizione e gestione foto della galleria: un componente a sé
 *  perché usa i propri hook (upload in corso, errore) — dentro un `case` di
 *  uno switch violerebbe le regole di React (hook chiamati in modo
 *  condizionale). */
function CampoGalleria({
  contenuto,
  bozza,
  imposta,
  asset,
  eventoId,
  impostaCampo,
}: {
  contenuto: Extract<Contenuto, { tipo: "galleria" }>;
  bozza: Record<string, unknown>;
  imposta: (campo: string, valore: unknown) => void;
  asset: MappaAsset;
  eventoId: string;
  impostaCampo: (patch: Record<string, unknown>) => Promise<void>;
}) {
  const v = <T,>(campo: string, predefinito: T): T =>
    (bozza[campo] as T) ?? predefinito;
  const foto = v("foto", contenuto.foto);
  const [inCorso, setInCorso] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const posto = MAX_FOTO_GALLERIA - foto.length;

  async function aggiungi(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files;
    if (!file || file.length === 0) return;
    setInCorso(true);
    setErrore(null);
    try {
      const scelti = Array.from(file).slice(0, posto);
      const caricate = [];
      for (const f of scelti) {
        caricate.push(await caricaAsset(eventoId, f));
      }
      await impostaCampo({
        foto: [
          ...foto,
          ...caricate.map((c) => ({ asset_id: c.id, didascalia: "" })),
        ],
      });
    } catch (err) {
      setErrore(err instanceof Error ? err.message : "Caricamento non riuscito.");
    } finally {
      setInCorso(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function rimuovi(assetId: string) {
    await impostaCampo({ foto: foto.filter((f) => f.asset_id !== assetId) });
  }

  return (
    <>
      <Campo etichetta="Titolo">
        <input type="text" maxLength={160}
          value={v("titolo", contenuto.titolo)}
          onChange={(e) => imposta("titolo", e.target.value)} />
      </Campo>
      <Campo etichetta="Disposizione">
        <select value={v("scorrimento", contenuto.scorrimento)}
          onChange={(e) => imposta("scorrimento", e.target.value)}>
          <option value="carosello">Carosello orizzontale</option>
          <option value="griglia">Griglia</option>
        </select>
      </Campo>

      <div className="campo-popup">
        <span>Foto ({foto.length} / {MAX_FOTO_GALLERIA})</span>
        <div className="griglia-foto-popup">
          {foto.map((f) => {
            const a = asset[f.asset_id];
            return (
              <figure key={f.asset_id} className="scheda-foto-popup">
                {a && (
                  // eslint-disable-next-line @next/next/no-img-element -- anteprima nell'editor
                  <img src={urlImmagine(a.chiave, "piccola")} alt="" />
                )}
                <input type="text" maxLength={200} placeholder="Didascalia"
                  value={f.didascalia}
                  onChange={(e) => imposta("foto", foto.map((r) =>
                    r.asset_id === f.asset_id ? { ...r, didascalia: e.target.value } : r,
                  ))} />
                <button type="button" className="scheda-foto-popup__rimuovi"
                  onClick={() => rimuovi(f.asset_id)} aria-label="Rimuovi la foto">
                  Rimuovi
                </button>
              </figure>
            );
          })}
        </div>
        {posto > 0 ? (
          <label className="tasto-popup" style={{ justifySelf: "start", marginTop: "0.5rem" }}>
            {inCorso ? "Carico…" : "+ Aggiungi foto"}
            <input ref={inputRef} type="file" accept="image/*" multiple hidden
              disabled={inCorso} onChange={aggiungi} />
          </label>
        ) : (
          <small>Hai raggiunto il massimo di {MAX_FOTO_GALLERIA} foto.</small>
        )}
        {errore && <p className="errore-popup" role="alert">{errore}</p>}
      </div>
    </>
  );
}

/** Un modulo per tipo di blocco. Volutamente esplicito: generare i campi da
 *  uno schema renderebbe impossibile scegliere il controllo giusto (una data
 *  vuole un date picker, un indirizzo no). */
function CampiPerTipo({
  contenuto,
  bozza,
  imposta,
  asset,
  eventoId,
  impostaCampo,
}: {
  contenuto: Contenuto;
  bozza: Record<string, unknown>;
  imposta: (campo: string, valore: unknown) => void;
  asset: MappaAsset;
  eventoId: string;
  impostaCampo: (patch: Record<string, unknown>) => Promise<void>;
}) {
  const v = <T,>(campo: string, predefinito: T): T =>
    (bozza[campo] as T) ?? predefinito;

  switch (contenuto.tipo) {
    case "busta":
      return (
        <>
          <Campo etichetta="Frase sopra i nomi">
            <input type="text" maxLength={80}
              value={v("frase", contenuto.frase)}
              onChange={(e) => imposta("frase", e.target.value)} />
          </Campo>
          <Campo etichetta="Nomi (vuoto: usa quelli della copertina)">
            <input type="text" maxLength={160}
              value={v("titolo", contenuto.titolo)}
              onChange={(e) => imposta("titolo", e.target.value)} />
          </Campo>
          <Campo etichetta="Data sulla busta">
            <input type="date" value={v("data", contenuto.data)}
              onChange={(e) => imposta("data", e.target.value)} />
          </Campo>
          <Campo etichetta="Testo del pulsante">
            <input type="text" maxLength={80}
              value={v("invito", contenuto.invito)}
              onChange={(e) => imposta("invito", e.target.value)} />
          </Campo>
          <Campo etichetta="Riga in fondo">
            <input type="text" maxLength={80}
              value={v("nota", contenuto.nota)}
              onChange={(e) => imposta("nota", e.target.value)} />
          </Campo>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "#7a7f82" }}>
            Nascondi questo blocco per far arrivare gli invitati direttamente
            all&apos;invito, senza busta.
          </p>
        </>
      );

    case "hero": {
      const assetAttuale = contenuto.asset_id ? asset[contenuto.asset_id] : undefined;
      return (
        <>
          <CampoFoto
            etichetta="Foto di copertina"
            assetAttuale={assetAttuale}
            eventoId={eventoId}
            onCaricata={(id) => impostaCampo({ asset_id: id })}
          />
          <Campo etichetta="Sopra il titolo">
            <input type="text" maxLength={80}
              value={v("occhiello", contenuto.occhiello)}
              onChange={(e) => imposta("occhiello", e.target.value)} />
          </Campo>
          <Campo etichetta="Titolo">
            <input type="text" maxLength={160}
              value={v("titolo", contenuto.titolo)}
              onChange={(e) => imposta("titolo", e.target.value)} />
          </Campo>
          <Campo etichetta="Sottotitolo">
            <input type="text" maxLength={160}
              value={v("sottotitolo", contenuto.sottotitolo)}
              onChange={(e) => imposta("sottotitolo", e.target.value)} />
          </Campo>
          <Campo etichetta="Data">
            <input type="date" value={v("data", contenuto.data)}
              onChange={(e) => imposta("data", e.target.value)} />
          </Campo>
          <Campo etichetta="Ora">
            <input type="time" value={v("ora", contenuto.ora)}
              onChange={(e) => imposta("ora", e.target.value)} />
          </Campo>
          <Campo etichetta="Luogo">
            <input type="text" maxLength={160}
              value={v("luogo", contenuto.luogo)}
              onChange={(e) => imposta("luogo", e.target.value)} />
          </Campo>
        </>
      );
    }

    case "testo":
      return (
        <>
          <Campo etichetta="Titolo (vuoto per nasconderlo)">
            <input type="text" maxLength={160}
              value={v("titolo", contenuto.titolo)}
              onChange={(e) => imposta("titolo", e.target.value)} />
          </Campo>
          <Campo etichetta="Testo">
            <textarea rows={8} value={v("corpo", contenuto.corpo)}
              onChange={(e) => imposta("corpo", e.target.value)} />
          </Campo>
          <label className="campo-popup riga">
            <input type="checkbox" checked={v("evidenza", contenuto.evidenza)}
              onChange={(e) => imposta("evidenza", e.target.checked)} />
            <span style={{ letterSpacing: 0, textTransform: "none", fontSize: "0.9rem" }}>
              Testo grande, in evidenza
            </span>
          </label>
        </>
      );

    case "countdown":
      return (
        <>
          <Campo etichetta="Data">
            <input type="date" value={v("data", contenuto.data)}
              onChange={(e) => imposta("data", e.target.value)} />
          </Campo>
          <Campo etichetta="Ora">
            <input type="time" value={v("ora", contenuto.ora)}
              onChange={(e) => imposta("ora", e.target.value)} />
          </Campo>
          <Campo etichetta="Testo a conto terminato">
            <input type="text" maxLength={160}
              value={v("testo_finito", contenuto.testo_finito)}
              onChange={(e) => imposta("testo_finito", e.target.value)} />
          </Campo>
        </>
      );

    case "programma": {
      const voci = v<VoceProgramma[]>("voci", contenuto.voci);
      const cambia = (i: number, campo: keyof VoceProgramma, valore: string) => {
        const copia = voci.map((riga, k) =>
          k === i ? { ...riga, [campo]: valore } : riga,
        );
        imposta("voci", copia);
      };
      return (
        <>
          <Campo etichetta="Titolo della sezione">
            <input type="text" maxLength={160}
              value={v("titolo", contenuto.titolo)}
              onChange={(e) => imposta("titolo", e.target.value)} />
          </Campo>
          {voci.map((riga, i) => (
            <div key={i} style={{ display: "grid", gap: "0.4rem",
              gridTemplateColumns: "6rem 1fr auto", alignItems: "center" }}>
              <input type="time" value={riga.ora} aria-label="Ora"
                onChange={(e) => cambia(i, "ora", e.target.value)} />
              <input type="text" value={riga.titolo} aria-label="Titolo" placeholder="Titolo"
                onChange={(e) => cambia(i, "titolo", e.target.value)} />
              <button type="button" className="tasto-popup tasto-popup--rosso"
                onClick={() => imposta("voci", voci.filter((_, k) => k !== i))}
                aria-label="Rimuovi la voce">×</button>
              <textarea rows={2} value={riga.descrizione} placeholder="Dettagli"
                aria-label="Descrizione" style={{ gridColumn: "1 / -1" }}
                onChange={(e) => cambia(i, "descrizione", e.target.value)} />
            </div>
          ))}
          <button type="button" className="tasto-popup"
            onClick={() => imposta("voci", [...voci, { ora: "", titolo: "", descrizione: "" }])}>
            + Aggiungi una voce
          </button>
        </>
      );
    }

    case "luogo":
      return (
        <>
          <Campo etichetta="Etichetta (Cerimonia, Ricevimento…)">
            <input type="text" maxLength={80}
              value={v("etichetta", contenuto.etichetta)}
              onChange={(e) => imposta("etichetta", e.target.value)} />
          </Campo>
          <Campo etichetta="Nome del luogo (vuoto per nascondere il blocco)">
            <input type="text" maxLength={160}
              value={v("nome", contenuto.nome)}
              onChange={(e) => imposta("nome", e.target.value)} />
          </Campo>
          <Campo etichetta="Indirizzo">
            <input type="text" maxLength={200}
              value={v("indirizzo", contenuto.indirizzo)}
              onChange={(e) => imposta("indirizzo", e.target.value)} />
          </Campo>
          <Campo etichetta="Ora">
            <input type="time" value={v("ora", contenuto.ora)}
              onChange={(e) => imposta("ora", e.target.value)} />
          </Campo>
          <Campo etichetta="Link a Google Maps">
            <input type="url" maxLength={500} placeholder="https://maps.app.goo.gl/…"
              value={v("mappa", contenuto.mappa)}
              onChange={(e) => imposta("mappa", e.target.value)} />
          </Campo>
        </>
      );

    case "nota":
      return (
        <>
          <Campo etichetta="Titolo">
            <input type="text" maxLength={160}
              value={v("titolo", contenuto.titolo)}
              onChange={(e) => imposta("titolo", e.target.value)} />
          </Campo>
          <Campo etichetta="Testo">
            <textarea rows={4} value={v("corpo", contenuto.corpo)}
              onChange={(e) => imposta("corpo", e.target.value)} />
          </Campo>
        </>
      );

    case "galleria":
      return (
        <CampoGalleria
          contenuto={contenuto}
          bozza={bozza}
          imposta={imposta}
          asset={asset}
          eventoId={eventoId}
          impostaCampo={impostaCampo}
        />
      );

    case "musica": {
      const brano = contenuto.asset_id ? asset[contenuto.asset_id] : undefined;
      return (
        <>
          <CampoAudio
            assetAttuale={brano}
            eventoId={eventoId}
            onCaricato={async (id) => {
              // Le due cose insieme, in un colpo solo: caricare il brano e
              // lasciare acceso "usa il brano incluso" farebbe suonare quello
              // sbagliato.
              await impostaCampo({ asset_id: id, predefinito: false });
            }}
          />
          <Campo etichetta="Titolo del brano">
            <input type="text" maxLength={160}
              placeholder="Che canzone è"
              value={v("titolo_brano", contenuto.titolo_brano)}
              onChange={(e) => imposta("titolo_brano", e.target.value)} />
          </Campo>
          <label className="campo-popup riga">
            <input type="checkbox" checked={v("predefinito", contenuto.predefinito)}
              onChange={(e) => imposta("predefinito", e.target.checked)} />
            <span style={{ letterSpacing: 0, textTransform: "none", fontSize: "0.9rem" }}>
              Usa il brano incluso
            </span>
          </label>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "#7a7f82" }}>
            MP3, M4A oppure OGG. Il brano incluso è strumentale e generato da
            noi: non porta diritti di terzi. Se carichi il tuo, i diritti
            restano a carico tuo.
          </p>
        </>
      );
    }

    case "rsvp":
      return (
        <>
          <Campo etichetta="Titolo">
            <input type="text" maxLength={160}
              value={v("titolo", contenuto.titolo)}
              onChange={(e) => imposta("titolo", e.target.value)} />
          </Campo>
          <Campo etichetta="Rispondere entro il">
            <input type="date" value={v("scadenza", contenuto.scadenza)}
              onChange={(e) => imposta("scadenza", e.target.value)} />
          </Campo>
          <Campo etichetta="Etichetta “ci sarò”">
            <input type="text" maxLength={80}
              value={v("etichetta_si", contenuto.etichetta_si)}
              onChange={(e) => imposta("etichetta_si", e.target.value)} />
          </Campo>
          <Campo etichetta="Etichetta “non vengo”">
            <input type="text" maxLength={80}
              value={v("etichetta_no", contenuto.etichetta_no)}
              onChange={(e) => imposta("etichetta_no", e.target.value)} />
          </Campo>
          <label className="campo-popup riga">
            <input type="checkbox" checked={v("chiedi_ospiti", contenuto.chiedi_ospiti)}
              onChange={(e) => imposta("chiedi_ospiti", e.target.checked)} />
            <span style={{ letterSpacing: 0, textTransform: "none", fontSize: "0.9rem" }}>
              Chiedi i nomi di chi viene
            </span>
          </label>
          <label className="campo-popup riga">
            <input type="checkbox" checked={v("chiedi_note", contenuto.chiedi_note)}
              onChange={(e) => imposta("chiedi_note", e.target.checked)} />
            <span style={{ letterSpacing: 0, textTransform: "none", fontSize: "0.9rem" }}>
              Chiedi intolleranze e note sul menu
            </span>
          </label>
        </>
      );

    default:
      return null;
  }
}

export function Popup({
  blocco,
  primo,
  ultimo,
  asset,
  eventoId,
  azioni,
}: {
  blocco: Blocco;
  primo: boolean;
  ultimo: boolean;
  asset: MappaAsset;
  eventoId: string;
  azioni: AzioniPopup;
}) {
  const [bozza, setBozza] = useState<Record<string, unknown>>({});
  const [inCorso, setInCorso] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);
  const [confermaElimina, setConfermaElimina] = useState(false);
  const riquadro = useRef<HTMLDivElement>(null);

  // Esc chiude, e il focus entra nel popup: senza, la tastiera resta sulla
  // pagina sotto e il popup è inaccessibile senza mouse.
  useEffect(() => {
    const allaTastiera = (e: KeyboardEvent) => {
      if (e.key === "Escape") azioni.chiudi();
    };
    document.addEventListener("keydown", allaTastiera);
    riquadro.current?.querySelector<HTMLElement>("input, textarea, select, button")?.focus();
    return () => document.removeEventListener("keydown", allaTastiera);
  }, [azioni]);

  const imposta = (campo: string, valore: unknown) =>
    setBozza((b) => ({ ...b, [campo]: valore }));

  async function esegui(azione: () => Promise<void>) {
    setInCorso(true);
    setErrore(null);
    try {
      await azione();
    } catch (e) {
      setErrore(e instanceof Error ? e.message : "Operazione non riuscita.");
      setInCorso(false);
    }
  }

  const modificato = Object.keys(bozza).length > 0;

  return (
    <div
      className="velo-popup"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) azioni.chiudi();
      }}
    >
      <div
        className="popup"
        role="dialog"
        aria-modal="true"
        aria-label={`Modifica ${ETICHETTE[blocco.tipo] ?? blocco.tipo}`}
        ref={riquadro}
      >
        <div className="popup__testata">
          <h2>{ETICHETTE[blocco.tipo] ?? blocco.tipo}</h2>
          <span className="popup__tipo">{blocco.tipo}</span>
          <button type="button" className="popup__chiudi" onClick={azioni.chiudi}
            aria-label="Chiudi">×</button>
        </div>

        <div className="popup__corpo">
          {errore && <p className="errore-popup" role="alert">{errore}</p>}
          <CampiPerTipo
            contenuto={blocco.contenuto}
            bozza={bozza}
            imposta={imposta}
            asset={asset}
            eventoId={eventoId}
            impostaCampo={azioni.impostaCampo}
          />
        </div>

        <div className="popup__azioni">
          <button type="button" className="tasto-popup" disabled={inCorso || primo}
            onClick={() => esegui(() => azioni.sposta("su"))}>↑ Su</button>
          <button type="button" className="tasto-popup" disabled={inCorso || ultimo}
            onClick={() => esegui(() => azioni.sposta("giu"))}>↓ Giù</button>
          <button type="button" className="tasto-popup" disabled={inCorso}
            onClick={() => esegui(() => azioni.nascondi(!blocco.visibile))}>
            {blocco.visibile ? "Nascondi" : "Mostra"}
          </button>

          {confermaElimina ? (
            <button type="button" className="tasto-popup tasto-popup--rosso" disabled={inCorso}
              onClick={() => esegui(azioni.elimina)}>Confermi? Elimina</button>
          ) : (
            <button type="button" className="tasto-popup tasto-popup--rosso" disabled={inCorso}
              onClick={() => setConfermaElimina(true)}>Elimina</button>
          )}

          <button type="button" className="tasto-popup tasto-popup--primario a-destra"
            disabled={inCorso || !modificato}
            onClick={() => esegui(() => azioni.salva(bozza))}>
            {inCorso ? "Salvo…" : "Salva"}
          </button>
        </div>
      </div>
    </div>
  );
}
