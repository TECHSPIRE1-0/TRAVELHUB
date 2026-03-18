from sqlalchemy import Column, Integer, String, ForeignKey, Float
from app.database import Base


class PackagePricing(Base):

    __tablename__ = "package_pricing"

    id = Column(Integer, primary_key=True, index=True)

    package_id = Column(Integer, ForeignKey("travel_packages.id"))

    transport_id = Column(Integer, ForeignKey("transport_options.id"))

    price = Column(Float)