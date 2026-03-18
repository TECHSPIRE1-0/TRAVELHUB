from pydantic import BaseModel
from datetime import date


class AgencyPackageResponse(BaseModel):

    id: int
    title: str
    destination: str
    base_price: float


class AgencyBookingResponse(BaseModel):

    booking_id: int
    package_title: str
    user_id: int
    departure_date: date
    total_price: float
    status: str