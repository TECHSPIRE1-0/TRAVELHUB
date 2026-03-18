from sqlalchemy import Column, Integer, String, ForeignKey, Float
from app.database import Base


class Agency(Base):

    __tablename__ = "agencies"

    id = Column(Integer, primary_key=True, index=True)

    agency_name = Column(String, nullable=False)

    contact_person = Column(String, nullable=False)

    designation = Column(String)

    business_email = Column(String, unique=True, nullable=False)

    phone_number = Column(String)

    business_location = Column(String)

    gst_number = Column(String)

    password = Column(String)
    
    
    

    
# """ackage Type Table

# Stores category of travel packages.

# Examples:

# Adventure

# Family

# Honeymoon

# Solo"""


# class PackageType(Base):

#     __tablename__ = "package_types"

#     id = Column(Integer, primary_key=True, index=True)

#     type_name = Column(String, unique=True)

#     description = Column(String)
    
    
    
# """Travel Packages Table

# This is the main table where agencies create packages."""

# class TravelPackage(Base):

#     __tablename__ = "travel_packages"

#     id = Column(Integer, primary_key=True, index=True)

#     agency_id = Column(Integer, ForeignKey("agencies.id"))

#     package_type_id = Column(Integer, ForeignKey("package_types.id"))

#     title = Column(String)

#     description = Column(String)

#     destination = Column(String)

#     start_location = Column(String)

#     duration_days = Column(Integer)

#     duration_nights = Column(Integer)

#     base_price = Column(Float)

#     max_people = Column(Integer)
    
    
    
# """Transport Options Table

# Allows different vehicles for the same package.

# Examples:

# Bike

# Car

# Traveller"""

# class TransportOption(Base):

#     __tablename__ = "transport_options"

#     id = Column(Integer, primary_key=True, index=True)

#     package_id = Column(Integer, ForeignKey("travel_packages.id"))

#     vehicle_type = Column(String)

#     vehicle_name = Column(String)

#     seat_capacity = Column(Integer)

#     price_per_day = Column(Float)
    

# """Package Itinerary Table

# Stores day-wise travel plan."""

# class PackageItinerary(Base):

#     __tablename__ = "package_itinerary"

#     id = Column(Integer, primary_key=True, index=True)

#     package_id = Column(Integer, ForeignKey("travel_packages.id"))

#     day_number = Column(Integer)

#     title = Column(String)

#     description = Column(String)
    
    
# """Package Images Table

# Stores images for travel packages."""

# class PackageImage(Base):

#     __tablename__ = "package_images"

#     id = Column(Integer, primary_key=True, index=True)

#     package_id = Column(Integer, ForeignKey("travel_packages.id"))

#     image_url = Column(String)
    
    
# """Package Pricing Table

# Different pricing based on transport."""

# class PackagePricing(Base):

#     __tablename__ = "package_pricing"

#     id = Column(Integer, primary_key=True, index=True)

#     package_id = Column(Integer, ForeignKey("travel_packages.id"))

#     transport_id = Column(Integer, ForeignKey("transport_options.id"))

#     price = Column(Float)
    
    
    
# """Booking Table

# Stores bookings by users."""

# # class Booking(Base):

# #     __tablename__ = "bookings"

# #     id = Column(Integer, primary_key=True, index=True)

# #     user_id = Column(Integer, ForeignKey("users.id"))

# #     package_id = Column(Integer, ForeignKey("travel_packages.id"))

# #     transport_id = Column(Integer, ForeignKey("transport_options.id"))

# #     people_count = Column(Integer)

# #     total_price = Column(Float)

# #     status = Column(String)   # pending / confirmed / cancelled



# """tommorow i will separate each table schema in different file and then create the table using alembic

# app
# │
# ├── database.py
# │
# ├── models
# │   │
# │   ├── __init__.py
# │   ├── user.py
# │   ├── agency.py
# │   ├── package_type.py
# │   ├── travel_package.py
# │   ├── transport_option.py
# │   ├── package_itinerary.py
# │   ├── package_image.py
# │   ├── package_pricing.py
# │   └── booking.py"""