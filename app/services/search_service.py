from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.travel_package import TravelPackage
from app.models.package_type import PackageType
from sqlalchemy import and_


# def search_packages(query: str, db: Session):

#     packages = db.query(TravelPackage).filter(
#         TravelPackage.title.ilike(f"%{query}%")
#     ).all()

#     result = []

#     for p in packages:
#         result.append({
#             "id": p.id,
#             "title": p.title,
#             "destination": p.destination,
#             "price": p.base_price,
#             "duration": f"{p.duration_days}D/{p.duration_nights}N"
#         })

#     return result

def search_by_filter(
    db: Session,
    destination: str = None,
    min_price: float = None,
    max_price: float = None,
    min_days: int = None,
    max_days: int = None,
    package_type: str = None
):

    query = db.query(TravelPackage)

    if package_type:
        query = query.join(PackageType)

    filters = []

    if destination:
        filters.append(TravelPackage.destination.ilike(f"%{destination}%"))

    if min_price is not None:
        filters.append(TravelPackage.base_price >= min_price)

    if max_price is not None:
        filters.append(TravelPackage.base_price <= max_price)

    if min_days is not None:
        filters.append(TravelPackage.duration_days >= min_days)

    if max_days is not None:
        filters.append(TravelPackage.duration_days <= max_days)

    if package_type:
        filters.append(PackageType.type_name.ilike(f"%{package_type}%"))

    if filters:
        query = query.filter(and_(*filters))

    packages = query.all()
    
    if not packages:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Package not found"
        )


    result = [
        {
            "id": p.id,
            "title": p.title,
            "destination": p.destination,
            "price": p.base_price,
            "base_price": p.base_price,
            "duration": f"{p.duration_days}D/{p.duration_nights}N"
        }
        for p in packages
    ]

    return result