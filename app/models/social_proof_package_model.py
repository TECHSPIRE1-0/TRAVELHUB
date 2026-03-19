from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.database import Base


class PackageView(Base):

    __tablename__ = "package_views"

    id         = Column(Integer, primary_key=True, index=True)
    package_id = Column(Integer, ForeignKey("travel_packages.id"), nullable=False, index=True)
    ip_hash    = Column(String, nullable=True)   # anonymised — MD5 of IP, never raw IP
    viewed_at  = Column(DateTime(timezone=True), server_default=func.now(), index=True)