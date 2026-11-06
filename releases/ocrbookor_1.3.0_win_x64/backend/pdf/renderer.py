"""
OCRBookor - PDF Page Renderer
Rend une page PDF en image haute résolution (PNG/JPEG) pour le prétraitement et l'OCR.
"""

from pathlib import Path
from typing import Optional

class PDFRenderer:
    @staticmethod
    def render_page(pdf_path: Path, page_number: number, output_image_path: Path, dpi: int = 300) -> bool:
        """
        Rend la page spécifiée (1-indexée) à la résolution DPI demandée.
        """
        try:
            import fitz
            doc = fitz.open(str(pdf_path))
            if page_number < 1 or page_number > len(doc):
                doc.close()
                return False

            page = doc[page_number - 1]
            # 72 dpi is 1.0 scale
            zoom = dpi / 72.0
            mat = fitz.Matrix(zoom, zoom)
            pix = page.get_pixmap(matrix=mat, alpha=False)
            pix.save(str(output_image_path))
            doc.close()
            return True
        except Exception as e:
            print(f"Erreur rendu page {page_number}: {e}")
            return False
