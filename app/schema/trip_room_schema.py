from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class CreateRoomRequest(BaseModel):
    name: str                    # e.g. "Goa Trip 2025 🏖️"


class AddPackageRequest(BaseModel):
    package_id: int


class VoteRequest(BaseModel):
    package_id: int


# ---------- Response shapes ----------

class PackageVoteSummary(BaseModel):
    package_id:   int
    title:        str
    destination:  str
    base_price:   float
    duration:     str
    vote_count:   int
    voters:       List[str]      # list of usernames who voted for this
    is_winner:    bool


class MemberInfo(BaseModel):
    user_id:  int
    username: str
    has_voted: bool


class RoomDetailResponse(BaseModel):
    room_code:    str
    name:         str
    status:       str
    created_by:   str            # username of creator
    total_members: int
    votes_cast:   int
    packages:     List[PackageVoteSummary]
    members:      List[MemberInfo]


class CreateRoomResponse(BaseModel):
    room_code: str
    name:      str
    message:   str


class VoteResponse(BaseModel):
    message:         str
    your_vote:       str         # package title you voted for
    current_results: List[PackageVoteSummary]

