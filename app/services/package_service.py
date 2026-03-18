from sqlalchemy.orm import Session

from app.models.package_type import PackageType
from app.models.travel_package import TravelPackage
from app.models.transport_option import TransportOption
from app.models.package_itinerary import PackageItinerary
from app.models.package_image import PackageImage
from app.models.package_pricing import PackagePricing


def create_full_package(data, agency_id, db: Session):

    # 1️⃣ Package Type
    package_type = db.query(PackageType).filter(
        PackageType.type_name == data.package_type.type_name
    ).first()

    if not package_type:
        package_type = PackageType(
            type_name=data.package_type.type_name,
            description=data.package_type.description
        )
        db.add(package_type)
        db.flush()

    # 2️⃣ Travel Package
    travel_package = TravelPackage(
        agency_id=agency_id,
        package_type_id=package_type.id,
        **data.package.dict()
    )

    db.add(travel_package)
    db.flush()

    # 3️⃣ Transport Options
    transport_objects = []

    for transport in data.transport_options:

        obj = TransportOption(
            package_id=travel_package.id,
            **transport.dict()
        )

        db.add(obj)
        db.flush()

        transport_objects.append(obj)

    # 4️⃣ Itinerary
    for day in data.itinerary:

        db.add(
            PackageItinerary(
                package_id=travel_package.id,
                **day.dict()
            )
        )

    # 5️⃣ Images
    for img in data.images:

        db.add(
            PackageImage(
                package_id=travel_package.id,
                image_url=img
            )
        )

    # 6️⃣ Pricing
    for price in data.pricing:

        transport = transport_objects[price.transport_index]

        db.add(
            PackagePricing(
                package_id=travel_package.id,
                transport_id=transport.id,
                price=price.price
            )
        )

    db.commit()

    return travel_package.id