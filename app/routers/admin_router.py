from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.schema.admin_schema import AdminRegister, AdminLogin
from app.services.admin_service import register_admin, login_admin

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.post("/register")
def admin_register(data: AdminRegister, db: Session = Depends(get_db)):
    admin = register_admin(data, db)
    return {"message": f"Admin '{admin.username}' registered successfully."}


@router.post("/login")
def admin_login(
    data: AdminLogin,
    response: Response,
    db: Session = Depends(get_db)
):
    return login_admin(data, db, response)