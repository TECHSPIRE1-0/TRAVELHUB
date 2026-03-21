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
        
        
        

def send_sos_email(
    to_email: str,
    user_name: str,
    user_email: str,
    user_phone: str,
    latitude: float,
    longitude: float,
    message: str,
    timestamp: str
):
    """
    Sends an emergency SOS alert email to the platform admin.
    Called immediately when a user triggers the SOS button.
    """
    maps_link = (
        f"https://maps.google.com/?q={latitude},{longitude}"
        if latitude and longitude else "Location not available"
    )
 
    subject = f"🚨 EMERGENCY SOS — {user_name} needs help!"
 
    body = f"""
EMERGENCY SOS ALERT
===================
 
A traveller has triggered an emergency alert on TravelHub.
 
Traveller Details:
  Name   : {user_name}
  Email  : {user_email}
  Phone  : {user_phone}
 
Location:
  Latitude  : {latitude}
  Longitude : {longitude}
  Maps Link : {maps_link}
 
Message from traveller:
  {message or "No message provided"}
 
Time: {timestamp}
 
Please take immediate action and contact the traveller.
 
— TravelHub SOS System
"""
 
    msg = MIMEMultipart()
    msg["From"]    = settings.EMAIL_USER
    msg["To"]      = to_email
    msg["Subject"] = subject
 
    msg.attach(MIMEText(body, "plain"))
 
    try:
        server = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT)
        server.starttls()
        server.login(settings.EMAIL_USER, settings.EMAIL_PASSWORD)
        server.send_message(msg)
        server.quit()
        print(f"SOS email sent to admin for user: {user_name}")
    except Exception as e:
        print(f"SOS email error: {e}")