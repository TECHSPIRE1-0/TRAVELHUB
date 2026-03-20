import json
import logging
from sqlalchemy.orm import Session
from google import genai

from app.config import settings
from app.models.travel_package import TravelPackage
from app.schema.reels_schema import ReelsRequest, ReelsResponse

logger = logging.getLogger(__name__)

client = genai.Client(api_key=settings.GEMINI_API_KEY)

def generate_reels_script(req: ReelsRequest, db: Session) -> dict:
    try:
        package = db.query(TravelPackage).filter(TravelPackage.id == req.package_id).first()
        if not package:
            return {"success": False, "error": "Travel package not found"}
            
        prompt = f"""
        You are a viral social media manager for a travel agency.
        Generate a highly engaging, fast-paced script for a {req.platform} video promoting this travel package.
        Tone: {req.tone}
        
        Package Details:
        - Title: {package.title}
        - Destination: {package.destination}
        - Duration: {package.duration_days} Days / {package.duration_nights} Nights
        - Base Price: ₹{package.base_price}
        - Description: {package.description}
        
        Output ONLY a valid JSON object matching this structure perfectly without markdown:
        {{
            "package_id": {package.id},
            "title": "A catchy inner-team title",
            "target_duration": "15 seconds",
            "suggested_audio": "Name or style of trending audio",
            "caption": "The instagram/tiktok caption with emojis and #hashtags",
            "script": [
                {{
                    "timestamp_seconds": "0:00 - 0:02",
                    "visual": "What is shown on screen",
                    "voiceover": "What is spoken",
                    "text_on_screen": "Text overlay"
                }}
            ]
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
                
        data = json.loads(raw_text)
        
        # Validate through Pydantic
        res = ReelsResponse(**data)
        return {"success": True, "data": res}
        
    except Exception as e:
        logger.error(f"Reels Script API Error: {e}")
        return {"success": False, "error": str(e)}