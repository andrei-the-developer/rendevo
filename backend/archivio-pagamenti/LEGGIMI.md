# archivio-pagamenti — Stripe, messo da parte il 2026-08-24

Decisione di Andrei: **niente pagamento finché non ci sono utenti.** La
strategia dell'MVP è farlo usare gratis, farlo conoscere e farlo passare di
mano; il pagamento (e la burocrazia che si porta dietro) si affronta dopo.

Qui dentro c'è il codice **funzionante** dell'integrazione Stripe, tolto dal
prodotto ma non buttato: checkout, verifica della firma del webhook,
idempotenza, scrittura di `Diritto` e `Acquisto`, e i 302 righe di test che lo
coprivano. Era testato e passava.

## Cosa è stato tolto dall'applicazione

- `app/pagamenti.py` -> qui.
- `tests/test_pagamenti.py` -> qui. Non basta spostarlo: pytest scende in
  tutte le sottocartelle e lo raccoglierebbe lo stesso, fallendo la raccolta
  perché importa `app.pagamenti`. Per questo `backend/pytest.ini` ora fissa
  `testpaths = tests`.
- `POST /api/eventi/{id}/pagamento` e `POST /api/stripe/webhook`: rotte
  eliminate da `app/main.py`.
- Le tre chiavi `INVITI_STRIPE_*` da `app/config.py`.
- Il controllo del `Diritto` in `servizi.crea_link()`: il link permanente ora
  è gratuito per tutti.

## Cosa NON è stato toccato, di proposito

Le tabelle **`diritto`** e **`acquisto`** restano nel database e nelle
migrazioni. Sono vuote e nessun codice le legge più. Cancellarle avrebbe
richiesto una migrazione distruttiva per guadagnare zero: due tabelle vuote non
danno fastidio a nessuno, e il giorno che il pagamento torna sono già lì.
`app/modelli.py` le definisce ancora.

Le chiavi `INVITI_STRIPE_*` sono ancora nel `.env` di produzione. Non le legge
più nessuno (`extra="ignore"` in `config.py`); toglierle è innocuo ma inutile.

## Per rimetterlo

1. Rimettere i due file al loro posto.
2. Rimettere le tre chiavi in `config.py`.
3. Rimettere le due rotte in `main.py` (stanno nella storia di questo file).
4. Rimettere il controllo del `Diritto` in `servizi.crea_link()`.
5. Riesporre `/api/stripe/webhook` in Caddy e riconfigurare l'endpoint nel
   cruscotto Stripe.
