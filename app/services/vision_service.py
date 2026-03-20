import io
import json
import logging
from PIL import Image
from sqlalchemy.orm import Session
from sqlalchemy import or_

import google as genai
from app.config import settings
from app.models.travel_package import TravelPackage

logger = logging.getLogger(__name__)

genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash-lite')

def analyze_image_and_match(image_bytes: bytes, db: Session) -> dict:
    """
    Analyzes an uploaded image, identifies the location/landmark, 
    and returns a matching travel package from the DB.
    """
    try:
        # Load image via PIL
        image = Image.open(io.BytesIO(image_bytes))
        
        prompt = """
        You are an expert travel AI. Look at this image. 
        Where was this taken? What is the main landmark or destination shown?
        
        Respond ONLY with a valid JSON object in this exact format:
        {
            "destination_name": "City or Region Name (e.g. Goa, Paris)",
            "landmark": "Specific landmark if any (e.g. Baga Beach, Eiffel Tower)",
            "description": "A 2-sentence fascinating fact about this place."
        }
        """
        
        response = model.generate_content([prompt, image])
        raw_text = response.text.strip()
        
        # Clean markdown if present
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
        dest = ai_data.get("destination_name", "")
        landmark = ai_data.get("landmark", "")
        
        # Search DB for overlapping destination
        # We will try to find a package that mentions the destination or the landmark
        packages = []
        if dest or landmark:
            filters = []
            if dest:
                filters.append(TravelPackage.destination.ilike(f"%{dest}%"))
                filters.append(TravelPackage.title.ilike(f"%{dest}%"))
            if landmark:
                filters.append(TravelPackage.title.ilike(f"%{landmark}%"))
                filters.append(TravelPackage.description.ilike(f"%{landmark}%"))
                
            query = db.query(TravelPackage).filter(or_(*filters))
            packages = query.limit(3).all()
            
        matched_packages = [
            {
                "id": p.id,
                "title": p.title,
                "destination": p.destination,
                "base_price": p.base_price,
                "duration": f"{p.duration_days}D/{p.duration_nights}N"
            } for p in packages
        ]
            
        return {
            "ai_analysis": ai_data,
            "matched_packages": matched_packages,
            "success": True
        }
        
    except Exception as e:
        logger.error(f"Vision AI Error: {e}")
        return {
            "success": False,
            "error": str(e)
        }
