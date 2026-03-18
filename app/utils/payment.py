import razorpay
from app.config import settings


RAZORPAY_KEY_ID = settings.RAZORPAY_KEY_ID
RAZORPAY_SECRET = settings.RAZORPAY_SECRET

client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_SECRET))