from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import date

from app.database import get_db
from app.schema.crowd_schema import CrowdLevelResponse, DestinationCrowdResponse
from app.services.crowd_service import (
    get_crowd_level_for_package,
    get_crowd_level_for_destination,
)

router = APIRouter(prefix="/crowd", tags=["Crowd Level"])


@router.get("/package/{package_id}", response_model=CrowdLevelResponse)
def check_package_crowd(
    package_id: int,
    departure_date: date = Query(..., description="Your intended departure date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
):

    return get_crowd_level_for_package(package_id, departure_date, db)


@router.get("/destination", response_model=DestinationCrowdResponse)
def check_destination_crowd(
    destination: str = Query(..., description="Destination name or partial name"),
    db: Session = Depends(get_db),
):

    return get_crowd_level_for_destination(destination, db)