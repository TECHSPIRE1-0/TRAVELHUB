from sqlalchemy import Column, Integer, String, ForeignKey, Float, DateTime
from app.database import Base


class Booking(Base):

    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    package_id = Column(Integer, ForeignKey("travel_packages.id"))

    transport_id = Column(Integer, ForeignKey("transport_options.id"))

    departure_date = Column(DateTime)   

    return_date = Column(DateTime)

    adults = Column(Integer)
    children = Column(Integer)

    room_type = Column(String)
    pickup_city = Column(String)
    special_requests = Column(String)

    total_price = Column(Float)

    status = Column(String, default="pending")
    razorpay_order_id = Column(String)