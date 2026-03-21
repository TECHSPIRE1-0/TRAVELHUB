from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from fastapi import HTTPException
from datetime import date, timedelta
from app.models.booking_model import Booking
from app.models.travel_package import TravelPackage


CROWD_THRESHOLDS = {
    "Low":          (0,   30),
    "Moderate":     (31,  60),
    "High":         (61,  85),
    "Very Crowded": (86,  200),   # 200 as an open upper bound
}

CROWD_EMOJIS = {
    "Low":          "🟢",
    "Moderate":     "🟡",
    "High":         "🟠",
    "Very Crowded": "🔴",
}

CROWD_LABELS = {
    "Low":          "Great time to visit — very few bookings so far!",
    "Moderate":     "Decent crowd expected, but still comfortable.",
    "High":         "This package is popular right now — book early!",
    "Very Crowded": "Almost fully booked for this period!",
}

CROWD_RECOMMENDATIONS = {
    "Low":          "Go ahead and book — you'll have a relaxed experience.",
    "Moderate":     "Book soon to secure your spot before it fills up.",
    "High":         "We recommend booking immediately or considering alternative dates.",
    "Very Crowded": "This slot is nearly full. Check alternative dates below.",
}

# Window (in days) around the requested departure_date to count bookings
DATE_WINDOW_DAYS = 15



def _classify_crowd(occupancy_pct: float) -> str:
    for level, (low, high) in CROWD_THRESHOLDS.items():
        if low <= occupancy_pct <= high:
            return level
    return "Very Crowded"


def _booked_people_in_window(
    package_id: int,
    departure_date: date,
    db: Session,
    window_days: int = DATE_WINDOW_DAYS,
) -> int:
    """Count total adults + children booked for a package within ±window_days of departure_date."""
    start = departure_date - timedelta(days=window_days)
    end   = departure_date + timedelta(days=window_days)

    result = db.query(
        func.coalesce(func.sum(Booking.adults + Booking.children), 0)
    ).filter(
        and_(
            Booking.package_id == package_id,
            Booking.departure_date >= start,
            Booking.departure_date <= end,
            Booking.status != "cancelled",
        )
    ).scalar()

    return int(result)


def _find_quieter_dates(
    package_id: int,
    departure_date: date,
    max_people: int,
    db: Session,
    num_suggestions: int = 3,
) -> list[date]:
    """
    Look ±60 days around the requested date and return up to `num_suggestions`
    dates where occupancy is lower than the requested date's occupancy.
    """
    base_booked = _booked_people_in_window(package_id, departure_date, db)
    base_pct    = (base_booked / max_people * 100) if max_people else 0

    candidates: list[tuple[float, date]] = []

    for offset in range(7, 61, 7):           # Weekly intervals, ±60 days
        for sign in [1, -1]:
            candidate_date = departure_date + timedelta(days=offset * sign)
            booked = _booked_people_in_window(package_id, candidate_date, db)
            pct    = (booked / max_people * 100) if max_people else 0

            if pct < base_pct:
                candidates.append((pct, candidate_date))

    # Return the least-crowded suggestions
    candidates.sort(key=lambda x: x[0])
    return [d for _, d in candidates[:num_suggestions]]



def get_crowd_level_for_package(
    package_id: int,
    departure_date: date,
    db: Session,
) -> dict:
    """
    Return crowd level info for a specific package + departure date.
    Called before/during booking so the user can make an informed choice.
    """
    package = db.query(TravelPackage).filter(TravelPackage.id == package_id).first()

    if not package:
        raise HTTPException(status_code=404, detail="Package not found")

    max_people = package.max_people or 1   # Avoid division by zero

    booked = _booked_people_in_window(package_id, departure_date, db)
    pct    = round(min((booked / max_people) * 100, 100), 1)
    level  = _classify_crowd(pct)

    alternative_dates: list[date] = []
    if level in ("High", "Very Crowded"):
        alternative_dates = _find_quieter_dates(package_id, departure_date, max_people, db)

    return {
        "package_id":            package_id,
        "destination":           package.destination,
        "package_title":         package.title,
        "departure_date":        departure_date,
        "max_people":            package.max_people,
        "booked_people":         booked,
        "occupancy_percentage":  pct,
        "crowd_level":           level,
        "crowd_label":           CROWD_LABELS[level],
        "crowd_emoji":           CROWD_EMOJIS[level],
        "recommendation":        CROWD_RECOMMENDATIONS[level],
        "alternative_dates":     alternative_dates or None,
    }


def get_crowd_level_for_destination(
    destination: str,
    db: Session,
) -> dict:
    """
    Aggregate crowd level across all packages for a destination.
    Useful for destination overview / search results pages.
    """
    packages = db.query(TravelPackage).filter(
        TravelPackage.destination.ilike(f"%{destination}%")
    ).all()

    if not packages:
        raise HTTPException(
            status_code=404,
            detail=f"No packages found for destination: {destination}"
        )

    today = date.today()
    occupancies: list[float] = []

    for pkg in packages:
        max_p = pkg.max_people or 1
        booked = _booked_people_in_window(pkg.id, today, db)
        pct    = round(min((booked / max_p) * 100, 100), 1)
        occupancies.append(pct)

    avg_pct = round(sum(occupancies) / len(occupancies), 1)
    level   = _classify_crowd(avg_pct)

    # Check if there's a quieter window in the next 4 weeks
    best_time_window = None
    weekly_averages: list[tuple[float, str]] = []

    for week_offset in range(4):
        window_date = today + timedelta(weeks=week_offset)
        week_occupancies: list[float] = []

        for pkg in packages:
            max_p  = pkg.max_people or 1
            booked = _booked_people_in_window(pkg.id, window_date, db)
            pct    = round(min((booked / max_p) * 100, 100), 1)
            week_occupancies.append(pct)

        week_avg = round(sum(week_occupancies) / len(week_occupancies), 1)
        label    = f"Week of {window_date.strftime('%b %d')}"
        weekly_averages.append((week_avg, label))

    quietest = min(weekly_averages, key=lambda x: x[0])
    if quietest[0] < avg_pct:
        best_time_window = f"{quietest[1]} looks quieter ({quietest[0]}% booked)"

    return {
        "destination":              destination,
        "total_packages":           len(packages),
        "avg_occupancy_percentage": avg_pct,
        "crowd_level":              level,
        "crowd_label":              CROWD_LABELS[level],
        "crowd_emoji":              CROWD_EMOJIS[level],
        "best_time_window":         best_time_window,
    }