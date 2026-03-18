from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base


class Traveller(Base):

    __tablename__ = "travellers"

    id = Column(Integer, primary_key=True, index=True)

    booking_id = Column(Integer, ForeignKey("bookings.id"))

    full_name = Column(String)

    age = Column(Integer)

    gender = Column(String)

    id_type = Column(String)

    email = Column(String)

    phone = Column(String)