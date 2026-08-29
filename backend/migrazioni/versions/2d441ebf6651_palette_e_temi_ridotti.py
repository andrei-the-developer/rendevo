"""palette e temi ridotti

Tema e palette diventano due scelte separate: il tema porta gli ornamenti,
la palette i colori. I temi «salvia», «agrumi», «allegro» e «notte» vengono
ritirati e confluiscono in «sobrio».

Revision ID: 2d441ebf6651
Revises: ba8fc983f7f3
Create Date: 2026-08-23 10:39:23.477563
"""
from alembic import op
import sqlalchemy as sa


revision = '2d441ebf6651'
down_revision = 'ba8fc983f7f3'
branch_labels = None
depends_on = None

RITIRATI = ('salvia', 'agrumi', 'allegro', 'notte')


def upgrade() -> None:
    # server_default: la colonna nasce NOT NULL e le righe già presenti
    # hanno bisogno di un valore.
    op.add_column(
        'evento',
        sa.Column('palette', sa.String(length=40), nullable=False,
                  server_default='oliva'),
    )

    # «notte» era scuro e freddo: eredita la palette blu invece dell'oliva.
    op.execute("UPDATE evento SET palette = 'blu' WHERE tema = 'notte'")
    op.execute(
        "UPDATE evento SET tema = 'sobrio' "
        f"WHERE tema IN {RITIRATI}"
    )


def downgrade() -> None:
    # I temi ritirati non si possono ricostruire: erano quattro e sono
    # collassati in uno. Si torna indietro solo sullo schema.
    op.drop_column('evento', 'palette')
