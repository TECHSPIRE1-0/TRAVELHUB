from fastapi import APIRouter, Depends,HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.models.travel_package import TravelPackage
from app.database import get_db
from app.schema.booking_schema import BookingCreate, BookingUpdate
from app.services.booking_service import create_booking,update_booking
from app.services.email_service import send_booking_email
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/booking", tags=["Booking"])


# @router.post("/create")
# def book_package(
#     data: BookingCreate,
#     db: Session = Depends(get_db),
#     user=Depends(get_current_user)
# ):

#     booking_id = create_booking(data, user.id, db)

#     return {
#         "message": "Booking successful",
#         "booking_id": booking_id
#     }
    
  

@router.post("/")
def create_booking_api(
    data : BookingCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):

    booking = create_booking(data, user.id, db)

    package = db.query(TravelPackage).filter(
        TravelPackage.id == booking.package_id
    ).first()


    background_tasks.add_task(
        send_booking_email,
        user.email,
        user.username,
        package.title,
        booking.id,
        booking.departure_date,
        booking.return_date,
        booking.total_price
    )

    return {
        "message": "Booking created successfully",
        "booking_id": booking.id
    }  


@router.patch("/update/{booking_id}")
def update_booking_api(
    booking_id: int,
    data: BookingUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):

    try:
        booking = update_booking(booking_id, user.id, data, db)

        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")

        return {
            "message": "Booking updated successfully",
            "booking_id": booking.id,
            "new_price": booking.total_price
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))