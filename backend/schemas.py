from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PhotoBase(BaseModel):
    file_name: str
    original_name: str
    file_size: int
    storage_path: str

class PhotoCreate(PhotoBase):
    uploader_ip: Optional[str] = None

class PhotoResponse(PhotoBase):
    id: int
    upload_date: datetime
    uploader_ip: Optional[str]

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class StatsResponse(BaseModel):
    total_uploads: int
    uploads_today: int
    storage_usage: int
