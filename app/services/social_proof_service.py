import hashlib
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.travel_package import TravelPackage
from app.models.booking_model import Booking
from app.models.social_proof_package_model import PackageView
from app.schema.social_proof_schema import SocialProofResponse


# --------------------------------------------------------------------------- #
#  Helpers                                                                      #
# --------------------------------------------------------------------------- #

def _hash_ip(ip: str) -> str:
    """Anonymise IP — store MD5 hash only, never raw IP."""
    return hashlib.md5(ip.encode()).hexdigest()


def _time_ago(dt: datetime) -> str:
    """Convert a datetime to a human-readable 'X ago' string."""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    now  = datetime.now(timezone.utc)
    diff = now - dt
    secs = int(diff.total_seconds())

    if secs < 60:
        return "just now"
    elif secs < 3600:
        mins = secs // 60
        return f"{mins} minute{'s' if mins > 1 else ''} ago"
    elif secs < 86400:
        hrs = secs // 3600
        return f"{hrs} hour{'s' if hrs > 1 else ''} ago"
    else:
        days = secs // 86400
        return f"{days} day{'s' if days > 1 else ''} ago"


# --------------------------------------------------------------------------- #
#  Record a view                                                                #
# --------------------------------------------------------------------------- #

def record_view(package_id: int, client_ip: str, db: Session):
    """
    Called every time a user opens a package detail page.
    Stores anonymised IP hash + timestamp.
    """
    pkg = db.query(TravelPackage).filter(TravelPackage.id == package_id).first()
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found")

    db.add(PackageView(
        package_id = package_id,
        ip_hash    = _hash_ip(client_ip)
    ))
    db.commit()
    return {"recorded": True}


# --------------------------------------------------------------------------- #
#  Compute social proof signals                                                 #
# --------------------------------------------------------------------------- #

def get_social_proof(
    package_id:     int,
    db:             Session,
    departure_date: str = None   # optional: "YYYY-MM-DD" to scope seats to one trip
) -> SocialProofResponse:
    """
    Computes social proof signals from real DB data.

    seats_left logic:
      - max_people is package capacity (e.g. 15 per trip)
      - If departure_date provided: count people booked for THAT specific date only
      - If no departure_date: count people booked for the NEAREST upcoming trip
        (most relevant for urgency — shows how full the next trip is)
      - This avoids incorrectly summing bookings across multiple trip dates
    """

    pkg = db.query(TravelPackage).filter(TravelPackage.id == package_id).first()
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found")

    now = datetime.now(timezone.utc)

    # --- Signal 1: viewers right now (last 10 minutes) ---
    ten_min_ago = now - timedelta(minutes=10)
    viewers_now = db.query(func.count(PackageView.id)).filter(
        PackageView.package_id == package_id,
        PackageView.viewed_at  >= ten_min_ago
    ).scalar() or 0

    # --- Signal 2: views today (last 24 hours) ---
    yesterday = now - timedelta(hours=24)
    views_today = db.query(func.count(PackageView.id)).filter(
        PackageView.package_id == package_id,
        PackageView.viewed_at  >= yesterday
    ).scalar() or 0

    # --- Signal 3: total upcoming bookings (demand signal, across all dates) ---
    bookings_week = db.query(func.count(Booking.id)).filter(
        Booking.package_id == package_id,
        Booking.status.in_(["pending", "confirmed"]),
        Booking.departure_date >= now
    ).scalar() or 0

    # --- Signal 4: seats left — scoped to one departure date ---
    # Determine which departure date to use for seat calculation
    if departure_date:
        # User is viewing a specific trip date — show that trip's seats
        from datetime import date
        try:
            dep = datetime.strptime(departure_date, "%Y-%m-%d")
            dep_start = dep.replace(hour=0,  minute=0,  second=0,  tzinfo=timezone.utc)
            dep_end   = dep.replace(hour=23, minute=59, second=59, tzinfo=timezone.utc)
        except ValueError:
            dep_start = dep_end = None
    else:
        # No date given — use the nearest upcoming departure as the reference trip
        nearest = db.query(Booking.departure_date).filter(
            Booking.package_id == package_id,
            Booking.status.in_(["pending", "confirmed"]),
            Booking.departure_date >= now
        ).order_by(Booking.departure_date.asc()).first()

        if nearest:
            nd = nearest[0]
            if nd.tzinfo is None:
                nd = nd.replace(tzinfo=timezone.utc)
            dep_start = nd.replace(hour=0,  minute=0,  second=0)
            dep_end   = nd.replace(hour=23, minute=59, second=59)
        else:
            dep_start = dep_end = None

    # Count people booked on that specific date
    if dep_start and dep_end:
        people_on_date = db.query(
            func.sum(Booking.adults + Booking.children)
        ).filter(
            Booking.package_id     == package_id,
            Booking.status.in_(["pending", "confirmed"]),
            Booking.departure_date >= dep_start,
            Booking.departure_date <= dep_end
        ).scalar() or 0
        seats_left = max(0, pkg.max_people - int(people_on_date))
    else:
        # No bookings exist yet — all seats available
        seats_left = pkg.max_people

    # --- Signal 5: last booked time (using departure_date as proxy) ---
    last_booking = db.query(Booking).filter(
        Booking.package_id == package_id,
        Booking.status.in_(["pending", "confirmed"])
    ).order_by(Booking.id.desc()).first()

    last_booked_ago: Optional[str] = None
    if last_booking:
        if last_booking.created_at:
            last_booked_ago = _time_ago(last_booking.created_at)
        else:
            last_booked_ago = "recently"

    # --------------------------------------------------------------------------
    #  Build urgency tags + level
    # --------------------------------------------------------------------------

    tags = []

    # Seats left tag
    if seats_left == 0:
        tags.append("Fully booked — join waitlist")
    elif seats_left <= 3:
        tags.append(f"Only {seats_left} seat{'s' if seats_left > 1 else ''} left!")
    elif seats_left <= 8:
        tags.append(f"{seats_left} seats remaining")

    # Last booked tag
    if last_booked_ago:
        tags.append(f"Last booked {last_booked_ago}")

    # Bookings this week tag
    if bookings_week >= 10:
        tags.append(f"{bookings_week} bookings this week — very popular!")
    elif bookings_week >= 5:
        tags.append(f"{bookings_week} people booked this week")
    elif bookings_week >= 1:
        tags.append(f"{bookings_week} booking{'s' if bookings_week > 1 else ''} this week")

    # Viewers now tag
    if viewers_now >= 10:
        tags.append(f"{viewers_now} people viewing right now!")
    elif viewers_now >= 3:
        tags.append(f"{viewers_now} people viewing this")

    # Views today tag
    if views_today >= 50:
        tags.append(f"Trending — {views_today} views today")
    elif views_today >= 20:
        tags.append(f"{views_today} people viewed today")

    # --------------------------------------------------------------------------
    #  Determine urgency level
    # --------------------------------------------------------------------------

    if seats_left == 0 or (seats_left <= 3 and bookings_week >= 3):
        urgency_level = "high"
        urgency_color = "red"
    elif seats_left <= 8 or bookings_week >= 5 or viewers_now >= 5:
        urgency_level = "medium"
        urgency_color = "orange"
    elif bookings_week >= 1 or views_today >= 10:
        urgency_level = "low"
        urgency_color = "green"
    else:
        urgency_level = "none"
        urgency_color = "gray"

    return SocialProofResponse(
        package_id      = pkg.id,
        title           = pkg.title,
        destination     = pkg.destination,
        viewers_now     = viewers_now,
        views_today     = views_today,
        bookings_week   = bookings_week,
        seats_left      = seats_left,
        last_booked_ago = last_booked_ago,
        urgency_level   = urgency_level,
        urgency_tags    = tags,
        urgency_color   = urgency_color,
    )