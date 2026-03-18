from sqlalchemy import Column, Integer, String, ForeignKey, Float
from app.database import Base

class TravelPackage(Base):

    __tablename__ = "travel_packages"

    id = Column(Integer, primary_key=True, index=True)

    agency_id = Column(Integer, ForeignKey("agencies.id"))

    package_type_id = Column(Integer, ForeignKey("package_types.id"))

    title = Column(String)

    description = Column(String)

    destination = Column(String)

    start_location = Column(String)

    duration_days = Column(Integer)

    duration_nights = Column(Integer)

    base_price = Column(Float)

    max_people = Column(Integer)