"""Infrastruttura di test minima.

Crea un database Postgres **effimero** (non quello di sviluppo/produzione),
applica le migrazioni Alembic reali con `alembic.command.upgrade`, e lo
droppa alla fine della sessione di test. Ogni test gira dentro la propria
transazione (con SAVEPOINT per assorbire i `commit()` che il codice di
produzione fa davvero, es. `servizi.crea_link`), quindi due test non si
sporcano a vicenda e non serve pulire manualmente le righe create.

Richiede una variabile d'ambiente `DATABASE_URL_ADMIN` che punti a un utente
con permesso di CREATE/DROP DATABASE (lo stesso utente applicativo va bene,
è il proprietario del database in sviluppo). Pensato per girare in un
container con accesso alla rete Docker del progetto (servizio `db`) — vedi
`squadra/memoria/backend.md` per il comando esatto usato per verificarlo.

TRAPPOLA scoperta scrivendo questo file, da non ripetere: `migrazioni/env.py`
**non** usa l'URL passato via `alembic.config.Config.set_main_option`. Importa
direttamente `app.db.motore`, cioè l'engine che l'app crea a tempo di import
leggendo `impostazioni().database_url` (una volta sola, `@lru_cache`). Quindi
l'unico modo per far girare le migrazioni contro il database di test è
impostare la variabile d'ambiente `INVITI_DATABASE_URL` **prima** che
qualunque cosa importi `app.db` o chiami `impostazioni()` per la prima volta
— per questo qui sotto viene impostata a livello di modulo (il file più
precoce che pytest carica in questa directory), non dentro una fixture.
"""

import os
import sys
import uuid
from datetime import UTC, datetime, timedelta

import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

_RADICE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, _RADICE)


def _url_admin() -> str:
    grezzo = os.environ.get("DATABASE_URL_ADMIN")
    if not grezzo:
        raise RuntimeError(
            "Serve DATABASE_URL_ADMIN (postgresql+psycopg://.../inviti) "
            "per creare il database di test effimero."
        )
    return grezzo


_NOME_DB_TEST = f"inviti_test_{uuid.uuid4().hex[:10]}"
_URL_DB_TEST = _url_admin().rsplit("/", 1)[0] + f"/{_NOME_DB_TEST}"

# Vedi la trappola in cima al file: deve succedere qui, a import-time di
# conftest, prima che qualunque test module importi `app.config`/`app.db`.
os.environ["INVITI_DATABASE_URL"] = _URL_DB_TEST

from app.modelli import Evento, Sessione  # noqa: E402


@pytest.fixture(scope="session")
def database_url():
    admin = create_engine(_url_admin(), isolation_level="AUTOCOMMIT")
    with admin.connect() as conn:
        conn.execute(text(f'CREATE DATABASE "{_NOME_DB_TEST}"'))
    admin.dispose()

    from alembic import command
    from alembic.config import Config

    cfg = Config(os.path.join(_RADICE, "alembic.ini"))
    cfg.set_main_option("script_location", os.path.join(_RADICE, "migrazioni"))
    command.upgrade(cfg, "head")

    yield _URL_DB_TEST

    from app.db import motore
    motore.dispose()  # chiude le connessioni in pool prima del DROP

    admin = create_engine(_url_admin(), isolation_level="AUTOCOMMIT")
    with admin.connect() as conn:
        conn.execute(text(f'DROP DATABASE "{_NOME_DB_TEST}" WITH (FORCE)'))
    admin.dispose()


@pytest.fixture()
def db(database_url):
    """Una Session per test, in una transazione con SAVEPOINT: i `commit()`
    fatti dal codice sotto test (es. `servizi.crea_link`) restano confinati
    dentro, e tutto sparisce a fine test."""
    engine = create_engine(database_url, future=True)
    connessione = engine.connect()
    transazione = connessione.begin()
    CreaSessione = sessionmaker(
        bind=connessione,
        join_transaction_mode="create_savepoint",
        expire_on_commit=False,
    )
    sessione = CreaSessione()
    try:
        yield sessione
    finally:
        sessione.close()
        transazione.rollback()
        connessione.close()
        engine.dispose()


@pytest.fixture()
def evento_di_test(db):
    """Un Evento minimo, proprietario di una sessione anonima — non passa
    da `servizi.crea_evento` apposta: quella funzione semina anche asset su
    disco (Pillow, `storage.py`), irrilevante per i test di questo modulo."""
    ses = Sessione(scade_il=datetime.now(UTC) + timedelta(days=1))
    db.add(ses)
    db.flush()

    evento = Evento(
        tipo="matrimonio",
        tema="sobrio",
        palette="oliva",
        proprietario_sessione_id=ses.id,
    )
    db.add(evento)
    db.flush()
    return evento
