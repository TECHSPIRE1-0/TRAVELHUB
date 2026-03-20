from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.vision_service import analyze_image_and_match

router = APIRouter(prefix="/vision", tags=["AI Local Lens (Image to Trip)"])

@router.post("/analyze")
async def analyze_landmark_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload a picture of a destination, landmark, or vibe, 
    and the AI will identify it and find matching travel packages!
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
        
    contents = await file.read()
    
    result = analyze_image_and_match(contents, db)
    
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "AI Analysis failed"))
        
    return result
