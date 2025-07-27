from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime

class ChatRequest(BaseModel):
    content: str

class ChatResponse(BaseModel):
    type: str
    content: Optional[str] = None
    routing: Optional[Any] = None
    error: Optional[str] = None
    messageId: Optional[str] = None

class MessageResponse(BaseModel):
    id: str
    room_id: str
    role: str
    content: str
    query_routing: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class ChatRoomResponse(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True 