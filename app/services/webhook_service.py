# import hmac
# import hashlib
# import json

# from fastapi import HTTPException
# from sqlalchemy.orm import Session

# from app.models.booking_model import Booking
# from app.config import settings


# def handle_webhook(request_body: bytes, signature: str, db: Session):

#     generated_signature = hmac.new(
#         bytes(settings.RAZORPAY_WEBHOOK_SECRET, "utf-8"),
#         request_body,
#         hashlib.sha256
#     ).hexdigest()

#     if not hmac.compare_digest(generated_signature, signature):
#         raise HTTPException(status_code=400, detail="Invalid webhook signature")

#     event = json.loads(request_body)

#     event_type = event.get("event")

#     if event_type == "payment.captured":

#         payment = event["payload"]["payment"]["entity"]

#         order_id = payment["order_id"]
#         amount = payment["amount"] / 100

#         booking = db.query(Booking).filter(
#             Booking.razorpay_order_id == order_id
#         ).first()

#         if not booking:
#             return

#         if booking.total_price != amount:
#             return

#         booking.status = "confirmed"
#         db.commit()

#     elif event_type == "payment.failed":

#         payment = event["payload"]["payment"]["entity"]

#         order_id = payment["order_id"]

#         booking = db.query(Booking).filter(
#             Booking.razorpay_order_id == order_id
#         ).first()

#         if booking:
#             booking.status = "failed"
#             db.commit()