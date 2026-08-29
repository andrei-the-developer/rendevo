"""Tabella per il reimposta-password.

Revision ID: 9f2c71b4ad30
Revises: 7c1a4b9d2e08
Create Date: 2026-08-25

Nella tabella finisce l'hash SHA-256 del token, mai il token. Un backup del
database che finisse in mani sbagliate non deve consegnare l'accesso agli
account: dall'hash non si torna indietro al link.
"""

import sqlalchemy as sa
from alembic import op

revision = "9f2c71b4ad30"
down_revision = "7c1a4b9d2e08"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "reimposta_password",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "utente_id",
            sa.Uuid(),
            sa.ForeignKey("utente.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("hash_token", sa.String(64), nullable=False, unique=True),
        sa.Column("scade_il", sa.DateTime(timezone=True), nullable=False),
        sa.Column("usato_il", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "creato_il",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_index(
        "ix_reimposta_password_utente_id", "reimposta_password", ["utente_id"]
    )
    op.create_index(
        "ix_reimposta_password_hash_token", "reimposta_password", ["hash_token"]
    )


def downgrade() -> None:
    op.drop_index("ix_reimposta_password_hash_token", "reimposta_password")
    op.drop_index("ix_reimposta_password_utente_id", "reimposta_password")
    op.drop_table("reimposta_password")
