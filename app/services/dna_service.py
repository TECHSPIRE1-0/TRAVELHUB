import json
from google import genai
from google.api_core.exceptions import ResourceExhausted, GoogleAPIError
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.config import settings
from app.models.travel_package import TravelPackage
from app.models.package_type import PackageType
from app.schema.dna_schema import (
    DNAQuizRequest, DNAQuizResponse,
    PersonaDetail, MatchedPackage,
    BudgetStyle, ActivityLevel, TravelGroup, TravelVibe, TripDuration
)


client = genai.Client(api_key=settings.GEMINI_API_KEY)



PERSONAS = {
    "Adventure": {
        "name":           "The Bold Trailblazer",
        "emoji":          "🧗",
        "tagline":        "You live for the rush. The harder the trail, the bigger the thrill.",
        "traits":         ["Risk-taker", "Physically active", "Loves the unknown"],
        "best_for":       ["Manali", "Ladakh", "Rishikesh"],
        "ideal_duration": "5–8 days",
    },
    "Honeymoon": {
        "name":           "The Romantic Escapist",
        "emoji":          "💑",
        "tagline":        "Every trip is a love story waiting to be written.",
        "traits":         ["Hopeless romantic", "Detail-oriented", "Loves surprises"],
        "best_for":       ["Goa", "Udaipur", "Kerala"],
        "ideal_duration": "5–7 days",
    },
    "Family": {
        "name":           "The Family Fun Maker",
        "emoji":          "👨‍👩‍👧‍👦",
        "tagline":        "Every smile on their faces is worth a thousand miles.",
        "traits":         ["Nurturing", "Safety-conscious", "Planner"],
        "best_for":       ["Ooty", "Shimla", "Kerala"],
        "ideal_duration": "5–7 days",
    },
    "Solo": {
        "name":           "The Free Spirit Wanderer",
        "emoji":          "🎒",
        "tagline":        "No itinerary, no problem. The world is your backyard.",
        "traits":         ["Independent", "Adaptable", "Spontaneous"],
        "best_for":       ["Goa", "Kasol", "Hampi"],
        "ideal_duration": "3–5 days",
    },
    "Group": {
        "name":           "The Social Explorer",
        "emoji":          "🎉",
        "tagline":        "The more the merrier — every trip is a party.",
        "traits":         ["Outgoing", "Energetic", "Creates memories"],
        "best_for":       ["Goa", "Manali", "Coorg"],
        "ideal_duration": "4–6 days",
    },
    "Cultural": {
        "name":           "The Culture Seeker",
        "emoji":          "🏛️",
        "tagline":        "History, food, and art — you travel to understand the world.",
        "traits":         ["Curious", "Intellectual", "Appreciates heritage"],
        "best_for":       ["Rajasthan", "Varanasi", "Mysore"],
        "ideal_duration": "6–9 days",
    },
    "Beach": {
        "name":           "The Sun Chaser",
        "emoji":          "🏖️",
        "tagline":        "Salt in your hair, sand between your toes — life is good.",
        "traits":         ["Laid-back", "Social", "Loves sunsets"],
        "best_for":       ["Goa", "Andaman", "Kerala"],
        "ideal_duration": "4–6 days",
    },
    "Wildlife": {
        "name":           "The Wild Heart",
        "emoji":          "🦁",
        "tagline":        "Concrete jungles bore you. You belong where the wild things are.",
        "traits":         ["Nature lover", "Patient", "Eco-conscious"],
        "best_for":       ["Corbett", "Ranthambore", "Kaziranga"],
        "ideal_duration": "3–5 days",
    },
}



BUDGET_LABELS = {
    "backpacker": "Under ₹10,000 per person",
    "midrange":   "₹10,000 – ₹30,000 per person",
    "luxury":     "₹30,000+ per person",
}

BUDGET_LIMITS = {
    "backpacker": (0,     10000),
    "midrange":   (5000,  30000),
    "luxury":     (20000, 999999),
}

DURATION_DAYS = {
    "weekend": (2, 3),
    "short":   (3, 5),
    "week":    (6, 8),
    "long":    (9, 30),
}



def compute_type_scores(data: DNAQuizRequest) -> dict:
    """
    Each quiz answer contributes points to different package types.
    The type with the highest total score wins → becomes the persona.
    """

    scores = {
        "Adventure": 0,
        "Honeymoon": 0,
        "Family":    0,
        "Solo":      0,
        "Group":     0,
        "Cultural":  0,
        "Beach":     0,
        "Wildlife":  0,
    }

    if data.budget_style == BudgetStyle.backpacker:
        scores["Adventure"] += 10
        scores["Solo"]      += 8
        scores["Group"]     += 5

    elif data.budget_style == BudgetStyle.midrange:
        scores["Cultural"]  += 8
        scores["Family"]    += 8
        scores["Beach"]     += 6
        scores["Wildlife"]  += 6

    elif data.budget_style == BudgetStyle.luxury:
        scores["Honeymoon"] += 12
        scores["Beach"]     += 8
        scores["Family"]    += 6

    if data.activity_level == ActivityLevel.relaxed:
        scores["Beach"]     += 12
        scores["Cultural"]  += 8
        scores["Honeymoon"] += 8

    elif data.activity_level == ActivityLevel.moderate:
        scores["Cultural"]  += 10
        scores["Family"]    += 8
        scores["Wildlife"]  += 8

    elif data.activity_level == ActivityLevel.intense:
        scores["Adventure"] += 20
        scores["Wildlife"]  += 10
        scores["Group"]     += 6

    if data.travel_group == TravelGroup.solo:
        scores["Solo"]      += 20
        scores["Adventure"] += 8
        scores["Cultural"]  += 6

    elif data.travel_group == TravelGroup.couple:
        scores["Honeymoon"] += 20
        scores["Beach"]     += 8
        scores["Cultural"]  += 5

    elif data.travel_group == TravelGroup.family:
        scores["Family"]    += 25
        scores["Beach"]     += 5
        scores["Cultural"]  += 5

    elif data.travel_group == TravelGroup.friends:
        scores["Group"]     += 20
        scores["Adventure"] += 10
        scores["Beach"]     += 8

    # --- Vibe ---
    if data.vibe == TravelVibe.adventure:
        scores["Adventure"] += 25
        scores["Wildlife"]  += 8

    elif data.vibe == TravelVibe.culture:
        scores["Cultural"]  += 25
        scores["Solo"]      += 5

    elif data.vibe == TravelVibe.beach:
        scores["Beach"]     += 25
        scores["Honeymoon"] += 8

    elif data.vibe == TravelVibe.nature:
        scores["Wildlife"]  += 20
        scores["Adventure"] += 10

    elif data.vibe == TravelVibe.city:
        scores["Cultural"]  += 15
        scores["Group"]     += 8

    return scores



def _generate_persona_with_ai(top_type: str, data: DNAQuizRequest, scores: dict):
    budget_labels  = {"backpacker": "backpacker (under 10,000)", "midrange": "mid-range (10,000-30,000)", "luxury": "luxury (30,000+)"}
    activity_labels = {"relaxed": "relaxed (beaches, sightseeing)", "moderate": "moderate (hiking, city walks)", "intense": "intense (trekking, rafting, camping)"}
    group_labels   = {"solo": "solo traveler", "couple": "couple", "family": "family with kids", "friends": "group of friends"}
    vibe_labels    = {"adventure": "adventure and thrills", "culture": "culture and heritage", "beach": "beach and relaxation", "nature": "nature and wildlife", "city": "city exploration"}
    duration_labels = {"weekend": "weekend 2-3 days", "short": "short trip 3-5 days", "week": "a full week 6-8 days", "long": "long escape 9-14 days"}

    top3 = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:3]
    top3_str = ", ".join(f"{t}({s}pts)" for t, s in top3)

    prompt = (
        "You are a creative travel personality expert for an Indian travel platform.\n\n"
        "A user completed a travel DNA quiz with these answers:\n"
        f"- Budget style: {budget_labels[data.budget_style.value]}\n"
        f"- Activity level: {activity_labels[data.activity_level.value]}\n"
        f"- Travel group: {group_labels[data.travel_group.value]}\n"
        f"- Travel vibe: {vibe_labels[data.vibe.value]}\n"
        f"- Trip duration: {duration_labels[data.duration.value]}\n\n"
        f"Their top travel personality type is: {top_type}\n"
        f"Scoring breakdown: {top3_str}\n\n"
        "Create a unique, deeply personal travel persona for this specific combination.\n"
        "Return ONLY valid JSON with no markdown:\n\n"
        "{\n"
        '  "name": "Creative 3-5 word title starting with The, specific to their combination",\n'
        '  "tagline": "One punchy sentence max 12 words speaking directly to them using you voice",\n'
        '  "traits": ["trait 1 specific to their combo", "trait 2", "trait 3"],\n'
        '  "best_for": ["Indian destination matching their vibe and budget", "destination 2", "destination 3"],\n'
        '  "ideal_duration": "X-Y days matching their duration choice"\n'
        "}\n\n"
        "Important rules:\n"
        "- name must be creative and specific, not generic like The Adventurer\n"
        "- tagline must reference their specific combination of answers\n"
        "- destinations must match their budget: backpacker gets Kasol/Hampi, luxury gets Udaipur/Kerala resorts\n"
        f"- ideal_duration must match: {duration_labels[data.duration.value]}"
    )

    try:
        response = client.models.generate_content(model="gemini-2.0-flash-lite", contents=prompt)
        raw = response.text.strip()

        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()

        result = json.loads(raw)
        required = ["name", "tagline", "traits", "best_for", "ideal_duration"]
        if all(k in result for k in required):
            return result

    except Exception:
        pass

    return None


def resolve_persona(scores: dict, data: DNAQuizRequest) -> PersonaDetail:

    max_score = max(scores.values())
    tied_types = [t for t, s in scores.items() if s == max_score]

    # Tiebreaker 1: prefer the type that directly matches travel_group
    group_priority = {
        "solo":    "Solo",
        "couple":  "Honeymoon",
        "family":  "Family",
        "friends": "Group",
    }
    preferred = group_priority.get(data.travel_group.value)
    if preferred and preferred in tied_types:
        top_type = preferred
    # Tiebreaker 2: prefer the type that matches the vibe
    elif len(tied_types) > 1:
        vibe_priority = {
            "adventure": "Adventure",
            "culture":   "Cultural",
            "beach":     "Beach",
            "nature":    "Wildlife",
            "city":      "Cultural",
        }
        vibe_preferred = vibe_priority.get(data.vibe.value)
        top_type = vibe_preferred if vibe_preferred in tied_types else tied_types[0]
    else:
        top_type = tied_types[0]

    fallback = PERSONAS[top_type]

    # Try Gemini first for a personalised persona
    ai_result = _generate_persona_with_ai(top_type, data, scores)

    if ai_result:
        return PersonaDetail(
            name           = ai_result["name"],
            emoji          = fallback["emoji"],        # keep emoji from hardcoded
            tagline        = ai_result["tagline"],
            top_type       = top_type,
            budget_range   = BUDGET_LABELS[data.budget_style.value],
            ideal_duration = ai_result["ideal_duration"],
            traits         = ai_result["traits"],
            best_for       = ai_result["best_for"],
            ai_generated   = True,
        )

    # Gemini failed or quota exceeded — use hardcoded fallback
    return PersonaDetail(
        name           = fallback["name"],
        emoji          = fallback["emoji"],
        tagline        = fallback["tagline"],
        top_type       = top_type,
        budget_range   = BUDGET_LABELS[data.budget_style.value],
        ideal_duration = fallback["ideal_duration"],
        traits         = fallback["traits"],
        best_for       = fallback["best_for"],
        ai_generated   = False,
    )



def fetch_matched_packages(
    persona: PersonaDetail,
    data: DNAQuizRequest,
    scores: dict,
    db: Session
) -> list:

    min_price, max_price = BUDGET_LIMITS[data.budget_style.value]
    min_days,  max_days  = DURATION_DAYS[data.duration.value]

    # Start with broad query — join package type
    base_query = db.query(TravelPackage, PackageType).join(
        PackageType, TravelPackage.package_type_id == PackageType.id
    )

    # Strict: top persona type + budget + duration
    strict = base_query.filter(and_(
        PackageType.type_name.ilike(f"%{persona.top_type}%"),
        TravelPackage.base_price >= min_price,
        TravelPackage.base_price <= max_price,
        TravelPackage.duration_days >= min_days,
        TravelPackage.duration_days <= max_days,
    )).all()

    # Relaxed: just budget + duration (any package type)
    if len(strict) < 3:
        relaxed = base_query.filter(and_(
            TravelPackage.base_price <= max_price * 1.3,
            TravelPackage.duration_days >= max(1, min_days - 1),
            TravelPackage.duration_days <= max_days + 2,
        )).all()
        combined = {p.id: (p, pt) for p, pt in strict}
        for p, pt in relaxed:
            combined.setdefault(p.id, (p, pt))
        results = list(combined.values())
    else:
        results = strict

    # Last resort — return everything
    if not results:
        results = base_query.limit(10).all()

    # Score each package
    ranked = []
    for package, pkg_type in results:
        score, why = _score_package(package, pkg_type, persona, scores, data)
        ranked.append(MatchedPackage(
            id           = package.id,
            title        = package.title,
            destination  = package.destination,
            base_price   = package.base_price,
            duration     = f"{package.duration_days}D/{package.duration_nights}N",
            package_type = pkg_type.type_name if pkg_type else "General",
            match_score  = score,
            why_matched  = why,
        ))

    ranked.sort(key=lambda x: x.match_score, reverse=True)
    return ranked


def _score_package(package, pkg_type, persona, scores, data):
    """Score a single package against the user's DNA profile."""

    score = 0
    reasons = []

    # Persona type match (biggest weight)
    if pkg_type and persona.top_type.lower() in pkg_type.type_name.lower():
        score += 50
        reasons.append(f"perfect for your {persona.top_type.lower()} style")

    # Secondary type match (second highest score)
    elif pkg_type:
        sorted_types = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        second_type = sorted_types[1][0] if len(sorted_types) > 1 else None
        if second_type and second_type.lower() in pkg_type.type_name.lower():
            score += 30
            reasons.append(f"matches your {second_type.lower()} side too")

    # Budget fit
    min_price, max_price = BUDGET_LIMITS[data.budget_style.value]
    if min_price <= package.base_price <= max_price:
        score += 25
        reasons.append(f"fits your {data.budget_style.value} budget")
    elif package.base_price <= max_price * 1.2:
        score += 10
        reasons.append("slightly above budget but worth it")

    # Duration fit
    min_days, max_days = DURATION_DAYS[data.duration.value]
    if min_days <= package.duration_days <= max_days:
        score += 15
        reasons.append(f"ideal {data.duration.value}-length trip")

    # Best destination match
    if any(dest.lower() in package.destination.lower() for dest in persona.best_for):
        score += 10
        reasons.append(f"top destination for your persona")

    if not reasons:
        score = 20
        reasons.append("available package")

    why = " · ".join(reasons).capitalize()
    return score, why



def run_dna_quiz(data: DNAQuizRequest, db: Session) -> DNAQuizResponse:

    # 1. Score all package types
    type_scores = compute_type_scores(data)

    # 2. Resolve persona from top score
    persona = resolve_persona(type_scores, data)

    # 3. Fetch + rank matched packages
    matched = fetch_matched_packages(persona, data, type_scores, db)

    return DNAQuizResponse(
        persona          = persona,
        type_scores      = type_scores,
        total_packages   = len(matched),
        matched_packages = matched,
    )