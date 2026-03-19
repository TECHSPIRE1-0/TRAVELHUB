from pydantic import BaseModel
from typing import List
from enum import Enum


# --------------------------------------------------------------------------- #
#  Quiz answer enums — strict validation on all inputs                         #
# --------------------------------------------------------------------------- #

class BudgetStyle(str, Enum):
    backpacker = "backpacker"   # under 10,000 per person
    midrange   = "midrange"     # 10,000 - 30,000
    luxury     = "luxury"       # 30,000+


class ActivityLevel(str, Enum):
    relaxed  = "relaxed"
    moderate = "moderate"
    intense  = "intense"


class TravelGroup(str, Enum):
    solo    = "solo"
    couple  = "couple"
    family  = "family"
    friends = "friends"


class TravelVibe(str, Enum):
    adventure = "adventure"
    culture   = "culture"
    beach     = "beach"
    nature    = "nature"
    city      = "city"


class TripDuration(str, Enum):
    weekend = "weekend"
    short   = "short"
    week    = "week"
    long    = "long"


# --------------------------------------------------------------------------- #
#  Request                                                                      #
# --------------------------------------------------------------------------- #

class DNAQuizRequest(BaseModel):
    budget_style:   BudgetStyle
    activity_level: ActivityLevel
    travel_group:   TravelGroup
    vibe:           TravelVibe
    duration:       TripDuration


# --------------------------------------------------------------------------- #
#  Response                                                                     #
# --------------------------------------------------------------------------- #

class PersonaDetail(BaseModel):
    name:           str
    emoji:          str
    tagline:        str
    top_type:       str
    budget_range:   str
    ideal_duration: str
    traits:         List[str]
    best_for:       List[str]
    ai_generated:   bool = False   # True when Gemini generated the persona


class MatchedPackage(BaseModel):
    id:           int
    title:        str
    destination:  str
    base_price:   float
    duration:     str
    package_type: str
    match_score:  int
    why_matched:  str


class DNAQuizResponse(BaseModel):
    persona:          PersonaDetail
    type_scores:      dict
    total_packages:   int
    matched_packages: List[MatchedPackage]