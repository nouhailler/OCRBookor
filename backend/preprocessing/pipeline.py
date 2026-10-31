"""
OCRBookor - Pipeline de Prétraitement Configurable
Enchaîne redressement, amélioration du contraste, débruitage et binarisation.
"""

from pathlib import Path
from typing import Dict, Any
from backend.preprocessing.deskew import Deskewer
from backend.preprocessing.threshold import Thresholder
from backend.preprocessing.denoise import Denoiser
from backend.preprocessing.borders import BorderRemover

class PreprocessingPipeline:
    def __init__(self, settings: Dict[str, Any]):
        self.settings = settings

    def process(self, input_image_path: Path, output_image_path: Path) -> Dict[str, Any]:
        current_path = input_image_path
        skew_angle = 0.0

        # 1. Deskew
        if self.settings.get("autoDeskew", True):
            skew_angle = Deskewer.calculate_skew_angle(current_path)
            if abs(skew_angle) >= 0.5:
                Deskewer.rotate_image(current_path, -skew_angle, output_image_path)
                current_path = output_image_path

        # 2. Border removal
        if self.settings.get("removeBorders", True):
            BorderRemover.remove_black_borders(current_path, output_image_path)
            current_path = output_image_path

        # 3. Denoise
        if self.settings.get("denoise", False):
            Denoiser.denoise_image(current_path, output_image_path)
            current_path = output_image_path

        # 4. Binarization
        thresh_val = self.settings.get("binarizationThreshold", 0)
        if thresh_val > 0:
            Thresholder.binarize(current_path, output_image_path, method="otsu")
            current_path = output_image_path

        return {
            "processed_path": str(current_path),
            "skew_angle": skew_angle
        }
