from pydantic import BaseModel


class AgencyRegister(BaseModel):

    agency_name: str
    contact_person: str
    designation: str
    business_email: str
    phone_number: str
    business_location: str
    gst_number: str | None = None
    password: str
    
    
class AgencyLogin(BaseModel):
    business_email : str
    password : str