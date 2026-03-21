from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import Dict, List
import json

from app.database import get_db
from app.schema.trip_room_schema import (
    CreateRoomRequest, AddPackageRequest, VoteRequest
)
from app.services.trip_room_service import (
    create_room, join_room, add_package_to_room,
    cast_vote, get_room, close_room
)
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/trip", tags=["Group Trip Planner"])



class ConnectionManager:
    def __init__(self):
        # room_code → list of active WebSocket connections
        self.rooms: Dict[str, List[WebSocket]] = {}

    async def connect(self, room_code: str, ws: WebSocket):
        await ws.accept()
        self.rooms.setdefault(room_code, []).append(ws)

    def disconnect(self, room_code: str, ws: WebSocket):
        if room_code in self.rooms:
            self.rooms[room_code].remove(ws)
            if not self.rooms[room_code]:
                del self.rooms[room_code]

    async def broadcast(self, room_code: str, message: dict):
        """Send a message to every connected client in the room."""
        connections = self.rooms.get(room_code, [])
        dead = []
        for ws in connections:
            try:
                await ws.send_text(json.dumps(message))
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(room_code, ws)

    def active_count(self, room_code: str) -> int:
        return len(self.rooms.get(room_code, []))


manager = ConnectionManager()



@router.post("/create")
def create_trip_room(
    data: CreateRoomRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """
    Create a group trip planning room.
    Returns a 6-char room code to share with friends.
    """
    return create_room(data.name, user.id, db)


@router.post("/{room_code}/join")
def join_trip_room(
    room_code: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """
    Join a trip room using the 6-char code.
    """
    return join_room(room_code.upper(), user.id, db)


@router.post("/{room_code}/add-package")
async def add_package(
    room_code: str,
    data: AddPackageRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """
    Room creator adds a travel package for members to vote on.
    Broadcasts update to all live WebSocket clients.
    """
    result = add_package_to_room(room_code.upper(), data.package_id, user.id, db)

    # Notify all live clients that a new package was added
    room_data = get_room(room_code.upper(), db)
    await manager.broadcast(room_code.upper(), {
        "event":   "package_added",
        "message": result["message"],
        "room":    room_data.dict()
    })

    return result


@router.post("/{room_code}/vote")
async def vote(
    room_code: str,
    data: VoteRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """
    Cast or change your vote for a package in the room.
    Instantly broadcasts updated live vote counts to all connected clients.
    """
    result = cast_vote(room_code.upper(), data.package_id, user.id, db)

    # Broadcast live vote update to everyone in the room
    await manager.broadcast(room_code.upper(), {
        "event":   "vote_update",
        "voter":   user.username,
        "message": f"{user.username} just voted!",
        "results": [r.dict() for r in result.current_results],
        "active_viewers": manager.active_count(room_code.upper())
    })

    return result


@router.get("/{room_code}")
def room_details(
    room_code: str,
    db: Session = Depends(get_db)
):
    """
    Get full room details — packages, vote counts, member list.
    No auth required so anyone with the code can see results.
    """
    return get_room(room_code.upper(), db)


@router.patch("/{room_code}/close")
async def close_voting(
    room_code: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """
    Room creator closes voting and announces the winner.
    Broadcasts final results to all live clients.
    """
    result = close_room(room_code.upper(), user.id, db)

    await manager.broadcast(room_code.upper(), {
        "event":        "voting_closed",
        "winner":       result["winner"],
        "final_results": [r.dict() for r in result["final_results"]]
    })

    return result


# --------------------------------------------------------------------------- #
#  WebSocket endpoint — live vote updates                                      #
# --------------------------------------------------------------------------- #

@router.websocket("/{room_code}/ws")
async def websocket_endpoint(
    room_code: str,
    websocket: WebSocket,
    db: Session = Depends(get_db)
):
    """
    Connect to a room's live feed.
    Receives real-time vote updates whenever anyone votes.

    Frontend usage:
        const ws = new WebSocket("ws://localhost:8000/trip/ABC123/ws");
        ws.onmessage = (e) => {
            const data = JSON.parse(e.data);
            // data.event = "vote_update" | "package_added" | "voting_closed"
            // data.results = [...] current vote counts
        };
    """
    code = room_code.upper()
    await manager.connect(code, websocket)

    # Send current room state immediately on connect
    try:
        room_data = get_room(code, db)
        await websocket.send_text(json.dumps({
            "event":   "connected",
            "message": f"Connected to '{room_data.name}'",
            "room":    room_data.dict(),
            "active_viewers": manager.active_count(code)
        }))

        # Keep connection alive — wait for disconnect
        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:
        manager.disconnect(code, websocket)

