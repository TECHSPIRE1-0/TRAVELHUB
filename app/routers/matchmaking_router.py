from fastapi import APIRouter, HTTPException
from app.schema.matchmaking_schema import MatchmakingRequest, MatchmakingResponse
from app.services.matchmaking_service import calculate_compatibility

router = APIRouter(prefix="/matchmaking", tags=["Trip Tinder (Traveler Matchmaking)"])

@router.post("/score", response_model=MatchmakingResponse)
async def get_travel_compatibility(request: MatchmakingRequest):
    """
    Trip Tinder: Compare two traveler profiles (e.g. from the DNA Quiz) 
    and let the AI determine if they would be good travel buddies!
    """
    try:
        return calculate_compatibility(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
