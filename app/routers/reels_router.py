from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schema.reels_schema import ReelsRequest, ReelsResponse
from app.services.reels_service import generate_reels_script

router = APIRouter(prefix="/marketing", tags=["Viral Travel Reels Generator"])

@router.post("/reels", response_model=ReelsResponse)
async def create_marketing_reel(
    request: ReelsRequest,
    db: Session = Depends(get_db)
):
    """
    Generate a highly engaging, scene-by-scene script for a TikTok or Instagram Reel 
    to promote a specific travel package.
    """
    result = generate_reels_script(request, db)
    
    if not result.get("success"):
        raise HTTPException(status_code=404 if "not found" in result.get("error", "") else 500, detail=result.get("error"))
        
    return result["data"]
