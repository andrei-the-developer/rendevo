// Rispecchia i modelli Pydantic del backend (app/blocchi.py).
// Se cambiano là, cambiano qui.

export type Modo = "lettura" | "modifica";

export type TipoBlocco =
  | "busta"
  | "hero"
  | "testo"
  | "countdown"
  | "programma"
  | "luogo"
  | "galleria"
  | "nota"
  | "musica"
  | "rsvp";

/** Campi che ogni blocco ha, qualunque sia il suo tipo. Rispecchia `_Base`
 *  in `app/blocchi.py`: i fiori sono decorazione, non contenuto, e per questo
 *  stanno sulla base e non su un tipo particolare. */
export interface BaseBlocco {
  /** Nome del fiore a sinistra, "" per nessuno. Vedi `FIORI`. */
  fiore_sx: string;
  fiore_dx: string;
  /** A che altezza sta il fiore di quel lato: alto, meta, basso. */
  altezza_sx: string;
  altezza_dx: string;
}

export interface Busta extends BaseBlocco {
  tipo: "busta";
  frase: string;
  titolo: string;
  data: string;
  invito: string;
  nota: string;
}

export interface Hero extends BaseBlocco {
  tipo: "hero";
  occhiello: string;
  titolo: string;
  sottotitolo: string;
  data: string;
  ora: string;
  luogo: string;
  asset_id: string | null;
}

export interface Testo extends BaseBlocco {
  tipo: "testo";
  titolo: string;
  corpo: string;
  evidenza: boolean;
}

export interface Countdown extends BaseBlocco {
  tipo: "countdown";
  data: string;
  ora: string;
  testo_finito: string;
}

export interface VoceProgramma {
  ora: string;
  titolo: string;
  descrizione: string;
}

export interface Programma extends BaseBlocco {
  tipo: "programma";
  titolo: string;
  voci: VoceProgramma[];
}

export interface Luogo extends BaseBlocco {
  tipo: "luogo";
  etichetta: string;
  nome: string;
  indirizzo: string;
  ora: string;
  mappa: string;
}

export interface FotoGalleria {
  asset_id: string;
  didascalia: string;
}

export interface Galleria extends BaseBlocco {
  tipo: "galleria";
  titolo: string;
  foto: FotoGalleria[];
  scorrimento: "carosello" | "griglia";
}

export interface Nota extends BaseBlocco {
  tipo: "nota";
  titolo: string;
  corpo: string;
}

export interface Musica extends BaseBlocco {
  tipo: "musica";
  asset_id: string | null;
  titolo_brano: string;
  predefinito: boolean;
}

export interface Rsvp extends BaseBlocco {
  tipo: "rsvp";
  titolo: string;
  scadenza: string;
  chiedi_ospiti: boolean;
  chiedi_note: boolean;
  etichetta_si: string;
  etichetta_no: string;
}

export type Contenuto =
  | Busta
  | Hero
  | Testo
  | Countdown
  | Programma
  | Luogo
  | Galleria
  | Nota
  | Musica
  | Rsvp;

export interface Blocco {
  id: string;
  tipo: TipoBlocco;
  posizione: number;
  visibile: boolean;
  contenuto: Contenuto;
}

export interface DatiAsset {
  chiave: string;
  tipo: string;
  larghezza: number | null;
  altezza: number | null;
}

export interface Evento {
  id: string;
  tipo: string;
  /** Il nome con cui l'organizzatore riconosce l'invito nel proprio elenco,
   *  non il titolo scritto nel blocco "hero" che vede l'invitato. */
  titolo: string;
  tema: string;
  palette: string;
  carattere: string;
  stato: string;
  versione: number;
  blocchi: Blocco[];
  /** I blocchi referenziano gli asset per id: qui c'è la chiave di storage. */
  asset: Record<string, DatiAsset>;
}

/** Voce di un registro d'aspetto: vale sia per i temi sia per le palette. */
export interface VoceAspetto {
  id: string;
  etichetta: string;
  descrizione: string;
}

export interface Aspetto {
  temi: VoceAspetto[];
  palette: VoceAspetto[];
  caratteri: VoceAspetto[];
}

/** I fiori appendibili ai lati di una sezione. Stessi nomi del backend
 *  (`blocchi.FIORI`) e stessi nomi dei file in ornamenti/romantico/. */
/** A che altezza della sezione sta il fiore. */
export const ALTEZZE = ["alto", "meta", "basso"] as const;
export type Altezza = (typeof ALTEZZE)[number];

export const FIORI = [
  "mazzo", "ramo", "ghirlanda",
  "rododendro", "rosa-crema", "garofano", "rosa-inciso", "cesto", "rosa-piena", "rosa-magenta",
] as const;
export type Fiore = (typeof FIORI)[number];

export interface ModelloEvento {
  tipo: string;
  etichetta: string;
  tema: string;
  blocchi: number;
}

export interface Utente {
  email: string;
}

export interface ChiSono {
  utente: Utente | null;
}

// Operazioni accettate da POST /api/eventi/{id}/operazioni
export type Operazione =
  | { op: "aggiorna"; blocco: string; contenuto: Record<string, unknown> }
  | { op: "sposta"; blocco: string; direzione: "su" | "giu" }
  // Trascinamento: `dopo` e' l'id del blocco che lo precedera', null per la cima.
  | { op: "posiziona"; blocco: string; dopo: string | null }
  | { op: "inserisci"; tipo: TipoBlocco; dopo: string | null; contenuto?: Record<string, unknown> }
  | { op: "elimina"; blocco: string }
  | { op: "visibilita"; blocco: string; visibile: boolean }
  | { op: "tema"; tema: string }
  | { op: "palette"; palette: string }
  | { op: "carattere"; carattere: string }
  | { op: "titolo"; titolo: string };

// GET /api/eventi — l'elenco dei propri inviti, per il selettore.
export interface VoceEvento {
  id: string;
  tipo: string;
  titolo: string;
  tema: string;
  palette: string;
  aggiornato_il: string;
}

// GET /api/eventi/{id}/risposte
export interface Risposta {
  id: string;
  presente: boolean;
  referente: string;
  /** Solo gli accompagnatori: chi risponde non si riscrive. */
  ospiti: string[];
  /** Teste di questa risposta: il referente più i suoi accompagnatori. */
  totale: number;
  note: string;
  messaggio: string;
  creato_il: string;
}

export interface Risposte {
  titolo: string;
  risposte: Risposta[];
  riepilogo: { risposte: number; si: number; no: number; ospiti: number };
}
