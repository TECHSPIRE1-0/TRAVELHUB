from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import Dict

from app.database import get_db
from app.models.travel_package import TravelPackage
from app.services.negotiator_service import NegotiatorSession

router = APIRouter(prefix="/negotiate", tags=["AI Package Negotiator Bot"])

# Store active negotiation sessions in memory
# connection_id -> NegotiatorSession
active_sessions: Dict[str, NegotiatorSession] = {}

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, connection_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[connection_id] = websocket

    def disconnect(self, connection_id: str):
        if connection_id in self.active_connections:
            del self.active_connections[connection_id]

    async def send_personal_message(self, message: dict, connection_id: str):
        ws = self.active_connections.get(connection_id)
        if ws:
            await ws.send_json(message)

manager = ConnectionManager()


@router.websocket("/{package_id}/ws")
async def negotiation_websocket(
    package_id: int,
    websocket: WebSocket,
    db: Session = Depends(get_db)
):
    """
    WebSocket endpoint for real-time haggling with the AI Travel Agent.
    Frontend connects to: ws://localhost:8000/negotiate/{package_id}/ws
    """
    package = db.query(TravelPackage).filter(TravelPackage.id == package_id).first()
    
    # We use the websocket object's id or remote address as a unique connection identifier
    connection_id = f"{id(websocket)}-{package_id}"
    
    await manager.connect(connection_id, websocket)
    
    if not package:
        await manager.send_personal_message({"type": "error", "message": "Package not found. Closing connection."}, connection_id)
        manager.disconnect(connection_id)
        await websocket.close()
        return

    # Initialize the AI Session
    session = NegotiatorSession(package)
    active_sessions[connection_id] = session
    
    # Send the initial greeting
    greeting = session.get_initial_greeting()
    await manager.send_personal_message({
        "type": "message",
        "sender": "Agent Alex",
        "text": greeting,
        "is_deal": False
    }, connection_id)

    try:
        while True:
            # Receive text from the user
            data = await websocket.receive_text()
            
            # Send to Gemini
            result = session.send_message(data)
            
            # Send the AI's response back to the user
            response_payload = {
                "type": "message",
                "sender": "Agent Alex",
                "text": result["reply"],
                "is_deal": result["deal_reached"],
                "agreed_price": result.get("agreed_price")
            }
            
            await manager.send_personal_message(response_payload, connection_id)
            
            # If a deal is reached, we can optionally close or let the user celebrate
            if result["deal_reached"]:
                # You could also sync standard booking APIs here!
                await manager.send_personal_message({
                    "type": "system",
                    "text": "Negotiation concluded successfully!"
                }, connection_id)
                # await websocket.close()
                # break
                
    except WebSocketDisconnect:
        manager.disconnect(connection_id)
        if connection_id in active_sessions:
            del active_sessions[connection_id]
