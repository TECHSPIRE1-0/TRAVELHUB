"""merge heads

Revision ID: 4b8e98dbab12
Revises: 3d1bbf7110bb, 5054c9d55a2b
Create Date: 2026-03-18 19:25:24.840803

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4b8e98dbab12'
down_revision: Union[str, Sequence[str], None] = ('3d1bbf7110bb', '5054c9d55a2b')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
