"""
OCRBookor - Binarisation & Seuillage
Fournit la binarisation Otsu et le seuillage adaptatif pour textes anciens et papiers jaunis.
"""

from pathlib import Path

class Thresholder:
    @staticmethod
    def binarize(image_path: Path, output_path: Path, method: str = "otsu") -> bool:
        try:
            import cv2
            img = cv2.imread(str(image_path), cv2.IMREAD_GRAYSCALE)
            if img is None:
                return False

            if method == "adaptive":
                binary = cv2.adaptiveThreshold(
                    img, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 21, 10
                )
            else:
                # Otsu thresholding
                binary = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]

            cv2.imwrite(str(output_path), binary)
            return True
        except Exception:
            return False
