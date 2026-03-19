# # from app.utils.payment import client, RAZORPAY_SECRET
# # from app.models.booking_model import Booking

# # from sqlalchemy.orm import Session
# # import hmac
# # import hashlib
# # from fastapi import HTTPException


# # def create_order_service(booking, db: Session):

# #     order = client.order.create({
# #         "amount": int(booking.total_price * 100),
# #         "currency": "INR",
# #         "payment_capture": 1
# #     })

# #     # save order id
# #     booking.razorpay_order_id = order["id"]
# #     db.commit()

# #     return order


# # def verify_payment_service(data, db: Session):

# #     #  Verify signature
# #     generated_signature = hmac.new(
# #         bytes(RAZORPAY_SECRET, "utf-8"),
# #         bytes(data["razorpay_order_id"] + "|" + data["razorpay_payment_id"], "utf-8"),
# #         hashlib.sha256
# #     ).hexdigest()

# #     if generated_signature != data["razorpay_signature"]:
# #         raise HTTPException(status_code=400, detail="Invalid payment signature")

# #     #  Get booking
# #     booking = db.query(Booking).filter(
# #         Booking.id == data["booking_id"]
# #     ).first()

# #     if not booking:
# #         raise HTTPException(status_code=404, detail="Booking not found")

# #     #  Verify order_id
# #     if booking.razorpay_order_id != data["razorpay_order_id"]:
# #         raise HTTPException(status_code=400, detail="Invalid order ID")

# #     #  Fetch order
# #     order = client.order.fetch(data["razorpay_order_id"])

# #     paid_amount = order["amount"] / 100

# #     #Verify amount
# #     if paid_amount != booking.total_price:
# #         raise HTTPException(status_code=400, detail="Payment amount mismatch")

# #     # Confirm booking
# #     booking.status = "confirmed"
# #     db.commit()

# #     return {
# #         "message": "Payment successful and booking confirmed"
# #     }



# """in this code add invoice generate after the booking conformed"""

# from app.utils.payment import client, RAZORPAY_SECRET
# from app.models.booking_model import Booking
# from app.services.invoice_service import generate_invoice

# from sqlalchemy.orm import Session
# import hmac
# import hashlib
# from fastapi import HTTPException


# def create_order_service(booking, db: Session):

#     order = client.order.create({
#         "amount": int(booking.total_price * 100),
#         "currency": "INR",
#         "payment_capture": 1
#     })

#     booking.razorpay_order_id = order["id"]
#     db.commit()

#     return order


# def verify_payment_service(data, db: Session):

#     generated_signature = hmac.new(
#         bytes(RAZORPAY_SECRET, "utf-8"),
#         bytes(data.razorpay_order_id + "|" + data.razorpay_payment_id, "utf-8"),
#         hashlib.sha256
#     ).hexdigest()

#     if generated_signature != data.razorpay_signature:
#         raise HTTPException(status_code=400, detail="Invalid payment signature")

#     booking = db.query(Booking).filter(
#         Booking.id == data.booking_id
#     ).first()

#     if not booking:
#         raise HTTPException(status_code=404, detail="Booking not found")

#     if booking.razorpay_order_id != data.razorpay_order_id:
#         raise HTTPException(status_code=400, detail="Invalid order ID")

#     order = client.order.fetch(data.razorpay_order_id)
#     paid_amount = order["amount"] / 100

#     if paid_amount != booking.total_price:
#         raise HTTPException(status_code=400, detail="Payment amount mismatch")

#     booking.status = "confirmed"

#     file_path = generate_invoice(booking.id, db)

#     booking.invoice_path = file_path

#     db.commit()

#     return {
#         "message": "Payment successful, booking confirmed, invoice generated",
#         "invoice_path": file_path
#     }