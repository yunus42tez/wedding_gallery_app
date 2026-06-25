from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from .database import Base

class Photo(Base):
    __tablename__ = "photos"

    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String, unique=True, index=True, nullable=False)
    original_name = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    upload_date = Column(DateTime(timezone=True), server_default=func.now())
    uploader_ip = Column(String, nullable=True)
    storage_path = Column(String, nullable=False)
