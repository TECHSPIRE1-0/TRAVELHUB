from sqlalchemy.orm import Session
from app.models.travel_package import TravelPackage
from app.models.booking_model import Booking


# Get Agency Packages
def get_agency_packages(agency_id, db: Session):

    packages = db.query(TravelPackage).filter(
        TravelPackage.agency_id == agency_id
    ).all()

    result = []

    for p in packages:
        result.append({
            "id": p.id,
            "title": p.title,
            "destination": p.destination,
            "base_price": p.base_price
        })

    return result


# Get All Bookings of Agency
def get_agency_bookings(agency_id, db: Session):

    bookings = db.query(Booking).join(
        TravelPackage,
        Booking.package_id == TravelPackage.id
    ).filter(
        TravelPackage.agency_id == agency_id
    ).all()

    result = []

    for b in bookings:

        package = db.query(TravelPackage).filter(
            TravelPackage.id == b.package_id
        ).first()

        result.append({
            "booking_id": b.id,
            "package_title": package.title,
            "user_id": b.user_id,
            "departure_date": b.departure_date,
            "total_price": b.total_price,
            "status": b.status
        })

    return result


#  Booking Details
def get_agency_booking_details(booking_id, agency_id, db: Session):

    booking = db.query(Booking).join(
        TravelPackage,
        Booking.package_id == TravelPackage.id
    ).filter(
        Booking.id == booking_id,
        TravelPackage.agency_id == agency_id
    ).first()

    if not booking:
        return None

    return {
        "booking_id": booking.id,
        "package_id": booking.package_id,
        "user_id": booking.user_id,
        "departure_date": booking.departure_date,
        "return_date": booking.return_date,
        "total_price": booking.total_price,
        "status": booking.status
    }


# Update Booking Status
def update_booking_status(booking_id, agency_id, status, db: Session):

    booking = db.query(Booking).join(
        TravelPackage,
        Booking.package_id == TravelPackage.id
    ).filter(
        Booking.id == booking_id,
        TravelPackage.agency_id == agency_id
    ).first()

    if not booking:
        return None

    booking.status = status

    db.commit()

    return booking


#  Dashboard Stats
def get_agency_stats(agency_id, db: Session):

    packages = db.query(TravelPackage).filter(
        TravelPackage.agency_id == agency_id
    ).all()

    bookings = db.query(Booking).join(
        TravelPackage,
        Booking.package_id == TravelPackage.id
    ).filter(
        TravelPackage.agency_id == agency_id
    ).all()

    total_revenue = sum([b.total_price for b in bookings])

    return {
        "total_packages": len(packages),
        "total_bookings": len(bookings),
        "total_revenue": total_revenue
    }