from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schema.enquiry_schema import EnquiryCreate
from app.services.enquiry_service import create_enquiry, get_agency_enquiries
from app.utils.dependencies import get_current_agency, get_current_user

router = APIRouter(
    prefix="/enquiry",
    tags=["Enquiry"]
)




@router.post("/send-enquiry")
def send_enquiry(
    data: EnquiryCreate,
    current_user = Depends(get_current_user),  
    db: Session = Depends(get_db)
):

    enquiry = create_enquiry(data, current_user.id, db)

    return {
        "message": "Enquiry sent successfully",
        "enquiry_id": enquiry.id
    }


@router.get("/agency/enquiries")
def get_enquiries(
    current_agency = Depends(get_current_agency),
    db: Session = Depends(get_db)
):

    enquiries = get_agency_enquiries(current_agency.id, db)

    return enquiries