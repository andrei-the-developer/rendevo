"""codice_invito

Revision ID: c2fe3df41e9e
Revises: b3d1c8e5a742
Create Date: 2026-08-30 09:34:54.529575
"""
from alembic import op
import sqlalchemy as sa


revision = 'c2fe3df41e9e'
down_revision = 'b3d1c8e5a742'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Le righe su reimposta_password che autogenerate voleva aggiungere qui
    # (una deriva preesistente fra modello e schema, non collegata a questo
    # cambio) sono state tolte apposta: non è questa la migrazione giusta per
    # toccare quella tabella senza capire perché la deriva c'è.
    op.create_table('codice_invito',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('codice', sa.String(length=40), nullable=False),
    sa.Column('etichetta', sa.String(length=160), nullable=False),
    sa.Column('sconto_centesimi', sa.Integer(), nullable=False),
    sa.Column('attivo', sa.Boolean(), nullable=False),
    sa.Column('creato_il', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_codice_invito_codice'), 'codice_invito', ['codice'], unique=True)
    op.add_column('utente', sa.Column('codice_invito_id', sa.UUID(), nullable=True))
    op.create_index(op.f('ix_utente_codice_invito_id'), 'utente', ['codice_invito_id'], unique=False)
    op.create_foreign_key(
        'fk_utente_codice_invito_id', 'utente', 'codice_invito',
        ['codice_invito_id'], ['id'], ondelete='SET NULL',
    )


def downgrade() -> None:
    op.drop_constraint('fk_utente_codice_invito_id', 'utente', type_='foreignkey')
    op.drop_index(op.f('ix_utente_codice_invito_id'), table_name='utente')
    op.drop_column('utente', 'codice_invito_id')
    op.drop_index(op.f('ix_codice_invito_codice'), table_name='codice_invito')
    op.drop_table('codice_invito')
