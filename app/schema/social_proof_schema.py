from pydantic import BaseModel
from typing import List, Optional


class SocialProofResponse(BaseModel):

    package_id:        int
    title:             str
    destination:       str

    
    viewers_now:       int      
    views_today:       int      
    bookings_week:     int      
    seats_left:        int      
    last_booked_ago:   Optional[str]   

    
    urgency_level:     str     
    urgency_tags:      List[str]  
    urgency_color:     str    