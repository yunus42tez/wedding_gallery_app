import os
import shutil
import sys
import uuid
from datetime import datetime, date, timedelta
from typing import List

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Request, status
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import func
from dotenv import load_dotenv

# Ensure parent directory is in sys.path to support direct execution
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

import backend.models as models
import backend.schemas as schemas
import backend.auth as auth
import backend.database as database
from backend.database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Wedding Photo Upload App")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".mp4", ".mov", ".avi", ".mkv", ".webm"}

@app.post("/api/upload", status_code=status.HTTP_201_CREATED)
async def upload_photos(
    request: Request,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    uploaded_photos = []
    
    for file in files:
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            continue
            
        unique_filename = f"{uuid.uuid4().hex}{ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        file_size = os.path.getsize(file_path)
        
        db_photo = models.Photo(
            file_name=unique_filename,
            original_name=file.filename,
            file_size=file_size,
            uploader_ip=request.client.host if request.client else None,
            storage_path=file_path
        )
        db.add(db_photo)
        db.commit()
        db.refresh(db_photo)
        
        uploaded_photos.append(db_photo)
        
    if not uploaded_photos:
        raise HTTPException(status_code=400, detail="No valid files uploaded.")
        
    return {"message": "Files uploaded successfully", "count": len(uploaded_photos)}

@app.post("/api/admin/login", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    admin_user = os.getenv("ADMIN_USERNAME", "ytez")
    admin_pass = os.getenv("ADMIN_PASSWORD", "aA123456")
    
    if form_data.username != admin_user or form_data.password != admin_pass:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": admin_user}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/admin/photos", response_model=List[schemas.PhotoResponse])
async def get_photos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), admin: str = Depends(auth.get_current_admin)):
    photos = db.query(models.Photo).order_by(models.Photo.upload_date.desc()).offset(skip).limit(limit).all()
    return photos

@app.get("/api/admin/photo/{photo_id}")
async def get_photo(photo_id: int, token: str, db: Session = Depends(get_db)):
    admin = auth.get_current_admin(token)
    photo = db.query(models.Photo).filter(models.Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    if not os.path.exists(photo.storage_path):
        raise HTTPException(status_code=404, detail="File not found on disk")
        
    return FileResponse(photo.storage_path)

@app.get("/api/admin/download/{photo_id}")
async def download_photo(photo_id: int, token: str, db: Session = Depends(get_db)):
    # We accept token from query for easy download link usage
    admin = auth.get_current_admin(token)
    
    photo = db.query(models.Photo).filter(models.Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    
    if not os.path.exists(photo.storage_path):
        raise HTTPException(status_code=404, detail="File not found on disk")
        
    return FileResponse(
        photo.storage_path, 
        media_type='application/octet-stream', 
        filename=photo.original_name
    )

@app.delete("/api/admin/photo/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_photo(photo_id: int, db: Session = Depends(get_db), admin: str = Depends(auth.get_current_admin)):
    photo = db.query(models.Photo).filter(models.Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
        
    try:
        if os.path.exists(photo.storage_path):
            os.remove(photo.storage_path)
    except Exception as e:
        pass
        
    db.delete(photo)
    db.commit()
    return

@app.get("/api/admin/stats", response_model=schemas.StatsResponse)
async def get_stats(db: Session = Depends(get_db), admin: str = Depends(auth.get_current_admin)):
    total_uploads = db.query(func.count(models.Photo.id)).scalar() or 0
    
    today = datetime.now().date()
    photos = db.query(models.Photo).all()
    uploads_today = sum(1 for p in photos if p.upload_date.date() == today)
    storage_usage = sum(p.file_size for p in photos)
    
    return {
        "total_uploads": total_uploads,
        "uploads_today": uploads_today,
        "storage_usage": storage_usage
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
