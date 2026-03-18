from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base


class Enquiry(Base):

    __tablename__ = "enquiries"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    agency_id = Column(Integer, ForeignKey("agencies.id"))

    package_id = Column(Integer, ForeignKey("travel_packages.id")) 

    name = Column(String)

    email = Column(String)

    phone = Column(String)

    destination = Column(String)

    travel_date = Column(String)

    travellers = Column(Integer)

    message = Column(String)

    status = Column(String, default="pending")