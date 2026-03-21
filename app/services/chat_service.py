from fastapi import WebSocket
from sqlalchemy.orm import Session
from app.models.chat_model import ChatMessage
from typing import Dict
import json


# Connection Manager 
# Keeps all active WebSocket connections in memory.
# Room key format:  "user_{user_id}_agency_{agency_id}"
# Each room has two slots: "user" and "agency"

class ConnectionManager:

    def __init__(self):
        # { room_id: { "user": WebSocket | None, "agency": WebSocket | None } }
        self.rooms: Dict[str, Dict[str, WebSocket]] = {}

    def _room_key(self, user_id: int, agency_id: int) -> str:
        return f"user_{user_id}_agency_{agency_id}"

    async def connect(self, websocket: WebSocket, user_id: int, agency_id: int, role: str):
        """role is 'user' or 'agency'"""
        await websocket.accept()
        key = self._room_key(user_id, agency_id)

        if key not in self.rooms:
            self.rooms[key] = {"user": None, "agency": None}

        self.rooms[key][role] = websocket

    def disconnect(self, user_id: int, agency_id: int, role: str):
        key = self._room_key(user_id, agency_id)
        if key in self.rooms:
            self.rooms[key][role] = None
            # Clean up empty rooms
            if not any(self.rooms[key].values()):
                del self.rooms[key]

    async def send_to_room(self, user_id: int, agency_id: int, sender: str, message: str):
        """Send message to both participants in the room."""
        key = self._room_key(user_id, agency_id)

        if key not in self.rooms:
            return

        payload = json.dumps({
            "sender":  sender,
            "message": message,
        })

        # Send to both sides (if connected)
        for role, ws in self.rooms[key].items():
            if ws:
                try:
                    await ws.send_text(payload)
                except Exception:
                    self.rooms[key][role] = None


# Single shared instance — imported by the router
manager = ConnectionManager()


# ─── DB Helpers ────────────────────────────────────────────────────────────────

def save_message(user_id: int, agency_id: int, sender: str, message: str, db: Session):
    msg = ChatMessage(
        user_id=user_id,
        agency_id=agency_id,
        sender=sender,
        message=message,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


def get_chat_history(user_id: int, agency_id: int, db: Session, limit: int = 50):
    """Returns last `limit` messages for a user-agency conversation."""
    return (
        db.query(ChatMessage)
        .filter(
            ChatMessage.user_id == user_id,
            ChatMessage.agency_id == agency_id,
        )
        .order_by(ChatMessage.created_at.asc())
        .limit(limit)
        .all()
    )


def get_agency_conversations(agency_id: int, db: Session):
    """
    Returns a list of all users who have chatted with this agency.
    Each entry includes the last message and timestamp so the agency
    dashboard can show a WhatsApp-style conversation list.
    """
    from sqlalchemy import func
    from app.models.user_model import User

    # Get the latest message per user for this agency
    subq = (
        db.query(
            ChatMessage.user_id,
            func.max(ChatMessage.created_at).label("last_at"),
        )
        .filter(ChatMessage.agency_id == agency_id)
        .group_by(ChatMessage.user_id)
        .subquery()
    )

    rows = (
        db.query(ChatMessage, User)
        .join(subq, (ChatMessage.user_id == subq.c.user_id) &
                    (ChatMessage.created_at == subq.c.last_at))
        .join(User, User.id == ChatMessage.user_id)
        .filter(ChatMessage.agency_id == agency_id)
        .order_by(ChatMessage.created_at.desc())
        .all()
    )

    return [
        {
            "user_id":      user.id,
            "username":     user.username,
            "email":        user.email,
            "last_message": msg.message,
            "last_sender":  msg.sender,
            "last_at":      msg.created_at.isoformat(),
        }
        for msg, user in rows
    ]