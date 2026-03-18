from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.utils.hashing import hash_password, verify_password
from app.models.user_model import User
from app.utils.jwt_handler import create_access_token
from app.utils.dependencies import get_current_user


def register_user(data, db : Session):
    
    user = User(
        username = data.username,
        email = data.email,
        phone_number = data.phone_number,
        password = hash_password(data.password)
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    
    
def login_user(data, db : Session, response):
    
    user = db.query(User).filter(User.username == data.username).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid username"
        )

    if not verify_password(data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="wrong password"
        )

    access_token = create_access_token(data={"user_id": user.id})
    
    response.set_cookie(key="access_token", value=access_token)

    return {
        "message" : "Login successfuly"
    }
    
    
