from pydantic import BaseModel
from typing import List


class PackageTypeSchema(BaseModel):
    type_name: str
    description: str


class PackageSchema(BaseModel):
    title: str
    description: str
    destination: str
    start_location: str
    duration_days: int
    duration_nights: int
    base_price: float
    max_people: int


class TransportSchema(BaseModel):
    vehicle_type: str
    vehicle_name: str
    seat_capacity: int
    price_per_day: float


class ItinerarySchema(BaseModel):
    day_number: int
    title: str
    description: str


class PricingSchema(BaseModel):
    transport_index: int
    price: float


class CreatePackageRequest(BaseModel):

    package_type: PackageTypeSchema
    package: PackageSchema
    transport_options: List[TransportSchema]
    itinerary: List[ItinerarySchema]
    images: List[str]
    pricing: List[PricingSchema]