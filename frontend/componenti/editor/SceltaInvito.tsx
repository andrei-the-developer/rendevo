"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { chiamaClient } from "@/lib/api-client";
import type { VoceEvento } from "@/lib/tipi";

/**
 * L'elenco dei propri inviti: si apre come `ScegliCarattere`, stessa
 * pillola e stessa lista. Una voce porta all'editor di quell'invito — il
 * rinominare invece resta sulla barra chiamante (vedi `RinominaInvito` in
 * `Tela.tsx`), perché qui si vede solo il titolo di eventi che non sono
 * aperti: nessuna versione con cui applicare un'operazione in sicurezza.
 */
export function SceltaInvito({ correnteId }: { correnteId: string }) {
  const t = useTranslations("SceltaInvito");
  const router = useRouter();
  const [aperto, setAperto] = useState(false);
  const [eventi, setEventi] = useState<VoceEvento[] | null>(null);
  const [creando, setCreando] = useState(false);
  const guscio = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aperto) return;
    const fuori = (e: PointerEvent) => {
      if (!guscio.current?.contains(e.target as Node)) setAperto(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAperto(false);
    };
    document.addEventListener("pointerdown", fuori);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", fuori);
      document.removeEventListener("keydown", esc);
    };
  }, [aperto]);

  // Caricato all'apertura, non prima: e' l'unico modo per vedere subito il
  // titolo appena cambiato altrove (un'altra scheda, un rinomina appena
  // fatto) senza tenere in giro uno stato duplicato.
  useEffect(() => {
    if (!aperto) return;
    chiamaClient<{ eventi: VoceEvento[] }>("/api/eventi")
      .then((r) => setEventi(r.eventi))
      .catch(() => setEventi([]));
  }, [aperto]);

  async function nuovoInvito() {
    setCreando(true);
    try {
      const nuovo = await chiamaClient<{ id: string }>("/api/eventi", {
        method: "POST",
        body: JSON.stringify({ tipo: "matrimonio" }),
      });
      router.push(`/e/${nuovo.id}`);
    } finally {
      setCreando(false);
    }
  }

  return (
    <div className="scelta-carattere" ref={guscio}>
      <button
        type="button"
        className="scelta-carattere__tasto"
        aria-haspopup="listbox"
        aria-expanded={aperto}
        onClick={() => setAperto((a) => !a)}
      >
        <span aria-hidden="true">☰</span>
        {t("iMieiInviti")}
        <span aria-hidden="true">▾</span>
      </button>

      {aperto && (
        <ul className="scelta-carattere__elenco" role="listbox">
          {eventi === null && <li className="scelta-invito__stato">{t("carico")}</li>}
          {eventi?.length === 0 && <li className="scelta-invito__stato">{t("nessunAltro")}</li>}
          {eventi?.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                role="option"
                aria-selected={e.id === correnteId}
                onClick={() => {
                  setAperto(false);
                  if (e.id !== correnteId) router.push(`/e/${e.id}`);
                }}
              >
                {e.titolo.trim() || t("senzaNome")}
              </button>
            </li>
          ))}
          <li className="scelta-invito__separatore" aria-hidden="true" />
          <li>
            <button type="button" onClick={() => void nuovoInvito()} disabled={creando}>
              {creando ? t("creando") : t("nuovoInvito")}
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
