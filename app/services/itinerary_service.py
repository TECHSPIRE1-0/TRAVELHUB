import json
import logging
from google import genai

from app.config import settings
from app.schema.itinerary_schema import ItineraryRequest, ItineraryResponse

# Configure Gemini
client = genai.Client(api_key=settings.GEMINI_API_KEY)

logger = logging.getLogger(__name__)

def generate_itinerary(request: ItineraryRequest) -> ItineraryResponse:
    """
    Calls Google Gemini to generate a highly detailed, personalized day-by-day itinerary.
    Estimates costs for each activity and sums them up.
    """
    
    prompt = f"""You are a world-class AI travel planner. Your goal is to create a dynamic, highly-detailed day-by-day itinerary.
    
    User Request:
    - Destination: {request.destination}
    - Budget: ₹{request.budget} INR
    - Duration: {request.duration_days} days
    - Traveler Type: {request.traveler_type}
    - Additional Preferences: {request.preferences or 'None'}
    
    Please output a raw JSON object (without markdown code blocks, just raw JSON text) matching the exact schema below.
    Ensure that the total estimated costs are realistic for the destination and traveler type in INR. 
    The 'budget_status' should be "Under Budget", "On Budget", or "Over Budget".
    
    {{
        "destination": "{request.destination}",
        "duration_days": {request.duration_days},
        "total_estimated_cost": 0.0,
        "budget_status": "Status",
        "packing_tips": [
            "Tip 1",
            "Tip 2",
            "Tip 3"
        ],
        "itinerary": [
            {{
                "day": 1,
                "theme": "Arrival & Leisure",
                "daily_total_cost": 0.0,
                "activities": [
                    {{
                        "time": "10:00 AM",
                        "title": "Arrive and Check-in",
                        "description": "Settle into your accommodation and freshen up.",
                        "estimated_cost_inr": 0.0
                    }}
                ]
            }}
        ]
    }}
    
    Make the itinerary highly engaging, culturally rich, and practical. Ensure the JSON is properly formatted and valid.
    """
    
    try:
        response = client.models.generate_content(model="gemini-2.0-flash", contents=prompt)
        raw_text = response.text.strip()
        
        # Clean up possible markdown wrappers
        if raw_text.startswith("```"):
            lines = raw_text.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            raw_text = "\n".join(lines).strip()
            
            if raw_text.startswith("json"):
                raw_text = raw_text[4:].strip()
                
        data = json.loads(raw_text)
        
        # Validate and build response using Pydantic
        return ItineraryResponse(**data)
        
    except Exception as e:
        logger.error(f"Failed to generate AI itinerary: {e}")
        # Fallback or strict error
        raise ValueError(f"AI Failed to generate a valid itinerary. Error: {str(e)}")
