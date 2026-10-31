"""
OCRBookor - PDF Analyzer
Analyse les pages du PDF (images pures, texte natif ou hybride, dimensions, pages blanches).
"""

from pathlib import Path
from typing import Dict, Any, List

class PDFAnalyzer:
    @staticmethod
    def analyze_document(file_path: Path) -> Dict[str, Any]:
        """
        Analyse la structure des pages du PDF.
        """
        try:
            import fitz  # PyMuPDF
            doc = fitz.open(str(file_path))
            total_pages = len(doc)
            pages_info = []
            pages_with_native_text = 0

            for i in range(total_pages):
                page = doc[i]
                text = page.get_text().strip()
                rect = page.rect
                images = page.get_images()

                has_text = len(text) > 40
                if has_text:
                    pages_with_native_text += 1

                is_blank = len(text) == 0 and len(images) == 0

                # Estimated DPI if image fills the page
                est_dpi = None
                if images:
                    # PyMuPDF rect width in points (72 points = 1 inch)
                    width_in_inches = rect.width / 72.0
                    try:
                        base_image = doc.extract_image(images[0][0])
                        img_width = base_image.get("width", 0)
                        if width_in_inches > 0 and img_width > 0:
                            est_dpi = int(img_width / width_in_inches)
                    except Exception:
                        pass

                pages_info.append({
                    "page_number": i + 1,
                    "width": int(rect.width),
                    "height": int(rect.height),
                    "has_native_text": has_text,
                    "native_text_length": len(text),
                    "has_images": len(images) > 0,
                    "is_blank": is_blank,
                    "estimated_dpi": est_dpi
                })

            doc.close()

            doc_type = "image_only"
            if pages_with_native_text == total_pages:
                doc_type = "native_text"
            elif pages_with_native_text > 0:
                doc_type = "hybrid"

            return {
                "file_name": file_path.name,
                "total_pages": total_pages,
                "document_type": doc_type,
                "pages": pages_info
            }
        except ImportError:
            # Fallback if PyMuPDF is not installed
            return {
                "file_name": file_path.name,
                "total_pages": 1,
                "document_type": "image_only",
                "note": "PyMuPDF non installé, analyse de base appliquée",
                "pages": [{
                    "page_number": 1,
                    "width": 595,
                    "height": 842,
                    "has_native_text": False,
                    "native_text_length": 0,
                    "has_images": True,
                    "is_blank": False,
                    "estimated_dpi": None
                }]
            }
