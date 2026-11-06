"""
OCRBookor - PDF Importer
Vérifie la validité, la taille et le format du document avant import.
"""

import os
from pathlib import Path
from backend.core.exceptions import InvalidPDFError
from backend.core.config import MAX_UPLOAD_SIZE_MB

class PDFImporter:
    @staticmethod
    def validate_file(file_path: Path) -> dict:
        if not file_path.exists():
            raise InvalidPDFError(f"Le fichier n'existe pas : {file_path}")

        file_size = os.path.getsize(file_path)
        if file_size == 0:
            raise InvalidPDFError("Le fichier est vide (taille 0 octets)")

        if file_size > MAX_UPLOAD_SIZE_MB * 1024 * 1024:
            raise InvalidPDFError(f"Le fichier dépasse la taille maximale autorisée de {MAX_UPLOAD_SIZE_MB} Mo")

        # Check PDF Magic bytes %PDF
        with open(file_path, "rb") as f:
            header = f.read(5)
            if not header.startswith(b"%PDF"):
                raise InvalidPDFError("Format de fichier non reconnu : l'en-tête PDF (%PDF) est absent")

        return {
            "valid": True,
            "file_name": file_path.name,
            "size_bytes": file_size
        }
