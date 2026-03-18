from fastapi import APIRouter, Depends, Response, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schema.agency_schema import AgencyRegister, AgencyLogin
from app.services.agency_service import register_agency, login_agency

router = APIRouter(prefix="/auth", tags=["Agency"])


@router.post("/register-agency")
def register(data: AgencyRegister, db: Session = Depends(get_db)):

    agency = register_agency(data, db)

    return {
        "message": "Agency registered successfully"
    }
    
    
@router.post("/login-agency")
def login(data : AgencyLogin, reponse : Response, db : Session = Depends(get_db)):
    
    agency_login = login_agency(data, db, reponse)
    
    if not agency_login:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email")
    
    return {
        "message" : "Agency login successfuly"
    }