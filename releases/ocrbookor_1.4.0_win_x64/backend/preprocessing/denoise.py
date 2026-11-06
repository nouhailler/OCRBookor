"""
OCRBookor - Réduction du Bruit & Débruitage
"""

from pathlib import Path

class Denoiser:
    @staticmethod
    def denoise_image(image_path: Path, output_path: Path) -> bool:
        try:
            import cv2
            img = cv2.imread(str(image_path))
            if img is None:
                return False

            # Fast non-local means denoising for text scans
            denoised = cv2.fastNlMeansDenoising(img, h=10)
            cv2.imwrite(str(output_path), denoised)
            return True
        except Exception:
            return False
