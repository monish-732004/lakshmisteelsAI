import uuid
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

def generate_uuid() -> str:
    return str(uuid.uuid4())

class UploadedFile(SQLModel, table=True):
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    filename: str
    file_path: str
    file_size: int
    mime_type: str
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    sheets_json: str = Field(default="[]")  # JSON list of sheet names
    active_sheet: Optional[str] = None
    domain: Optional[str] = "General"  # Auto-detected (Sales, Finance, etc.)
    current_version_id: Optional[str] = None

class DatasetVersion(SQLModel, table=True):
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    file_id: str = Field(index=True)
    version_number: int
    file_path: str  # Path to the actual dataframe storage for this version
    created_at: datetime = Field(default_factory=datetime.utcnow)
    description: str  # What was cleaned in this step
    columns_json: str = Field(default="[]")  # Column details cache

class CleaningAuditLog(SQLModel, table=True):
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    file_id: str = Field(index=True)
    version_id: str
    step_name: str
    details: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ChatMessage(SQLModel, table=True):
    id: str = Field(default_factory=generate_uuid, primary_key=True)
    file_id: str = Field(index=True)
    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
