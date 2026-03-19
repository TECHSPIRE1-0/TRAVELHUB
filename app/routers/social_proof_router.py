from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.schema.social_proof_schema import SocialProofResponse
from app.services.social_proof_service import get_social_proof, record_view

router = APIRouter(prefix="/packages", tags=["Social Proof"])


@router.post("/{package_id}/view")
def track_view(
    package_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Call this every time a user opens a package detail page.
    Records an anonymised view (IP hash + timestamp).

    Frontend: call this once when the package page loads.
        fetch(`/packages/${id}/view`, { method: 'POST' })
    """
    client_ip = request.client.host or "unknown"
    return record_view(package_id, client_ip, db)


@router.get("/{package_id}/social-proof", response_model=SocialProofResponse)
def social_proof(
    package_id:     int,
    departure_date: str = None,   # optional "YYYY-MM-DD" — scopes seats to that trip date
    db: Session = Depends(get_db)
):
    """
    Returns live urgency signals for a package — use to display on
    the package detail page to drive booking conversions.

    Response includes:
    - viewers_now     : people viewing in last 10 min
    - views_today     : total views in last 24 hours
    - bookings_week   : bookings made in last 7 days
    - seats_left      : available capacity
    - last_booked_ago : when was the last booking
    - urgency_level   : "high" | "medium" | "low" | "none"
    - urgency_tags    : ready-to-display strings e.g. ["Only 3 seats left!"]
    - urgency_color   : "red" | "orange" | "green" | "gray"

    Example response:
    {
        "urgency_level": "high",
        "urgency_color": "red",
        "urgency_tags": [
            "Only 2 seats left!",
            "Last booked recently",
            "8 bookings this week — very popular!"
        ],
        "viewers_now": 14,
        "seats_left": 2
    }
    """
    return get_social_proof(package_id, db, departure_date)