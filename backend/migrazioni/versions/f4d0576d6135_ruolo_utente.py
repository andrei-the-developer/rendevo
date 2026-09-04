"""ruolo_utente

Revision ID: f4d0576d6135
Revises: c2fe3df41e9e
Create Date: 2026-09-04 19:12:15.191040
"""
from alembic import op
import sqlalchemy as sa


revision = 'f4d0576d6135'
down_revision = 'c2fe3df41e9e'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Le righe su reimposta_password che autogenerate voleva aggiungere qui
    # (una deriva preesistente fra modello e schema, non collegata a questo
    # cambio) sono state tolte apposta, come nella migrazione precedente.
    op.add_column('utente', sa.Column('ruolo', sa.String(length=20), server_default='base', nullable=False))
    op.create_check_constraint('utente_ruolo_valido', 'utente', "ruolo IN ('base', 'pro')")


def downgrade() -> None:
    op.drop_constraint('utente_ruolo_valido', 'utente', type_='check')
    op.drop_column('utente', 'ruolo')
