from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

RADICE = Path(__file__).resolve().parent.parent


class Impostazioni(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=RADICE / ".env", env_prefix="INVITI_", extra="ignore"
    )

    database_url: str = "postgresql+psycopg://inviti:inviti_dev@127.0.0.1:5432/inviti"

    # Firma dei cookie di sessione. In produzione va passata dall'ambiente:
    # cambiarla invalida tutte le sessioni anonime, e con esse la proprietà
    # degli inviti non ancora rivendicati da un account.
    segreto: str = "sviluppo-non-usare-in-produzione"

    # "locale" tiene i file su disco, "s3" parla a MinIO. Lo stesso codice
    # applicativo non sa quale dei due sta usando.
    storage: str = "locale"
    storage_locale_dir: Path = RADICE / "dati" / "upload"
    s3_endpoint: str = ""
    s3_bucket: str = "inviti"
    s3_access_key: str = ""
    s3_secret_key: str = ""

    origini_cors: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # ⚠️  APERTURA TEMPORANEA — decisione di Andrei del 2026-08-25.
    #
    # A True, chiunque abbia l'URL /e/{id} apre e modifica quell'invito, e
    # legge le sue risposte. Non c'e' piu' nessun controllo di proprieta'.
    # L'id e' un UUID, quindi non si indovina — ma un link condiviso, una
    # cronologia, uno screenshot bastano a darlo via.
    #
    # Vale finche' non ci sono utenti veri. **Prima del lancio va rimessa a
    # False**: da quel momento le pagine /e/{id}/risposte contengono nomi di
    # invitati, cioe' dati personali di terzi, e lasciarli aperti non e' piu'
    # una scorciatoia ma un problema.
    modifica_aperta: bool = True

    # L'indirizzo pubblico del sito, usato per costruire i link dentro le
    # email. Deve essere quello che l'utente vede nel browser, non un
    # indirizzo interno: e' un link su cui deve poter cliccare.
    # Ripiego per lo sviluppo: in produzione arriva da INVITI_BASE_PUBBLICA,
    # che docker-compose costruisce dal DOMINIO nel .env.
    base_pubblica: str = "http://localhost:3000"

    # SMTP. Vuoti = nessuna email parte (il codice se ne accorge e lo scrive
    # nel registro, senza rompere niente). Vanno scritti nel .env, mai qui.
    smtp_host: str = ""
    smtp_porta: int = 587
    smtp_utente: str = ""
    smtp_password: str = ""
    smtp_mittente: str = ""

    # Quanto vale un link per reimpostare la password. Corto di proposito: e'
    # un lasciapassare per l'account, e chi lo chiede lo usa subito.
    reimposta_minuti: int = 60

    # Niente Stripe: il pagamento e' stato tolto dal prodotto il 2026-08-24
    # (vedi backend/archivio-pagamenti/LEGGIMI.md). Se un giorno torna, le
    # tre chiavi vanno rimesse qui.


@lru_cache
def impostazioni() -> Impostazioni:
    return Impostazioni()
