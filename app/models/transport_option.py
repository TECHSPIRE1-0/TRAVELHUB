from sqlalchemy import Column, Integer, String, ForeignKey, Float
from app.database import Base

class TransportOption(Base):

    __tablename__ = "transport_options"

    id = Column(Integer, primary_key=True, index=True)

    package_id = Column(Integer, ForeignKey("travel_packages.id"))

    vehicle_type = Column(String)

    vehicle_name = Column(String)

    seat_capacity = Column(Integer)

    price_per_day = Column(Float)
    