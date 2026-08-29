import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termini e condizioni",
  description: "Termini e condizioni d'uso di Rendevo.",
  robots: { index: false, follow: false },
};

/** Statica apposta: sono termini legali, non contenuto che l'editor deve
 *  poter cambiare. Va aggiornata a mano, qui, quando cambia qualcosa di
 *  sostanziale nel servizio (vedi l'ultimo aggiornamento sotto). */
export default function PaginaTermini() {
  return (
    <main className="pagina-app pagina-termini">
      <div className="termini-corpo">
        <h1>Termini e condizioni</h1>
        <p className="termini-agg">Ultimo aggiornamento: 29 agosto 2026.</p>

        <p>
          Questi termini regolano l&apos;uso di Rendevo, il servizio che permette di
          creare un invito digitale, condividerne il link e raccogliere le
          risposte di chi è invitato. Usando Rendevo accetti quanto scritto qui
          sotto.
        </p>

        <h2>1. Il servizio</h2>
        <p>
          Rendevo è oggi offerto gratuitamente, in una fase iniziale di
          avviamento del prodotto. Non garantiamo che resterà gratuito per
          sempre né che ogni funzione attuale resterà disponibile senza
          cambiamenti: se in futuro cambiasse qualcosa di sostanziale (un
          piano a pagamento, un limite di utilizzo), te lo diremo prima che
          si applichi al tuo account.
        </p>

        <h2>2. Il tuo account</h2>
        <p>
          Puoi usare Rendevo senza registrarti: in quel caso il tuo invito
          resta legato al browser con cui l&apos;hai creato. Registrandoti con
          email e password puoi ritrovare i tuoi inviti da qualunque
          dispositivo e crearne più di uno. Sei responsabile di tenere la tua
          password riservata e di tutto quello che succede con il tuo
          account.
        </p>

        <h2>3. I contenuti che carichi</h2>
        <p>
          Testi, foto, musica e ogni altro contenuto che inserisci nel tuo
          invito restano tuoi: non ne diventiamo proprietari, li conserviamo
          solo per farteli mostrare all&apos;interno del servizio (a te e a chi
          inviti). Sei l&apos;unico responsabile di quello che carichi, e in
          particolare:
        </p>
        <ul>
          <li>
            <strong>Musica.</strong> Se aggiungi un brano al tuo invito devi
            avere i diritti per usarlo — perché l&apos;hai scritto o composto tu,
            perché è di dominio pubblico o con una licenza che lo consente,
            oppure perché hai ottenuto il permesso di chi ne detiene i
            diritti. Caricare musica protetta da copyright senza averne il
            diritto è una violazione di queste condizioni, oltre che
            potenzialmente della legge: la responsabilità è solo tua, e ci
            riserviamo di rimuovere il file e, nei casi più gravi, di
            sospendere l&apos;account.
          </li>
          <li>
            <strong>Foto e testi.</strong> Non caricare contenuti che non hai
            il diritto di usare, che violano la privacy di terzi, o che sono
            offensivi, illegali o ingannevoli.
          </li>
        </ul>
        <p>
          Se qualcuno ci segnala in buona fede che un contenuto caricato da un
          utente viola i suoi diritti, potremmo rimuoverlo senza preavviso in
          attesa di verificare la segnalazione.
        </p>

        <h2>4. I dati di chi risponde al tuo invito</h2>
        <p>
          Quando qualcuno risponde al tuo invito (presenza, accompagnatori,
          note sul menu), quei dati li raccogli tu, come organizzatore
          dell&apos;evento: li mostriamo solo a te, nella pagina delle risposte
          del tuo invito. Trattandosi di dati personali di terzi (i tuoi
          invitati), è una buona pratica avvisarli che le loro risposte
          saranno visibili a chi organizza l&apos;evento. Il dettaglio di come
          trattiamo i dati personali su Rendevo sarà oggetto di
          un&apos;informativa sulla privacy separata da questi termini.
        </p>

        <h2>5. Cosa non va fatto</h2>
        <p>
          Oltre a quanto già detto sui contenuti, non va usato Rendevo per:
          inviare inviti a chi non li ha richiesti (spam), tentare di
          accedere ad account o inviti che non sono tuoi, sovraccaricare o
          danneggiare il servizio, o usarlo per qualunque scopo illegale.
        </p>

        <h2>6. Disponibilità e responsabilità</h2>
        <p>
          Facciamo il possibile perché Rendevo funzioni senza interruzioni,
          ma non possiamo garantirlo: è un servizio in fase di avviamento,
          offerto <em>così com&apos;è</em>. Nei limiti consentiti dalla legge, non
          rispondiamo di danni indiretti derivanti dall&apos;uso o
          dall&apos;impossibilità di usare il servizio (ad esempio, un invito
          temporaneamente non raggiungibile). Ti consigliamo di non affidare
          a Rendevo l&apos;unica copia di contenuti a cui tieni particolarmente.
        </p>

        <h2>7. Modifiche a questi termini</h2>
        <p>
          Possiamo aggiornare questi termini nel tempo, soprattutto mentre il
          servizio è in questa fase iniziale. La data in cima a questa pagina
          indica l&apos;ultimo aggiornamento. Se una modifica fosse
          significativa, cercheremo di darne un preavviso ragionevole a chi
          ha un account.
        </p>

        <h2>8. Legge applicabile</h2>
        <p>
          Questi termini sono regolati dalla legge italiana. Per qualunque
          controversia è competente il foro del consumatore, dove
          applicabile, o il foro italiano competente secondo legge.
        </p>

        <h2>9. Contatti</h2>
        <p>
          Per domande su questi termini, o per segnalare un contenuto che
          ritieni violi i tuoi diritti, contattaci attraverso i canali
          indicati sul sito di Rendevo.
        </p>
      </div>
    </main>
  );
}
