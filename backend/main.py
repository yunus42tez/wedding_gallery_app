import os
import sys
import uuid
import tempfile
import shutil
from datetime import timedelta
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Request, status
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from dotenv import load_dotenv

# Ensure parent directory is in sys.path to support direct execution
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

import backend.auth as auth
import backend.drive_service as drive_service

# ── Google Drive setup ───────────────────────────────────────────
_drive = drive_service.get_drive_service()
_folder_id = drive_service.get_or_create_folder(_drive, folder_name="Wedday")

app = FastAPI(title="Wedding Photo Upload App")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".mp4", ".mov", ".avi", ".mkv", ".webm"}

# ── Pydantic Schemas ─────────────────────────────────────────────

class Token(BaseModel):
    access_token: str
    token_type: str

class PhotoResponse(BaseModel):
    id: str
    file_name: str
    original_name: str
    file_size: int
    upload_date: str
    mime_type: str

class StatsResponse(BaseModel):
    total_uploads: int
    uploads_today: int
    storage_usage: int

# ── Endpoints ────────────────────────────────────────────────────

@app.post("/api/upload", status_code=status.HTTP_201_CREATED)
async def upload_photos(
    request: Request,
    files: List[UploadFile] = File(...),
):
    """Upload photos/videos to Google Drive."""
    uploaded_count = 0

    for file in files:
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            continue

        # Save to a temporary file, then upload to Drive
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name

        try:
            drive_service.upload_file(_drive, tmp_path, file.filename, _folder_id)
            uploaded_count += 1
        finally:
            os.unlink(tmp_path)

    if uploaded_count == 0:
        raise HTTPException(status_code=400, detail="No valid files uploaded.")

    return {"message": "Files uploaded successfully", "count": uploaded_count}


@app.post("/api/admin/login", response_model=Token)
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


@app.get("/api/admin/photos", response_model=List[PhotoResponse])
async def get_photos(admin: str = Depends(auth.get_current_admin)):
    """List all uploaded photos/videos from Google Drive."""
    files = drive_service.list_files(_drive, _folder_id)
    return [
        {
            "id": f["id"],
            "file_name": f["name"],
            "original_name": f["name"],
            "file_size": int(f.get("size", 0)),
            "upload_date": f.get("createdTime", ""),
            "mime_type": f.get("mimeType", ""),
        }
        for f in files
    ]


@app.get("/api/admin/photo/{photo_id}")
async def get_photo(photo_id: str, token: str):
    """Stream a photo/video from Google Drive (token via query param)."""
    admin = auth.get_current_admin(token)

    try:
        metadata = drive_service.get_file_metadata(_drive, photo_id)
        buffer = drive_service.download_file(_drive, photo_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Photo not found")

    mime_type = metadata.get("mimeType", "application/octet-stream")
    return StreamingResponse(buffer, media_type=mime_type)


@app.get("/api/admin/download/{photo_id}")
async def download_photo(photo_id: str, token: str):
    """Download a photo/video from Google Drive."""
    admin = auth.get_current_admin(token)

    try:
        metadata = drive_service.get_file_metadata(_drive, photo_id)
        buffer = drive_service.download_file(_drive, photo_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Photo not found")

    return StreamingResponse(
        buffer,
        media_type="application/octet-stream",
        headers={"Content-Disposition": f'attachment; filename="{metadata["name"]}"'},
    )


@app.delete("/api/admin/photo/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_photo(photo_id: str, admin: str = Depends(auth.get_current_admin)):
    """Delete a photo/video from Google Drive."""
    try:
        drive_service.delete_file(_drive, photo_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Photo not found")
    return


@app.get("/api/admin/stats", response_model=StatsResponse)
async def get_stats(admin: str = Depends(auth.get_current_admin)):
    """Get upload statistics from Google Drive."""
    stats = drive_service.get_folder_stats(_drive, _folder_id)
    return stats


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
