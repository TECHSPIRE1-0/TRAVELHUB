from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.search_service import search_by_filter

router = APIRouter(prefix="/packages", tags=["Packages"])


# @router.get("/search")
# def search_package(
#     query: str = Query(...),
#     db: Session = Depends(get_db)
# ):

#     return {
#         "results": search_packages(query, db)
#     }


@router.get("/")
def search_package(
    destination: str = Query(None),
    min_price: float = Query(None),
    max_price: float = Query(None),
    min_days: int = Query(None),
    max_days: int = Query(None),
    package_type: str = Query(None),
    db: Session = Depends(get_db)
):

    data = search_by_filter(
        db,
        destination,
        min_price,
        max_price,
        min_days,
        max_days,
        package_type
    )

    return {
        "results": data
    }