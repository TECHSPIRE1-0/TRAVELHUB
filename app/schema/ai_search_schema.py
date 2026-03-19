from pydantic import BaseModel
from typing import Optional, List


class AISearchRequest(BaseModel):
    query: str


class ParsedFilters(BaseModel):
    destination: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    min_days: Optional[int] = None
    max_days: Optional[int] = None
    package_type: Optional[str] = None
    people_count: Optional[int] = None
    travel_month: Optional[str] = None


class PackageResult(BaseModel):
    id: int
    title: str
    destination: str
    base_price: float
    duration: str
    package_type: str
    max_people: int
    agency_id: int
    match_score: int
    match_reasons: List[str]


class AISearchResponse(BaseModel):
    query: str
    parsed_filters: ParsedFilters
    summary: str
    total_found: int
    results: List[PackageResult]