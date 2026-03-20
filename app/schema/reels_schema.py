from pydantic import BaseModel, Field
from typing import List, Optional

class ReelsRequest(BaseModel):
    package_id: int = Field(..., description="ID of the travel package to promote")
    tone: Optional[str] = Field("energetic", description="Tone of the video: energetic, romantic, cinematic, funny, etc.")
    platform: Optional[str] = Field("Instagram Reels", description="Platform: Instagram Reels, TikTok, YouTube Shorts")

class Scene(BaseModel):
    timestamp_seconds: str = Field(..., example="0:00 - 0:03")
    visual: str = Field(..., example="Fast pan of the beach at sunset")
    voiceover: str = Field(..., example="POV: You found the ultimate hidden gem in Goa...")
    text_on_screen: str = Field(..., example="Wait for the end 🤯")

class ReelsResponse(BaseModel):
    package_id: int
    title: str = Field(..., description="A catchy title for the video")
    target_duration: str = Field(..., example="15 seconds")
    suggested_audio: str = Field(..., example="Trending upbeat tropical remix")
    caption: str = Field(..., description="The caption for the post, including hashtags")
    script: List[Scene] = Field(..., description="The scene-by-scene script")
