"""Logica di dominio: creazione eventi e applicazione delle operazioni.

Le modifiche non salvano il documento intero ma un batch di operazioni. Da qui
arrivano undo/redo, salvataggio automatico e rilevamento dei conflitti senza
costruirli separatamente: il client rimanda la versione che credeva di avere e
il server rifiuta se nel frattempo è cambiata.
"""

import secrets
import uuid
from datetime import UTC, datetime
from urllib.parse import urlparse

from pydantic import ValidationError
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from . import blocchi as tipi_blocco
from . import storage
from .modelli import Asset, Blocco, Evento, LinkCondivisione, Sessione, Utente

PASSO = 1000.0

# Quanti inviti insieme puo' avere ciascun ruolo. Chi non ha ancora un
# account (sessione anonima) non ha un ruolo: resta al limite piu' basso,
# quello implicito di sempre prima che esistesse il multi-invito.
LIMITE_ANONIMO = 1
LIMITI_RUOLO = {"base": 2, "pro": 10}


class ErroreOperazione(Exception):
    """Operazione non applicabile: il chiamante la traduce in 4xx."""


class Conflitto(Exception):
    """Qualcun altro ha scritto dopo l'ultima lettura del client."""


class LimiteRaggiunto(Exception):
    """Il proprietario ha gia' il massimo di inviti permessi dal suo piano."""


def limite_inviti(utente: Utente | None) -> int:
    if utente is None:
        return LIMITE_ANONIMO
    return LIMITI_RUOLO.get(utente.ruolo, LIMITI_RUOLO["base"])


def _conta_eventi_proprietario(db: Session, ses: Sessione) -> int:
    # Stessa condizione di GET /api/eventi: conta quello che vede lì, non di
    # più e non di meno.
    condizione = Evento.proprietario_sessione_id == ses.id
    if ses.utente_id is not None:
        condizione = condizione | (Evento.proprietario_utente_id == ses.utente_id)
    return db.scalar(select(func.count()).select_from(Evento).where(condizione)) or 0


# ---------------------------------------------------------------- creazione

# Tessere disponibili in app/assets_semina/, per il segnaposto della galleria.
_TESSERE_GALLERIA = ["galleria-1", "galleria-2", "galleria-3", "galleria-4"]


def _semina_asset(db: Session, evento_id, nome_tessera: str) -> Asset:
    meta = storage.semina_immagine(nome_tessera, str(evento_id))
    asset = Asset(
        evento_id=evento_id,
        tipo="immagine",
        chiave_storage=meta["chiave"],
        larghezza=meta["larghezza"],
        altezza=meta["altezza"],
        byte=meta["byte"],
    )
    db.add(asset)
    db.flush()
    return asset


def crea_evento(db: Session, tipo: str, ses: Sessione) -> Evento:
    utente = db.get(Utente, ses.utente_id) if ses.utente_id else None
    limite = limite_inviti(utente)
    if _conta_eventi_proprietario(db, ses) >= limite:
        raise LimiteRaggiunto(
            f"Hai raggiunto il limite di {limite} inviti per il tuo piano."
        )

    try:
        predefiniti = tipi_blocco.blocchi_predefiniti(tipo)
    except KeyError:
        raise ErroreOperazione(f"Tipo di evento sconosciuto: {tipo}")

    modello = tipi_blocco.MODELLI[tipo]
    evento = Evento(
        tipo=tipo,
        tema=modello["tema"],
        palette=modello["palette"],
        titolo_interno=modello["etichetta"],
        proprietario_sessione_id=ses.id,
    )
    db.add(evento)
    db.flush()

    # Un invito appena creato non deve sembrare vuoto: la copertina e la
    # galleria partono già con un segnaposto, sostituibile con un clic
    # destro esattamente come qualunque altro campo.
    hero_asset = _semina_asset(db, evento.id, "hero")
    foto_galleria = [
        {"asset_id": str(_semina_asset(db, evento.id, nome).id),
         "didascalia": "Sostituisci con una tua foto"}
        for nome in _TESSERE_GALLERIA
    ]

    for indice, (tipo_blocco, contenuto) in enumerate(predefiniti, start=1):
        if tipo_blocco == "hero":
            contenuto = {**contenuto, "asset_id": str(hero_asset.id)}
        elif tipo_blocco == "galleria":
            contenuto = {**contenuto, "foto": foto_galleria}
        db.add(Blocco(
            evento_id=evento.id,
            tipo=tipo_blocco,
            posizione=indice * PASSO,
            contenuto=contenuto,
        ))
    db.commit()
    db.refresh(evento)
    return evento


# ---------------------------------------------------------------- operazioni

def _link_sicuro(valore: str) -> str:
    """Solo http/https: un `javascript:` finirebbe in un href renderizzato."""
    valore = (valore or "").strip()
    if not valore:
        return ""
    p = urlparse(valore)
    return valore if p.scheme in ("http", "https") and p.netloc else ""


def _pulisci_link(tipo: str, contenuto: dict) -> dict:
    if tipo == "luogo" and "mappa" in contenuto:
        contenuto = {**contenuto, "mappa": _link_sicuro(contenuto["mappa"])}
    return contenuto


def _blocco(db: Session, evento: Evento, blocco_id: str) -> Blocco:
    try:
        chiave = uuid.UUID(str(blocco_id))
    except ValueError:
        raise ErroreOperazione("Identificativo di blocco non valido")
    blocco = db.get(Blocco, chiave)
    if blocco is None or blocco.evento_id != evento.id:
        raise ErroreOperazione("Blocco non trovato in questo evento")
    return blocco


def _ordinati(db: Session, evento: Evento) -> list[Blocco]:
    return list(db.scalars(
        select(Blocco).where(Blocco.evento_id == evento.id).order_by(Blocco.posizione)
    ))


def _aggiorna(db: Session, evento: Evento, op: dict) -> None:
    blocco = _blocco(db, evento, op.get("blocco"))
    patch = op.get("contenuto")
    if not isinstance(patch, dict):
        raise ErroreOperazione("`contenuto` deve essere un oggetto")

    unito = _pulisci_link(blocco.tipo, {**blocco.contenuto, **patch})
    unito.pop("tipo", None)
    try:
        blocco.contenuto = tipi_blocco.valida(blocco.tipo, unito)
    except ValidationError as e:
        raise ErroreOperazione(f"Contenuto non valido: {e.error_count()} campi")


def _sposta(db: Session, evento: Evento, op: dict) -> None:
    """Scambia la posizione con il vicino. Su/giù prima del trascinamento:
    meno codice, e resta l'unica interazione che funzionerà anche da mobile."""
    direzione = op.get("direzione")
    if direzione not in ("su", "giu"):
        raise ErroreOperazione("`direzione` deve essere 'su' oppure 'giu'")

    blocco = _blocco(db, evento, op.get("blocco"))
    lista = _ordinati(db, evento)
    i = lista.index(blocco)
    j = i - 1 if direzione == "su" else i + 1
    if not 0 <= j < len(lista):
        return  # già in cima o in fondo: non è un errore, è un no-op

    vicino = lista[j]
    blocco.posizione, vicino.posizione = vicino.posizione, blocco.posizione


def _posiziona(db: Session, evento: Evento, op: dict) -> None:
    """Porta un blocco subito dopo un altro (o in cima, se `dopo` e' None).

    E' la primitiva del trascinamento, e non un di piu' rispetto a `sposta`:
    con `sposta` un salto di quattro posti sarebbe una sequenza di quattro
    scambi, e la sessione gira con `autoflush=False` (vedi `db.py`). Ogni
    operazione rileggerebbe dal database un ordine ancora vecchio, e due
    scambi identici si annullerebbero a vicenda: il blocco resterebbe dov'era.
    Qui invece si scrive una posizione sola, una volta.

    La posizione e' la media dei due vicini, come in `_inserisci`: infilare
    costa un UPDATE e non rinumera la lista.
    """
    blocco = _blocco(db, evento, op.get("blocco"))
    dopo_id = op.get("dopo")
    if dopo_id is not None and str(blocco.id) == str(dopo_id):
        return  # "mettiti dopo te stesso": non e' un errore, non e' un lavoro

    # Senza se stesso: altrimenti il blocco farebbe da vicino a se' medesimo
    # e la media verrebbe calcolata sulla posizione che sta per lasciare.
    lista = [b for b in _ordinati(db, evento) if b.id != blocco.id]

    if dopo_id is None:
        nuova = (float(lista[0].posizione) / 2) if lista else PASSO
    else:
        dopo = _blocco(db, evento, dopo_id)
        k = next((i for i, b in enumerate(lista) if b.id == dopo.id), None)
        if k is None:
            raise ErroreOperazione("Il blocco di riferimento non esiste piu'")
        seguente = lista[k + 1] if k + 1 < len(lista) else None
        nuova = (
            (float(dopo.posizione) + float(seguente.posizione)) / 2
            if seguente is not None
            else float(dopo.posizione) + PASSO
        )

    blocco.posizione = nuova


def _inserisci(db: Session, evento: Evento, op: dict) -> None:
    tipo = op.get("tipo")
    if tipo not in tipi_blocco.TIPI:
        raise ErroreOperazione(f"Tipo di blocco sconosciuto: {tipo}")

    lista = _ordinati(db, evento)
    dopo_id = op.get("dopo")

    if dopo_id is None:
        posizione = (float(lista[0].posizione) / 2) if lista else PASSO
    else:
        dopo = _blocco(db, evento, dopo_id)
        k = lista.index(dopo)
        seguente = lista[k + 1] if k + 1 < len(lista) else None
        # Media dei vicini: infilare un blocco costa un solo INSERT, senza
        # rinumerare la lista. È il motivo per cui posizione è numeric.
        posizione = (
            (float(dopo.posizione) + float(seguente.posizione)) / 2
            if seguente is not None
            else float(dopo.posizione) + PASSO
        )

    db.add(Blocco(
        evento_id=evento.id,
        tipo=tipo,
        posizione=posizione,
        contenuto=tipi_blocco.valida(tipo, op.get("contenuto") or {}),
    ))


def _elimina(db: Session, evento: Evento, op: dict) -> None:
    db.delete(_blocco(db, evento, op.get("blocco")))


def _visibilita(db: Session, evento: Evento, op: dict) -> None:
    blocco = _blocco(db, evento, op.get("blocco"))
    blocco.visibile = bool(op.get("visibile", True))


def _tema(db: Session, evento: Evento, op: dict) -> None:
    canonico = tipi_blocco.tema_valido(str(op.get("tema") or ""))
    if canonico is None:
        ammessi = ", ".join(tipi_blocco.TEMI)
        raise ErroreOperazione(f"Tema sconosciuto. Disponibili: {ammessi}")
    evento.tema = canonico


def _palette(db: Session, evento: Evento, op: dict) -> None:
    canonica = tipi_blocco.palette_valida(str(op.get("palette") or ""))
    if canonica is None:
        ammesse = ", ".join(tipi_blocco.PALETTE)
        raise ErroreOperazione(f"Palette sconosciuta. Disponibili: {ammesse}")
    evento.palette = canonica


def _carattere(db: Session, evento: Evento, op: dict) -> None:
    canonico = tipi_blocco.carattere_valido(str(op.get("carattere") or ""))
    if canonico is None:
        ammessi = ", ".join(tipi_blocco.CARATTERI)
        raise ErroreOperazione(f"Carattere sconosciuto. Disponibili: {ammessi}")
    evento.carattere = canonico


def _titolo(db: Session, evento: Evento, op: dict) -> None:
    # E' il nome con cui l'organizzatore riconosce l'invito nel proprio
    # elenco quando ne ha piu' di uno: non ha niente a che fare col titolo
    # scritto nel blocco "hero", che l'invitato vede.
    titolo = str(op.get("titolo") or "").strip()[:160]
    evento.titolo_interno = titolo


AZIONI = {
    "aggiorna": _aggiorna,
    "sposta": _sposta,
    "posiziona": _posiziona,
    "inserisci": _inserisci,
    "elimina": _elimina,
    "visibilita": _visibilita,
    "tema": _tema,
    "palette": _palette,
    "carattere": _carattere,
    "titolo": _titolo,
}


def applica(
    db: Session,
    evento: Evento,
    operazioni: list[dict],
    versione_attesa: int | None = None,
) -> Evento:
    if not operazioni:
        return evento
    if len(operazioni) > 100:
        raise ErroreOperazione("Troppe operazioni in un solo batch (max 100)")

    # Blocca la riga evento: due batch concorrenti sullo stesso invito si
    # mettono in fila invece di sovrascriversi a metà.
    bloccato = db.scalars(
        select(Evento).where(Evento.id == evento.id).with_for_update()
    ).one()

    if versione_attesa is not None and versione_attesa != bloccato.versione:
        raise Conflitto(
            f"L'invito è alla versione {bloccato.versione}, "
            f"il client aveva la {versione_attesa}"
        )

    for op in operazioni:
        azione = AZIONI.get(op.get("op"))
        if azione is None:
            raise ErroreOperazione(f"Operazione sconosciuta: {op.get('op')!r}")
        azione(db, bloccato, op)

    bloccato.versione += 1
    db.commit()
    db.refresh(bloccato)
    return bloccato


# ---------------------------------------------------------------------- link

def crea_link(db: Session, evento: Evento) -> LinkCondivisione:
    """Il link dell'invito, quello che si manda agli ospiti. Non scade.

    C'era anche un link di anteprima a 10 minuti: serviva a far vedere
    l'invito a chi non aveva pagato, e col pagamento e' sparito anche lui
    (decisione di Andrei del 2026-08-24, "tutti possono usare l'app senza
    limitazioni"). Chi vuole vedere l'invito come lo vedra` un ospite apre
    questo stesso link.

    E' idempotente: se ne esiste gia' uno valido lo restituisce invece di
    crearne un altro. Serve a "Copia link invito", che l'utente preme piu'
    volte -- ogni pressione non deve produrre un URL diverso da quello che
    ha gia' mandato su WhatsApp.
    """
    esistente = db.scalars(
        select(LinkCondivisione).where(
            LinkCondivisione.evento_id == evento.id,
            LinkCondivisione.scade_il.is_(None),
            LinkCondivisione.revocato_il.is_(None),
        ).order_by(LinkCondivisione.creato_il)
    ).first()
    if esistente is not None:
        return esistente

    link = LinkCondivisione(
        evento_id=evento.id,
        token=secrets.token_urlsafe(16),
    )
    db.add(link)
    db.commit()
    db.refresh(link)
    return link


def link_valido(db: Session, token: str) -> LinkCondivisione | None:
    """None se inesistente, revocato o scaduto: il chiamante distingue 404 da 410."""
    link = db.scalars(
        select(LinkCondivisione).where(LinkCondivisione.token == token)
    ).first()
    if link is None or link.revocato_il is not None:
        return None
    if link.scade_il is not None and link.scade_il <= datetime.now(UTC):
        return None
    return link
