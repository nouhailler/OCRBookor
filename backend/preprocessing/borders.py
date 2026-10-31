"""
OCRBookor - Suppression des Bordures Noires
Détecte et rogne les bords noirs caractéristiques des numérisations à plat.
"""

from pathlib import Path

class BorderRemover:
    @staticmethod
    def remove_black_borders(image_path: Path, output_path: Path) -> bool:
        try:
            import cv2
            img = cv2.imread(str(image_path))
            if img is None:
                return False

            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            # Find contours of the main page rectangle
            thresh = cv2.threshold(gray, 30, 255, cv2.THRESH_BINARY)[1]
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

            if contours:
                c = max(contours, key=cv2.contourArea)
                x, y, w, h = cv2.boundingRect(c)
                # Ensure cropped region is at least 60% of original image
                if w > img.shape[1] * 0.6 and h > img.shape[0] * 0.6:
                    cropped = img[y:y+h, x:x+w]
                    cv2.imwrite(str(output_path), cropped)
                    return True

            cv2.imwrite(str(output_path), img)
            return True
        except Exception:
            return False
