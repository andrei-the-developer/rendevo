"use client";

import { createContext, useContext } from "react";

/**
 * Stato del sipario: la busta è chiusa o aperta.
 *
 * Il valore predefinito è `aperto`, così un blocco reso fuori da un sipario
 * — un'anteprima, un test — si comporta come se l'invito fosse già aperto.
 *
 * `registraSblocco` esiste per un motivo solo, ed è il telefono. La musica
 * deve partire **dopo** che la busta si è aperta, cioè circa tre secondi dopo
 * il clic. Ma Safari su iOS e Chrome su Android lasciano partire l'audio
 * soltanto *dentro* la chiamata del gestore del gesto: tre secondi dopo,
 * `play()` viene rifiutato e l'invito resta muto.
 *
 * La via d'uscita è separare le due cose. Dentro il clic la musica viene
 * "sbloccata": il browser la fa partire e la si mette subito in pausa, muta,
 * senza che nessuno senta niente. Da quel momento l'elemento audio è
 * considerato autorizzato, e il `play()` vero — quello all'apertura della
 * busta — passa senza problemi.
 */
export interface StatoApertura {
  aperto: boolean;
  /** Il sipario chiama questa funzione *dentro* il click. */
  registraSblocco: (sblocca: () => void) => void;
}

export const Apertura = createContext<StatoApertura>({
  aperto: true,
  registraSblocco: () => {},
});

export function useApertura(): StatoApertura {
  return useContext(Apertura);
}
