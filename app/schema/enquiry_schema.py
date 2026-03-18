from pydantic import BaseModel


class EnquiryCreate(BaseModel):

    package_id: int

    name: str

    email: str

    phone: str

    destination: str

    travel_date: str

    travellers: int

    message: str