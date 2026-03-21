# from fastapi import APIRouter, Depends, BackgroundTasks
# from pydantic import BaseModel
# from typing import Optional

# from app.services.email_service import send_sos_email
# from app.utils.dependencies import get_current_user

# router = APIRouter(prefix="/sos", tags=["SOS Emergency Alert"])


# class SOSPayload(BaseModel):
#     latitude:  Optional[float] = None
#     longitude: Optional[float] = None
#     message:   Optional[str]   = None
#     timestamp: str


# @router.post("/alert")
# async def send_sos_alert(
#     payload: SOSPayload,
#     background_tasks: BackgroundTasks,
#     user=Depends(get_current_user)
# ):
#     """
#     Called when the user taps the SOS / Emergency button.
#     Sends an immediate alert email to the platform admin
#     with the user's name, phone, location and message.

#     The email is sent in the background so the user gets
#     an instant response without waiting for the email to send.
#     """

#     print(f"\n EMERGENCY SOS RECEIVED ")
#     print(f"User   : {user.username} ({user.email})")
#     print(f"Phone  : {user.phone_number}")
#     print(f"Location: Lat {payload.latitude}, Lng {payload.longitude}")
#     print(f"Message : {payload.message}")
#     print(f"Time    : {payload.timestamp}\n")

#     # Send email in background — user gets instant response
#     background_tasks.add_task(
#         send_sos_email,
#         user_name   = user.username,
#         user_email  = user.email,
#         user_phone  = user.phone_number or "Not provided",
#         latitude    = payload.latitude,
#         longitude   = payload.longitude,
#         message     = payload.message,
#         timestamp   = payload.timestamp
#     )

#     return {
#         "status":  "success",
#         "message": "Emergency alert sent. Help is on the way."
#     }


from fastapi import APIRouter, Depends, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.admin_model import Admin
from app.services.email_service import send_sos_email
from app.utils.dependencies import get_current_user   # ← USER, not admin

router = APIRouter(prefix="/sos", tags=["SOS Emergency Alert"])


class SOSPayload(BaseModel):
    latitude:  Optional[float] = None
    longitude: Optional[float] = None
    message:   Optional[str]   = None
    timestamp: str


@router.post("/alert")
async def send_sos_alert(
    payload: SOSPayload,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)   # ← USER triggers the alert
):
    # Fetch admin email from DB
    admin = db.query(Admin).filter(Admin.is_active == True).first()

    if admin:
        background_tasks.add_task(
            send_sos_email,
            to_email   = admin.email,       # ← sends TO the admin
            user_name  = user.username,
            user_email = user.email,
            user_phone = user.phone_number or "Not provided",
            latitude   = payload.latitude,
            longitude  = payload.longitude,
            message    = payload.message,
            timestamp  = payload.timestamp
        )

    return {
        "status":  "success",
        "message": "Emergency alert sent. Help is on the way."
    }