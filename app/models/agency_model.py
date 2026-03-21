from sqlalchemy import Column, Integer, String, ForeignKey, Float
from app.database import Base


class Agency(Base):

    __tablename__ = "agencies"

    id = Column(Integer, primary_key=True, index=True)

    agency_name = Column(String, nullable=False)

    contact_person = Column(String, nullable=False)

    designation = Column(String)

    business_email = Column(String, unique=True, nullable=False)

    phone_number = Column(String)

    business_location = Column(String)

    gst_number = Column(String)

    password = Column(String)
    
    
    
