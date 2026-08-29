"""Colonna `carattere` sull'evento.

Revision ID: b3d1c8e5a742
Revises: 9f2c71b4ad30
Create Date: 2026-08-25

`server_default` e non solo `default`: gli inviti gia' esistenti devono
trovarsi un valore senza che nessuno li riapra, e il default lato Python
vale solo per le righe nuove.
"""

import sqlalchemy as sa
from alembic import op

revision = "b3d1c8e5a742"
down_revision = "9f2c71b4ad30"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "evento",
        sa.Column("carattere", sa.String(40), nullable=False,
                  server_default="cormorant"),
    )


def downgrade() -> None:
    op.drop_column("evento", "carattere")
