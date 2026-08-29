"""Integrazione Stripe: crea la Checkout Session e riceve il webhook che
scrive il `Diritto`.

Decisioni prese qui, per chi tornerà a leggerle:

- **Un solo prodotto, un solo prezzo, creato nel cruscotto Stripe** (Andrei,
  2026-08-23): referenziamo il Price per id (`STRIPE_PRICE_ID`), non lo
  ricreiamo con `price_data` inline. Il codice non conosce l'importo: se
  cambia, cambia nel cruscotto Stripe, non qui.
- **Il diritto lo scrive solo il webhook**, mai il ritorno del browser
  (`success_url`): un utente che chiude la scheda subito dopo aver pagato
  non tornerebbe mai su quella pagina, e il pagamento andrebbe perso.
- **Idempotenza gratis**: `Diritto.stripe_payment_intent` è già `UNIQUE`
  (`modelli.py`). Stripe consegna gli eventi "at-least-once", non "exactly
  once": un secondo invio dello stesso evento genera lo stesso INSERT, che
  fallisce con `IntegrityError`; si fa rollback e si risponde comunque 200.
  Non serve una tabella di eventi processati per questo unico side-effect.
- **API version pinnata** alla stessa versione dell'endpoint webhook già
  registrato nel cruscotto Stripe (verificato via API il 2026-08-23:
  `2026-07-29.dahlia`), così la forma degli oggetti che riceviamo e di
  quelli che leggiamo via API resta coerente anche se l'account cambia
  versione di default in futuro.
"""

import logging
import re
import uuid

import stripe
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .config import impostazioni
from .modelli import Acquisto, Diritto, Evento

logger = logging.getLogger(__name__)

TIPO_LINK_PERMANENTE = "link_permanente"

stripe.api_version = "2026-07-29.dahlia"


class ConfigurazioneStripeMancante(Exception):
    """Una o più variabili STRIPE_* non sono configurate."""


class WebhookNonValido(Exception):
    """Firma assente/non verificabile o payload malformato: 400, non 500."""


def _prepara_client(richiede_price: bool = False) -> None:
    cfg = impostazioni()
    mancanti = [
        nome for nome, valore in (
            ("STRIPE_SECRET_KEY", cfg.stripe_secret_key),
            ("STRIPE_WEBHOOK_SECRET", cfg.stripe_webhook_secret),
        )
        if not valore
    ]
    if richiede_price and not cfg.stripe_price_id:
        mancanti.append("STRIPE_PRICE_ID")
    if mancanti:
        raise ConfigurazioneStripeMancante(
            "Stripe non configurato, mancano nel .env: " + ", ".join(mancanti)
        )
    stripe.api_key = cfg.stripe_secret_key


_FONTE_AMMESSA = re.compile(r"[^a-z0-9_.:-]+")


def pulisci_fonte(grezzo: str | None) -> str | None:
    """Normalizza il canale di provenienza che arriva dal browser.

    Arriva da un parametro in query string, cioè da chiunque: va trattato
    come input ostile. Minuscolo (altrimenti «Meta» e «meta» diventano due
    righe diverse nei conteggi), solo caratteri innocui, massimo 60 —
    quanto la colonna. Vuoto dopo la pulizia = nessuna fonte, non stringa
    vuota: nei conteggi `NULL` e "" sarebbero due cose diverse per errore.
    """
    if not grezzo:
        return None
    ripulito = _FONTE_AMMESSA.sub("-", str(grezzo).strip().lower()).strip("-")
    return ripulito[:60] or None


def crea_sessione_checkout(
    evento: Evento, base_url: str, fonte: str | None = None
) -> stripe.checkout.Session:
    """Crea una Checkout Session one-time per il Price già configurato.

    Ritorna la sessione intera (non solo l'URL): il chiamante HTTP userà
    `.url` per il redirect, i test possono verificare anche `.metadata` e
    `.client_reference_id` senza dover rifare una chiamata a Stripe.
    Hosted Checkout: niente Stripe.js, niente chiave pubblicabile da
    esporre al frontend.
    """
    _prepara_client(richiede_price=True)
    cfg = impostazioni()

    # La fonte viaggia dentro Stripe, non solo nel nostro database: così
    # resta leggibile anche dal cruscotto e dagli export, e sopravvive a
    # qualunque disastro nostro. Il webhook la rilegge da qui.
    metadata = {"evento_id": str(evento.id)}
    fonte = pulisci_fonte(fonte)
    if fonte:
        metadata["fonte"] = fonte

    return stripe.checkout.Session.create(
        mode="payment",
        line_items=[{"price": cfg.stripe_price_id, "quantity": 1}],
        # Ridondanza voluta: metadata e client_reference_id arrivano
        # entrambi nel webhook, non tutti gli eventi Stripe espongono l'uno
        # comodamente quanto l'altro.
        metadata=metadata,
        client_reference_id=str(evento.id),
        # Non "riuscito": il pagamento non è confermato finché non arriva
        # il webhook, che può arrivare dopo che il browser è già tornato.
        success_url=f"{base_url}/e/{evento.id}?pagamento=in_elaborazione",
        cancel_url=f"{base_url}/e/{evento.id}?pagamento=annullato",
    )


def _leggi(oggetto, chiave: str):
    """Accesso a una chiave che funziona sia su un `dict` sia su uno
    `stripe.StripeObject`.

    Dalla v12 di stripe-python, `StripeObject` **non eredita più da
    `dict`**: `.get(...)` non esiste più (scoperto qui scrivendo i test,
    non a memoria — `AttributeError: get`, non un `None` silenzioso).
    `__getitem__` invece resta supportato su entrambi i tipi, quindi
    proviamo quello e trattiamo qualunque fallimento come "assente".
    """
    try:
        return oggetto[chiave]
    except (KeyError, TypeError):
        return None


def _percorso(oggetto, *chiavi):
    """`_leggi` applicato in cascata: `customer_details.address.country`
    senza far esplodere niente se un anello di mezzo è `None`."""
    for chiave in chiavi:
        oggetto = _leggi(oggetto, chiave)
        if oggetto is None:
            return None
    return oggetto


def _evento_id_dalla_sessione(sessione) -> uuid.UUID | None:
    grezzo = _leggi(_leggi(sessione, "metadata"), "evento_id") or _leggi(
        sessione, "client_reference_id"
    )
    if not grezzo:
        return None
    try:
        return uuid.UUID(str(grezzo))
    except ValueError:
        logger.warning("Webhook Stripe con evento_id non valido: %r", grezzo)
        return None


def gestisci_webhook(db: Session, payload: bytes, firma: str) -> None:
    """Verifica la firma ed applica l'evento. Solleva `WebhookNonValido` per
    payload/firma non validi (400: mai 500, o Stripe ritenta all'infinito
    su un errore che non si risolve da solo) e `ConfigurazioneStripeMancante`
    se manca il secret (500: questo è un errore nostro, transitorio, e
    vogliamo che Stripe ritenti finché non lo risolviamo)."""
    _prepara_client()
    cfg = impostazioni()

    try:
        evento_stripe = stripe.Webhook.construct_event(
            payload, firma, cfg.stripe_webhook_secret
        )
    except (ValueError, stripe.SignatureVerificationError) as e:
        raise WebhookNonValido(f"Payload o firma non validi: {e}") from e

    if evento_stripe["type"] != "checkout.session.completed":
        return  # Non gestito: 200 comunque, non deve far ritentare Stripe.

    sessione = evento_stripe["data"]["object"]
    evento_id = _evento_id_dalla_sessione(sessione)
    if evento_id is None:
        return

    db.add(Diritto(
        evento_id=evento_id,
        tipo=TIPO_LINK_PERMANENTE,
        stripe_payment_intent=_leggi(sessione, "payment_intent"),
    ))
    db.add(_acquisto_dalla_sessione(sessione, evento_id))
    try:
        db.commit()
    except IntegrityError:
        # Stesso evento consegnato due volte, o evento_id non corrisponde
        # a nessun evento reale (FK): in entrambi i casi non c'è nulla da
        # ritentare, quindi rollback e si torna comunque 200.
        db.rollback()


def _acquisto_dalla_sessione(sessione, evento_id: uuid.UUID) -> Acquisto:
    """Il registro della vendita, con tutto quello che la Checkout Session
    porta già con sé.

    Cosa *non* c'è, e perché: la **commissione Stripe** non sta su questo
    oggetto. Vive sulla Balance Transaction del pagamento e richiederebbe
    una seconda chiamata all'API dentro il webhook — cioè un altro modo di
    fallire mentre stiamo confermando un pagamento. Stripe la conserva e la
    espone comunque nel cruscotto e negli export: se un giorno servirà in
    casa, si riconcilia a posteriori con `stripe_payment_intent`, senza
    fretta e senza rischio.

    `paese` può restare vuoto: con `billing_address_collection` su "auto"
    (il default che usiamo) Stripe chiede l'indirizzo solo quando il metodo
    di pagamento lo richiede. Per averlo sempre servirebbe "required", che
    aggiunge un modulo da compilare prima di pagare: è un cambio di
    conversione, non una scelta tecnica, e va deciso da chi guarda i numeri.
    """
    return Acquisto(
        evento_id=evento_id,
        stripe_session_id=str(_leggi(sessione, "id")),
        stripe_payment_intent=_leggi(sessione, "payment_intent"),
        importo_totale=_leggi(sessione, "amount_total"),
        valuta=_leggi(sessione, "currency"),
        paese=_percorso(sessione, "customer_details", "address", "country"),
        email=_percorso(sessione, "customer_details", "email"),
        fonte=pulisci_fonte(_percorso(sessione, "metadata", "fonte")),
    )
