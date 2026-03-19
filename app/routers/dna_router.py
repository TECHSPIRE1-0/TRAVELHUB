from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schema.dna_schema import DNAQuizRequest, DNAQuizResponse
from app.services.dna_service import run_dna_quiz

router = APIRouter(prefix="/dna", tags=["Travel DNA"])


@router.post("/quiz", response_model=DNAQuizResponse)
def travel_dna_quiz(
    data: DNAQuizRequest,
    db: Session = Depends(get_db)
):
    """
    Submit your Travel DNA quiz answers and get:
    - Your traveler persona (name, emoji, tagline, traits)
    - Matched travel packages ranked by compatibility score

    Questions:
    1. budget_style   : backpacker | midrange | luxury
    2. activity_level : relaxed | moderate | intense
    3. travel_group   : solo | couple | family | friends
    4. vibe           : adventure | culture | beach | nature | city
    5. duration       : weekend | short | week | long

    Example request body:
    {
        "budget_style":   "midrange",
        "activity_level": "intense",
        "travel_group":   "friends",
        "vibe":           "adventure",
        "duration":       "week"
    }
    """

    return run_dna_quiz(data, db)


@router.get("/questions")
def get_quiz_questions():
    """
    Returns the quiz questions and all valid options for the frontend.
    """
    return {
        "questions": [
            {
                "id":       "budget_style",
                "question": "What is your travel budget style?",
                "options": [
                    {"value": "backpacker", "label": "Backpacker",  "hint": "Under ₹10,000 per person"},
                    {"value": "midrange",   "label": "Mid-range",   "hint": "₹10,000 – ₹30,000 per person"},
                    {"value": "luxury",     "label": "Luxury",      "hint": "₹30,000+ per person"},
                ]
            },
            {
                "id":       "activity_level",
                "question": "How active do you like your trips?",
                "options": [
                    {"value": "relaxed",  "label": "Relaxed",  "hint": "Beaches, sightseeing, leisure"},
                    {"value": "moderate", "label": "Moderate", "hint": "Some hiking, city walks"},
                    {"value": "intense",  "label": "Intense",  "hint": "Trekking, rafting, camping"},
                ]
            },
            {
                "id":       "travel_group",
                "question": "Who do you usually travel with?",
                "options": [
                    {"value": "solo",    "label": "Solo",    "hint": "Just me, myself and I"},
                    {"value": "couple",  "label": "Couple",  "hint": "Me and my partner"},
                    {"value": "family",  "label": "Family",  "hint": "With kids and/or parents"},
                    {"value": "friends", "label": "Friends", "hint": "The whole gang"},
                ]
            },
            {
                "id":       "vibe",
                "question": "What is your travel vibe?",
                "options": [
                    {"value": "adventure", "label": "Adventure", "hint": "Thrills and adrenaline"},
                    {"value": "culture",   "label": "Culture",   "hint": "History, food, heritage"},
                    {"value": "beach",     "label": "Beach",     "hint": "Sun, sea, relaxation"},
                    {"value": "nature",    "label": "Nature",    "hint": "Wildlife and forests"},
                    {"value": "city",      "label": "City",      "hint": "Urban exploring"},
                ]
            },
            {
                "id":       "duration",
                "question": "How long do you like your trips?",
                "options": [
                    {"value": "weekend", "label": "Weekend",    "hint": "2–3 days"},
                    {"value": "short",   "label": "Short trip", "hint": "3–5 days"},
                    {"value": "week",    "label": "A week",     "hint": "6–8 days"},
                    {"value": "long",    "label": "Long trip",  "hint": "9+ days"},
                ]
            },
        ]
    }