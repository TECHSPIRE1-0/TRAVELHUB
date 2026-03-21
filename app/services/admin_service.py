from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.admin_model import Admin
from app.utils.hashing import hash_password, verify_password
from app.utils.jwt_handler import create_access_token


def register_admin(data, db: Session):

    existing = db.query(Admin).filter(
        (Admin.email == data.email) | (Admin.username == data.username)
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Admin with this email or username already exists."
        )

    admin = Admin(
        username = data.username,
        email    = data.email,
        password = hash_password(data.password)
    )

    db.add(admin)
    db.commit()
    db.refresh(admin)

    return admin


def login_admin(data, db: Session, response):

    admin = db.query(Admin).filter(
        Admin.username == data.username
    ).first()

    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found."
        )

    if not verify_password(data.password, admin.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Wrong password."
        )

    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin account is deactivated."
        )

    token = create_access_token(data={"admin_id": admin.id})
    response.set_cookie(key="admin_token", value=token)

    return {"message": "Admin login successful"}