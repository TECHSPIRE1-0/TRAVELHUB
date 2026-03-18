from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schema.package_schema import CreatePackageRequest
from app.services.package_service import create_full_package
from app.utils.dependencies import get_current_agency

router = APIRouter(prefix="/agency", tags=["Packages"])


@router.post("/create-package")
def create_package(
    data: CreatePackageRequest,
    db: Session = Depends(get_db),
    agency=Depends(get_current_agency)
):

    package_id = create_full_package(data, agency.id, db)

    return {
        "message": "Package created successfully",
        "package_id": package_id
    }