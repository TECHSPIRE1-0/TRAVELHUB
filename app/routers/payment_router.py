from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schema.payment_schema import PaymentVerifySchema
from app.database import get_db
from app.models.booking_model import Booking
from app.services.payment_service import (
    create_order_service,
    verify_payment_service
)

router = APIRouter(prefix="/payment", tags=["Payment"])


@router.post("/create-order/{booking_id}")
def create_order(booking_id: int, db: Session = Depends(get_db)):

    booking = db.query(Booking).filter(Booking.id == booking_id).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    order = create_order_service(booking, db)

    return {
        "order_id": order["id"],
        "amount": order["amount"],
        "currency": "INR"
    }


@router.post("/verify")
def verify_payment(data: PaymentVerifySchema, db: Session = Depends(get_db)):

    return verify_payment_service(data, db)