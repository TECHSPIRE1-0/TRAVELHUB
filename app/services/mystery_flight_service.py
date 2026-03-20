import json
import random
import logging
from sqlalchemy.orm import Session
from google import genai

from app.config import settings
from app.models.travel_package import TravelPackage
from app.schema.mystery_flight_schema import MysteryFlightRequest, MysteryFlightResponse

logger = logging.getLogger(__name__)

client = genai.Client(api_key=settings.GEMINI_API_KEY)

def book_mystery_flight(req: MysteryFlightRequest, db: Session) -> dict:
    try:
        # Find packages within the user's budget
        packages = db.query(TravelPackage).filter(TravelPackage.base_price <= req.max_budget).all()
        
        if not packages:
            return {"success": False, "error": "No packages found within that budget"}
            
        # Select a random package
        selected_package = random.choice(packages)
        
        # Ask Gemini to generate a cryptic fun hint
        prompt = f"""
        You are 'The Mystery Travel Agent'. A user just booked a blind travel package.
        They don't know where they are going until they arrive at the airport!
        
        Destination they are actually going to: {selected_package.destination}
        Duration: {selected_package.duration_days} days
        Theme/Type: Adventure/Leisure
        
        Generate a fun, highly cryptic JSON response to build excitement WITHOUT revealing the actual destination.
        
        Output exact JSON matching this format:
        {{
            "mystery_announcement": "Get ready for a journey to a land of [vague description]!",
            "packing_hints": ["Hint 1", "Hint 2", "Hint 3"]
        }}
        """
        
        response = client.models.generate_content(model="gemini-2.0-flash-lite", contents=prompt)
        raw_text = response.text.strip()
        
        if raw_text.startswith("```"):
            lines = raw_text.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            raw_text = "\n".join(lines).strip()
            if raw_text.startswith("json"):
                raw_text = raw_text[4:].strip()
                
        ai_data = json.loads(raw_text)
        
        res = MysteryFlightResponse(
            booking_reference=f"MYS-{random.randint(10000, 99999)}",
            package_id=selected_package.id,
            budget_used=selected_package.base_price,
            airport_arrival_time=f"Day 1, 04:30 AM",
            mystery_announcement=ai_data.get("mystery_announcement", "Get ready for a surprise!"),
            packing_hints=ai_data.get("packing_hints", ["Pack light!", "Bring a jacket!"])
        )
        
        return {"success": True, "data": res}
        
    except Exception as e:
        logger.error(f"Mystery Flight Error: {e}")
        return {"success": False, "error": str(e)}