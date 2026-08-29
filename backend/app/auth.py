"""Autenticazione: hash delle password, verifica, e il trasferimento della
bozza da sessione anonima ad account.

Niente libreria esterna per l'hashing: `hashlib.scrypt` è nella libreria
standard di Python (compilata contro OpenSSL) ed è una KDF adatta alle
password — non serve aggiungere bcrypt o passlib per questo.
"""

import hashlib
import hmac
import re
import secrets
import uuid

from sqlalchemy import select, update
from sqlalchemy.orm import Session

from datetime import UTC, datetime, timedelta

from .config import impostazioni
from .modelli import Evento, ReimpostaPassword, Sessione, Utente

# n/r/p sono i parametri di costo di scrypt: valori pratici per una richiesta
# web (qualche decina di millisecondi), non i valori massimi da disco cifrato.
_N, _R, _P = 2**14, 8, 1
_LUNGHEZZA_CHIAVE = 32

_EMAIL_RE = re.compile(r"^[^@\s]{1,64}@[^@\s]{1,255}\.[^@\s]{2,24}$")


def email_valida(email: str) -> str | None:
    """Normalizza e valida l'email, o None se non è plausibile.

    Un controllo leggero via regex, non RFC 5322 completo: basta a scartare
    errori di battitura senza tirare dentro una libreria di validazione."""
    email = email.strip().lower()
    return email if _EMAIL_RE.match(email) else None


def cripta_password(chiaro: str) -> str:
    sale = secrets.token_bytes(16)
    derivata = hashlib.scrypt(
        chiaro.encode("utf-8"), salt=sale, n=_N, r=_R, p=_P, dklen=_LUNGHEZZA_CHIAVE
    )
    return f"{sale.hex()}${derivata.hex()}"


def verifica_password(chiaro: str, hash_salvato: str) -> bool:
    try:
        sale_hex, derivata_hex = hash_salvato.split("$", 1)
        sale = bytes.fromhex(sale_hex)
        attesa = bytes.fromhex(derivata_hex)
    except ValueError:
        return False
    calcolata = hashlib.scrypt(
        chiaro.encode("utf-8"), salt=sale, n=_N, r=_R, p=_P, dklen=len(attesa)
    )
    # Confronto a tempo costante: un confronto diretto (`==`) perderebbe
    # tempo in base a dove i byte iniziano a differire, e quel tempo è
    # un'informazione che un attaccante può misurare.
    return hmac.compare_digest(calcolata, attesa)


# ------------------------------------------------- reimpostazione password

def _impronta(token: str) -> str:
    """SHA-256 senza sale, e va bene cosi'.

    Il sale serve contro le tabelle precalcolate, che hanno senso sulle
    password (corte, prevedibili, scelte da persone). Qui il token e' 32 byte
    casuali: non esiste dizionario che lo contenga. Un hash veloce e' anzi
    preferibile, perche' questa funzione gira a ogni verifica del link.
    """
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def crea_richiesta_reimposta(db: Session, utente: Utente) -> str:
    """Genera il token e restituisce quello **in chiaro**, l'unica volta in
    cui esiste. In tabella va solo la sua impronta.

    Le richieste precedenti dello stesso utente vengono chiuse: se qualcuno
    ha chiesto il link per sbaglio e poi lo richiede davvero, il primo non
    deve restare valido in giro per un'ora.
    """
    db.execute(
        update(ReimpostaPassword)
        .where(
            ReimpostaPassword.utente_id == utente.id,
            ReimpostaPassword.usato_il.is_(None),
        )
        .values(usato_il=datetime.now(UTC))
    )
    token = secrets.token_urlsafe(32)
    db.add(ReimpostaPassword(
        utente_id=utente.id,
        hash_token=_impronta(token),
        scade_il=datetime.now(UTC) + timedelta(minutes=impostazioni().reimposta_minuti),
    ))
    return token


def richiesta_valida(db: Session, token: str) -> ReimpostaPassword | None:
    """None se inesistente, gia' usata o scaduta. Il chiamante non distingue
    i tre casi verso l'utente: sono tutti "questo link non vale piu'"."""
    riga = db.scalars(
        select(ReimpostaPassword).where(
            ReimpostaPassword.hash_token == _impronta(token)
        )
    ).first()
    if riga is None or riga.usato_il is not None:
        return None
    scade = riga.scade_il
    if scade.tzinfo is None:
        scade = scade.replace(tzinfo=UTC)
    return None if scade <= datetime.now(UTC) else riga


def consuma_richiesta(db: Session, riga: ReimpostaPassword, nuova: str) -> Utente:
    """Cambia la password e brucia il link, insieme a ogni altro in sospeso."""
    utente = db.get(Utente, riga.utente_id)
    utente.hash_password = cripta_password(nuova)
    adesso = datetime.now(UTC)
    db.execute(
        update(ReimpostaPassword)
        .where(
            ReimpostaPassword.utente_id == utente.id,
            ReimpostaPassword.usato_il.is_(None),
        )
        .values(usato_il=adesso)
    )
    return utente


# ------------------------------------------------------------- sessioni

def collega_sessione_a_utente(db: Session, sessione: Sessione, utente: Utente) -> None:
    """Lega la sessione anonima all'account e trasferisce le sue bozze.

    Usata sia alla registrazione sia al login: chi si logga su un browser
    che ha già un invito anonimo in corso non deve perderlo.
    """
    db.execute(
        update(Evento)
        .where(Evento.proprietario_sessione_id == sessione.id)
        .values(proprietario_utente_id=utente.id, proprietario_sessione_id=None)
    )
    sessione.utente_id = utente.id


def scollega_sessione(sessione: Sessione) -> None:
    """Logout: la sessione torna anonima, gli inviti dell'account spariscono
    dalla vista finché non si accede di nuovo — restano suoi, solo non
    più raggiungibili da questo cookie."""
    sessione.utente_id = None
