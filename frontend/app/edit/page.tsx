"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { chiamaClient } from "@/lib/api-client";
import type { Evento } from "@/lib/tipi";

/**
 * `/edit` — la porta d'ingresso all'editor, quella su cui punta il pulsante
 * della landing. Non è più la home: dal 2026-08-24 `/` è la pagina pubblica
 * statica servita da Caddy, e l'applicazione comincia da qui.
 *
 * Se la sessione ha già un invito, lo riprende; altrimenti ne crea uno
 * (matrimonio come modello di partenza — il tipo non conta più molto, dato
 * che tutto si personalizza dall'editor). Senza questo controllo, ogni
 * apertura o ricarica creerebbe un invito vuoto nuovo.
 */
export default function Edit() {
  const router = useRouter();
  const [errore, setErrore] = useState<string | null>(null);
  const partito = useRef(false);

  useEffect(() => {
    if (partito.current) return;
    partito.current = true;

    (async () => {
      try {
        const { eventi } = await chiamaClient<{ eventi: { id: string }[] }>("/api/eventi");
        if (eventi.length > 0) {
          router.replace(`/e/${eventi[0].id}`);
          return;
        }
        const nuovo = await chiamaClient<Evento>("/api/eventi", {
          method: "POST",
          body: JSON.stringify({ tipo: "matrimonio" }),
        });
        router.replace(`/e/${nuovo.id}`);
      } catch (e) {
        setErrore(e instanceof Error ? e.message : "Non riesco a preparare l'invito.");
      }
    })();
  }, [router]);

  return (
    <main className="pagina-app">
      <div className="app-contenuto app-contenuto--centrato">
        {errore ? (
          <>
            <h1 className="app-titolo">Qualcosa non ha funzionato</h1>
            <p className="app-sommario">{errore}</p>
          </>
        ) : (
          <p className="app-sommario">Preparo il tuo invito…</p>
        )}
      </div>
    </main>
  );
}
