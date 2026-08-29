"""Invio email via SMTP.

Solo `smtplib` e `email` della libreria standard: nessun pacchetto in piu',
nessun servizio esterno obbligatorio. Funziona con qualunque casella che
parli SMTP — Gmail con una password per app, il mail del dominio, Brevo,
Mailgun: cambiano solo le quattro righe nel `.env`.

Se SMTP non e' configurato, `invia()` non solleva: registra un avviso e
restituisce False. Il chiamante deve comportarsi identicamente nei due casi,
perche' altrimenti la differenza fra "mandata" e "non mandata" direbbe a un
estraneo se un indirizzo e' registrato o no.
"""

import logging
import smtplib
import ssl
from email.message import EmailMessage

from .config import impostazioni

registro = logging.getLogger("inviti.posta")


def configurata() -> bool:
    c = impostazioni()
    return bool(c.smtp_host and c.smtp_mittente)


def invia(a: str, oggetto: str, testo: str) -> bool:
    """True se consegnata al server SMTP. Non solleva mai: un errore di posta
    non deve far fallire la richiesta HTTP che l'ha originata."""
    c = impostazioni()
    if not configurata():
        registro.warning(
            "SMTP non configurato: email a %s non inviata (oggetto: %s). "
            "Servono INVITI_SMTP_HOST e INVITI_SMTP_MITTENTE nel .env.",
            a, oggetto,
        )
        return False

    messaggio = EmailMessage()
    messaggio["From"] = c.smtp_mittente
    messaggio["To"] = a
    messaggio["Subject"] = oggetto
    messaggio.set_content(testo)

    try:
        if c.smtp_porta == 465:
            # Porta 465 = TLS implicito: la connessione nasce gia' cifrata.
            with smtplib.SMTP_SSL(
                c.smtp_host, c.smtp_porta, timeout=15,
                context=ssl.create_default_context(),
            ) as s:
                if c.smtp_utente:
                    s.login(c.smtp_utente, c.smtp_password)
                s.send_message(messaggio)
        else:
            # 587 (e 25): si parte in chiaro e si sale a TLS con STARTTLS.
            with smtplib.SMTP(c.smtp_host, c.smtp_porta, timeout=15) as s:
                s.ehlo()
                s.starttls(context=ssl.create_default_context())
                s.ehlo()
                if c.smtp_utente:
                    s.login(c.smtp_utente, c.smtp_password)
                s.send_message(messaggio)
    except Exception:
        # Volutamente largo: smtplib alza una decina di eccezioni diverse, piu'
        # quelle di rete e di TLS. Nessuna deve arrivare all'utente.
        registro.exception("Invio email a %s fallito", a)
        return False

    registro.info("Email inviata a %s (%s)", a, oggetto)
    return True
