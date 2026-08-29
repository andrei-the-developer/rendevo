import uuid
from datetime import UTC, datetime, timedelta

from fastapi import Depends, Request, Response
from itsdangerous import BadSignature, URLSafeSerializer
from sqlalchemy.orm import Session

from .config import impostazioni
from .db import sessione as dip_sessione
from .modelli import Sessione

COOKIE = "inviti_sessione"
DURATA = timedelta(days=180)


def _firma() -> URLSafeSerializer:
    return URLSafeSerializer(impostazioni().segreto, salt="sessione")


def _imposta_cookie(risposta: Response, sessione_id: uuid.UUID) -> None:
    risposta.set_cookie(
        COOKIE,
        _firma().dumps(str(sessione_id)),
        max_age=int(DURATA.total_seconds()),
        httponly=True,
        samesite="lax",
        # In produzione dietro HTTPS va True; in sviluppo su http resterebbe
        # non inviato, quindi lo leghiamo alla presenza di origini https.
        secure=not impostazioni().origini_cors[0].startswith("http://"),
        path="/",
    )


def _id_dal_cookie(richiesta: Request) -> uuid.UUID | None:
    grezzo = richiesta.cookies.get(COOKIE)
    if not grezzo:
        return None
    try:
        return uuid.UUID(_firma().loads(grezzo))
    except (BadSignature, ValueError):
        # Cookie manomesso o segreto ruotato: si riparte da una sessione nuova.
        return None


def sessione_corrente(
    richiesta: Request,
    risposta: Response,
    db: Session = Depends(dip_sessione),
) -> Sessione:
    """Recupera la sessione dal cookie, o ne crea una nuova.

    Chiunque apra il sito ottiene una sessione: è quella che tiene la
    proprietà degli inviti creati senza registrarsi.
    """
    adesso = datetime.now(UTC)
    sessione_id = _id_dal_cookie(richiesta)

    if sessione_id is not None:
        ses = db.get(Sessione, sessione_id)
        if ses is not None and ses.scade_il > adesso:
            ses.ultimo_uso = adesso
            db.commit()
            return ses

    ses = Sessione(scade_il=adesso + DURATA)
    db.add(ses)
    db.commit()
    _imposta_cookie(risposta, ses.id)
    return ses
