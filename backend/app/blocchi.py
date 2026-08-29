"""Tipi di blocco e composizioni predefinite per tipo di evento.

Il contenuto dei blocchi vive in una colonna jsonb, ma non è JSON libero:
ogni tipo ha un modello Pydantic e l'unione è discriminata sul campo `tipo`.
È questo che tiene il JSON tipizzato invece di lasciarlo diventare una palude,
e che rende un nuovo tipo di evento una questione di composizione anziché di
codice nuovo.
"""

from typing import Annotated, Literal
from uuid import UUID

from pydantic import BaseModel, Field, TypeAdapter, field_validator


# I fiori che si possono appendere ai lati di una sezione. I nomi sono anche
# i nomi dei file in `frontend/public/ornamenti/romantico/`: aggiungerne uno
# vuol dire mettere l'immagine li' e aggiungere una voce qui.
# A che altezza della sezione sta il fiore. "meta" e' il valore storico:
# prima esisteva solo quello, e gli inviti gia' creati lo prendono da qui.
ALTEZZE_FIORE = {"alto", "meta", "basso"}

FIORI = {
    "mazzo", "ramo", "ghirlanda",
    "rododendro", "rosa-crema", "garofano", "rosa-inciso", "cesto", "rosa-piena", "rosa-magenta",
}


class _Base(BaseModel):
    model_config = {"extra": "forbid"}

    # Ornamento ai lati della sezione: nome del fiore, o stringa vuota per
    # nessuno. Sta sulla base e non sui singoli tipi perche' e' una scelta di
    # decorazione, e vale per qualunque sezione — non e' contenuto.
    fiore_sx: str = ""
    fiore_dx: str = ""
    # A che altezza sta il fiore di quel lato.
    altezza_sx: str = "meta"
    altezza_dx: str = "meta"

    @field_validator("altezza_sx", "altezza_dx")
    @classmethod
    def _altezza_conosciuta(cls, v: str) -> str:
        """Vuoto vale "meta": e' quello che facevano tutti i blocchi prima che
        l'altezza esistesse, e non deve diventare un errore."""
        v = (v or "").strip() or "meta"
        if v not in ALTEZZE_FIORE:
            raise ValueError(f"Altezza sconosciuta: {v!r}")
        return v

    @field_validator("fiore_sx", "fiore_dx")
    @classmethod
    def _fiore_conosciuto(cls, v: str) -> str:
        """Lista chiusa: il nome finisce dentro un URL nel CSS, e accettarne
        uno qualsiasi vorrebbe dire lasciare scrivere a un utente un pezzo di
        percorso."""
        v = v.strip()
        if v and v not in FIORI:
            raise ValueError(f"Fiore sconosciuto: {v!r}")
        return v


class Busta(_Base):
    """La lettera chiusa che si vede per prima.

    Non è una sezione dello scorrimento: la pagina invitato la usa come
    sipario davanti a tutto il resto. Resta però un blocco come gli altri,
    così si modifica col click destro come qualsiasi altra cosa.
    """

    tipo: Literal["busta"] = "busta"
    frase: str = ""
    titolo: str = ""            # se vuoto, prende il titolo dell'hero
    data: str = ""
    invito: str = "Apri l'invito"
    nota: str = ""


class Hero(_Base):
    tipo: Literal["hero"] = "hero"
    occhiello: str = ""
    titolo: str = ""
    sottotitolo: str = ""
    data: str = ""                       # ISO, il rendering la formatta
    ora: str = ""
    luogo: str = ""
    asset_id: UUID | None = None


class Testo(_Base):
    tipo: Literal["testo"] = "testo"
    titolo: str = ""
    corpo: str = ""
    evidenza: bool = False               # resa più grande, per l'annuncio


class Countdown(_Base):
    tipo: Literal["countdown"] = "countdown"
    data: str = ""
    ora: str = ""
    testo_finito: str = "Il grande giorno è arrivato."


class VoceProgramma(_Base):
    ora: str = ""
    titolo: str = ""
    descrizione: str = ""


class Programma(_Base):
    tipo: Literal["programma"] = "programma"
    titolo: str = "Il programma"
    voci: list[VoceProgramma] = Field(default_factory=list)


class Luogo(_Base):
    tipo: Literal["luogo"] = "luogo"
    etichetta: str = ""
    nome: str = ""
    indirizzo: str = ""
    ora: str = ""
    mappa: str = ""                      # validata come http/https alla scrittura


class FotoGalleria(_Base):
    asset_id: UUID
    didascalia: str = ""


class Galleria(_Base):
    tipo: Literal["galleria"] = "galleria"
    titolo: str = ""
    foto: list[FotoGalleria] = Field(default_factory=list)
    scorrimento: Literal["carosello", "griglia"] = "carosello"


class Nota(_Base):
    tipo: Literal["nota"] = "nota"
    titolo: str = ""
    corpo: str = ""


class Musica(_Base):
    tipo: Literal["musica"] = "musica"
    asset_id: UUID | None = None
    titolo_brano: str = ""
    # Senza un file caricato suona il brano incluso, sintetizzato da noi e
    # quindi libero da diritti di terzi. Chi carica il proprio lo sostituisce.
    predefinito: bool = True


class Rsvp(_Base):
    tipo: Literal["rsvp"] = "rsvp"
    titolo: str = "Ci sarai?"
    scadenza: str = ""
    chiedi_ospiti: bool = True
    chiedi_note: bool = True
    etichetta_si: str = "Ci sarò"
    etichetta_no: str = "Non potrò venire"


Contenuto = Annotated[
    Busta | Hero | Testo | Countdown | Programma | Luogo | Galleria | Nota
    | Musica | Rsvp,
    Field(discriminator="tipo"),
]

_adattatore = TypeAdapter(Contenuto)

TIPI = {
    "busta", "hero", "testo", "countdown", "programma",
    "luogo", "galleria", "nota", "musica", "rsvp",
}


def valida(tipo: str, contenuto: dict) -> dict:
    """Normalizza il contenuto di un blocco, o solleva ValidationError."""
    return _adattatore.validate_python({**contenuto, "tipo": tipo}).model_dump(
        mode="json"
    )


# ---------------------------------------------------------------------------
# Temi e palette: due dimensioni indipendenti
# ---------------------------------------------------------------------------

# Il TEMA decide gli ornamenti e i caratteri; la PALETTE decide i colori.
# Sono separati perché sono due scelte diverse: «voglio dei fiori» non è
# «voglio il verde». Ogni combinazione è valida.
# I token di stile vivono nel frontend (app/temi.css); qui teniamo l'elenco
# valido e le etichette per i menu.
TEMI: dict[str, dict[str, str]] = {
    "sobrio": {
        "etichetta": "Sobrio",
        "descrizione": "Nessun ornamento, solo tipografia. Pulito e discreto.",
    },
    "romantico": {
        "etichetta": "Romantico",
        "descrizione": "Fiori ai lati e piccoli dettagli, senza esagerare.",
    },
}

PALETTE: dict[str, dict[str, str]] = {
    "oliva": {
        "etichetta": "Verde oliva",
        "descrizione": "Verde caldo e ottone antico su avorio.",
    },
    "blu": {
        "etichetta": "Blu scuro",
        "descrizione": "Blu notte e oro tenue su carta fredda.",
    },
}

# I caratteri per i titoli. Il nome e' anche il valore di `data-carattere` in
# pagina: aggiungerne uno vuol dire una voce qui e una regola nel CSS.
#
# Tutti da Google Fonts, con licenza aperta e commerciale, e auto-ospitati
# alla build da `next/font/google`: nessuna chiamata a Google a runtime.
CARATTERI: dict[str, dict[str, str]] = {
    "cormorant": {
        "etichetta": "Classico",
        "descrizione": "Garamond moderno. Sobrio, si legge sempre.",
    },
    "playfair": {
        "etichetta": "Elegante",
        "descrizione": "Serif di forte contrasto, deciso.",
    },
    "italiana": {
        "etichetta": "Slanciato",
        "descrizione": "Serif alto e stretto, un po' art déco.",
    },
    "great-vibes": {
        "etichetta": "Corsivo",
        "descrizione": "Corsivo pieno, da partecipazione classica.",
    },
    "pinyon": {
        "etichetta": "Calligrafico",
        "descrizione": "Calligrafia inglese, sottile e formale.",
    },
    "parisienne": {
        "etichetta": "Manoscritto",
        "descrizione": "Corsivo morbido, meno formale.",
    },
    "tangerine": {
        "etichetta": "Svolazzante",
        "descrizione": "Calligrafia leggera, molto decorativa.",
    },
}


def carattere_valido(carattere: str) -> str | None:
    carattere = (carattere or "").strip()
    return carattere if carattere in CARATTERI else None


# Temi ritirati: gli inviti creati prima continuano a funzionare.
ALIAS_TEMI = {
    "salvia": "sobrio",
    "agrumi": "sobrio",
    "allegro": "sobrio",
    "notte": "sobrio",
}


def tema_valido(tema: str) -> str | None:
    """Restituisce il tema canonico, o None se non esiste."""
    tema = (tema or "").strip()
    tema = ALIAS_TEMI.get(tema, tema)
    return tema if tema in TEMI else None


def palette_valida(palette: str) -> str | None:
    palette = (palette or "").strip()
    return palette if palette in PALETTE else None


# ---------------------------------------------------------------------------
# Composizioni predefinite: un tipo di evento è una lista di blocchi più un tema
# ---------------------------------------------------------------------------

MODELLI: dict[str, dict] = {
    "matrimonio": {
        "etichetta": "Matrimonio",
        "tema": "romantico",
        "palette": "oliva",
        "blocchi": [
            Busta(frase="Ci sposiamo!", data="",
                  nota="Con musica · alza il volume"),
            Hero(occhiello="Ci sposiamo", titolo="Giulia & Marco",
                 luogo="Chiesa di Santa Maria Assunta"),
            Countdown(),
            Testo(evidenza=True, corpo=(
                "Con immensa gioia vi annunciamo il nostro matrimonio.\n"
                "Saremmo felici di avervi accanto per condividere l'inizio "
                "della nostra nuova vita insieme.")),
            Testo(titolo="La nostra storia", corpo=(
                "Ci siamo conosciuti una sera d'estate, per caso.\n\n"
                "Da quel momento non ci siamo più lasciati.")),
            Programma(voci=[
                VoceProgramma(ora="16:00", titolo="Cerimonia",
                              descrizione="Vi aspettiamo qualche minuto prima."),
                VoceProgramma(ora="17:15", titolo="Aperitivo",
                              descrizione="Brindisi e foto in giardino."),
                VoceProgramma(ora="18:30", titolo="Cena"),
                VoceProgramma(ora="22:00", titolo="Musica e balli"),
            ]),
            Luogo(etichetta="Cerimonia", nome="Chiesa di Santa Maria Assunta",
                  indirizzo="Piazza del Duomo 1, Firenze", ora="16:00"),
            Luogo(etichetta="Ricevimento", nome="Villa Le Fontanelle",
                  indirizzo="Via delle Colline 24, Fiesole", ora="18:30"),
            Galleria(titolo="Noi due"),
            Nota(titolo="Dress code", corpo=(
                "Elegante. Vi chiediamo gentilmente di evitare il bianco.")),
            Nota(titolo="Regali", corpo="Il regalo più bello è la vostra presenza."),
            Rsvp(),
            Musica(),
        ],
    },
    "compleanno": {
        "etichetta": "Compleanno",
        "tema": "sobrio",
        "palette": "blu",
        "blocchi": [
            Busta(frase="Si festeggia!", nota="Con musica · alza il volume"),
            Hero(occhiello="Si festeggia", titolo="I 40 di Luca"),
            Countdown(),
            Testo(evidenza=True, corpo="Ho una scusa per vedervi tutti insieme.\nNon fatemela sprecare."),
            Programma(voci=[
                VoceProgramma(ora="20:00", titolo="Arrivo e aperitivo"),
                VoceProgramma(ora="21:30", titolo="Cena"),
                VoceProgramma(ora="23:30", titolo="Torta"),
            ]),
            Luogo(etichetta="Dove", nome="", indirizzo=""),
            Galleria(titolo="Anni scorsi"),
            Nota(titolo="Regali", corpo="Nessun regalo. Portate voglia di stare alzati."),
            Rsvp(titolo="Vieni?"),
            Musica(),
        ],
    },
    "festa_sorpresa": {
        "etichetta": "Festa a sorpresa",
        "tema": "sobrio",
        "palette": "blu",
        "blocchi": [
            Busta(frase="Shhh… è una sorpresa",
                  invito="Apri, ma non dirlo a nessuno",
                  nota="Con musica · alza il volume"),
            Hero(occhiello="È una sorpresa", titolo="Per Anna"),
            # In una sorpresa l'avvertimento viene prima di tutto il resto:
            # è l'informazione che rovina la festa se si legge troppo tardi.
            Nota(titolo="Acqua in bocca", corpo=(
                "Anna non ne sa nulla. Non scrivetele, non taggatela, "
                "non commentate da nessuna parte.")),
            Countdown(),
            Testo(evidenza=True, corpo="Arrivate in orario: alle 21:00 le luci si spengono."),
            Programma(voci=[
                VoceProgramma(ora="20:30", titolo="Arrivo degli ospiti",
                              descrizione="In silenzio, per favore."),
                VoceProgramma(ora="21:00", titolo="Arriva Anna"),
                VoceProgramma(ora="21:15", titolo="Si festeggia"),
            ]),
            Luogo(etichetta="Dove", nome="", indirizzo=""),
            Rsvp(titolo="Ci sei?"),
            Musica(),
        ],
    },
}


def blocchi_predefiniti(tipo: str) -> list[tuple[str, dict]]:
    """Coppie (tipo_blocco, contenuto) per creare un nuovo evento."""
    modello = MODELLI.get(tipo)
    if modello is None:
        raise KeyError(tipo)
    return [(b.tipo, b.model_dump(mode="json")) for b in modello["blocchi"]]
