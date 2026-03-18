from sqlalchemy import Column, Integer, String
from app.database import Base


class PackageType(Base):

    __tablename__ = "package_types"

    id = Column(Integer, primary_key=True, index=True)

    type_name = Column(String, unique=True)

    description = Column(String)