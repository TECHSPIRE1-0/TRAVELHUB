from fastapi import FastAPI
from app.database import Base, engine
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth_router, agency_router, package_router, enquiry_router, booking_router, user_router, agency_dashboard_router, search_router, payment_router, ai_search_router, dna_router,trip_room_router,social_proof_router

Base.metadata.create_all(bind=engine)


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router, prefix="/auth")
app.include_router(agency_router.router, prefix="/auth")
app.include_router(package_router.router)
app.include_router(enquiry_router.router)
app.include_router(booking_router.router)
app.include_router(user_router.router)
app.include_router(agency_dashboard_router.router)
app.include_router(search_router.router)
# app.include_router(payment_router.router)
app.include_router(ai_search_router.router)
app.include_router(dna_router.router)
app.include_router(trip_room_router.router)
app.include_router(social_proof_router.router)

# app.include_router(webhook_router.router)



"""next i implement the review like rating , when a user send enquiry to the agency send the mail as the agency register mail."""

"""Next i implement the innovation and AI recomendation."""