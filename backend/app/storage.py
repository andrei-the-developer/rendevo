"""Adattatore di storage. Il codice applicativo non sa se i file finiscono
su disco o su MinIO: in sviluppo è disco, in produzione è S3-compatibile.
"""

import pathlib
import secrets
import shutil
from abc import ABC, abstractmethod
from io import BytesIO
from pathlib import Path

from fastapi import HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError

from .config import impostazioni

MAX_IMMAGINE = 8 * 1024 * 1024
MAX_AUDIO = 10 * 1024 * 1024
PEZZO = 64 * 1024

# Derivate generate all'upload: il browser scarica la misura che gli serve
# invece dell'originale da 4000 px.
MISURE = {"grande": 1800, "media": 1000, "piccola": 480}

# Le tessere segnaposto pronte in assets_semina/: da lì vengono copiate nello
# storage del nuovo evento, con lo stesso schema di chiavi degli upload veri.
CARTELLA_SEMINA = pathlib.Path(__file__).resolve().parent / "assets_semina"

FIRME_AUDIO = {
    b"ID3": "mp3",
    b"\xff\xfb": "mp3",
    b"\xff\xf3": "mp3",
    b"\xff\xf2": "mp3",
    b"OggS": "ogg",
}


class Deposito(ABC):
    @abstractmethod
    def scrivi(self, chiave: str, dati: bytes) -> None: ...

    @abstractmethod
    def elimina(self, chiave: str) -> None: ...

    @abstractmethod
    def url(self, chiave: str) -> str: ...


class DepositoLocale(Deposito):
    def __init__(self, radice: Path) -> None:
        self.radice = radice
        self.radice.mkdir(parents=True, exist_ok=True)

    def _percorso(self, chiave: str) -> Path:
        p = (self.radice / chiave).resolve()
        # Le chiavi le generiamo noi, ma un controllo costa nulla.
        if not p.is_relative_to(self.radice.resolve()):
            raise HTTPException(400, "Chiave di storage non valida")
        return p

    def scrivi(self, chiave: str, dati: bytes) -> None:
        p = self._percorso(chiave)
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_bytes(dati)

    def elimina(self, chiave: str) -> None:
        p = self._percorso(chiave)
        if p.is_file():
            p.unlink()
        elif p.is_dir():
            shutil.rmtree(p, ignore_errors=True)

    def url(self, chiave: str) -> str:
        return f"/media/{chiave}"


class DepositoS3(Deposito):
    """MinIO o qualunque S3-compatibile. boto3 si importa solo se serve."""

    def __init__(self) -> None:
        import boto3

        cfg = impostazioni()
        self.bucket = cfg.s3_bucket
        self.cliente = boto3.client(
            "s3",
            endpoint_url=cfg.s3_endpoint,
            aws_access_key_id=cfg.s3_access_key,
            aws_secret_access_key=cfg.s3_secret_key,
        )

    def scrivi(self, chiave: str, dati: bytes) -> None:
        self.cliente.put_object(Bucket=self.bucket, Key=chiave, Body=dati)

    def elimina(self, chiave: str) -> None:
        self.cliente.delete_object(Bucket=self.bucket, Key=chiave)

    def url(self, chiave: str) -> str:
        return f"/media/{chiave}"


def deposito() -> Deposito:
    cfg = impostazioni()
    if cfg.storage == "s3":
        return DepositoS3()
    return DepositoLocale(cfg.storage_locale_dir)


# --------------------------------------------------------------- ingestione

async def _leggi(file: UploadFile, limite: int) -> bytes:
    pezzi, totale = [], 0
    while pezzo := await file.read(PEZZO):
        totale += len(pezzo)
        if totale > limite:
            raise HTTPException(
                413, f"File troppo grande: il limite è {limite // (1024 * 1024)} MB."
            )
        pezzi.append(pezzo)
    if not totale:
        raise HTTPException(400, "Il file è vuoto.")
    return b"".join(pezzi)


async def salva_immagine(file: UploadFile, evento_id: str) -> dict:
    """Riscrive l'immagine con Pillow e ne genera le derivate.

    La ri-codifica è anche la sanificazione: un payload nascosto in un file
    che si spaccia per immagine non sopravvive al giro.
    """
    dati = await _leggi(file, MAX_IMMAGINE)
    try:
        img = Image.open(BytesIO(dati))
        img.load()
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError):
        raise HTTPException(400, "Formato immagine non riconosciuto o file corrotto.")

    if img.mode not in ("RGB", "L"):
        img = img.convert("RGB")

    base = f"{evento_id}/{secrets.token_urlsafe(12)}"
    dep = deposito()
    byte_totali = 0

    for nome, lato in MISURE.items():
        copia = img.copy()
        copia.thumbnail((lato, lato), Image.LANCZOS)
        buffer = BytesIO()
        copia.save(buffer, "JPEG", quality=86, optimize=True, progressive=True)
        contenuto = buffer.getvalue()
        dep.scrivi(f"{base}-{nome}.jpg", contenuto)
        byte_totali += len(contenuto)

    return {
        "chiave": base,
        "larghezza": img.width,
        "altezza": img.height,
        "byte": byte_totali,
    }


def semina_immagine(nome_tessera: str, evento_id: str) -> dict:
    """Copia una tessera segnaposto già pronta nello storage dell'evento.

    Nessuna elaborazione: le derivate sono già state generate una volta sola
    da genera_segnaposto.py e sono identiche per ogni evento che le usa —
    solo la chiave di storage cambia, per restare dentro la cartella
    dell'evento e sparire con lui se viene eliminato.
    """
    chiave = f"{evento_id}/{secrets.token_urlsafe(8)}-{nome_tessera}"
    dep = deposito()
    byte_totali = 0
    larghezza = altezza = None

    for misura, lato in MISURE.items():
        origine = CARTELLA_SEMINA / f"{nome_tessera}-{misura}.jpg"
        dati = origine.read_bytes()
        dep.scrivi(f"{chiave}-{misura}.jpg", dati)
        byte_totali += len(dati)
        if misura == "grande":
            with Image.open(origine) as img:
                larghezza, altezza = img.size

    return {"chiave": chiave, "larghezza": larghezza, "altezza": altezza, "byte": byte_totali}


async def salva_audio(file: UploadFile, evento_id: str) -> dict:
    dati = await _leggi(file, MAX_AUDIO)

    estensione = next(
        (e for firma, e in FIRME_AUDIO.items() if dati.startswith(firma)), None
    )
    if estensione is None and dati[4:8] == b"ftyp":
        estensione = "m4a"
    if estensione is None:
        raise HTTPException(
            400, "Formato audio non supportato. Carica un file MP3, M4A oppure OGG."
        )

    chiave = f"{evento_id}/{secrets.token_urlsafe(12)}.{estensione}"
    deposito().scrivi(chiave, dati)
    return {"chiave": chiave, "larghezza": None, "altezza": None, "byte": len(dati)}
