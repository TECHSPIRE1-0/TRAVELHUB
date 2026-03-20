import json
import logging
from google import genai

from app.config import settings
from app.schema.matchmaking_schema import MatchmakingRequest, MatchmakingResponse

logger = logging.getLogger(__name__)

client = genai.Client(api_key=settings.GEMINI_API_KEY)

def calculate_compatibility(req: MatchmakingRequest) -> MatchmakingResponse:
    try:
        prompt = f"""
        You are an expert AI Travel Matchmaker ("Trip Tinder").
        Your job is to analyze two travelers' profiles and determine how well they would travel together to {req.destination or 'a destination'}.
        
        Traveler 1 ({req.user1_name}): {json.dumps(req.user1_profile)}
        Traveler 2 ({req.user2_name}): {json.dumps(req.user2_profile)}
        
        Output ONLY a valid JSON object matching this structure exactly (no markdown formatting):
        {{
            "compatibility_score": 85,
            "verdict": "Great Travel Buddies!",
            "analysis": "Since both of you love high-intensity adventures, you'll have a blast trekking. However, Kabir prefers mid-range hotels while Rohit is a backpacker, so you may need to compromise on accommodation!"
        }}
        """
        
        response = client.models.generate_content(model="gemini-2.5-flash", contents=prompt)
        raw_text = response.text.strip()
        
        # Clean markdown
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
        return MatchmakingResponse(**data)
        
    except Exception as e:
        logger.error(f"Matchmaking API Error: {e}")
        # Fallback response
        return MatchmakingResponse(
            compatibility_score=50,
            verdict="System Error - Could not analyze",
            analysis="The AI matchmaker is currently taking a coffee break!"
        )