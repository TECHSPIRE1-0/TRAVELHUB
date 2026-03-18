from sqlalchemy.orm import Session
from app.models.booking_model import Booking
from app.models.travel_package import TravelPackage
from datetime import date

# def get_user_dashboard(user_id, db: Session):

#     bookings = db.query(Booking).filter(
#         Booking.user_id == user_id
#     ).all()

#     result = []

#     for b in bookings:

#         package = db.query(TravelPackage).filter(
#             TravelPackage.id == b.package_id
#         ).first()

#         result.append({
#             "id": b.id,
#             "package_title": package.title,
#             "destination": package.destination,
#             "departure_date": b.departure_date,
#             "total_price": b.total_price,
#             "status": b.status
#         })

#     return result


def get_user_dashboard(user_id, db: Session):

    bookings = db.query(Booking).filter(
        Booking.user_id == user_id
    ).all()

    today = date.today()

    upcoming_trips = []
    completed_trips = []

    for b in bookings:

        package = db.query(TravelPackage).filter(
            TravelPackage.id == b.package_id
        ).first()

        trip_data = {
            "booking_id": b.id,
            "package_title": package.title,
            "destination": package.destination,
            "departure_date": b.departure_date,
            "total_price": b.total_price,
            "status": b.status
        }

        if b.departure_date >= today:
            upcoming_trips.append(trip_data)
        else:
            completed_trips.append(trip_data)

    return {
        "total_bookings": len(bookings),
        "upcoming_trips": upcoming_trips,
        "completed_trips": completed_trips
    }
    
    

def get_booking_details(booking_id, user_id, db: Session):

    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.user_id == user_id
    ).first()

    if not booking:
        return None

    package = db.query(TravelPackage).filter(
        TravelPackage.id == booking.package_id
    ).first()

    return {
        "booking_id": booking.id,
        "package": package.title,
        "destination": package.destination,
        "departure_date": booking.departure_date,
        "return_date": booking.return_date,
        "people": booking.adults + booking.children,
        "total_price": booking.total_price,
        "status": booking.status
    }


def cancel_booking(booking_id, user_id, db: Session):

    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.user_id == user_id
    ).first()

    if not booking:
        return None

    booking.status = "cancelled"

    db.commit()

    return booking