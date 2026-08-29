"""Verifica dell'integrazione Stripe (`pagamenti.py`).

Due categorie di test:

1. **Firma del webhook**, costruita a mano con lo stesso schema che Stripe
   usa davvero (`t=<timestamp>,v1=<hmac-sha256 di "timestamp.payload">`) e
   verificata contro `STRIPE_WEBHOOK_SECRET` reale (letto dal `.env`, non
   inventato): non serve `stripe listen` per provare che
   `stripe.Webhook.construct_event` accetta una firma valida e rifiuta una
   invalida — è matematica, non un servizio esterno.
2. **Una vera Checkout Session** creata contro l'API di Stripe in modalità
   test (rete reale, chiave `sk_test_...` reale, Price reale già creato da
   Andrei nel cruscotto): l'unica parte che *non* si può verificare in
   locale senza `stripe listen` è la consegna del webhook da parte dei
   server Stripe verso il nostro endpoint pubblico — quello resta da
   provare con un pagamento di test reale contro
   `https://andreievictoria.it/api/stripe/webhook` (vedi report).
"""

import hashlib
import hmac
import time
import uuid

import pytest
from sqlalchemy import select

from app import pagamenti
from app.config import impostazioni
from app.modelli import Acquisto, Diritto


def _firma_webhook(payload: bytes, secret: str, timestamp: int | None = None) -> str:
    timestamp = timestamp or int(time.time())
    firmato = f"{timestamp}.{payload.decode()}".encode()
    v1 = hmac.new(secret.encode(), firmato, hashlib.sha256).hexdigest()
    return f"t={timestamp},v1={v1}"


def _payload_checkout_completato(
    evento_id: str,
    payment_intent: str,
    fonte: str | None = None,
    paese: str | None = None,
    email: str | None = None,
    sessione_id: str | None = None,
) -> bytes:
    import json
    metadata = {"evento_id": evento_id}
    if fonte is not None:
        metadata["fonte"] = fonte
    # `customer_details` esiste solo a sessione completata, e `address` può
    # mancare del tutto: con billing_address_collection="auto" Stripe
    # raccoglie l'indirizzo solo quando il metodo di pagamento lo richiede.
    dettagli_cliente = None
    if paese is not None or email is not None:
        dettagli_cliente = {"email": email}
        if paese is not None:
            dettagli_cliente["address"] = {"country": paese}
    return json.dumps({
        "id": "evt_test_" + uuid.uuid4().hex[:16],
        "object": "event",  # tutti gli Event Stripe hanno questo campo:
        # `stripe.Webhook.construct_event` lo legge per distinguere gli
        # eventi "v1" da quelli "v2.core.event" prima ancora di guardare
        # `type` — un payload di test senza non passa la verifica.
        "type": "checkout.session.completed",
        "data": {
            "object": {
                "id": sessione_id or ("cs_test_" + uuid.uuid4().hex[:16]),
                "object": "checkout.session",
                "metadata": metadata,
                "client_reference_id": evento_id,
                "payment_intent": payment_intent,
                "amount_total": 6900,
                "currency": "eur",
                "customer_details": dettagli_cliente,
            }
        },
    }).encode()


@pytest.fixture()
def webhook_secret():
    secret = impostazioni().stripe_webhook_secret
    if not secret:
        pytest.skip("STRIPE_WEBHOOK_SECRET non configurato in questo ambiente")
    return secret


def test_webhook_rifiuta_firma_non_valida(db, evento_di_test, webhook_secret):
    payload = _payload_checkout_completato(str(evento_di_test.id), "pi_finto")
    with pytest.raises(pagamenti.WebhookNonValido):
        pagamenti.gestisci_webhook(db, payload, "t=123,v1=firmafalsa")

    assert db.scalars(
        select(Diritto).where(Diritto.evento_id == evento_di_test.id)
    ).first() is None


def test_webhook_rifiuta_corpo_manomesso_dopo_la_firma(db, evento_di_test, webhook_secret):
    payload = _payload_checkout_completato(str(evento_di_test.id), "pi_finto")
    firma = _firma_webhook(payload, webhook_secret)
    manomesso = payload.replace(b"pi_finto", b"pi_altro!")

    with pytest.raises(pagamenti.WebhookNonValido):
        pagamenti.gestisci_webhook(db, manomesso, firma)


def test_webhook_scrive_il_diritto_ed_e_idempotente(db, evento_di_test, webhook_secret):
    payload = _payload_checkout_completato(str(evento_di_test.id), "pi_abc123")
    firma = _firma_webhook(payload, webhook_secret)

    pagamenti.gestisci_webhook(db, payload, firma)

    diritti = db.scalars(
        select(Diritto).where(Diritto.evento_id == evento_di_test.id)
    ).all()
    assert len(diritti) == 1
    assert diritti[0].tipo == "link_permanente"
    assert diritti[0].stripe_payment_intent == "pi_abc123"

    # Stripe consegna gli eventi "at-least-once": lo stesso evento può
    # arrivare due volte. Il secondo invio non deve né fallire né duplicare.
    pagamenti.gestisci_webhook(db, payload, firma)

    diritti = db.scalars(
        select(Diritto).where(Diritto.evento_id == evento_di_test.id)
    ).all()
    assert len(diritti) == 1


def test_webhook_ignora_tipi_di_evento_non_gestiti(db, evento_di_test, webhook_secret):
    import json
    payload = json.dumps({
        "id": "evt_test_altro",
        "object": "event",
        "type": "payment_intent.created",
        "data": {"object": {"object": "payment_intent"}},
    }).encode()
    firma = _firma_webhook(payload, webhook_secret)

    pagamenti.gestisci_webhook(db, payload, firma)  # non deve sollevare

    assert db.scalars(
        select(Diritto).where(Diritto.evento_id == evento_di_test.id)
    ).first() is None


def test_crea_sessione_checkout_reale_contro_stripe_test_mode(evento_di_test):
    """Integrazione vera: chiama l'API di Stripe in modalità test con la
    chiave e il Price reali. Non simula nulla — se questo test passa,
    sappiamo che `stripe.checkout.Session.create` con il nostro Price ID è
    davvero accettato da Stripe, non solo che il codice compila."""
    cfg = impostazioni()
    if not (cfg.stripe_secret_key and cfg.stripe_price_id):
        pytest.skip("STRIPE_SECRET_KEY / STRIPE_PRICE_ID non configurati")

    sessione = pagamenti.crea_sessione_checkout(evento_di_test, "https://esempio-test.invalid")

    assert sessione.url.startswith("https://checkout.stripe.com/")
    assert sessione.client_reference_id == str(evento_di_test.id)
    assert sessione.metadata["evento_id"] == str(evento_di_test.id)
    assert sessione.mode == "payment"
    assert sessione.amount_total == 6900  # 69,00 EUR: il Price creato da Andrei

    # Verifica indipendente: rileggiamo la STESSA sessione da Stripe con una
    # chiamata separata (retrieve, non solo il valore di ritorno del create)
    # per essere sicuri che l'API l'abbia davvero persistita così.
    import stripe
    stripe.api_key = cfg.stripe_secret_key
    riletta = stripe.checkout.Session.retrieve(sessione.id)
    assert riletta.client_reference_id == str(evento_di_test.id)
    assert riletta.metadata["evento_id"] == str(evento_di_test.id)


# --- Registro della vendita (`acquisto`) -----------------------------------
#
# Richiesta di `marketing`: senza il canale di provenienza e il paese del
# cliente, la spesa pubblicitaria non è attribuibile a nessuna vendita.


def test_webhook_scrive_acquisto_con_fonte_paese_e_importo(
    db, evento_di_test, webhook_secret
):
    payload = _payload_checkout_completato(
        str(evento_di_test.id),
        "pi_con_dati",
        fonte="meta-storie",
        paese="IT",
        email="cliente@esempio.it",
        sessione_id="cs_test_con_dati",
    )
    pagamenti.gestisci_webhook(db, payload, _firma_webhook(payload, webhook_secret))

    acquisto = db.scalars(
        select(Acquisto).where(Acquisto.evento_id == evento_di_test.id)
    ).one()
    assert acquisto.fonte == "meta-storie"
    assert acquisto.paese == "IT"
    assert acquisto.email == "cliente@esempio.it"
    assert acquisto.importo_totale == 6900
    assert acquisto.valuta == "eur"
    assert acquisto.stripe_session_id == "cs_test_con_dati"
    assert acquisto.stripe_payment_intent == "pi_con_dati"


def test_webhook_senza_dati_cliente_scrive_comunque_l_acquisto(
    db, evento_di_test, webhook_secret
):
    """Il caso normale, non quello eccezionale: con
    `billing_address_collection="auto"` l'indirizzo può non arrivare
    affatto. La vendita va registrata lo stesso, con i campi vuoti."""
    payload = _payload_checkout_completato(str(evento_di_test.id), "pi_scarno")
    pagamenti.gestisci_webhook(db, payload, _firma_webhook(payload, webhook_secret))

    acquisto = db.scalars(
        select(Acquisto).where(Acquisto.evento_id == evento_di_test.id)
    ).one()
    assert acquisto.paese is None
    assert acquisto.email is None
    assert acquisto.fonte is None
    assert acquisto.importo_totale == 6900


def test_acquisto_non_si_duplica_se_stripe_riconsegna_l_evento(
    db, evento_di_test, webhook_secret
):
    payload = _payload_checkout_completato(
        str(evento_di_test.id), "pi_doppio", sessione_id="cs_test_doppio"
    )
    firma = _firma_webhook(payload, webhook_secret)

    pagamenti.gestisci_webhook(db, payload, firma)
    pagamenti.gestisci_webhook(db, payload, firma)

    acquisti = db.scalars(
        select(Acquisto).where(Acquisto.evento_id == evento_di_test.id)
    ).all()
    diritti = db.scalars(
        select(Diritto).where(Diritto.evento_id == evento_di_test.id)
    ).all()
    assert len(acquisti) == 1
    assert len(diritti) == 1


def test_cancellare_l_evento_non_cancella_la_vendita(
    db, evento_di_test, webhook_secret
):
    """Scelta di schema, non dettaglio: `acquisto.evento_id` è SET NULL.
    Una cancellazione GDPR dell'evento non deve far sparire la prova che
    una vendita è avvenuta."""
    payload = _payload_checkout_completato(
        str(evento_di_test.id), "pi_superstite", sessione_id="cs_test_superstite"
    )
    pagamenti.gestisci_webhook(db, payload, _firma_webhook(payload, webhook_secret))

    from app.modelli import Evento
    db.delete(db.get(Evento, evento_di_test.id))
    db.commit()

    acquisto = db.scalars(
        select(Acquisto).where(Acquisto.stripe_session_id == "cs_test_superstite")
    ).one()
    assert acquisto.evento_id is None
    assert acquisto.stripe_payment_intent == "pi_superstite"


@pytest.mark.parametrize(
    "grezzo, atteso",
    [
        ("  Meta-Storie  ", "meta-storie"),
        ("META", "meta"),
        ("wedding planner", "wedding-planner"),
        ("<script>alert(1)</script>", "script-alert-1-script"),
        ("", None),
        (None, None),
        ("!!!", None),
        ("x" * 200, "x" * 60),
    ],
)
def test_pulisci_fonte(grezzo, atteso):
    """Arriva da una query string, cioè da chiunque: minuscolo, caratteri
    innocui, tagliato alla lunghezza della colonna."""
    assert pagamenti.pulisci_fonte(grezzo) == atteso


def test_la_fonte_arriva_davvero_a_stripe(evento_di_test):
    """Integrazione vera: la fonte deve sopravvivere fino a Stripe, non solo
    fino al nostro database — è quello che la rende leggibile dal cruscotto
    e dagli export anche se il nostro DB sparisce."""
    cfg = impostazioni()
    if not (cfg.stripe_secret_key and cfg.stripe_price_id):
        pytest.skip("STRIPE_SECRET_KEY / STRIPE_PRICE_ID non configurati")

    sessione = pagamenti.crea_sessione_checkout(
        evento_di_test, "https://esempio-test.invalid", fonte="  Meta-Storie "
    )
    assert sessione.metadata["fonte"] == "meta-storie"

    import stripe
    stripe.api_key = cfg.stripe_secret_key
    assert stripe.checkout.Session.retrieve(sessione.id).metadata["fonte"] == "meta-storie"
