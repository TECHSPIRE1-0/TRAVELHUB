# from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, UniqueConstraint
# from sqlalchemy.sql import func
# from app.database import Base


# class TripRoom(Base):

#     __tablename__ = "trip_rooms"

#     id         = Column(Integer, primary_key=True, index=True)
#     room_code  = Column(String, unique=True, nullable=False, index=True)  # 6-char shareable code
#     name       = Column(String, nullable=False)
#     created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
#     status     = Column(String, default="open")   # open | closed
#     created_at = Column(DateTime(timezone=True), server_default=func.now())


# class TripRoomMember(Base):

#     __tablename__ = "trip_room_members"

#     id        = Column(Integer, primary_key=True, index=True)
#     room_id   = Column(Integer, ForeignKey("trip_rooms.id"), nullable=False)
#     user_id   = Column(Integer, ForeignKey("users.id"),  nullable=False)
#     joined_at = Column(DateTime(timezone=True), server_default=func.now())

#     __table_args__ = (
#         UniqueConstraint("room_id", "user_id", name="uq_room_member"),
#     )


# class TripRoomPackage(Base):

#     __tablename__ = "trip_room_packages"

#     id         = Column(Integer, primary_key=True, index=True)
#     room_id    = Column(Integer, ForeignKey("trip_rooms.id"),      nullable=False)
#     package_id = Column(Integer, ForeignKey("travel_packages.id"), nullable=False)
#     added_by   = Column(Integer, ForeignKey("users.id"),           nullable=False)

#     __table_args__ = (
#         UniqueConstraint("room_id", "package_id", name="uq_room_package"),
#     )


# class TripVote(Base):

#     __tablename__ = "trip_votes"

#     id         = Column(Integer, primary_key=True, index=True)
#     room_id    = Column(Integer, ForeignKey("trip_rooms.id"),      nullable=False)
#     package_id = Column(Integer, ForeignKey("travel_packages.id"), nullable=False)
#     user_id    = Column(Integer, ForeignKey("users.id"),           nullable=False)
#     voted_at   = Column(DateTime(timezone=True), server_default=func.now())

#     # One vote per user per room (can change their vote but not double vote)
#     __table_args__ = (
#         UniqueConstraint("room_id", "user_id", name="uq_room_vote"),
#     )



from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, UniqueConstraint, Float
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

class TripGroupBooking(Base):
    """
    Created when the room creator initiates a group booking
    after voting closes. One per room.
    """
    __tablename__ = "trip_group_bookings"

    id            = Column(Integer, primary_key=True, index=True)
    room_id       = Column(Integer, ForeignKey("trip_rooms.id"), nullable=False, unique=True)
    package_id    = Column(Integer, ForeignKey("travel_packages.id"), nullable=False)
    total_price   = Column(Float, nullable=False)
    per_person    = Column(Float, nullable=False)
    total_members = Column(Integer, nullable=False)
    status        = Column(String, default="pending")  # pending | confirmed | cancelled
    created_at    = Column(DateTime(timezone=True), server_default=func.now())


class TripMemberPayment(Base):
    """
    Tracks each member's payment status for a group booking.
    Booking confirms automatically when all members have paid.
    """
    __tablename__ = "trip_member_payments"

    id              = Column(Integer, primary_key=True, index=True)
    group_booking_id = Column(Integer, ForeignKey("trip_group_bookings.id"), nullable=False)
    user_id         = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount          = Column(Float, nullable=False)
    status          = Column(String, default="pending")  # pending | paid
    paid_at         = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        UniqueConstraint("group_booking_id", "user_id", name="uq_group_payment_member"),
    )