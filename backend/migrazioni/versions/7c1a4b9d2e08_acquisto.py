"""tabella acquisto: attribuzione e dati della vendita

Registra il fatto commerciale accanto al `Diritto`, che resta il permesso.
Nasce da una richiesta di `marketing`: senza il canale di provenienza
(`fonte`) e il paese del cliente, la spesa pubblicitaria non è attribuibile
a nessuna vendita e la soglia OSS non è ricostruibile.

`evento_id` è nullable con SET NULL apposta: cancellare un evento (GDPR,
retention) non deve cancellare la prova della vendita.

Revision ID: 7c1a4b9d2e08
Revises: 2d441ebf6651
Create Date: 2026-08-24
"""
from alembic import op
import sqlalchemy as sa


revision = '7c1a4b9d2e08'
down_revision = '2d441ebf6651'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'acquisto',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('evento_id', sa.UUID(), nullable=True),
        sa.Column('stripe_session_id', sa.String(length=255), nullable=False),
        sa.Column('stripe_payment_intent', sa.String(length=255), nullable=True),
        sa.Column('importo_totale', sa.Integer(), nullable=True),
        sa.Column('valuta', sa.String(length=3), nullable=True),
        sa.Column('paese', sa.String(length=2), nullable=True),
        sa.Column('email', sa.String(length=320), nullable=True),
        sa.Column('fonte', sa.String(length=60), nullable=True),
        sa.Column('creato_il', sa.DateTime(timezone=True),
                  server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['evento_id'], ['evento.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('stripe_session_id'),
    )
    op.create_index(op.f('ix_acquisto_evento_id'), 'acquisto', ['evento_id'])
    op.create_index(op.f('ix_acquisto_fonte'), 'acquisto', ['fonte'])


def downgrade() -> None:
    op.drop_index(op.f('ix_acquisto_fonte'), table_name='acquisto')
    op.drop_index(op.f('ix_acquisto_evento_id'), table_name='acquisto')
    op.drop_table('acquisto')
