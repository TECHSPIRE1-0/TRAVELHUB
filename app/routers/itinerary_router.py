from fastapi import APIRouter, HTTPException
from app.schema.itinerary_schema import ItineraryRequest, ItineraryResponse
from app.services.itinerary_service import generate_itinerary

router = APIRouter(prefix="/itinerary", tags=["AI Itinerary Generator"])

@router.post("/generate", response_model=ItineraryResponse)
async def create_smart_itinerary(request: ItineraryRequest):
    """
    Generate an AI-powered, highly personalized day-by-day travel itinerary.
    Includes cost estimations, packing tips, and thematic daily plans.
    """
    try:
        # Generate the itinerary
        return generate_itinerary(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
