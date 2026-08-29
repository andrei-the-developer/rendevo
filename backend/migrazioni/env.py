from logging.config import fileConfig

from alembic import context

from app.config import impostazioni
from app.db import motore
from app.modelli import Base

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def offline() -> None:
    context.configure(
        url=impostazioni().database_url,
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def online() -> None:
    with motore.connect() as connessione:
        context.configure(
            connection=connessione,
            target_metadata=target_metadata,
            compare_type=True,
        )
        with context.begin_transaction():
            context.run_migrations()


offline() if context.is_offline_mode() else online()
