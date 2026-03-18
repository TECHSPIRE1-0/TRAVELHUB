from sqlalchemy import Column, Integer, String, ForeignKey, Float
from app.database import Base

class PackageImage(Base):

    __tablename__ = "package_images"

    id = Column(Integer, primary_key=True, index=True)

    package_id = Column(Integer, ForeignKey("travel_packages.id"))

    image_url = Column(String)