from sqlalchemy import Column, Integer, String,ForeignKey, Float
from app.database import Base

class User(Base):

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String, unique=True)

    email = Column(String, unique=True)
    
    phone_number = Column(String, unique=True)
    
    password = Column(String)
    
    