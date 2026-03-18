from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.user_dashboard_service import (
    get_user_dashboard,
    get_booking_details,
    cancel_booking
)
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/user", tags=["User Dashboard"])


@router.get("/dashboard")
def user_dashboard(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):

    data = get_user_dashboard(user.id, db)

    return {
        "bookings": data
    }


@router.get("/booking/{booking_id}")
def booking_details(
    booking_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):

    data = get_booking_details(booking_id, user.id, db)

    if not data:
        raise HTTPException(status_code=404, detail="Booking not found")

    return data


@router.patch("/booking/{booking_id}/cancel")
def cancel_user_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):

    booking = cancel_booking(booking_id, user.id, db)

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    return {
        "message": "Booking cancelled successfully"
    }