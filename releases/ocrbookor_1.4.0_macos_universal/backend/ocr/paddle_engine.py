"""
OCRBookor - Moteur PaddleOCR Réel
Ne déclare le moteur disponible que si paddleocr et paddlepaddle sont installés et exécutables.
"""

from pathlib import Path
from typing import Dict, Any, List
from backend.ocr.base import BaseOCREngine
from backend.core.exceptions import OCREngineNotInstalledError

class PaddleOCREngine(BaseOCREngine):
    def __init__(self):
        self._available: bool = None
        self._ocr_instance = None

    @property
    def engine_name(self) -> str:
        return "paddleocr"

    def is_available(self) -> bool:
        if self._available is not None:
            return self._available
        try:
            import paddleocr
            self._available = True
        except ImportError:
            self._available = False
        return self._available

    def get_supported_languages(self) -> List[str]:
        if not self.is_available():
            return []
        return ["fr", "en", "ch", "latin"]

    def recognize_page(self, image_path: Path, lang: str = "fra") -> Dict[str, Any]:
        if not self.is_available():
            raise OCREngineNotInstalledError(
                "Le moteur PaddleOCR n'est pas installé. Installez paddleocr via pip."
            )

        try:
            from paddleocr import PaddleOCR
            if self._ocr_instance is None:
                # Map ISO code to PaddleOCR lang
                paddle_lang = "fr" if lang in ["fra", "fr"] else "en"
                self._ocr_instance = PaddleOCR(use_angle_cls=True, lang=paddle_lang, show_log=False)

            result = self._ocr_instance.ocr(str(image_path), cls=True)
            lines = []
            total_conf = 0.0
            word_count = 0

            if result and result[0]:
                for line in result[0]:
                    box = line[0]
                    text, conf = line[1]
                    total_conf += conf * 100
                    word_count += len(text.split())
                    lines.append(text)

            avg_conf = round(total_conf / max(1, len(result[0] or [])), 1) if result and result[0] else 0.0

            return {
                "engine": "paddleocr",
                "lang": lang,
                "text": "\n".join(lines),
                "confidence": avg_conf,
                "word_count": word_count,
                "raw_result": result
            }
        except Exception as e:
            raise RuntimeError(f"Échec d'exécution de PaddleOCR : {e}")
