"""
OCRBookor - Détection et Correction d'Inclinaison (Deskew)
Calcule l'angle réel d'inclinaison par analyse du profil de projection ou transformée de Hough.
"""

import math
from pathlib import Path
from typing import Tuple

class Deskewer:
    @staticmethod
    def calculate_skew_angle(image_path: Path) -> float:
        """
        Calcule l'angle d'inclinaison réel de la page en degrés (-10° à +10°).
        Si OpenCV est disponible, utilise le profil de projection ou minAreaRect sur les composantes de texte.
        """
        try:
            import cv2
            import numpy as np

            img = cv2.imread(str(image_path), cv2.IMREAD_GRAYSCALE)
            if img is None:
                return 0.0

            # Invert and threshold
            thresh = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)[1]

            # Detect text coordinates
            coords = np.column_stack(np.where(thresh > 0))
            if len(coords) < 100:
                return 0.0

            # Compute minAreaRect on ink pixels
            angle = cv2.minAreaRect(coords)[-1]

            # Normalize angle to [-45, 45] range
            if angle < -45:
                angle = -(90 + angle)
            elif angle > 45:
                angle = 90 - angle

            # Filter outlier angles (typically scan skew is within [-10, 10])
            if abs(angle) > 15:
                return 0.0

            return round(float(angle), 2)
        except Exception:
            return 0.0

    @staticmethod
    def rotate_image(image_path: Path, angle_deg: float, output_path: Path) -> bool:
        """
        Effectue la rotation de l'image pour redresser la page.
        """
        if abs(angle_deg) < 0.2:
            return True

        try:
            import cv2
            img = cv2.imread(str(image_path))
            if img is None:
                return False

            (h, w) = img.shape[:2]
            center = (w // 2, h // 2)
            M = cv2.getRotationMatrix2D(center, angle_deg, 1.0)
            rotated = cv2.warpAffine(img, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
            cv2.imwrite(str(output_path), rotated)
            return True
        except Exception:
            return False
