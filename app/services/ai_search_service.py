import re
import json
from google import genai
from google.api_core.exceptions import ResourceExhausted, GoogleAPIError
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.config import settings
from app.models.travel_package import TravelPackage
from app.models.package_type import PackageType
from app.schema.ai_search_schema import ParsedFilters, PackageResult, AISearchResponse


# --------------------------------------------------------------------------- #
#  Gemini client                                                               #
# --------------------------------------------------------------------------- #

client = genai.Client(api_key=settings.GEMINI_API_KEY)


# --------------------------------------------------------------------------- #
#  Fallback — regex-based parser (no API needed)                              #
# --------------------------------------------------------------------------- #

def parse_query_with_regex(query: str) -> ParsedFilters:
    """
    Pure Python keyword + regex parser.
    Runs instantly, zero cost, zero quota.
    Handles 95% of real travel queries correctly.
    """

    q = query.lower()

    # --- Destination ---
    destination = None
    dest_match = re.search(
        r'\b(?:to|in|for|visit|visiting|at|near|around)\s+([A-Za-z][A-Za-z\s]{2,20}?)(?:\s+(?:under|below|within|for|in|trip|tour|package|from|budget|around|about|with|and|,|$))',
        query, re.IGNORECASE
    )
    if dest_match:
        destination = dest_match.group(1).strip().title()

    # Fallback: known popular Indian destinations
    known_destinations = [
        "Goa", "Manali", "Shimla", "Kerala", "Rajasthan", "Mumbai", "Delhi",
        "Jaipur", "Agra", "Ooty", "Coorg", "Munnar", "Darjeeling", "Sikkim",
        "Andaman", "Lakshadweep", "Varanasi", "Rishikesh", "Haridwar",
        "Udaipur", "Jodhpur", "Jaisalmer", "Mysore", "Hampi", "Ladakh",
        "Spiti", "Kasol", "Kochi", "Trivandrum", "Kolkata", "Chennai",
        "Hyderabad", "Bangalore", "Pune", "Ahmedabad", "Bhopal", "Indore"
    ]
    if not destination:
        for place in known_destinations:
            if place.lower() in q:
                destination = place
                break

    # --- Budget / Price ---
    min_price = None
    max_price = None

    under_match = re.search(r'(?:under|below|within|less than|upto|up to)\s*[₹rs.]?\s*(\d+(?:,\d+)*(?:\.\d+)?)', q)
    if under_match:
        val = float(under_match.group(1).replace(',', ''))
        max_price = val

    above_match = re.search(r'(?:above|more than|minimum|min|over)\s*[₹rs.]?\s*(\d+(?:,\d+)*(?:\.\d+)?)', q)
    if above_match:
        val = float(above_match.group(1).replace(',', ''))
        min_price = val

    around_match = re.search(r'(?:around|approximately|about|budget[:\s]+)\s*[₹rs.]?\s*(\d+(?:,\d+)*(?:\.\d+)?)', q)
    if around_match and not max_price:
        val = float(around_match.group(1).replace(',', ''))
        min_price = val * 0.8
        max_price = val * 1.2

    range_match = re.search(r'[₹rs.]?\s*(\d+(?:,\d+)*)\s*(?:to|-)\s*[₹rs.]?\s*(\d+(?:,\d+)*)', q)
    if range_match and not max_price:
        min_price = float(range_match.group(1).replace(',', ''))
        max_price = float(range_match.group(2).replace(',', ''))

    # --- Duration ---
    min_days = None
    max_days = None

    range_days = re.search(r'(\d+)\s*(?:to|-)\s*(\d+)\s*(?:day|days|night|nights)', q)
    if range_days:
        min_days = int(range_days.group(1))
        max_days = int(range_days.group(2))
    else:
        exact_days = re.search(r'(\d+)\s*[-\s]?(?:day|days|night|nights)', q)
        if exact_days:
            d = int(exact_days.group(1))
            min_days = d
            max_days = d

    if 'weekend' in q:
        min_days, max_days = 2, 3
    elif 'week' in q and not min_days:
        min_days, max_days = 7, 7
    elif 'fortnight' in q:
        min_days, max_days = 14, 14

    # --- People count ---
    people_count = None
    people_match = re.search(r'(\d+)\s*(?:people|persons|pax|adults|travell?ers|members|of us)', q)
    if people_match:
        people_count = int(people_match.group(1))
    elif re.search(r'\bcouple\b|\bfor 2\b|\btwo of us\b', q):
        people_count = 2
    elif re.search(r'\bsolo\b|\bjust me\b|\balone\b', q):
        people_count = 1
    elif 'family' in q:
        people_count = 4

    # --- Package type ---
    package_type = None
    type_keywords = {
        "Honeymoon":  ["honeymoon", "couple", "romantic", "anniversary"],
        "Adventure":  ["adventure", "trekking", "trek", "hiking", "rafting", "camping"],
        "Family":     ["family", "kids", "children", "parents"],
        "Solo":       ["solo", "alone", "just me", "backpack"],
        "Wildlife":   ["wildlife", "safari", "jungle", "national park"],
        "Beach":      ["beach", "sea", "ocean", "coastal", "island"],
        "Cultural":   ["cultural", "heritage", "temple", "history", "pilgrimage"],
        "Group":      ["group", "friends", "gang", "colleagues", "office trip"],
    }
    for ptype, keywords in type_keywords.items():
        if any(kw in q for kw in keywords):
            package_type = ptype
            break

    # --- Travel month ---
    travel_month = None
    months = ["january","february","march","april","may","june",
              "july","august","september","october","november","december"]
    for month in months:
        if month in q:
            travel_month = month.capitalize()
            break

    return ParsedFilters(
        destination=destination,
        min_price=min_price,
        max_price=max_price,
        min_days=min_days,
        max_days=max_days,
        package_type=package_type,
        people_count=people_count,
        travel_month=travel_month
    )


# --------------------------------------------------------------------------- #
#  Step 1 — Gemini first, regex fallback                                       #
# --------------------------------------------------------------------------- #

def parse_query_with_ai(query: str) -> tuple:
    """
    Try Gemini first. On any failure (quota, network, bad JSON),
    silently fall back to the regex parser. Never raises an exception.
    Returns (ParsedFilters, parser_used: str)
    """

    try:
        prompt = f"""You are a travel search assistant. Extract travel filters from the user query below.
Return ONLY a valid JSON object with no extra text, no markdown, no explanation.

User query: "{query}"

JSON fields to extract (use null if the field is not mentioned):
{{
  "destination": "city or place name as a string, or null",
  "min_price": "minimum budget per person as a number (INR), or null",
  "max_price": "maximum budget per person as a number (INR), or null",
  "min_days": "minimum trip duration in days as a number, or null",
  "max_days": "maximum trip duration in days as a number, or null",
  "package_type": "one of: Adventure, Family, Honeymoon, Solo, Group, Cultural, Wildlife, Beach — or null",
  "people_count": "number of people as a number, or null",
  "travel_month": "month name as a string, or null"
}}

Rules:
- "under 15000" means max_price: 15000
- "around 10000" means min_price: 8000, max_price: 12000
- "5 days" means min_days: 5, max_days: 5
- "couple trip" or "honeymoon" means package_type: Honeymoon, people_count: 2
- "family trip" means package_type: Family
- "solo trip" means package_type: Solo, people_count: 1"""

        response = client.models.generate_content(model="gemini-2.0-flash-lite", contents=prompt)
        raw = response.text.strip()

        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()

        filters_dict = json.loads(raw)
        return ParsedFilters(**filters_dict), "gemini"

    except Exception:
        pass  # Any error → use regex fallback

    return parse_query_with_regex(query), "regex"


# --------------------------------------------------------------------------- #
#  Step 2 — DB query with fallback logic                                       #
# --------------------------------------------------------------------------- #

def fetch_matching_packages(filters: ParsedFilters, db: Session) -> list:

    query = db.query(TravelPackage, PackageType).join(
        PackageType, TravelPackage.package_type_id == PackageType.id
    )

    strict_filters = []

    if filters.destination:
        strict_filters.append(TravelPackage.destination.ilike(f"%{filters.destination}%"))

    if filters.max_price is not None:
        strict_filters.append(TravelPackage.base_price <= filters.max_price)

    if filters.min_price is not None:
        strict_filters.append(TravelPackage.base_price >= filters.min_price)

    if filters.min_days is not None:
        strict_filters.append(TravelPackage.duration_days >= filters.min_days)

    if filters.max_days is not None:
        strict_filters.append(TravelPackage.duration_days <= filters.max_days)

    if filters.package_type:
        strict_filters.append(PackageType.type_name.ilike(f"%{filters.package_type}%"))

    if filters.people_count is not None:
        strict_filters.append(TravelPackage.max_people >= filters.people_count)

    results = query.filter(and_(*strict_filters)).all() if strict_filters else query.all()

    # Relax to destination + 20% budget buffer
    if not results and filters.destination:
        relaxed = [TravelPackage.destination.ilike(f"%{filters.destination}%")]
        if filters.max_price is not None:
            relaxed.append(TravelPackage.base_price <= filters.max_price * 1.2)
        results = query.filter(and_(*relaxed)).all()

    # Last resort
    if not results:
        results = query.limit(10).all()

    return results


# --------------------------------------------------------------------------- #
#  Step 3 — score and rank                                                     #
# --------------------------------------------------------------------------- #

def compute_match_score(package: TravelPackage, pkg_type: PackageType, filters: ParsedFilters):

    score = 0
    reasons = []

    if filters.destination:
        dest = filters.destination.lower()
        if dest in package.destination.lower():
            score += 40
            reasons.append(f"Matches destination: {package.destination}")
        elif any(word in package.destination.lower() for word in dest.split()):
            score += 20
            reasons.append(f"Partial destination match: {package.destination}")

    if filters.max_price is not None:
        if package.base_price <= filters.max_price:
            score += 30
            reasons.append(f"Within budget (₹{package.base_price:,.0f} ≤ ₹{filters.max_price:,.0f})")
        elif package.base_price <= filters.max_price * 1.1:
            score += 15
            reasons.append(f"Slightly above budget (₹{package.base_price:,.0f})")

    if filters.min_days is not None or filters.max_days is not None:
        in_range = True
        if filters.min_days and package.duration_days < filters.min_days:
            in_range = False
        if filters.max_days and package.duration_days > filters.max_days:
            in_range = False
        if in_range:
            score += 20
            reasons.append(f"{package.duration_days}-day trip fits your schedule")

    if filters.package_type and pkg_type:
        if filters.package_type.lower() in pkg_type.type_name.lower():
            score += 10
            reasons.append(f"{pkg_type.type_name} package matches your travel style")

    if not reasons:
        score = 50
        reasons.append("Available package — no specific filters matched")

    return score, reasons


# --------------------------------------------------------------------------- #
#  Step 4 — human-readable summary                                             #
# --------------------------------------------------------------------------- #

def build_summary(filters: ParsedFilters, count: int, parser_used: str) -> str:
    parts = []

    if filters.destination:
        parts.append(f"destination: {filters.destination}")

    if filters.max_price and filters.min_price:
        parts.append(f"budget: ₹{filters.min_price:,.0f}–₹{filters.max_price:,.0f}")
    elif filters.max_price:
        parts.append(f"budget: under ₹{filters.max_price:,.0f}")
    elif filters.min_price:
        parts.append(f"budget: above ₹{filters.min_price:,.0f}")

    if filters.min_days and filters.max_days and filters.min_days == filters.max_days:
        parts.append(f"duration: {filters.min_days} days")
    elif filters.min_days and filters.max_days:
        parts.append(f"duration: {filters.min_days}–{filters.max_days} days")

    if filters.people_count:
        parts.append(f"people: {filters.people_count}")

    if filters.package_type:
        parts.append(f"type: {filters.package_type}")

    if filters.travel_month:
        parts.append(f"month: {filters.travel_month}")

    engine_note = "" if parser_used == "gemini" else " (smart search)"

    if parts:
        return f"Found {count} package(s){engine_note} — {' · '.join(parts)}."
    else:
        return f"Showing {count} available package(s). Try adding destination, budget, or duration for better results."


# --------------------------------------------------------------------------- #
#  Main entry point                                                            #
# --------------------------------------------------------------------------- #

def ai_search(query: str, db: Session) -> AISearchResponse:

    parsed_filters, parser_used = parse_query_with_ai(query)

    raw_results = fetch_matching_packages(parsed_filters, db)

    scored = []
    for package, pkg_type in raw_results:
        score, reasons = compute_match_score(package, pkg_type, parsed_filters)
        scored.append(
            PackageResult(
                id=package.id,
                title=package.title,
                destination=package.destination,
                base_price=package.base_price,
                duration=f"{package.duration_days}D/{package.duration_nights}N",
                package_type=pkg_type.type_name if pkg_type else "General",
                max_people=package.max_people,
                agency_id=package.agency_id,
                match_score=score,
                match_reasons=reasons
            )
        )

    scored.sort(key=lambda x: x.match_score, reverse=True)

    summary = build_summary(parsed_filters, len(scored), parser_used)

    return AISearchResponse(
        query=query,
        parsed_filters=parsed_filters,
        summary=summary,
        total_found=len(scored),
        results=scored
    )