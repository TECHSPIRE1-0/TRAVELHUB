from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.agency_model import Agency
from app.utils.hashing import hash_password, verify_password
from app.utils.jwt_handler import create_access_token

def register_agency(data, db: Session):

    agency = Agency(
        agency_name=data.agency_name,
        contact_person=data.contact_person,
        designation=data.designation,
        business_email=data.business_email,
        phone_number=data.phone_number,
        business_location=data.business_location,
        gst_number=data.gst_number,
        password=hash_password(data.password)
    )

    db.add(agency)
    db.commit()
    db.refresh(agency)

    return agency


def login_agency(data, db:Session, response):
    
    agency = db.query(Agency).filter(Agency.business_email == data.business_email).first()
    
    if not agency:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="not found")
    
    
    if not verify_password(data.password, agency.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="wrong password")
    
    
    agency_token = create_access_token(
        {"agency_id":agency.id}
    )
    
    response.set_cookie(key = "agency_token", value = agency_token)
    
    return {
        "message" : "login successfuly"
    }