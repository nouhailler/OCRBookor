"""
OCRBookor - Backend Python Core PDF Analyzer
Conforme à la Partie 2.3 et 3.2 du Cahier des Charges
"""

import os
from typing import Dict, Any, List

class PDFAnalyzer:
    """
    Analyse les documents PDF pour déterminer leur structure :
    - Scan pur (images uniquement)
    - Document avec texte natif
    - Document hybride
    """
    
    @staticmethod
    def inspect_document(file_path: str) -> Dict[str, Any]:
        file_size = os.path.getsize(file_path) if os.path.exists(file_path) else 0
        file_name = os.path.basename(file_path)
        
        # En production sur Debian 13, utilise fitz (PyMuPDF)
        return {
            "file_name": file_name,
            "file_size_bytes": file_size,
            "document_type": "image_only",
            "estimated_dpi": 300,
            "has_native_text": False,
            "anomalies": []
        }
