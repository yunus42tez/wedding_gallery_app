"""
Google Drive Service Module
Handles all Google Drive operations: upload, list, download, delete.
Uses a service account for authentication.
"""

import os
import io
import json
import tempfile
from datetime import datetime
from typing import Optional

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload, MediaIoBaseDownload

# Scopes required for Google Drive file management
SCOPES = ["https://www.googleapis.com/auth/drive"]

# MIME type mapping for media files
MIME_TYPES = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".heic": "image/heic",
    ".mp4": "video/mp4",
    ".mov": "video/quicktime",
    ".avi": "video/x-msvideo",
    ".mkv": "video/x-matroska",
    ".webm": "video/webm",
}


def _get_credentials():
    """
    Load service account credentials.
    Priority:
    1. GOOGLE_SERVICE_ACCOUNT_JSON env var (JSON string - for production)
    2. Local file at backend/credentials/service_account.json (for development)
    """
    json_str = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON")
    if json_str:
        info = json.loads(json_str)
        return service_account.Credentials.from_service_account_info(info, scopes=SCOPES)

    # Fallback to local file
    cred_path = os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        "credentials",
        "service_account.json",
    )
    if os.path.exists(cred_path):
        return service_account.Credentials.from_service_account_file(cred_path, scopes=SCOPES)

    raise RuntimeError(
        "Google Drive credentials not found. "
        "Set GOOGLE_SERVICE_ACCOUNT_JSON env var or place service_account.json in backend/credentials/"
    )


def get_drive_service():
    """Build and return the Google Drive API service client."""
    creds = _get_credentials()
    return build("drive", "v3", credentials=creds)


def get_or_create_folder(service, folder_name: str = "WeddingPhotos", parent_id: Optional[str] = None) -> str:
    """
    Get existing folder by name or create a new one.
    Returns the folder ID.
    """
    # Check env for explicit folder ID
    folder_id = os.getenv("GOOGLE_DRIVE_FOLDER_ID")
    if folder_id:
        return folder_id

    # Search for existing folder
    query = f"name='{folder_name}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
    if parent_id:
        query += f" and '{parent_id}' in parents"

    results = service.files().list(q=query, spaces="drive", fields="files(id, name)").execute()
    files = results.get("files", [])

    if files:
        return files[0]["id"]

    # Create folder
    file_metadata = {
        "name": folder_name,
        "mimeType": "application/vnd.google-apps.folder",
    }
    if parent_id:
        file_metadata["parents"] = [parent_id]

    folder = service.files().create(body=file_metadata, fields="id").execute()
    return folder["id"]


def upload_file(service, file_path: str, original_name: str, folder_id: str) -> dict:
    """
    Upload a file to Google Drive.
    Returns file metadata dict with id, name, size, webViewLink, etc.
    """
    ext = os.path.splitext(original_name)[1].lower()
    mime_type = MIME_TYPES.get(ext, "application/octet-stream")

    file_metadata = {
        "name": original_name,
        "parents": [folder_id],
    }

    media = MediaFileUpload(file_path, mimetype=mime_type, resumable=True)
    file = (
        service.files()
        .create(body=file_metadata, media_body=media, fields="id,name,size,mimeType,createdTime,webViewLink")
        .execute()
    )
    return file


def list_files(service, folder_id: str, page_size: int = 100) -> list:
    """
    List all files in a Google Drive folder.
    Returns list of file metadata dicts.
    """
    query = f"'{folder_id}' in parents and trashed=false"
    results = (
        service.files()
        .list(
            q=query,
            spaces="drive",
            fields="files(id,name,size,mimeType,createdTime,webViewLink,thumbnailLink)",
            pageSize=page_size,
            orderBy="createdTime desc",
        )
        .execute()
    )
    return results.get("files", [])


def download_file(service, file_id: str) -> io.BytesIO:
    """
    Download a file from Google Drive.
    Returns a BytesIO object containing the file data.
    """
    request = service.files().get_media(fileId=file_id)
    buffer = io.BytesIO()
    downloader = MediaIoBaseDownload(buffer, request)

    done = False
    while not done:
        _, done = downloader.next_chunk()

    buffer.seek(0)
    return buffer


def get_file_metadata(service, file_id: str) -> dict:
    """Get metadata for a specific file."""
    return (
        service.files()
        .get(fileId=file_id, fields="id,name,size,mimeType,createdTime,webViewLink")
        .execute()
    )


def delete_file(service, file_id: str) -> None:
    """Delete a file from Google Drive."""
    service.files().delete(fileId=file_id).execute()


def get_folder_stats(service, folder_id: str) -> dict:
    """
    Get statistics for files in a folder.
    Returns dict with total_uploads, uploads_today, storage_usage.
    """
    files = list_files(service, folder_id, page_size=1000)

    total_uploads = len(files)
    storage_usage = sum(int(f.get("size", 0)) for f in files)

    today = datetime.utcnow().date()
    uploads_today = 0
    for f in files:
        created = f.get("createdTime", "")
        if created:
            try:
                file_date = datetime.fromisoformat(created.replace("Z", "+00:00")).date()
                if file_date == today:
                    uploads_today += 1
            except (ValueError, TypeError):
                pass

    return {
        "total_uploads": total_uploads,
        "uploads_today": uploads_today,
        "storage_usage": storage_usage,
    }
