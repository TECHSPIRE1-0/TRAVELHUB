import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.config import settings


def send_booking_email(
    to_email: str,
    username: str,
    package_name: str,
    booking_id: int,
    departure_date,
    return_date,
    total_price: float
):

    subject = "Booking Confirmation "

    body = f"""
Hi {username},

Your booking is successful 

 Booking Details:

Booking ID: {booking_id}
Package: {package_name}
Travel Dates: {departure_date} → {return_date}
Total Price: ₹{total_price}

Thank you for choosing TravelHub 

Have a great trip!
"""

    msg = MIMEMultipart()
    msg["From"] = settings.EMAIL_USER
    msg["To"] = to_email
    msg["Subject"] = subject

    msg.attach(MIMEText(body, "plain"))

    try:
        server = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT)
        server.starttls()
        server.login(settings.EMAIL_USER, settings.EMAIL_PASSWORD)
        server.send_message(msg)
        server.quit()
    except Exception as e:
        print("Email error:", e)