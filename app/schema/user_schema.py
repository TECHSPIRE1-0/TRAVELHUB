from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):
    username : str
    email : EmailStr
    phone_number : str
    password : str
    
    
class UserLogin(BaseModel):
    username : str
    password : str