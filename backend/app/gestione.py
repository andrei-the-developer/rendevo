"""Comandi di gestione da riga di comando, per cose che oggi capitano poche
volte e non giustificano un pannello di amministrazione.

Uso, da dentro il container:

    docker compose exec api python -m app.gestione crea-codice MARCO25 \
        "Marco - wedding planner Milano" --sconto 10

    docker compose exec api python -m app.gestione elenca-codici
"""

import argparse
import sys

from .db import CreaSessione
from .modelli import CodiceInvito


def crea_codice(codice: str, etichetta: str, sconto_euro: float) -> None:
    codice = codice.strip().upper()
    with CreaSessione() as db:
        esistente = db.query(CodiceInvito).filter_by(codice=codice).first()
        if esistente is not None:
            print(f"Esiste già un codice {codice!r} ({esistente.etichetta})", file=sys.stderr)
            raise SystemExit(1)
        riga = CodiceInvito(
            codice=codice,
            etichetta=etichetta,
            sconto_centesimi=round(sconto_euro * 100),
        )
        db.add(riga)
        db.commit()
        print(f"Creato: {codice} — {etichetta} (sconto {sconto_euro:.2f} €)")


def elenca_codici() -> None:
    with CreaSessione() as db:
        righe = db.query(CodiceInvito).order_by(CodiceInvito.creato_il).all()
        if not righe:
            print("Nessun codice ancora.")
            return
        for r in righe:
            stato = "attivo" if r.attivo else "disattivato"
            n_utenti = len(r.utenti)
            print(
                f"{r.codice:<20} {r.etichetta:<40} "
                f"sconto {r.sconto_centesimi / 100:6.2f} €  "
                f"{stato:<12} usato da {n_utenti} account"
            )


def disattiva_codice(codice: str) -> None:
    codice = codice.strip().upper()
    with CreaSessione() as db:
        riga = db.query(CodiceInvito).filter_by(codice=codice).first()
        if riga is None:
            print(f"Nessun codice {codice!r}", file=sys.stderr)
            raise SystemExit(1)
        riga.attivo = False
        db.commit()
        print(f"Disattivato: {codice}")


def main() -> None:
    p = argparse.ArgumentParser(prog="gestione")
    sotto = p.add_subparsers(dest="comando", required=True)

    p_crea = sotto.add_parser("crea-codice", help="Crea un nuovo codice invito")
    p_crea.add_argument("codice")
    p_crea.add_argument("etichetta")
    p_crea.add_argument("--sconto", type=float, default=0.0, help="Sconto in euro (default 0)")

    sotto.add_parser("elenca-codici", help="Elenca tutti i codici invito")

    p_disattiva = sotto.add_parser("disattiva-codice", help="Disattiva un codice invito")
    p_disattiva.add_argument("codice")

    args = p.parse_args()
    if args.comando == "crea-codice":
        crea_codice(args.codice, args.etichetta, args.sconto)
    elif args.comando == "elenca-codici":
        elenca_codici()
    elif args.comando == "disattiva-codice":
        disattiva_codice(args.codice)


if __name__ == "__main__":
    main()
