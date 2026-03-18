from sqlalchemy import Column, Integer, String, ForeignKey, Float
from app.database import Base

class PackageItinerary(Base):

    __tablename__ = "package_itinerary"

    id = Column(Integer, primary_key=True, index=True)

    package_id = Column(Integer, ForeignKey("travel_packages.id"))

    day_number = Column(Integer)

    title = Column(String)

    description = Column(String)