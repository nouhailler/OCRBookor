"""
OCRBookor - Extraction des Illustrations
Extrait les images et gravures incorporées dans le PDF source avec préservation de la résolution.
"""

from pathlib import Path
from typing import List, Dict, Any

class ImageExtractor:
    @staticmethod
    def extract_images(pdf_path: Path, output_dir: Path) -> List[Dict[str, Any]]:
        """
        Extrait les illustrations embarquées dans le document PDF.
        """
        extracted = []
        try:
            import fitz
            doc = fitz.open(str(pdf_path))
            output_dir.mkdir(parents=True, exist_ok=True)

            img_idx = 1
            for page_num in range(len(doc)):
                page = doc[page_num]
                image_list = page.get_images(full=True)

                for img_info in image_list:
                    xref = img_info[0]
                    base_image = doc.extract_image(xref)
                    image_bytes = base_image["image"]
                    image_ext = base_image["ext"]

                    # Filter tiny icons or artifacts (e.g. smaller than 80x80)
                    if base_image["width"] < 80 or base_image["height"] < 80:
                        continue

                    filename = f"illustration_p{page_num + 1}_{img_idx}.{image_ext}"
                    filepath = output_dir / filename

                    with open(filepath, "wb") as f:
                        f.write(image_bytes)

                    extracted.append({
                        "id": f"ill-{page_num + 1}-{img_idx}",
                        "page_number": page_num + 1,
                        "title": f"Illustration {img_idx}",
                        "width": base_image["width"],
                        "height": base_image["height"],
                        "file_path": str(filepath),
                        "file_name": filename
                    })
                    img_idx += 1

            doc.close()
        except Exception as e:
            print(f"Erreur extraction illustrations: {e}")

        return extracted
