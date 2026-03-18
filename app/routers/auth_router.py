from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.schema.user_schema import UserRegister, UserLogin
from app.services.auth_service import register_user, login_user

router = APIRouter(prefix="/auth", tags=["User"])


@router.post("/register")
def register(data: UserRegister, db: Session = Depends(get_db)):

    user = register_user(data, db)

    return {
        "message": "User registered successfully"
   
    }


@router.post("/login")
def login(data: UserLogin, response : Response, db: Session = Depends(get_db)):

    user = login_user(data, db, response)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "message": "Login successful"
 
    }