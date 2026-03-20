from pydantic import BaseModel, Field
from typing import List

class MysteryFlightRequest(BaseModel):
    user_id: int = Field(..., description="The ID of the user booking the mystery trip")
    max_budget: float = Field(..., description="The maximum amount they are willing to spend")

class MysteryFlightResponse(BaseModel):
    booking_reference: str = Field(..., description="Mock booking reference ID")
    package_id: int = Field(..., description="The internally assigned package ID")
    budget_used: float = Field(..., description="How much of their budget was spent")
    airport_arrival_time: str = Field(..., description="When to show up at the airport")
    mystery_announcement: str = Field(..., description="A fun, cryptic message about their trip")
    packing_hints: List[str] = Field(..., description="e.g. 'pack a swimsuit', 'bring thick socks'")
