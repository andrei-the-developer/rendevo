import uuid
from datetime import datetime

from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


def _id() -> Mapped[uuid.UUID]:
    return mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)


def _adesso() -> Mapped[datetime]:
    return mapped_column(DateTime(timezone=True), server_default=func.now())


class Utente(Base):
    __tablename__ = "utente"

    id: Mapped[uuid.UUID] = _id()
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    hash_password: Mapped[str] = mapped_column(String(255))
    creato_il: Mapped[datetime] = _adesso()
    email_verificata_il: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    # (vedi CodiceInvito piu' sotto per il significato)
    # Con quale codice si e' registrato, se l'ha usato: serve per sapere a chi
    # attribuire una commissione quando il servizio smettera' di essere
    # gratuito. `SET NULL` e non `CASCADE`: cancellare un codice non deve
    # cancellare gli utenti che l'hanno usato, solo scollegarli.
    codice_invito_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("codice_invito.id", ondelete="SET NULL"), nullable=True, index=True
    )

    eventi: Mapped[list["Evento"]] = relationship(back_populates="proprietario_utente")
    codice_invito: Mapped["CodiceInvito | None"] = relationship(back_populates="utenti")


class CodiceInvito(Base):
    """Un codice dato in mano a un organizzatore/influencer: chi si registra
    con questo codice gli viene attribuito. Oggi Rendevo e' gratuito, quindi
    non c'e' ancora nessuna commissione da calcolare — questa tabella esiste
    solo per non perdere l'attribuzione fin da subito, cosi' quando arrivera'
    un piano a pagamento la storia di chi ha portato chi c'e' gia'."""

    __tablename__ = "codice_invito"

    id: Mapped[uuid.UUID] = _id()
    codice: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    # Chi e', per riconoscerlo a occhio in un elenco: non e' mostrato a nessuno.
    etichetta: Mapped[str] = mapped_column(String(160))
    # Lo sconto (in centesimi) che chi si registra con questo codice avra' sul
    # prezzo, quando ci sara' un prezzo. Zero e' un codice puramente di
    # attribuzione, senza sconto.
    sconto_centesimi: Mapped[int] = mapped_column(Integer, default=0)
    attivo: Mapped[bool] = mapped_column(Boolean, default=True)
    creato_il: Mapped[datetime] = _adesso()

    utenti: Mapped[list["Utente"]] = relationship(back_populates="codice_invito")


class Sessione(Base):
    """Sessione anonima o autenticata. L'id firmato viaggia nel cookie."""

    __tablename__ = "sessione"

    id: Mapped[uuid.UUID] = _id()
    utente_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("utente.id", ondelete="CASCADE"), nullable=True, index=True
    )
    creato_il: Mapped[datetime] = _adesso()
    ultimo_uso: Mapped[datetime] = _adesso()
    scade_il: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class Evento(Base):
    __tablename__ = "evento"
    __table_args__ = (
        # Un evento senza proprietario non sarebbe raggiungibile da nessuno:
        # meglio che il database lo renda impossibile.
        CheckConstraint(
            "proprietario_utente_id IS NOT NULL OR proprietario_sessione_id IS NOT NULL",
            name="evento_ha_un_proprietario",
        ),
        Index("ix_evento_sessione", "proprietario_sessione_id"),
        Index("ix_evento_utente", "proprietario_utente_id"),
    )

    id: Mapped[uuid.UUID] = _id()
    tipo: Mapped[str] = mapped_column(String(40))          # matrimonio, compleanno, ...
    # Due scelte indipendenti: il tema porta gli ornamenti, la palette i colori.
    tema: Mapped[str] = mapped_column(String(40), default="sobrio")
    palette: Mapped[str] = mapped_column(String(40), default="oliva")
    # Il carattere dei titoli. Terza scelta indipendente da tema e palette:
    # "voglio il corsivo" non e' "voglio i fiori" ne' "voglio il verde".
    carattere: Mapped[str] = mapped_column(String(40), default="cormorant")
    stato: Mapped[str] = mapped_column(String(20), default="bozza")
    titolo_interno: Mapped[str] = mapped_column(String(160), default="")

    proprietario_utente_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("utente.id", ondelete="CASCADE"), nullable=True
    )
    proprietario_sessione_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("sessione.id", ondelete="SET NULL"), nullable=True
    )

    # Incrementata a ogni batch di operazioni: il client la rimanda per
    # accorgersi se qualcun altro ha scritto nel frattempo.
    versione: Mapped[int] = mapped_column(BigInteger, default=1)

    creato_il: Mapped[datetime] = _adesso()
    aggiornato_il: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    proprietario_utente: Mapped["Utente | None"] = relationship(back_populates="eventi")
    blocchi: Mapped[list["Blocco"]] = relationship(
        back_populates="evento",
        cascade="all, delete-orphan",
        order_by="Blocco.posizione",
    )


class Blocco(Base):
    __tablename__ = "blocco"
    __table_args__ = (Index("ix_blocco_evento_pos", "evento_id", "posizione"),)

    id: Mapped[uuid.UUID] = _id()
    evento_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("evento.id", ondelete="CASCADE")
    )
    tipo: Mapped[str] = mapped_column(String(40))

    # Numeric e non integer: per infilare un blocco tra due esistenti basta la
    # media delle loro posizioni, con un solo UPDATE invece di rinumerare
    # l'intera lista a ogni spostamento.
    posizione: Mapped[float] = mapped_column(Numeric(20, 10))

    contenuto: Mapped[dict] = mapped_column(JSONB, default=dict)
    visibile: Mapped[bool] = mapped_column(Boolean, default=True)

    evento: Mapped["Evento"] = relationship(back_populates="blocchi")


class Asset(Base):
    __tablename__ = "asset"

    id: Mapped[uuid.UUID] = _id()
    evento_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("evento.id", ondelete="CASCADE"), index=True
    )
    tipo: Mapped[str] = mapped_column(String(20))          # immagine | audio
    chiave_storage: Mapped[str] = mapped_column(String(255))
    larghezza: Mapped[int | None] = mapped_column(Integer, nullable=True)
    altezza: Mapped[int | None] = mapped_column(Integer, nullable=True)
    byte: Mapped[int] = mapped_column(Integer)
    creato_il: Mapped[datetime] = _adesso()


class LinkCondivisione(Base):
    __tablename__ = "link_condivisione"

    id: Mapped[uuid.UUID] = _id()
    evento_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("evento.id", ondelete="CASCADE"), index=True
    )
    token: Mapped[str] = mapped_column(String(64), unique=True, index=True)

    # NULL = permanente (il link che si manda agli ospiti). Valorizzato =
    # anteprima a scadenza. Dal 2026-08-24 il permanente non richiede piu'
    # nessun diritto: il pagamento non esiste piu'.
    scade_il: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    revocato_il: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    creato_il: Mapped[datetime] = _adesso()

    @property
    def permanente(self) -> bool:
        return self.scade_il is None


class ReimpostaPassword(Base):
    """Un lasciapassare a tempo per rientrare in un account.

    In tabella sta l'**hash** del token, non il token: chi legge il database
    non deve poter entrare negli account altrui. Stessa ragione per cui non
    salviamo le password in chiaro — il link vero esiste solo nella casella
    di posta di chi l'ha chiesto.

    Non c'e' unicita' su `utente_id`: chi preme due volte "ho dimenticato la
    password" genera due righe, e quella vecchia viene marcata usata dal
    codice. Un vincolo qui costringerebbe a cancellare, e perderemmo la
    traccia di quante richieste sono partite.
    """

    __tablename__ = "reimposta_password"

    id: Mapped[uuid.UUID] = _id()
    utente_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("utente.id", ondelete="CASCADE"), index=True
    )
    hash_token: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    scade_il: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    usato_il: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    creato_il: Mapped[datetime] = _adesso()


class Rsvp(Base):
    __tablename__ = "rsvp"

    id: Mapped[uuid.UUID] = _id()
    evento_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("evento.id", ondelete="CASCADE"), index=True
    )
    link_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("link_condivisione.id", ondelete="SET NULL"), nullable=True
    )
    presente: Mapped[bool] = mapped_column(Boolean)
    referente: Mapped[str] = mapped_column(String(160))
    ospiti: Mapped[list] = mapped_column(JSONB, default=list)
    note: Mapped[str] = mapped_column(Text, default="")
    messaggio: Mapped[str] = mapped_column(Text, default="")
    creato_il: Mapped[datetime] = _adesso()


class Diritto(Base):
    """Sbloccato dal webhook Stripe: la sua presenza abilita i link permanenti."""

    __tablename__ = "diritto"

    id: Mapped[uuid.UUID] = _id()
    evento_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("evento.id", ondelete="CASCADE"), index=True
    )
    tipo: Mapped[str] = mapped_column(String(40), default="link_permanente")
    stripe_payment_intent: Mapped[str | None] = mapped_column(
        String(255), unique=True, nullable=True
    )
    creato_il: Mapped[datetime] = _adesso()


class Acquisto(Base):
    """Il registro di una vendita: quanto, da dove, di che paese.

    Perché una tabella separata da `Diritto` e non tre colonne in più là
    dentro: `Diritto` risponde a «questo evento può avere un link
    permanente?» ed è governato dal ciclo di vita dell'evento. Questo è
    invece il fatto commerciale, ha una vita propria e cresce in una
    direzione diversa (dati fiscali, attribuzione, rendicontazione).

    `evento_id` è **nullable con SET NULL**, non CASCADE: cancellare un
    evento (richiesta GDPR, pulizia a scadenza) non deve cancellare la
    prova che una vendita è avvenuta. Si perde il collegamento all'evento,
    non la riga.
    """

    __tablename__ = "acquisto"

    id: Mapped[uuid.UUID] = _id()
    evento_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("evento.id", ondelete="SET NULL"), index=True, nullable=True
    )

    # Chiave di idempotenza: Stripe consegna gli eventi at-least-once, e la
    # stessa Checkout Session non deve produrre due righe.
    stripe_session_id: Mapped[str] = mapped_column(String(255), unique=True)
    stripe_payment_intent: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )

    # In centesimi, come li manda Stripe: nessun float in mezzo ai soldi.
    importo_totale: Mapped[int | None] = mapped_column(Integer, nullable=True)
    valuta: Mapped[str | None] = mapped_column(String(3), nullable=True)

    # ISO 3166-1 alpha-2, dal `customer_details` di Stripe. Nullable perché
    # con `billing_address_collection` su "auto" Stripe raccoglie
    # l'indirizzo solo quando serve: può non arrivare.
    paese: Mapped[str | None] = mapped_column(String(2), nullable=True)
    email: Mapped[str | None] = mapped_column(String(320), nullable=True)

    # Da quale canale è arrivato chi ha comprato (`?fonte=` in ingresso,
    # passato a Stripe come metadata e riletto dal webhook).
    fonte: Mapped[str | None] = mapped_column(String(60), index=True, nullable=True)

    creato_il: Mapped[datetime] = _adesso()
