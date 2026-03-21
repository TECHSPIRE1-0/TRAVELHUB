from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from app.database import Base


class Admin(Base):

    __tablename__ = "admins"

    id         = Column(Integer, primary_key=True, index=True)
    username   = Column(String, unique=True, nullable=False)
    email      = Column(String, unique=True, nullable=False)
    password   = Column(String, nullable=False)
    is_active  = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())