from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schema.ai_search_schema import AISearchRequest, AISearchResponse
from app.services.ai_search_service import ai_search

router = APIRouter(prefix="/ai", tags=["AI Search"])


@router.post("/search", response_model=AISearchResponse)
def natural_language_search(
    data: AISearchRequest,
    db: Session = Depends(get_db)
):
    """
    Search travel packages using plain English.

    Example queries:
    - "5-day trip to Manali under ₹15,000 for 2 people"
    - "honeymoon package in Goa in December"
    - "adventure trip for solo traveler under 7 days"
    - "family trip to Kerala, budget around ₹25,000"
    """

    if not data.query.strip():
        raise HTTPException(status_code=400, detail="Search query cannot be empty")

    if len(data.query) > 500:
        raise HTTPException(status_code=400, detail="Query too long. Keep it under 500 characters")

    result = ai_search(data.query.strip(), db)

    return result