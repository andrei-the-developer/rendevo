"""`posiziona`: la primitiva del trascinamento delle sezioni.

Perché esiste, invece di ripetere `sposta` N volte: la sessione gira con
`autoflush=False` (vedi `db.py`), quindi dentro un solo batch ogni `sposta`
rileggerebbe dal database un ordine ancora vecchio. Due scambi identici si
annullano, e un salto di quattro posti lascia il blocco esattamente dov'era.
Verificato in produzione con quattro `sposta` in un batch: il blocco resta
esattamente dov'era. Non c'è un test che lo dimostri perché **qui non si
riproduce**: la sessione dei test ha `autoflush` attivo e quindi vede l'ordine
aggiornato a ogni operazione. Un test del genere verificherebbe l'ambiente di
prova, non il codice che gira davvero.
"""

import pytest

from app import servizi
from app.modelli import Blocco


@pytest.fixture
def con_blocchi(db, evento_di_test):
    """`evento_di_test` nasce vuoto apposta (vedi conftest). Qui servono
    blocchi veri e in ordine noto, perche' il trascinamento e' tutto una
    questione di ordine."""
    for i, tipo in enumerate(["busta", "hero", "testo", "programma", "nota", "rsvp"]):
        db.add(Blocco(
            evento_id=evento_di_test.id,
            tipo=tipo,
            posizione=(i + 1) * servizi.PASSO,
            contenuto={},
        ))
    db.flush()
    return evento_di_test


def blocchi(db, evento):
    return servizi._ordinati(db, evento)


def test_porta_un_blocco_in_cima(db, con_blocchi):
    lista = blocchi(db, con_blocchi)
    ultimo = lista[-1]

    servizi.applica(db, con_blocchi, [
        {"op": "posiziona", "blocco": str(ultimo.id), "dopo": None},
    ])

    assert blocchi(db, con_blocchi)[0].id == ultimo.id


def test_porta_un_blocco_dopo_un_altro(db, con_blocchi):
    lista = blocchi(db, con_blocchi)
    primo, terzo = lista[0], lista[2]

    servizi.applica(db, con_blocchi, [
        {"op": "posiziona", "blocco": str(primo.id), "dopo": str(terzo.id)},
    ])

    nuova = blocchi(db, con_blocchi)
    assert nuova.index(next(b for b in nuova if b.id == primo.id)) == 2


def test_in_fondo(db, con_blocchi):
    lista = blocchi(db, con_blocchi)
    primo, ultimo = lista[0], lista[-1]

    servizi.applica(db, con_blocchi, [
        {"op": "posiziona", "blocco": str(primo.id), "dopo": str(ultimo.id)},
    ])

    assert blocchi(db, con_blocchi)[-1].id == primo.id


def test_dopo_se_stesso_non_fa_niente(db, con_blocchi):
    prima = [b.id for b in blocchi(db, con_blocchi)]
    bersaglio = prima[2]

    servizi.applica(db, con_blocchi, [
        {"op": "posiziona", "blocco": str(bersaglio), "dopo": str(bersaglio)},
    ])

    assert [b.id for b in blocchi(db, con_blocchi)] == prima
