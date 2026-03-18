from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.booking_model import Booking
from app.models.traveler_model import Traveller
from app.models.package_pricing import PackagePricing
from datetime import datetime, timedelta


def create_booking(data, user_id, db: Session):

    pricing = db.query(PackagePricing).filter(
        PackagePricing.package_id == data.package_id,
        PackagePricing.transport_id == data.transport_id
    ).first()

    if not pricing:
        raise HTTPException(status_code=404, detail="Pricing not found")

    total_people = data.adults + data.children
    total_price = pricing.price * total_people

    booking = Booking(
        user_id=user_id,
        package_id=data.package_id,
        transport_id=data.transport_id,
        departure_date=data.departure_date,
        return_date=data.return_date,
        adults=data.adults,
        children=data.children,
        room_type=data.room_type,
        pickup_city=data.pickup_city,
        special_requests=data.special_requests,
        total_price=total_price,
        status="pending"
    )

    db.add(booking)
    db.flush()

    for t in data.travellers:
        db.add(
            Traveller(
                booking_id=booking.id,
                full_name=t.full_name,
                age=t.age,
                gender=t.gender,
                id_type=t.id_type,
                email=t.email,
                phone=t.phone
            )
        )

    db.commit()
    db.refresh(booking)

    return booking


def update_booking(booking_id, user_id, data, db: Session):

    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.user_id == user_id
    ).first()

    if not booking:
        return None

    # Cannot modify cancelled booking
    if booking.status == "cancelled":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="can't modify cancelled booking")

    now = datetime.now()

    # Cannot modify past bookings
    if booking.departure_date < now:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="can't modify past bookings")

    # Cannot modify within 24 hours
    time_difference = booking.departure_date - now

    if time_difference < timedelta(hours=24):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Modification allowed only before 24 hours of departure"
        )

    """in feature we add  a new feature that the user can't cancelled trip before a specific time"""
    #  Allowed Updates
    if data.departure_date:
        booking.departure_date = data.departure_date

    if data.return_date:
        booking.return_date = data.return_date

    if data.adults is not None:
        booking.adults = data.adults

    if data.children is not None:
        booking.children = data.children

    if data.room_type:
        booking.room_type = data.room_type

    if data.pickup_city:
        booking.pickup_city = data.pickup_city

    if data.special_requests:
        booking.special_requests = data.special_requests

    #  Recalculate price
    pricing = db.query(PackagePricing).filter(
        PackagePricing.package_id == booking.package_id,
        PackagePricing.transport_id == booking.transport_id
    ).first()

    total_people = booking.adults + booking.children

    booking.total_price = pricing.price * total_people

    db.commit()
    db.refresh(booking)

    return booking