"""
OCRBookor - Configuration Core
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = Path(os.environ.get("OCRBOOKOR_DATA_DIR", BASE_DIR / "data"))
PROJECTS_DIR = DATA_DIR / "projects"
UPLOADS_DIR = DATA_DIR / "uploads"
DATABASE_PATH = DATA_DIR / "ocrbookor.sqlite3"

# Ensure directories exist
for directory in [DATA_DIR, PROJECTS_DIR, UPLOADS_DIR]:
    directory.mkdir(parents=True, exist_ok=True)

# Tesseract & OCR Configuration
TESSERACT_CMD = os.environ.get("TESSERACT_CMD", "tesseract")
DEFAULT_LANGUAGE = os.environ.get("DEFAULT_LANGUAGE", "fra")
MAX_UPLOAD_SIZE_MB = int(os.environ.get("MAX_UPLOAD_SIZE_MB", 200))
