import time
import uuid
from collections import defaultdict
from datetime import UTC, datetime

from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from . import auth, blocchi as tipi_blocco
from . import posta
from . import servizi, storage
from .config import impostazioni
from .db import sessione as dip_db
from .modelli import Asset as ModelloAsset
from .modelli import CodiceInvito, Evento, LinkCondivisione, Rsvp as ModelloRsvp, Sessione, Utente
from .sessioni import sessione_corrente

app = FastAPI(title="Inviti digitali", version="2.0.0-dev")

cfg = impostazioni()
if cfg.storage == "locale":
    # Solo in sviluppo: in produzione i media passano dal proxy, non da qui.
    cfg.storage_locale_dir.mkdir(parents=True, exist_ok=True)
    app.mount("/media", StaticFiles(directory=cfg.storage_locale_dir), name="media")

app.add_middleware(
    CORSMiddleware,
    allow_origins=impostazioni().origini_cors,
    allow_credentials=True,      # indispensabile: la sessione è in un cookie
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------------------------------------------------- schemi

class CreaEvento(BaseModel):
    tipo: str


class Operazioni(BaseModel):
    operazioni: list[dict] = Field(default_factory=list)
    versione: int | None = None



class InviaRsvp(BaseModel):
    presente: bool
    referente: str = Field(min_length=1, max_length=160)
    ospiti: list[str] = Field(default_factory=list)
    note: str = ""
    messaggio: str = ""


class DimenticataPassword(BaseModel):
    email: str = Field(max_length=320)


class ReimpostaPassword(BaseModel):
    token: str = Field(min_length=16, max_length=200)
    password: str = Field(min_length=8, max_length=200)


class DatiAuth(BaseModel):
    email: str = Field(max_length=320)
    password: str = Field(min_length=8, max_length=200)


class DatiRegistrazione(DatiAuth):
    # Facoltativo, e sbagliarlo non blocca la registrazione: chi lo scrive a
    # mano da un'email puo' fare un errore di battitura, e non e' colpa sua
    # se perde uno sconto per questo — la registrazione va avanti comunque.
    codice: str | None = Field(default=None, max_length=40)


# --------------------------------------------------------------- limite login

# In memoria: sufficiente per un solo processo. Se in produzione si passa a
# più worker, va spostato su Redis (già nello stack, non ancora usato per
# questo). Stesso schema del limite RSVP dell'MVP precedente.
MAX_TENTATIVI_LOGIN = 8
FINESTRA_LOGIN = 600
_tentativi_login: dict[str, list[float]] = defaultdict(list)


def _login_limite_superato(ip: str) -> bool:
    ora = time.monotonic()
    recenti = [t for t in _tentativi_login[ip] if ora - t < FINESTRA_LOGIN]
    _tentativi_login[ip] = recenti
    if len(recenti) >= MAX_TENTATIVI_LOGIN:
        return True
    recenti.append(ora)
    return False


# ------------------------------------------------------------ serializzazione

def _blocco_json(b) -> dict:
    return {
        "id": str(b.id),
        "tipo": b.tipo,
        "posizione": float(b.posizione),
        "visibile": b.visibile,
        "contenuto": b.contenuto,
    }


def _evento_json(
    evento: Evento, db: Session, blocchi_visibili_solo: bool = False
) -> dict:
    blocchi = sorted(evento.blocchi, key=lambda b: float(b.posizione))
    if blocchi_visibili_solo:
        blocchi = [b for b in blocchi if b.visibile]

    # I blocchi referenziano gli asset per id; il client ha bisogno della
    # chiave di storage e delle dimensioni per costruire gli URL e riservare
    # lo spazio prima che l'immagine arrivi.
    righe = db.scalars(
        select(ModelloAsset).where(ModelloAsset.evento_id == evento.id)
    ).all()
    return {
        "id": str(evento.id),
        "tipo": evento.tipo,
        "titolo": evento.titolo_interno,
        "tema": evento.tema,
        "palette": evento.palette,
        "carattere": evento.carattere,
        "stato": evento.stato,
        "versione": evento.versione,
        "blocchi": [_blocco_json(b) for b in blocchi],
        "asset": {
            str(a.id): {
                "chiave": a.chiave_storage,
                "tipo": a.tipo,
                "larghezza": a.larghezza,
                "altezza": a.altezza,
            }
            for a in righe
        },
    }


def _mio_evento(db: Session, evento_id: str, ses: Sessione) -> Evento:
    try:
        chiave = uuid.UUID(evento_id)
    except ValueError:
        raise HTTPException(404, "Invito non trovato")

    evento = db.get(Evento, chiave)
    if evento is None:
        raise HTTPException(404, "Invito non trovato")

    # Interruttore unico, in `config.py`. Quando e' acceso il controllo di
    # proprieta' non viene fatto: basta conoscere l'URL. Il resto della
    # funzione resta intatto apposta — richiudere e' una riga, non un
    # ripristino da fare a memoria in sei punti diversi.
    if impostazioni().modifica_aperta:
        return evento

    proprio = evento.proprietario_sessione_id == ses.id or (
        ses.utente_id is not None
        and evento.proprietario_utente_id == ses.utente_id
    )
    if not proprio:
        # 404 e non 403: a chi non è suo non diciamo nemmeno che esiste.
        raise HTTPException(404, "Invito non trovato")
    return evento


# -------------------------------------------------------------------- rotte

@app.get("/api/salute")
async def salute() -> dict:
    return {"stato": "ok"}


# ---------------------------------------------------------------- autenticazione

def _utente_json(u: Utente | None) -> dict:
    return {"utente": {"email": u.email} if u else None}


@app.get("/api/auth/chi_sono")
async def chi_sono(
    db: Session = Depends(dip_db),
    ses: Sessione = Depends(sessione_corrente),
) -> dict:
    utente = db.get(Utente, ses.utente_id) if ses.utente_id else None
    return _utente_json(utente)


@app.post("/api/auth/registrati", status_code=201)
async def registrati(
    corpo: DatiRegistrazione,
    db: Session = Depends(dip_db),
    ses: Sessione = Depends(sessione_corrente),
) -> dict:
    email = auth.email_valida(corpo.email)
    if email is None:
        raise HTTPException(400, "Indirizzo email non valido")

    utente = Utente(email=email, hash_password=auth.cripta_password(corpo.password))

    # Un codice sbagliato o scaduto non blocca la registrazione: si registra
    # comunque, solo senza l'attribuzione/lo sconto.
    codice_applicato = False
    if corpo.codice:
        riga = db.scalars(
            select(CodiceInvito).where(
                CodiceInvito.codice == corpo.codice.strip().upper(),
                CodiceInvito.attivo.is_(True),
            )
        ).first()
        if riga is not None:
            utente.codice_invito_id = riga.id
            codice_applicato = True

    db.add(utente)
    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "Esiste già un account con questa email")

    # Chi si registra avendo già un invito anonimo in corso non deve perderlo.
    auth.collega_sessione_a_utente(db, ses, utente)
    db.commit()
    return {**_utente_json(utente), "codice_applicato": codice_applicato}


@app.post("/api/auth/accedi")
async def accedi(
    richiesta: Request,
    corpo: DatiAuth,
    db: Session = Depends(dip_db),
    ses: Sessione = Depends(sessione_corrente),
) -> dict:
    ip = richiesta.client.host if richiesta.client else "sconosciuto"
    if _login_limite_superato(ip):
        raise HTTPException(429, "Troppi tentativi. Riprova più tardi.")

    email = auth.email_valida(corpo.email)
    utente = (
        db.scalars(select(Utente).where(Utente.email == email)).first()
        if email
        else None
    )
    # Lo stesso messaggio per email inesistente e password sbagliata: non
    # diciamo a chi tenta di indovinare quali email sono registrate.
    if utente is None or not auth.verifica_password(corpo.password, utente.hash_password):
        raise HTTPException(401, "Email o password non corrette")

    auth.collega_sessione_a_utente(db, ses, utente)
    db.commit()
    return _utente_json(utente)


@app.post("/api/auth/password/dimenticata", status_code=202)
async def password_dimenticata(
    richiesta: Request,
    corpo: DimenticataPassword,
    lavori: BackgroundTasks,
    db: Session = Depends(dip_db),
) -> dict:
    """Manda per email il link per reimpostare la password.

    Risponde **sempre** 202 con lo stesso messaggio, che l'indirizzo esista o
    no. Distinguere i due casi trasformerebbe questo endpoint in uno
    strumento per scoprire chi e' registrato, che e' esattamente quello che
    l'endpoint di login evita gia' col suo "email o password non corrette".

    Stesso limite per IP del login: senza, si potrebbe usare per tempestare di
    email un indirizzo altrui.
    """
    ip = richiesta.client.host if richiesta.client else "sconosciuto"
    risposta = {
        "messaggio": "Se l'indirizzo è registrato, il link è in arrivo. "
                     "Controlla anche la posta indesiderata."
    }
    if _login_limite_superato(ip):
        raise HTTPException(429, "Troppi tentativi. Riprova più tardi.")

    email = auth.email_valida(corpo.email)
    utente = (
        db.scalars(select(Utente).where(Utente.email == email)).first()
        if email
        else None
    )
    if utente is None:
        return risposta

    token = auth.crea_richiesta_reimposta(db, utente)
    db.commit()

    minuti = impostazioni().reimposta_minuti
    collegamento = f"{impostazioni().base_pubblica.rstrip('/')}/password/{token}"
    # In coda, non qui: un server SMTP lento terrebbe appesa la richiesta, e
    # il tempo di risposta direbbe comunque se l'indirizzo esiste.
    lavori.add_task(
        posta.invia,
        utente.email,
        "Reimposta la password di Inviti",
        f"Ciao,\n\n"
        f"hai chiesto di reimpostare la password del tuo account Inviti.\n"
        f"Apri questo link entro {minuti} minuti:\n\n"
        f"{collegamento}\n\n"
        f"Se non sei stato tu, ignora questo messaggio: la password attuale "
        f"resta quella di prima e il link scade da solo.\n",
    )
    return risposta


@app.post("/api/auth/password/reimposta")
async def reimposta_password(
    corpo: ReimpostaPassword,
    db: Session = Depends(dip_db),
    ses: Sessione = Depends(sessione_corrente),
) -> dict:
    """Cambia la password con un link valido, e fa entrare subito.

    Farlo entrare e' voluto: chi ha appena dimostrato di controllare la
    casella non deve ridigitare la password che ha appena scelto. Vale anche
    il collegamento delle bozze anonime, come al login.
    """
    riga = auth.richiesta_valida(db, corpo.token)
    if riga is None:
        raise HTTPException(
            400, "Questo link non è più valido. Chiedine un altro."
        )
    utente = auth.consuma_richiesta(db, riga, corpo.password)
    auth.collega_sessione_a_utente(db, ses, utente)
    db.commit()
    return _utente_json(utente)


@app.get("/api/auth/password/verifica/{token}")
async def verifica_link_password(token: str, db: Session = Depends(dip_db)) -> dict:
    """Dice alla pagina se il link vale, prima di far scrivere la password.

    Senza, l'utente compone una password nuova e scopre solo premendo Invia
    che il link era scaduto da un'ora.
    """
    return {"valido": auth.richiesta_valida(db, token) is not None}


@app.post("/api/auth/esci")
async def esci(
    db: Session = Depends(dip_db),
    ses: Sessione = Depends(sessione_corrente),
) -> dict:
    auth.scollega_sessione(ses)
    db.commit()
    return {"ok": True}


@app.get("/api/modelli")
async def modelli() -> dict:
    """Tipi di evento disponibili, per la schermata di creazione."""
    return {
        "modelli": [
            {"tipo": t, "etichetta": m["etichetta"], "tema": m["tema"],
             "blocchi": len(m["blocchi"])}
            for t, m in tipi_blocco.MODELLI.items()
        ]
    }


@app.get("/api/aspetto")
async def aspetto() -> dict:
    """Temi e palette selezionabili: due scelte indipendenti fra loro e dal
    tipo di evento."""
    def elenca(registro: dict) -> list[dict]:
        return [
            {"id": i, "etichetta": v["etichetta"], "descrizione": v["descrizione"]}
            for i, v in registro.items()
        ]

    return {
        "temi": elenca(tipi_blocco.TEMI),
        "palette": elenca(tipi_blocco.PALETTE),
        "caratteri": elenca(tipi_blocco.CARATTERI),
    }


@app.post("/api/eventi", status_code=201)
async def crea_evento(
    corpo: CreaEvento,
    db: Session = Depends(dip_db),
    ses: Sessione = Depends(sessione_corrente),
) -> dict:
    try:
        evento = servizi.crea_evento(db, corpo.tipo, ses.id)
    except servizi.ErroreOperazione as e:
        raise HTTPException(400, str(e))
    return _evento_json(evento, db)


@app.get("/api/eventi")
async def elenca_eventi(
    db: Session = Depends(dip_db),
    ses: Sessione = Depends(sessione_corrente),
) -> dict:
    condizione = Evento.proprietario_sessione_id == ses.id
    if ses.utente_id is not None:
        condizione = condizione | (Evento.proprietario_utente_id == ses.utente_id)
    eventi = db.scalars(
        select(Evento).where(condizione).order_by(Evento.aggiornato_il.desc())
    ).all()
    return {
        "eventi": [
            {"id": str(e.id), "tipo": e.tipo, "tema": e.tema,
             "palette": e.palette, "titolo": e.titolo_interno,
             "aggiornato_il": e.aggiornato_il.isoformat()}
            for e in eventi
        ]
    }


@app.get("/api/eventi/{evento_id}")
async def leggi_evento(
    evento_id: str,
    db: Session = Depends(dip_db),
    ses: Sessione = Depends(sessione_corrente),
) -> dict:
    return _evento_json(_mio_evento(db, evento_id, ses), db)


@app.post("/api/eventi/{evento_id}/operazioni")
async def applica_operazioni(
    evento_id: str,
    corpo: Operazioni,
    db: Session = Depends(dip_db),
    ses: Sessione = Depends(sessione_corrente),
) -> dict:
    evento = _mio_evento(db, evento_id, ses)
    try:
        aggiornato = servizi.applica(db, evento, corpo.operazioni, corpo.versione)
    except servizi.Conflitto as e:
        raise HTTPException(409, str(e))
    except servizi.ErroreOperazione as e:
        raise HTTPException(400, str(e))
    return _evento_json(aggiornato, db)


@app.post("/api/eventi/{evento_id}/link", status_code=201)
async def crea_link(
    evento_id: str,
    db: Session = Depends(dip_db),
    ses: Sessione = Depends(sessione_corrente),
) -> dict:
    """Il link dell'invito. Uno solo, gratuito, che non scade.

    Non prende piu' un corpo: prima serviva a chiedere l'anteprima a 10
    minuti invece del link vero, e l'anteprima non esiste piu'.
    """
    evento = _mio_evento(db, evento_id, ses)
    link = servizi.crea_link(db, evento)
    return {"token": link.token}


@app.get("/api/eventi/{evento_id}/risposte")
async def elenca_risposte(
    evento_id: str,
    db: Session = Depends(dip_db),
    ses: Sessione = Depends(sessione_corrente),
) -> dict:
    """Le risposte ricevute, per chi possiede l'invito.

    `_mio_evento` faceva da controllo d'accesso. Dal 2026-08-25 e'
    disattivato (`modifica_aperta` in config.py): con l'URL ci entra
    chiunque, **queste risposte comprese**.

    Il conteggio lo fa il server e non il browser: "quanti a tavola" e' la
    domanda per cui si apre questa pagina, e sommare a mano una lista lunga
    e' esattamente il lavoro che il prodotto dovrebbe togliere.
    """
    evento = _mio_evento(db, evento_id, ses)

    righe = db.scalars(
        select(ModelloRsvp)
        .where(ModelloRsvp.evento_id == evento.id)
        .order_by(ModelloRsvp.creato_il.desc())
    ).all()

    risposte = [
        {
            "id": str(r.id),
            "presente": r.presente,
            "referente": r.referente,
            "ospiti": r.ospiti or [],
            # Le teste di questa risposta: chi ha risposto piu' i suoi
            # accompagnatori. Lo conta il server perche' e' la stessa somma
            # che finisce nel riepilogo: farla due volte in due posti diversi
            # e' il modo classico di ritrovarsi due numeri che non tornano.
            "totale": 1 + len(r.ospiti or []),
            "note": r.note or "",
            "messaggio": r.messaggio or "",
            "creato_il": r.creato_il.isoformat(),
        }
        for r in righe
    ]
    presenti = [r for r in risposte if r["presente"]]
    return {
        "titolo": evento.titolo_interno,
        "risposte": risposte,
        "riepilogo": {
            "risposte": len(risposte),
            "si": len(presenti),
            "no": len(risposte) - len(presenti),
            # Il numero che conta davvero: le teste, non le risposte. Chi
            # risponde per una famiglia di cinque e` una riga sola — e chi
            # risponde da solo vale comunque uno, che e' l'errore che il
            # vecchio conteggio faceva (sommava solo gli accompagnatori).
            "ospiti": sum(r["totale"] for r in presenti),
        },
    }


@app.delete("/api/eventi/{evento_id}/risposte/{risposta_id}", status_code=204)
async def cancella_risposta(
    evento_id: str,
    risposta_id: str,
    db: Session = Depends(dip_db),
    ses: Sessione = Depends(sessione_corrente),
) -> None:
    """Toglie una risposta. Serve a ripulire le prove fatte dal proprietario,
    che altrimenti restano dentro i conteggi.

    Il filtro su `evento_id` non e' ridondante: senza, chi conosce l'id di una
    risposta potrebbe cancellare quella di un altro invito passando il proprio
    `evento_id`.
    """
    evento = _mio_evento(db, evento_id, ses)
    try:
        chiave = uuid.UUID(risposta_id)
    except ValueError:
        raise HTTPException(404, "Risposta non trovata")

    riga = db.scalars(
        select(ModelloRsvp).where(
            ModelloRsvp.id == chiave,
            ModelloRsvp.evento_id == evento.id,
        )
    ).first()
    if riga is None:
        raise HTTPException(404, "Risposta non trovata")

    db.delete(riga)
    db.commit()


@app.post("/api/eventi/{evento_id}/asset", status_code=201)
async def carica_asset(
    evento_id: str,
    file: UploadFile,
    db: Session = Depends(dip_db),
    ses: Sessione = Depends(sessione_corrente),
) -> dict:
    evento = _mio_evento(db, evento_id, ses)

    tipo_mime = (file.content_type or "").lower()
    if tipo_mime.startswith("audio/"):
        meta = await storage.salva_audio(file, str(evento.id))
        tipo = "audio"
    else:
        # Non ci fidiamo del content-type: Pillow decide se è un'immagine.
        meta = await storage.salva_immagine(file, str(evento.id))
        tipo = "immagine"

    asset = ModelloAsset(
        evento_id=evento.id,
        tipo=tipo,
        chiave_storage=meta["chiave"],
        larghezza=meta["larghezza"],
        altezza=meta["altezza"],
        byte=meta["byte"],
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return {
        "id": str(asset.id),
        "tipo": asset.tipo,
        "chiave": asset.chiave_storage,
        "larghezza": asset.larghezza,
        "altezza": asset.altezza,
    }


@app.get("/api/eventi/{evento_id}/asset")
async def elenca_asset(
    evento_id: str,
    db: Session = Depends(dip_db),
    ses: Sessione = Depends(sessione_corrente),
) -> dict:
    evento = _mio_evento(db, evento_id, ses)
    righe = db.scalars(
        select(ModelloAsset)
        .where(ModelloAsset.evento_id == evento.id)
        .order_by(ModelloAsset.creato_il.desc())
    ).all()
    return {
        "asset": [
            {"id": str(a.id), "tipo": a.tipo, "chiave": a.chiave_storage,
             "larghezza": a.larghezza, "altezza": a.altezza}
            for a in righe
        ]
    }


@app.get("/api/inviti/{token}")
async def leggi_invito(token: str, db: Session = Depends(dip_db)) -> dict:
    """Vista pubblica. Nessuna sessione richiesta: la conosce solo il token."""
    link = servizi.link_valido(db, token)
    if link is None:
        esiste = db.scalars(
            select(LinkCondivisione).where(LinkCondivisione.token == token)
        ).first()
        if esiste is not None:
            # Scaduto, non inesistente: un 404 secco farebbe pensare a un sito
            # rotto, mentre 410 dice che il link c'era e non c'è più.
            raise HTTPException(410, "Questo link non è più valido")
        raise HTTPException(404, "Invito non trovato")

    evento = db.get(Evento, link.evento_id)
    # Nessun `puo_rispondere`: ogni link vivo raccoglie risposte, da quando
    # l'anteprima a scadenza e' stata tolta.
    return _evento_json(evento, db, blocchi_visibili_solo=True)


@app.post("/api/inviti/{token}/rsvp", status_code=201)
async def invia_rsvp(
    token: str,
    corpo: InviaRsvp,
    db: Session = Depends(dip_db),
) -> dict:
    link = servizi.link_valido(db, token)
    if link is None:
        raise HTTPException(410, "Questo link non è più valido")
    # `ospiti` sono **solo gli accompagnatori**: chi risponde e' gia' contato
    # da `referente` e non riscrive il proprio nome. Prima il codice ci
    # infilava dentro il referente quando la lista era vuota, e il conto
    # dipendeva da se l'invitato si fosse ricordato di ripetersi o no.
    ospiti = [n.strip()[:160] for n in corpo.ospiti if n.strip()][:20]

    db.add(ModelloRsvp(
        evento_id=link.evento_id,
        link_id=link.id,
        presente=corpo.presente,
        referente=corpo.referente.strip()[:160],
        ospiti=ospiti if corpo.presente else [],
        note=corpo.note.strip()[:500],
        messaggio=corpo.messaggio.strip()[:1000],
    ))
    db.commit()
    return {"ricevuto": True}
