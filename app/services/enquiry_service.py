from sqlalchemy.orm import Session
from app.models.enquiry import Enquiry
from app.models.travel_package import TravelPackage


def create_enquiry(data, user_id: int, db: Session):

    # 🔥 Get package
    package = db.query(TravelPackage).filter(
        TravelPackage.id == data.package_id
    ).first()

    if not package:
        raise Exception("Package not found")

    # 🔥 Get agency_id automatically
    agency_id = package.agency_id

    enquiry = Enquiry(
        user_id=user_id,
        agency_id=agency_id,
        package_id=data.package_id,
        name=data.name,
        email=data.email,
        phone=data.phone,
        destination=data.destination,
        travel_date=data.travel_date,
        travellers=data.travellers,
        message=data.message
    )

    db.add(enquiry)
    db.commit()
    db.refresh(enquiry)

    return enquiry


def get_agency_enquiries(agency_id: int, db: Session):

    enquiries = db.query(Enquiry).filter(
        Enquiry.agency_id == agency_id
    ).all()

    return enquiries