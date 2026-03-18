from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import letter

from sqlalchemy.orm import Session

from app.models.booking_model import Booking
from app.models.user_model import User
from app.models.travel_package import TravelPackage

import os


def generate_invoice(booking_id: int, db: Session):

    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    user = db.query(User).filter(User.id == booking.user_id).first()
    package = db.query(TravelPackage).filter(
        TravelPackage.id == booking.package_id
    ).first()

    os.makedirs("invoices", exist_ok=True)

    file_path = f"invoices/invoice_{booking.id}.pdf"

    doc = SimpleDocTemplate(file_path, pagesize=letter)
    styles = getSampleStyleSheet()

    content = []

    content.append(Paragraph("<b>TravelHub Invoice</b>", styles["Title"]))
    content.append(Spacer(1, 20))

    content.append(Paragraph(f"Booking ID: {booking.id}", styles["Normal"]))
    content.append(Paragraph(f"Status: {booking.status}", styles["Normal"]))
    content.append(Spacer(1, 10))

    content.append(Paragraph("<b>Customer Details</b>", styles["Heading2"]))
    content.append(Paragraph(f"Name: {user.username}", styles["Normal"]))
    content.append(Paragraph(f"Email: {user.email}", styles["Normal"]))
    content.append(Spacer(1, 10))

    content.append(Paragraph("<b>Package Details</b>", styles["Heading2"]))
    content.append(Paragraph(f"Package: {package.title}", styles["Normal"]))
    content.append(Paragraph(f"Destination: {package.destination}", styles["Normal"]))
    content.append(Spacer(1, 10))

    content.append(Paragraph("<b>Travel Details</b>", styles["Heading2"]))
    content.append(Paragraph(f"Departure: {booking.departure_date}", styles["Normal"]))
    content.append(Paragraph(f"Return: {booking.return_date}", styles["Normal"]))
    content.append(Spacer(1, 10))

    content.append(Paragraph("<b>Payment</b>", styles["Heading2"]))
    content.append(Paragraph(f"Total Paid: ₹{booking.total_price}", styles["Normal"]))

    doc.build(content)

    return file_path