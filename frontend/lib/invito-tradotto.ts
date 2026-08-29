/**
 * Le traduzioni del contenuto dell'invito di Andrei e Victoria.
 *
 * PERCHE' STANNO QUI E NON NEL DATABASE
 * Tradurre nel database avrebbe voluto dire una colonna per lingua su ogni
 * blocco, una migrazione e un editor capace di gestirle: cioe' cambiare il
 * backend. La richiesta era esplicita — nessuna modifica al backend, e le
 * risposte dei nuovi inviti devono mescolarsi alle vecchie. Con le traduzioni
 * qui, l'invito nel database resta **uno solo**: cambia soltanto come viene
 * disegnato a chi arriva da /ro, /gr o /es. Le risposte finiscono tutte nello
 * stesso evento, nello stesso elenco, negli stessi conteggi.
 *
 * IL PREZZO, DA SAPERE
 * Queste traduzioni **non seguono l'editor**. Se Andrei cambia un testo
 * italiano, le altre tre lingue restano indietro finche' qualcuno non le
 * aggiorna qui. Le chiavi sono gli id dei blocchi del suo evento: se un blocco
 * viene cancellato e rifatto, cambia id e la sua traduzione smette di
 * applicarsi — il testo torna in italiano, senza rompere niente.
 *
 * Nomi propri, indirizzi, orari e il titolo del brano non si traducono.
 */

import type { Evento } from "./tipi";
import type { Lingua } from "./lingue";

/** Traduzioni di un blocco: gli stessi nomi di campo del contenuto. */
type Campi = Record<string, unknown>;

/** id del blocco -> campi tradotti. */
type PerBlocco = Record<string, Campi>;

/** Chiavi vere dei blocchi dell'evento ef21df8b. Sono qui in cima cosi' che
 *  cambiarne uno voglia dire toccare un posto solo. */
const B = {
  busta: "ad8b9a2f",
  annuncio: "8e4e476e",
  hero: "382604ee",
  countdown: "71c21f0b",
  storia: "ec5f1482",
  programma: "948386cf",
  galleria: "0dbc1998",
  dressCode: "f456e579",
  regali: "736e2660",
  luogoCerimonia: "0f949a9d",
  luogoRistorante: "9c9c071f",
  rsvp: "298d6d62",
} as const;

const TRADUZIONI: Record<Exclude<Lingua, "it">, PerBlocco> = {
  ro: {
    [B.busta]: {
      frase: "Ne căsătorim!",
      nota: "Cu muzică · dă volumul mai tare",
      invito: "Deschide invitația",
    },
    [B.annuncio]: { titolo: "Cu imensă bucurie vă invităm la nunta noastră" },
    [B.hero]: { luogo: "Sala degli Stucchi, Palazzo Trissino (Corso Palladio 98)" },
    [B.countdown]: { testo_finito: "Marea zi a sosit." },
    [B.storia]: {
      titolo: "Povestea noastră",
      corpo:
        "Ne-am întâlnit într-o duminică caldă,\naproape din întâmplare, într-o gelaterie.\n\n" +
        "O întâlnire simplă, devenită începutul unei povești minunate.\n" +
        "Din acea zi am împărțit zâmbete, vise, emoții și clipe de neuitat, " +
        "descoperind, pas cu pas, că cea mai frumoasă magie este să găsești pe cineva " +
        "cu care să vrei să împarți viața.\n\n" +
        "Și astfel, din acea duminică, „întâmplarea” noastră a devenit un pentru totdeauna.",
    },
    [B.programma]: {
      titolo: "Programul",
      voci: [
        { titolo: "Ceremonia", descrizione: "Ziua noastră specială începe aici, cu ceremonia care ne va uni viețile. Vă așteptăm cu câteva minute înainte la Sala degli Stucchi, Palazzo Trissino." },
        { titolo: "Întâlnire la restaurant", descrizione: "După „da”-ul nostru, ne vom regăsi la restaurant ca să continuăm împreună această zi specială, între zâmbete, toasturi și voie bună." },
        { titolo: "Prânzul", descrizione: "Ne așteaptă un prânz bogat, cu bunătăți pentru toate gusturile, însoțite de pahare de umplut și toasturi de împărțit." },
        { titolo: "Muzică și dans", descrizione: "Între un toast și altul, după ce ne vom fi bucurat de bunătățile mesei, ne vom lăsa purtați de muzică pentru a sărbători începutul călătoriei noastre împreună." },
        { titolo: "Încheierea", descrizione: "Iar când ziua se va apropia de final, la ora 21:00, ne vom lua rămas-bun purtând cu noi bucuria de a fi sărbătorit împreună." },
      ],
    },
    [B.galleria]: { titolo: "Noi doi" },
    [B.dressCode]: {
      titolo: "Ținuta",
      corpo: "Elegantă. Vă rugăm cu drag să evitați albul.",
    },
    [B.regali]: {
      titolo: "Cadouri",
      corpo: "Casa noastră este plină de iubire. Totuși, dacă vreți să ne faceți un dar, îl vom pune în pușculiță și, când îl vom folosi, ne vom gândi la voi și la gestul vostru.",
    },
    [B.luogoCerimonia]: { etichetta: "Ceremonia" },
    [B.luogoRistorante]: { etichetta: "Restaurantul" },
    [B.rsvp]: {
      titolo: "Vei fi acolo?",
      etichetta_si: "Voi fi acolo",
      etichetta_no: "Nu voi putea veni",
    },
  },

  el: {
    [B.busta]: {
      frase: "Παντρευόμαστε!",
      nota: "Με μουσική · δυνάμωσε την ένταση",
      invito: "Άνοιξε την πρόσκληση",
    },
    [B.annuncio]: { titolo: "Με μεγάλη χαρά σας προσκαλούμε στον γάμο μας" },
    [B.hero]: { luogo: "Sala degli Stucchi, Palazzo Trissino (Corso Palladio 98)" },
    [B.countdown]: { testo_finito: "Η μεγάλη μέρα έφτασε." },
    [B.storia]: {
      titolo: "Η ιστορία μας",
      corpo:
        "Γνωριστήκαμε μια ζεστή Κυριακή,\nσχεδόν τυχαία, σε ένα παγωτατζίδικο.\n\n" +
        "Μια απλή συνάντηση, που έγινε η αρχή μιας υπέροχης ιστορίας.\n" +
        "Από εκείνη τη μέρα μοιραστήκαμε χαμόγελα, όνειρα, συγκινήσεις και αξέχαστες στιγμές, " +
        "ανακαλύπτοντας, βήμα βήμα, ότι η πιο όμορφη μαγεία είναι να βρεις κάποιον " +
        "με τον οποίο θέλεις να μοιραστείς τη ζωή σου.\n\n" +
        "Κι έτσι, από εκείνη την Κυριακή, το «τυχαία» μας έγινε ένα για πάντα.",
    },
    [B.programma]: {
      titolo: "Το πρόγραμμα",
      voci: [
        { titolo: "Η τελετή", descrizione: "Η ξεχωριστή μας μέρα ξεκινά εδώ, με την τελετή που θα ενώσει τις ζωές μας. Σας περιμένουμε λίγα λεπτά νωρίτερα στη Sala degli Stucchi, Palazzo Trissino." },
        { titolo: "Συνάντηση στο εστιατόριο", descrizione: "Μετά το «ναι» μας, θα βρεθούμε στο εστιατόριο για να συνεχίσουμε μαζί αυτή την ξεχωριστή μέρα, με χαμόγελα, προπόσεις και παρέα." },
        { titolo: "Το γεύμα", descrizione: "Μας περιμένει ένα πλούσιο γεύμα, με λιχουδιές για όλα τα γούστα, συνοδευόμενες από ποτήρια που θα γεμίσουν και προπόσεις που θα μοιραστούμε." },
        { titolo: "Μουσική και χορός", descrizione: "Ανάμεσα σε δύο προπόσεις, αφού απολαύσουμε τα καλούδια του τραπεζιού, θα αφεθούμε στη μουσική για να γιορτάσουμε την αρχή του κοινού μας ταξιδιού." },
        { titolo: "Το κλείσιμο", descrizione: "Κι όταν η μέρα φτάσει στο τέλος της, στις 21:00, θα αποχαιρετιστούμε κρατώντας τη χαρά που γιορτάσαμε μαζί." },
      ],
    },
    [B.galleria]: { titolo: "Εμείς οι δύο" },
    [B.dressCode]: {
      titolo: "Ενδυματολογικός κώδικας",
      corpo: "Επίσημο. Σας παρακαλούμε ευγενικά να αποφύγετε το λευκό.",
    },
    [B.regali]: {
      titolo: "Δώρα",
      corpo: "Το σπίτι μας είναι γεμάτο αγάπη. Αν όμως θέλετε να μας κάνετε ένα δώρο, θα το βάλουμε στον κουμπαρά και, όταν το χρησιμοποιήσουμε, θα σκεφτούμε εσάς και τη χειρονομία σας.",
    },
    [B.luogoCerimonia]: { etichetta: "Η τελετή" },
    [B.luogoRistorante]: { etichetta: "Το εστιατόριο" },
    [B.rsvp]: {
      titolo: "Θα είσαι εκεί;",
      etichetta_si: "Θα είμαι εκεί",
      etichetta_no: "Δεν θα μπορέσω να έρθω",
    },
  },

  es: {
    [B.busta]: {
      frase: "¡Nos casamos!",
      nota: "Con música · sube el volumen",
      invito: "Abre la invitación",
    },
    [B.annuncio]: { titolo: "Con inmensa alegría os invitamos a nuestra boda" },
    [B.hero]: { luogo: "Sala degli Stucchi, Palazzo Trissino (Corso Palladio 98)" },
    [B.countdown]: { testo_finito: "El gran día ha llegado." },
    [B.storia]: {
      titolo: "Nuestra historia",
      corpo:
        "Nos conocimos un domingo caluroso,\ncasi por casualidad, en una heladería.\n\n" +
        "Un encuentro sencillo, convertido en el comienzo de una historia maravillosa.\n" +
        "Desde aquel día hemos compartido sonrisas, sueños, emociones y momentos inolvidables, " +
        "descubriendo, paso a paso, que la magia más bonita es encontrar a alguien " +
        "con quien querer compartir la vida.\n\n" +
        "Y así, desde aquel domingo, nuestro «por casualidad» se convirtió en un para siempre.",
    },
    [B.programma]: {
      titolo: "El programa",
      voci: [
        { titolo: "La ceremonia", descrizione: "Nuestro día especial empieza aquí, con la ceremonia que unirá nuestras vidas. Os esperamos unos minutos antes en la Sala degli Stucchi, Palazzo Trissino." },
        { titolo: "Encuentro en el restaurante", descrizione: "Después de nuestro sí, nos reuniremos en el restaurante para seguir juntos este día especial, entre sonrisas, brindis y buena compañía." },
        { titolo: "La comida", descrizione: "Nos espera una comida abundante, con delicias para todos los gustos, acompañadas de copas que llenar y brindis que compartir." },
        { titolo: "Música y baile", descrizione: "Entre brindis y brindis, después de disfrutar de las delicias de la mesa, nos dejaremos llevar por la música para celebrar el comienzo de nuestro viaje juntos." },
        { titolo: "El cierre", descrizione: "Y cuando el día llegue a su fin, a las 21:00, nos despediremos llevándonos la alegría de haberlo celebrado juntos." },
      ],
    },
    [B.galleria]: { titolo: "Nosotros dos" },
    [B.dressCode]: {
      titolo: "Código de vestimenta",
      corpo: "Elegante. Os pedimos amablemente que evitéis el blanco.",
    },
    [B.regali]: {
      titolo: "Regalos",
      corpo: "Nuestra casa está llena de amor. Aun así, si queréis hacernos un regalo, lo guardaremos en la alcancia y cuando lo ussemos, pensaremos en vosotros y en vuestro gesto.",
    },
    [B.luogoCerimonia]: { etichetta: "La ceremonia" },
    [B.luogoRistorante]: { etichetta: "El restaurante" },
    [B.rsvp]: {
      titolo: "¿Estarás?",
      etichetta_si: "Allí estaré",
      etichetta_no: "No podré ir",
    },
  },
};

/** Applica le traduzioni a un evento. Torna l'evento intatto per l'italiano
 *  e per qualsiasi blocco senza traduzione: mancare una traduzione fa vedere
 *  l'italiano, non una pagina rotta. */
export function traduci(evento: Evento, lingua: Lingua): Evento {
  if (lingua === "it") return evento;
  const tabella = TRADUZIONI[lingua];
  if (!tabella) return evento;

  return {
    ...evento,
    blocchi: evento.blocchi.map((b) => {
      // Le chiavi sono i primi otto caratteri dell'id: bastano a distinguere
      // dodici blocchi e rendono la tabella leggibile.
      const campi = tabella[b.id.slice(0, 8)];
      if (!campi) return b;

      const contenuto = { ...b.contenuto } as Record<string, unknown>;
      for (const [campo, valore] of Object.entries(campi)) {
        // `voci` del programma: si fondono voce per voce, cosi' orari e
        // ordine restano quelli del database e si traduce solo il testo.
        if (campo === "voci" && Array.isArray(contenuto.voci) && Array.isArray(valore)) {
          contenuto.voci = (contenuto.voci as Record<string, unknown>[]).map((v, i) => ({
            ...v,
            ...((valore[i] as Record<string, unknown>) ?? {}),
          }));
        } else {
          contenuto[campo] = valore;
        }
      }
      // Il contenuto e` un'unione discriminata sul campo `tipo`: dopo la
      // fusione TypeScript vede un oggetto generico e non sa piu' quale ramo
      // sia. I campi tradotti sono gli stessi che c'erano, quindi il tipo
      // regge — passare da `unknown` e` il modo che TypeScript accetta.
      return { ...b, contenuto: contenuto as unknown as typeof b.contenuto };
    }),
  };
}
