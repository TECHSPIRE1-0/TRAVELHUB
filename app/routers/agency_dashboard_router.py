from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.agency_dashboard_service import (
    get_agency_packages,
    get_agency_bookings,
    get_agency_booking_details,
    update_booking_status,
    get_agency_stats
)
from app.utils.dependencies import get_current_agency

router = APIRouter(prefix="/agency/dashboard", tags=["Agency Dashboard"])


#  Get Packages
@router.get("/packages")
def agency_packages(
    db: Session = Depends(get_db),
    agency=Depends(get_current_agency)
):

    return get_agency_packages(agency.id, db)


# Get Bookings
@router.get("/bookings")
def agency_bookings(
    db: Session = Depends(get_db),
    agency=Depends(get_current_agency)
):

    return get_agency_bookings(agency.id, db)


#  Booking Details
@router.get("/booking/{booking_id}")
def booking_details(
    booking_id: int,
    db: Session = Depends(get_db),
    agency=Depends(get_current_agency)
):

    data = get_agency_booking_details(booking_id, agency.id, db)

    if not data:
        raise HTTPException(status_code=404, detail="Booking not found")

    return data


#  Update Booking Status
@router.patch("/booking/{booking_id}/status")
def update_status(
    booking_id: int,
    status: str,
    db: Session = Depends(get_db),
    agency=Depends(get_current_agency)
):

    booking = update_booking_status(booking_id, agency.id, status, db)

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    return {
        "message": f"Booking {status} successfully"
    }


# Dashboard Stats
@router.get("/stats")
def agency_stats(
    db: Session = Depends(get_db),
    agency=Depends(get_current_agency)
):

    stats = get_agency_stats(agency.id, db)
    stats["agency_name"] = agency.agency_name
    return stats