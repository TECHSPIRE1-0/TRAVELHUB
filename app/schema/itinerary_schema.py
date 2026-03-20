from pydantic import BaseModel, Field
from typing import List, Optional


class ItineraryRequest(BaseModel):
    destination: str = Field(..., example="Goa", description="The destination to visit")
    budget: float = Field(..., example=15000, description="Total budget in INR")
    duration_days: int = Field(..., example=3, description="Number of days for the trip")
    traveler_type: str = Field(..., example="couple", description="e.g. solo, couple, family, friends")
    preferences: Optional[str] = Field(None, example="We love beach parties and spicy food.", description="Additional context or preferences")


class Activity(BaseModel):
    time: str = Field(..., example="10:00 AM", description="Time of the activity")
    title: str = Field(..., example="Visit Baga Beach", description="Title of the activity")
    description: str = Field(..., example="Relax on the sandy shores and enjoy water sports.", description="Short description")
    estimated_cost_inr: float = Field(..., example=500, description="Estimated cost for this activity in INR")


class DailyItinerary(BaseModel):
    day: int = Field(..., example=1, description="Day number")
    theme: str = Field(..., example="Beach & Relaxation", description="High level theme for the day")
    activities: List[Activity] = Field(..., description="List of activities for the day")
    daily_total_cost: float = Field(..., example=2500, description="Estimated total cost for the day")


class ItineraryResponse(BaseModel):
    destination: str
    duration_days: int
    total_estimated_cost: float = Field(..., description="Total cost of all activities across all days")
    budget_status: str = Field(..., example="Under Budget", description="Status like 'Under Budget', 'On Budget', or 'Over Budget'")
    packing_tips: List[str] = Field(..., description="3 to 5 smart packing tips based on the destination and itinerary")
    itinerary: List[DailyItinerary] = Field(..., description="Day by day breakdown")

