"""
OCRBookor - Moteur RapidOCR Réel
Optionnel, vérifie la présence de rapidocr_onnxruntime.
"""

from pathlib import Path
from typing import Dict, Any, List
from backend.ocr.base import BaseOCREngine
from backend.core.exceptions import OCREngineNotInstalledError

class RapidOCREngine(BaseOCREngine):
    def __init__(self):
        self._available: bool = None
        self._engine = None

    @property
    def engine_name(self) -> str:
        return "rapidocr"

    def is_available(self) -> bool:
        if self._available is not None:
            return self._available
        try:
            import rapidocr_onnxruntime
            self._available = True
        except ImportError:
            self._available = False
        return self._available

    def get_supported_languages(self) -> List[str]:
        return ["fr", "en"] if self.is_available() else []

    def recognize_page(self, image_path: Path, lang: str = "fra") -> Dict[str, Any]:
        if not self.is_available():
            raise OCREngineNotInstalledError("RapidOCR n'est pas installé.")

        try:
            from rapidocr_onnxruntime import RapidOCR
            if self._engine is None:
                self._engine = RapidOCR()

            result, elapse = self._engine(str(image_path))
            lines = [r[1] for r in result] if result else []
            confs = [r[2] for r in result] if result else []
            avg_conf = round((sum(confs) / len(confs)) * 100, 1) if confs else 0.0

            return {
                "engine": "rapidocr",
                "lang": lang,
                "text": "\n".join(lines),
                "confidence": avg_conf,
                "word_count": sum(len(l.split()) for l in lines)
            }
        except Exception as e:
            raise RuntimeError(f"Échec d'exécution RapidOCR : {e}")
