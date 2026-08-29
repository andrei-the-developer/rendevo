"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { LINGUE_SUPPORTATE, type LinguaApp } from "@/lib/lingue-app";

/** Stessa lingua ovunque nell'app Next.js: cambia il cookie `locale` (letto
 *  da `i18n/request.ts`) e ricarica i dati server con `router.refresh()` —
 *  niente prefisso nell'URL, l'indirizzo resta lo stesso. La landing
 *  statica (fuori da Next.js) legge lo stesso cookie a modo suo, vedi
 *  `landing/index.html`. */
export function SelettoreLingua() {
  const locale = useLocale() as LinguaApp;
  const t = useTranslations("Lingua");
  const router = useRouter();
  const [aperto, setAperto] = useState(false);
  const [inCorso, startTransition] = useTransition();
  const guscio = useRef<HTMLDivElement>(null);

  async function cambia(nuova: LinguaApp) {
    setAperto(false);
    if (nuova === locale) return;
    await fetch("/imposta-lingua", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: nuova }),
    });
    startTransition(() => router.refresh());
  }

  return (
    <div
      className="scelta-carattere"
      ref={guscio}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setAperto(false);
      }}
    >
      <button
        type="button"
        className="scelta-carattere__tasto"
        aria-haspopup="listbox"
        aria-expanded={aperto}
        disabled={inCorso}
        onClick={() => setAperto((a) => !a)}
      >
        <span aria-hidden="true">🌐</span>
        {t(locale)}
        <span aria-hidden="true">▾</span>
      </button>

      {aperto && (
        <ul className="scelta-carattere__elenco" role="listbox">
          {LINGUE_SUPPORTATE.map((l) => (
            <li key={l}>
              <button
                type="button"
                role="option"
                aria-selected={l === locale}
                onClick={() => void cambia(l)}
              >
                {t(l)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
