from pydantic import BaseModel, Field
from typing import Dict, Optional

class MatchmakingRequest(BaseModel):
    user1_name: str = Field(..., example="Rohit")
    user1_profile: Dict[str, str] = Field(
        ..., 
        example={"budget_style": "backpacker", "vibe": "adventure", "activity_level": "intense"}
    )
    user2_name: str = Field(..., example="Kabir")
    user2_profile: Dict[str, str] = Field(
        ..., 
        example={"budget_style": "midrange", "vibe": "adventure", "activity_level": "intense"}
    )
    destination: Optional[str] = Field(None, example="Manali")

class MatchmakingResponse(BaseModel):
    compatibility_score: int = Field(..., description="0 to 100 score")
    verdict: str = Field(..., example="Perfect Travel Buddies!")
    analysis: str = Field(..., description="A short, fun paragraph explaining why they match or might clash.")
