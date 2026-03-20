import json
import logging
from sqlalchemy.orm import Session
from google import genai
from google.genai import types

from app.config import settings
from app.models.travel_package import TravelPackage

logger = logging.getLogger(__name__)

client = genai.Client(api_key=settings.GEMINI_API_KEY)

class NegotiatorSession:
    def __init__(self, package: TravelPackage):
        self.package = package
        self.base_price = package.base_price
        # Agent's absolute rock bottom price (e.g. 80% of base price)
        self.bottom_line = int(self.base_price * 0.8)
        
        system_instruction = f"""
        You are 'Alex', an experienced, tough but friendly travel agent for TravelHub.
        You are negotiating the price of a travel package with a customer.
        
        Package Details:
        - Title: {package.title}
        - Destination: {package.destination}
        - Duration: {package.duration_days} Days / {package.duration_nights} Nights
        - Max People: {package.max_people}
        - Initial Listed Price: ₹{self.base_price} INR
        
        Your boss told you NOT to drop the price below ₹{self.bottom_line} INR.
        
        Rules for Negotiation:
        1. Always be polite, enthusiastic about the destination, but firm about the value of the trip.
        2. If the user asks for a discount, make them work for it. Drop the price in small increments (e.g., ₹500 - ₹1000 at a time).
        3. Explain *why* the package is worth the money (e.g. mentions the great hotels, exclusive tours).
        4. If they offer a price below ₹{self.bottom_line}, politely reject it and make a counter-offer that is above or equal to your bottom line.
        5. If the user agrees to a price (or you accept their offer), you must conclude the deal by outputting EXACTLY this string at the end of your message: 
           [DEAL_REACHED: <agreed_price>]
        6. Keep your responses short and conversational (like a WhatsApp chat). Do not output markdown, just plain text.
        """
        
        # Initialize Gemini chat session
        self.chat = client.chats.create(
            model="gemini-2.0-flash-lite",
            history=[
                types.Content(role="user", parts=[types.Part(text=system_instruction)]),
                types.Content(role="model", parts=[types.Part(text="Understood. I will act as Alex the travel agent and negotiate firmly but fairly. I am ready.")])
            ]
        )

    def get_initial_greeting(self) -> str:
        return f"Hi! I'm Alex from TravelHub. I see you're interested in the '{self.package.title}' package to {self.package.destination}. The listed price is ₹{self.base_price}. Are you ready to book, or did you have questions about the pricing?"

    def send_message(self, user_message: str) -> dict:
        """
        Sends the user's message to the Gemini agent and parses the response to see if a deal was reached.
        """
        try:
            response = self.chat.send_message(user_message)
            text = response.text.strip()
            
            # Check if deal was reached
            deal_price = None
            if "[DEAL_REACHED:" in text:
                # Extract the price
                start = text.find("[DEAL_REACHED:") + len("[DEAL_REACHED:")
                end = text.find("]", start)
                if end != -1:
                    try:
                        deal_price = float(text[start:end].strip())
                        text = text[:text.find("[DEAL_REACHED:")].strip()
                    except ValueError:
                        pass

            return {
                "reply": text,
                "deal_reached": deal_price is not None,
                "agreed_price": deal_price
            }
        except Exception as e:
            logger.error(f"Gemini Negotiation Error: {e}")
            return {
                "reply": "I'm having a bit of trouble with my system right now. Can we continue this negotiation in a moment?",
                "deal_reached": False,
                "agreed_price": None
            }