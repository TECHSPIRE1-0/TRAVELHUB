from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.sql import func
from app.database import Base


class ChatMessage(Base):

    __tablename__ = "chat_messages"

    id         = Column(Integer, primary_key=True, index=True)

    # Who is the conversation between
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    agency_id  = Column(Integer, ForeignKey("agencies.id"), nullable=False)

    # "user" or "agency" — who sent this message
    sender     = Column(String, nullable=False)

    message    = Column(Text, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())