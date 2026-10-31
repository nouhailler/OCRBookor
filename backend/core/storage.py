"""
OCRBookor - Stockage Fichiers Local (Filesystem)
Gère l'arborescence des répertoires pour chaque projet de numérisation :
data/projects/{project_id}/
    ├── source/original.pdf
    ├── images/original/
    ├── images/processed/
    ├── ocr/
    ├── exports/
"""

import shutil
from pathlib import Path
from typing import Optional
from backend.core.config import PROJECTS_DIR

class ProjectStorage:
    def __init__(self, project_id: str):
        self.project_id = project_id
        self.root = PROJECTS_DIR / project_id
        self.source_dir = self.root / "source"
        self.images_original = self.root / "images" / "original"
        self.images_processed = self.root / "images" / "processed"
        self.ocr_dir = self.root / "ocr"
        self.exports_dir = self.root / "exports"

        # Create directories
        for d in [self.source_dir, self.images_original, self.images_processed, self.ocr_dir, self.exports_dir]:
            d.mkdir(parents=True, exist_ok=True)

    def save_source_pdf(self, source_path: Path) -> Path:
        dest = self.source_dir / "original.pdf"
        shutil.copy2(source_path, dest)
        return dest

    def get_source_pdf(self) -> Optional[Path]:
        path = self.source_dir / "original.pdf"
        return path if path.exists() else None

    def delete_project_data(self):
        if self.root.exists():
            shutil.rmtree(self.root)
