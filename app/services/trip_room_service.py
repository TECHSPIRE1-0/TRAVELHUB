import random
import string
from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.models.trip_room_model import TripRoom, TripRoomMember, TripRoomPackage, TripVote
from app.models.travel_package import TravelPackage
from app.models.user_model import User
from app.schema.trip_room_schema import (
    PackageVoteSummary, MemberInfo,
    RoomDetailResponse, CreateRoomResponse, VoteResponse
)



def _generate_room_code(db: Session) -> str:
    """Generate unique 6-char alphanumeric room code."""
    while True:
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        exists = db.query(TripRoom).filter(TripRoom.room_code == code).first()
        if not exists:
            return code


def _get_room_or_404(room_code: str, db: Session) -> TripRoom:
    room = db.query(TripRoom).filter(TripRoom.room_code == room_code).first()
    if not room:
        raise HTTPException(status_code=404, detail=f"Room '{room_code}' not found")
    return room


def _build_vote_summaries(room_id: int, db: Session) -> List[PackageVoteSummary]:
    """Build vote summary for all packages in a room."""
    room_pkgs = db.query(TripRoomPackage).filter(
        TripRoomPackage.room_id == room_id
    ).all()

    all_votes = db.query(TripVote).filter(TripVote.room_id == room_id).all()

    # Find winner (most votes)
    vote_counts = {}
    for v in all_votes:
        vote_counts[v.package_id] = vote_counts.get(v.package_id, 0) + 1

    max_votes = max(vote_counts.values(), default=0)

    summaries = []
    for rp in room_pkgs:
        pkg = db.query(TravelPackage).filter(TravelPackage.id == rp.package_id).first()
        if not pkg:
            continue

        pkg_votes = [v for v in all_votes if v.package_id == rp.package_id]
        voters = []
        for v in pkg_votes:
            u = db.query(User).filter(User.id == v.user_id).first()
            if u:
                voters.append(u.username)

        count = vote_counts.get(rp.package_id, 0)
        summaries.append(
            PackageVoteSummary(
                package_id  = pkg.id,
                title       = pkg.title,
                destination = pkg.destination,
                base_price  = pkg.base_price,
                duration    = f"{pkg.duration_days}D/{pkg.duration_nights}N",
                vote_count  = count,
                voters      = voters,
                is_winner   = count == max_votes and count > 0
            )
        )

    summaries.sort(key=lambda x: x.vote_count, reverse=True)
    return summaries


# Fix missing import
from typing import List


def create_room(name: str, user_id: int, db: Session) -> CreateRoomResponse:
    code = _generate_room_code(db)

    room = TripRoom(
        room_code  = code,
        name       = name,
        created_by = user_id,
        status     = "open"
    )
    db.add(room)
    db.flush()

    # Creator auto-joins the room
    db.add(TripRoomMember(room_id=room.id, user_id=user_id))
    db.commit()

    return CreateRoomResponse(
        room_code = code,
        name      = name,
        message   = f"Room created! Share this code with your friends: {code}"
    )



def join_room(room_code: str, user_id: int, db: Session):
    room = _get_room_or_404(room_code, db)

    if room.status == "closed":
        raise HTTPException(status_code=400, detail="This room is closed. Voting has ended.")

    already = db.query(TripRoomMember).filter(
        TripRoomMember.room_id == room.id,
        TripRoomMember.user_id == user_id
    ).first()

    if already:
        raise HTTPException(status_code=409, detail="You have already joined this room.")

    db.add(TripRoomMember(room_id=room.id, user_id=user_id))
    db.commit()

    user = db.query(User).filter(User.id == user_id).first()
    return {"message": f"Welcome to '{room.name}'! You can now vote on packages."}



def add_package_to_room(room_code: str, package_id: int, user_id: int, db: Session):
    room = _get_room_or_404(room_code, db)

    if room.created_by != user_id:
        raise HTTPException(status_code=403, detail="Only the room creator can add packages.")

    if room.status == "closed":
        raise HTTPException(status_code=400, detail="Room is closed.")

    # Check package exists
    pkg = db.query(TravelPackage).filter(TravelPackage.id == package_id).first()
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found.")

    # Check not already added
    exists = db.query(TripRoomPackage).filter(
        TripRoomPackage.room_id   == room.id,
        TripRoomPackage.package_id == package_id
    ).first()
    if exists:
        raise HTTPException(status_code=409, detail=f"'{pkg.title}' is already in this room.")

    db.add(TripRoomPackage(room_id=room.id, package_id=package_id, added_by=user_id))
    db.commit()

    return {"message": f"'{pkg.title}' added to the room. Members can now vote on it!"}



def cast_vote(room_code: str, package_id: int, user_id: int, db: Session):
    room = _get_room_or_404(room_code, db)

    if room.status == "closed":
        raise HTTPException(status_code=400, detail="Voting is closed for this room.")

    # Must be a member
    member = db.query(TripRoomMember).filter(
        TripRoomMember.room_id == room.id,
        TripRoomMember.user_id == user_id
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Join the room first before voting.")

    # Package must be in the room
    in_room = db.query(TripRoomPackage).filter(
        TripRoomPackage.room_id   == room.id,
        TripRoomPackage.package_id == package_id
    ).first()
    if not in_room:
        raise HTTPException(status_code=404, detail="This package is not in the room.")

    # Check if already voted — if yes, change their vote
    existing_vote = db.query(TripVote).filter(
        TripVote.room_id == room.id,
        TripVote.user_id == user_id
    ).first()

    if existing_vote:
        existing_vote.package_id = package_id   # change vote
    else:
        db.add(TripVote(room_id=room.id, package_id=package_id, user_id=user_id))

    db.commit()

    pkg = db.query(TravelPackage).filter(TravelPackage.id == package_id).first()
    summaries = _build_vote_summaries(room.id, db)

    return VoteResponse(
        message         = f"Vote cast for '{pkg.title}'!",
        your_vote       = pkg.title,
        current_results = summaries
    )



def get_room(room_code: str, db: Session) -> RoomDetailResponse:
    room = _get_room_or_404(room_code, db)

    creator = db.query(User).filter(User.id == room.created_by).first()

    members_raw = db.query(TripRoomMember).filter(
        TripRoomMember.room_id == room.id
    ).all()

    all_votes = db.query(TripVote).filter(TripVote.room_id == room.id).all()
    voters_set = {v.user_id for v in all_votes}

    members = []
    for m in members_raw:
        u = db.query(User).filter(User.id == m.user_id).first()
        if u:
            members.append(MemberInfo(
                user_id   = u.id,
                username  = u.username,
                has_voted = u.id in voters_set
            ))

    summaries = _build_vote_summaries(room.id, db)

    return RoomDetailResponse(
        room_code     = room.room_code,
        name          = room.name,
        status        = room.status,
        created_by    = creator.username if creator else "unknown",
        total_members = len(members),
        votes_cast    = len(all_votes),
        packages      = summaries,
        members       = members
    )



def close_room(room_code: str, user_id: int, db: Session):
    room = _get_room_or_404(room_code, db)

    if room.created_by != user_id:
        raise HTTPException(status_code=403, detail="Only the room creator can close voting.")

    if room.status == "closed":
        raise HTTPException(status_code=400, detail="Room is already closed.")

    room.status = "closed"
    db.commit()

    summaries = _build_vote_summaries(room.id, db)
    winner = next((s for s in summaries if s.is_winner), None)

    return {
        "message": "Voting closed!",
        "winner":  winner.title if winner else "No votes cast",
        "final_results": summaries
    }
