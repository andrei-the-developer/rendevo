from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from .config import impostazioni

motore = create_engine(
    impostazioni().database_url,
    pool_pre_ping=True,
    future=True,
)

CreaSessione = sessionmaker(bind=motore, autoflush=False, expire_on_commit=False)


def sessione() -> Iterator[Session]:
    """Dipendenza FastAPI: una sessione per richiesta, chiusa comunque vada."""
    with CreaSessione() as s:
        yield s
