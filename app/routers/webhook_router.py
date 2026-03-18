# from fastapi import APIRouter, Request, Header, Depends
# from sqlalchemy.orm import Session

# from app.database import get_db
# from app.services.webhook_service import handle_webhook

# router = APIRouter(prefix="/webhook", tags=["Webhook"])


# @router.post("/razorpay")
# async def razorpay_webhook(
#     request: Request,
#     x_razorpay_signature: str = Header(...),
#     db: Session = Depends(get_db)
# ):

#     body = await request.body()

#     handle_webhook(body, x_razorpay_signature, db)

#     return {"status": "ok"}


# """For now skip it."""