/**
 * Le lingue dell'invito pubblico (lato invitato): le parole scritte dentro i
 * componenti (bottoni RSVP, conto alla rovescia, date), non il contenuto che
 * l'organizzatore scrive nell'editor. Oggi chi crea un invito su Rendevo lo
 * scrive solo in italiano, quindi tutto qui risolve sempre su "it" — resta
 * pronto per quando un invito potra' avere una sua lingua scelta
 * dall'organizzatore, indipendente dalla lingua dell'interfaccia (vedi
 * frontend/messages/ per quella).
 */

export const LINGUE = ["it", "ro", "el", "es"] as const;
export type Lingua = (typeof LINGUE)[number];

/** Il codice per `<html lang>` e per `Intl`. "el" e` il greco: il percorso
 *  pubblico e` /gr perche' e` quello che la gente riconosce, ma il codice di
 *  lingua corretto e` `el`. */
export const CODICE_HTML: Record<Lingua, string> = {
  it: "it",
  ro: "ro",
  el: "el",
  es: "es",
};

interface Dizionario {
  apriInvito: string;
  siApre: string;
  tempoRimanente: string;
  giorni: string;
  ore: string;
  minuti: string;
  secondi: string;
  giornoArrivato: string;
  fotoPrecedente: string;
  fotoSuccessiva: string;
  galleria: string;
  branoIncluso: string;
  fermaMusica: string;
  ascoltaMusica: string;
  apriMappa: string;
  ore_: string;
  laTuaRisposta: string;
  chiRisponde: string;
  nomeCognome: string;
  vengoAccompagnato: string;
  chiVieneConTe: string;
  nomeGiaScritto: string;
  noteMenu: string;
  inviaRisposta: string;
  invio: string;
  grazie: string;
  rispostaArrivata: string;
  erroreInvio: string;
  rispondiEntro: (data: string) => string;
}

const IT: Dizionario = {
  apriInvito: "Apri l'invito",
  siApre: "Si apre…",
  tempoRimanente: "Tempo rimanente",
  giorni: "giorni",
  ore: "ore",
  minuti: "minuti",
  secondi: "secondi",
  giornoArrivato: "Il grande giorno è arrivato.",
  fotoPrecedente: "Foto precedente",
  fotoSuccessiva: "Foto successiva",
  galleria: "Galleria di foto, scorri in orizzontale",
  branoIncluso: "Brano incluso",
  fermaMusica: "Ferma la musica",
  ascoltaMusica: "Ascolta la musica",
  apriMappa: "Apri la mappa",
  ore_: "ore",
  laTuaRisposta: "La tua risposta",
  chiRisponde: "Chi risponde",
  nomeCognome: "Nome e cognome",
  vengoAccompagnato: "Vengo accompagnato",
  chiVieneConTe: "Chi viene con te",
  nomeGiaScritto: "Il tuo l'hai già scritto sopra.",
  noteMenu: "Intolleranze o note sul menu",
  inviaRisposta: "Invia la risposta",
  invio: "Invio…",
  grazie: "Grazie!",
  rispostaArrivata: "La tua risposta è arrivata. Ci vediamo presto.",
  erroreInvio: "Non è stato possibile inviare la risposta.",
  rispondiEntro: (d) => `Ti chiediamo di rispondere entro il ${d}.`,
};

const RO: Dizionario = {
  apriInvito: "Deschide invitația",
  siApre: "Se deschide…",
  tempoRimanente: "Timp rămas",
  giorni: "zile",
  ore: "ore",
  minuti: "minute",
  secondi: "secunde",
  giornoArrivato: "Marea zi a sosit.",
  fotoPrecedente: "Fotografia precedentă",
  fotoSuccessiva: "Fotografia următoare",
  galleria: "Galerie foto, derulează orizontal",
  branoIncluso: "Melodie inclusă",
  fermaMusica: "Oprește muzica",
  ascoltaMusica: "Ascultă muzica",
  apriMappa: "Deschide harta",
  ore_: "ora",
  laTuaRisposta: "Răspunsul tău",
  chiRisponde: "Cine răspunde",
  nomeCognome: "Nume și prenume",
  vengoAccompagnato: "Vin însoțit",
  chiVieneConTe: "Cine vine cu tine",
  nomeGiaScritto: "Numele tău l-ai scris deja mai sus.",
  noteMenu: "Intoleranțe sau observații despre meniu",
  inviaRisposta: "Trimite răspunsul",
  invio: "Se trimite…",
  grazie: "Mulțumim!",
  rispostaArrivata: "Răspunsul tău a ajuns. Ne vedem în curând.",
  erroreInvio: "Nu am reușit să trimitem răspunsul.",
  rispondiEntro: (d) => `Te rugăm să răspunzi până pe ${d}.`,
};

const EL: Dizionario = {
  apriInvito: "Άνοιξε την πρόσκληση",
  siApre: "Ανοίγει…",
  tempoRimanente: "Χρόνος που απομένει",
  giorni: "ημέρες",
  ore: "ώρες",
  minuti: "λεπτά",
  secondi: "δευτερόλεπτα",
  giornoArrivato: "Η μεγάλη μέρα έφτασε.",
  fotoPrecedente: "Προηγούμενη φωτογραφία",
  fotoSuccessiva: "Επόμενη φωτογραφία",
  galleria: "Συλλογή φωτογραφιών, κύλιση οριζόντια",
  branoIncluso: "Μουσική επένδυση",
  fermaMusica: "Σταμάτα τη μουσική",
  ascoltaMusica: "Άκου τη μουσική",
  apriMappa: "Άνοιξε τον χάρτη",
  ore_: "στις",
  laTuaRisposta: "Η απάντησή σου",
  chiRisponde: "Ποιος απαντά",
  nomeCognome: "Όνομα και επώνυμο",
  vengoAccompagnato: "Θα έρθω συνοδευόμενος",
  chiVieneConTe: "Ποιος έρχεται μαζί σου",
  nomeGiaScritto: "Το δικό σου το έγραψες ήδη παραπάνω.",
  noteMenu: "Δυσανεξίες ή σημειώσεις για το μενού",
  inviaRisposta: "Στείλε την απάντηση",
  invio: "Αποστολή…",
  grazie: "Ευχαριστούμε!",
  rispostaArrivata: "Η απάντησή σου έφτασε. Τα λέμε σύντομα.",
  erroreInvio: "Δεν ήταν δυνατή η αποστολή της απάντησης.",
  rispondiEntro: (d) => `Σε παρακαλούμε να απαντήσεις έως τις ${d}.`,
};

const ES: Dizionario = {
  apriInvito: "Abre la invitación",
  siApre: "Se abre…",
  tempoRimanente: "Tiempo restante",
  giorni: "días",
  ore: "horas",
  minuti: "minutos",
  secondi: "segundos",
  giornoArrivato: "El gran día ha llegado.",
  fotoPrecedente: "Foto anterior",
  fotoSuccessiva: "Foto siguiente",
  galleria: "Galería de fotos, desliza en horizontal",
  branoIncluso: "Canción incluida",
  fermaMusica: "Detener la música",
  ascoltaMusica: "Escuchar la música",
  apriMappa: "Abrir el mapa",
  ore_: "a las",
  laTuaRisposta: "Tu respuesta",
  chiRisponde: "Quién responde",
  nomeCognome: "Nombre y apellidos",
  vengoAccompagnato: "Voy acompañado",
  chiVieneConTe: "Quién viene contigo",
  nomeGiaScritto: "El tuyo ya lo has escrito arriba.",
  noteMenu: "Intolerancias o notas sobre el menú",
  inviaRisposta: "Enviar la respuesta",
  invio: "Enviando…",
  grazie: "¡Gracias!",
  rispostaArrivata: "Tu respuesta ha llegado. Nos vemos pronto.",
  erroreInvio: "No se ha podido enviar la respuesta.",
  rispondiEntro: (d) => `Te pedimos que respondas antes del ${d}.`,
};

const DIZIONARI: Record<Lingua, Dizionario> = { it: IT, ro: RO, el: EL, es: ES };

export function dizionario(lingua: Lingua = "it"): Dizionario {
  return DIZIONARI[lingua] ?? IT;
}

// ------------------------------------------------------------------- date

/** Nomi dei mesi e dei giorni, scritti a mano e non presi da `Intl`.
 *
 *  `Intl` sul server (container, ICU completo) e nel browser puo' produrre
 *  stringhe diverse — accenti, maiuscole, abbreviazioni — e React segnala un
 *  errore di idratazione. Qui il risultato e' identico ovunque. */
const MESI: Record<Lingua, string[]> = {
  it: ["gennaio","febbraio","marzo","aprile","maggio","giugno","luglio","agosto","settembre","ottobre","novembre","dicembre"],
  ro: ["ianuarie","februarie","martie","aprilie","mai","iunie","iulie","august","septembrie","octombrie","noiembrie","decembrie"],
  el: ["Ιανουαρίου","Φεβρουαρίου","Μαρτίου","Απριλίου","Μαΐου","Ιουνίου","Ιουλίου","Αυγούστου","Σεπτεμβρίου","Οκτωβρίου","Νοεμβρίου","Δεκεμβρίου"],
  es: ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"],
};

const GIORNI: Record<Lingua, string[]> = {
  it: ["domenica","lunedì","martedì","mercoledì","giovedì","venerdì","sabato"],
  ro: ["duminică","luni","marți","miercuri","joi","vineri","sâmbătă"],
  el: ["Κυριακή","Δευτέρα","Τρίτη","Τετάρτη","Πέμπτη","Παρασκευή","Σάββατο"],
  es: ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"],
};

/** Come si compone una data per esteso, lingua per lingua.
 *
 *  Non basta tradurre i nomi dei mesi: lo spagnolo vuole "17 **de** octubre
 *  **de** 2026" e il rumeno mette la virgola dopo il giorno della settimana.
 *  Scritto qui invece che dentro `formato.ts` cosi` la lingua ha un posto
 *  solo dove essere descritta. */
export const FORMATO_DATA: Record<Lingua, {
  lunga: (g: string, n: number, m: string, a: number) => string;
  breve: (n: number, m: string, a: number) => string;
}> = {
  it: {
    lunga: (g, n, m, a) => `${g} ${n} ${m} ${a}`,
    breve: (n, m, a) => `${n} ${m} ${a}`,
  },
  ro: {
    lunga: (g, n, m, a) => `${g}, ${n} ${m} ${a}`,
    breve: (n, m, a) => `${n} ${m} ${a}`,
  },
  el: {
    lunga: (g, n, m, a) => `${g} ${n} ${m} ${a}`,
    breve: (n, m, a) => `${n} ${m} ${a}`,
  },
  es: {
    lunga: (g, n, m, a) => `${g}, ${n} de ${m} de ${a}`,
    breve: (n, m, a) => `${n} de ${m} de ${a}`,
  },
};

export function mesi(lingua: Lingua = "it"): string[] {
  return MESI[lingua] ?? MESI.it;
}

export function giorni(lingua: Lingua = "it"): string[] {
  return GIORNI[lingua] ?? GIORNI.it;
}
