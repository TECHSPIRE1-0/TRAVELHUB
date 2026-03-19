from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.sql import func
from app.database import Base


class TripRoom(Base):

    __tablename__ = "trip_rooms"

    id         = Column(Integer, primary_key=True, index=True)
    room_code  = Column(String, unique=True, nullable=False, index=True)  # 6-char shareable code
    name       = Column(String, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    status     = Column(String, default="open")   # open | closed
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class TripRoomMember(Base):

    __tablename__ = "trip_room_members"

    id        = Column(Integer, primary_key=True, index=True)
    room_id   = Column(Integer, ForeignKey("trip_rooms.id"), nullable=False)
    user_id   = Column(Integer, ForeignKey("users.id"),  nullable=False)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("room_id", "user_id", name="uq_room_member"),
    )


class TripRoomPackage(Base):

    __tablename__ = "trip_room_packages"

    id         = Column(Integer, primary_key=True, index=True)
    room_id    = Column(Integer, ForeignKey("trip_rooms.id"),      nullable=False)
    package_id = Column(Integer, ForeignKey("travel_packages.id"), nullable=False)
    added_by   = Column(Integer, ForeignKey("users.id"),           nullable=False)

    __table_args__ = (
        UniqueConstraint("room_id", "package_id", name="uq_room_package"),
    )


class TripVote(Base):

    __tablename__ = "trip_votes"

    id         = Column(Integer, primary_key=True, index=True)
    room_id    = Column(Integer, ForeignKey("trip_rooms.id"),      nullable=False)
    package_id = Column(Integer, ForeignKey("travel_packages.id"), nullable=False)
    user_id    = Column(Integer, ForeignKey("users.id"),           nullable=False)
    voted_at   = Column(DateTime(timezone=True), server_default=func.now())

    # One vote per user per room (can change their vote but not double vote)
    __table_args__ = (
        UniqueConstraint("room_id", "user_id", name="uq_room_vote"),
    )