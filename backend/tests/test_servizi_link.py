"""`crea_link()` dopo la rimozione del pagamento e dell'anteprima.

Storia breve di questo file, perché spiega perché i test sono questi:
prima il link permanente richiedeva un `Diritto` scritto dal webhook Stripe,
e accanto c'era un link di anteprima a 10 minuti per chi non aveva pagato.
Il 2026-08-24 Andrei ha tolto il pagamento, e poi anche l'anteprima ("tutti
possono usare l'app, senza limitazioni"). Resta un link solo, gratuito, che
non scade.

La proprietà che conta è l'**idempotenza**: il pulsante "Copia link invito"
chiama questo codice a ogni pressione e deve restituire sempre lo stesso URL.
Se ne generasse uno nuovo ogni volta, chi ha già mandato il link su WhatsApp
si ritroverebbe con più link vivi per lo stesso invito e non saprebbe più
quale ha distribuito.
"""

from datetime import UTC, datetime

from app import servizi


def test_il_link_non_scade_e_non_richiede_niente(db, evento_di_test):
    link = servizi.crea_link(db, evento_di_test)

    assert link.scade_il is None
    assert link.token


def test_e_idempotente(db, evento_di_test):
    primo = servizi.crea_link(db, evento_di_test)
    secondo = servizi.crea_link(db, evento_di_test)

    assert secondo.id == primo.id
    assert secondo.token == primo.token


def test_un_link_revocato_non_viene_riusato(db, evento_di_test):
    """Revocare serve a bruciare un link distribuito per sbaglio: se poi
    venisse restituito di nuovo, la revoca non servirebbe a niente."""
    primo = servizi.crea_link(db, evento_di_test)
    primo.revocato_il = datetime.now(UTC)
    db.flush()

    secondo = servizi.crea_link(db, evento_di_test)

    assert secondo.token != primo.token
    assert secondo.scade_il is None


def test_link_valido_scarta_i_revocati(db, evento_di_test):
    link = servizi.crea_link(db, evento_di_test)
    assert servizi.link_valido(db, link.token) is not None

    link.revocato_il = datetime.now(UTC)
    db.flush()
    assert servizi.link_valido(db, link.token) is None
