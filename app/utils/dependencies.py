from fastapi import Depends, HTTPException, Request, Cookie
from sqlalchemy.orm import Session
from jose import jwt
from app.database import get_db
from app.models.user_model import User
from app.utils.jwt_handler import SECRET_KEY, ALGORITHM
from app.models.agency_model import Agency

def get_current_user(request : Request, db : Session = Depends(get_db)):
    
    token = request.cookies.get("access_token")
    
    payload = jwt.decode(token, SECRET_KEY, algorithms=ALGORITHM)
    
    user_id = payload.get("user_id")
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid Credential")
    
    return user




def get_current_agency(request : Request, db: Session = Depends(get_db)):
    
    token = request.cookies.get("agency_token")

    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

    agency_id = payload.get("agency_id")

    agency = db.query(Agency).filter(Agency.id == agency_id).first()

    if not agency:
        raise HTTPException(status_code=401, detail="Invalid agency")

    return agency