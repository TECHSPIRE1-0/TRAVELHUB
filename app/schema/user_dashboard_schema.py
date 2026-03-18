from pydantic import BaseModel
from datetime import date
from typing import List


class BookingResponse(BaseModel):

    id: int
    package_title: str
    destination: str
    departure_date: date
    total_price: float
    status: str

    class Config:
        orm_mode = True