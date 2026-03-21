from pydantic import BaseModel, EmailStr


class AdminRegister(BaseModel):
    username: str
    email:    EmailStr
    password: str


class AdminLogin(BaseModel):
    username: str
    password: str