import { FORMATO_DATA, giorni as giorniDi, mesi as mesiDi, type Lingua } from "./lingue";

/** Le date arrivano come ISO "2027-06-12". Parsing manuale, non `new Date`:
 *  su una stringa senza fuso il browser interpreta UTC e a volte torna il
 *  giorno prima. */
function pezzi(iso: string): [number, number, number] | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

export function dataLunga(iso: string, lingua: Lingua = "it"): string {
  const p = pezzi(iso);
  if (!p) return iso;
  const [anno, mese, giorno] = p;
  const settimana = giorniDi(lingua)[new Date(anno, mese - 1, giorno).getDay()];
  return FORMATO_DATA[lingua].lunga(settimana, giorno, mesiDi(lingua)[mese - 1], anno);
}

export function dataBreve(iso: string, lingua: Lingua = "it"): string {
  const p = pezzi(iso);
  if (!p) return iso;
  const [anno, mese, giorno] = p;
  return FORMATO_DATA[lingua].breve(giorno, mesiDi(lingua)[mese - 1], anno);
}

/** Millisecondi dell'istante locale dell'evento, per il countdown. */
export function istante(data: string, ora: string): number | null {
  const p = pezzi(data);
  if (!p) return null;
  const [anno, mese, giorno] = p;
  const m = /^(\d{1,2}):(\d{2})/.exec((ora || "").trim());
  const h = m ? Number(m[1]) : 0;
  const min = m ? Number(m[2]) : 0;
  return new Date(anno, mese - 1, giorno, h % 24, min % 60).getTime();
}

/** Divide "Giulia & Marco" per incolonnare i nomi sui telefoni. */
export function separaNomi(titolo: string): string[] {
  const parti = titolo.split(/\s*&\s*/);
  return parti.length > 1 ? parti : [titolo];
}
