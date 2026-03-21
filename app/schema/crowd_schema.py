from pydantic import BaseModel
from typing import Optional
from datetime import date


class CrowdLevelResponse(BaseModel):
    package_id: int
    destination: str
    package_title: str
    departure_date: date
    max_people: int
    booked_people: int
    occupancy_percentage: float
    crowd_level: str          # "Low" | "Moderate" | "High" | "Very Crowded"
    crowd_label: str          # Human-friendly message
    crowd_emoji: str          # Visual indicator
    recommendation: str       # Actionable tip for the user
    alternative_dates: Optional[list[date]] = None  # Suggested less-crowded dates


class DestinationCrowdResponse(BaseModel):
    destination: str
    total_packages: int
    avg_occupancy_percentage: float
    crowd_level: str
    crowd_label: str
    crowd_emoji: str
    best_time_window: Optional[str] = None  # e.g. "Next 2 weeks look quieter"