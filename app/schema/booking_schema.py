from pydantic import BaseModel
from typing import List, Optional
from datetime import date


class TravellerSchema(BaseModel):

    full_name: str
    age: int
    gender: str
    id_type: str
    email: str
    phone: str


class BookingCreate(BaseModel):

    package_id: int
    transport_id: int

    departure_date: date
    return_date: date

    adults: int
    children: int

    room_type: str
    pickup_city: str
    special_requests: str | None = None

    travellers: List[TravellerSchema]
    
    
    
class BookingUpdate(BaseModel):

    departure_date: Optional[date] = None
    return_date: Optional[date] = None

    adults: Optional[int] = None
    children: Optional[int] = None

    room_type: Optional[str] = None
    pickup_city: Optional[str] = None
    special_requests: Optional[str] = None