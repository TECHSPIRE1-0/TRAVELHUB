from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from app.database import get_db
from app.utils.jwt_handler import SECRET_KEY, ALGORITHM
from app.models.user_model import User
from app.models.agency_model import Agency
from app.services.chat_service import manager, save_message, get_chat_history
from app.utils.dependencies import get_current_user, get_current_agency

router = APIRouter(prefix="/chat", tags=["Chat"])


def _get_user_from_token(token: str, db: Session) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError()
        return user
    except (JWTError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid user token")


def _get_agency_from_token(token: str, db: Session) -> Agency:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        agency_id = payload.get("agency_id")
        agency = db.query(Agency).filter(Agency.id == agency_id).first()
        if not agency:
            raise ValueError()
        return agency
    except (JWTError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid agency token")



@router.get("/history/{agency_id}")
def fetch_chat_history(
    agency_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
   

    messages = get_chat_history(user.id, agency_id, db)

    return [
        {
            "sender":     m.sender,
            "message":    m.message,
            "created_at": m.created_at.isoformat(),
        }
        for m in messages
    ]


@router.get("/agency/history/{user_id}")
def fetch_chat_history_agency(
    user_id: int,
    db: Session = Depends(get_db),
    agency=Depends(get_current_agency)
):
    

    messages = get_chat_history(user_id, agency.id, db)

    return [
        {
            "sender":     m.sender,
            "message":    m.message,
            "created_at": m.created_at.isoformat(),
        }
        for m in messages
    ]


@router.websocket("/ws/user/{agency_id}")
async def user_chat(
    websocket: WebSocket,
    agency_id: int,
    db: Session = Depends(get_db),
):
    token = websocket.cookies.get("access_token")
    if not token:
        await websocket.close(code=1008)
        return
    user = _get_user_from_token(token, db)

    await manager.connect(websocket, user.id, agency_id, role="user")

    try:
        while True:
            data = await websocket.receive_json()
            message_text = data.get("message", "").strip()

            if not message_text:
                continue

            # Persist to DB
            save_message(user.id, agency_id, sender="user", message=message_text, db=db)

            # Broadcast to both sides of the room
            await manager.send_to_room(user.id, agency_id, sender="user", message=message_text)

    except WebSocketDisconnect:
        manager.disconnect(user.id, agency_id, role="user")



@router.websocket("/ws/agency/{user_id}")
async def agency_chat(
    websocket: WebSocket,
    user_id: int,
    db: Session = Depends(get_db),
):
    token = websocket.cookies.get("agency_token")
    if not token:
        await websocket.close(code=1008)
        return
    agency = _get_agency_from_token(token, db)

    await manager.connect(websocket, user_id, agency.id, role="agency")

    try:
        while True:
            data = await websocket.receive_json()
            message_text = data.get("message", "").strip()

            if not message_text:
                continue

            # Persist to DB
            save_message(user_id, agency.id, sender="agency", message=message_text, db=db)

            # Broadcast to both sides of the room
            await manager.send_to_room(user_id, agency.id, sender="agency", message=message_text)

    except WebSocketDisconnect:
        manager.disconnect(user_id, agency.id, role="agency")


@router.get("/agency/conversations")
def get_conversations(
    db: Session = Depends(get_db),
    agency=Depends(get_current_agency)
):
    
    from app.services.chat_service import get_agency_conversations
    return get_agency_conversations(agency.id, db)