import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { LINGUE_SUPPORTATE } from "@/lib/lingue-app";

/** Un anno: e' una preferenza, non una sessione. Sopravvive al login/logout
 *  perche' non e' legata all'account, solo al browser. */
const UN_ANNO = 60 * 60 * 24 * 365;

export async function POST(richiesta: Request) {
  const { locale } = (await richiesta.json()) as { locale?: string };
  if (!locale || !(LINGUE_SUPPORTATE as readonly string[]).includes(locale)) {
    return NextResponse.json({ errore: "Lingua sconosciuta" }, { status: 400 });
  }
  (await cookies()).set("locale", locale, {
    maxAge: UN_ANNO,
    path: "/",
    sameSite: "lax",
  });
  return NextResponse.json({ ok: true });
}
