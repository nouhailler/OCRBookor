"""
OCRBookor - Gestionnaire et Orchestrateur des Moteurs OCR
Gère la sélection, la détection des moteurs disponibles, la comparaison honnête et les erreurs.
"""

from pathlib import Path
from typing import Dict, Any, List, Optional
from backend.ocr.base import BaseOCREngine
from backend.ocr.tesseract_engine import TesseractEngine
from backend.ocr.paddle_engine import PaddleOCREngine
from backend.ocr.rapid_engine import RapidOCREngine
from backend.core.exceptions import OCREngineNotInstalledError

class OCRManager:
    def __init__(self):
        self.engines: Dict[str, BaseOCREngine] = {
            "tesseract": TesseractEngine(),
            "paddleocr": PaddleOCREngine(),
            "rapidocr": RapidOCREngine()
        }

    def get_engine_statuses(self) -> Dict[str, Dict[str, Any]]:
        """Retourne l'état de disponibilité réel de chaque moteur"""
        statuses = {}
        for name, engine in self.engines.items():
            avail = engine.is_available()
            statuses[name] = {
                "available": avail,
                "supported_languages": engine.get_supported_languages() if avail else []
            }
        return statuses

    def run_ocr(self, engine_name: str, image_path: Path, lang: str = "fra") -> Dict[str, Any]:
        engine = self.engines.get(engine_name)
        if not engine:
            raise ValueError(f"Moteur OCR inconnu : {engine_name}")

        if not engine.is_available():
            raise OCREngineNotInstalledError(
                f"Le moteur '{engine_name}' n'est pas disponible sur le système hôte."
            )

        return engine.recognize_page(image_path, lang=lang)

    def compare_engines(self, image_path: Path, lang: str = "fra") -> Dict[str, Any]:
        """
        Exécute réellement les moteurs disponibles et compare leurs résultats.
        Aucun résultat n'est simulé si un moteur est absent.
        """
        comparison: Dict[str, Any] = {}
        for name, engine in self.engines.items():
            if engine.is_available():
                try:
                    res = engine.recognize_page(image_path, lang=lang)
                    comparison[name] = {
                        "status": "success",
                        "text": res.get("text", ""),
                        "confidence": res.get("confidence", 0.0),
                        "word_count": res.get("word_count", 0)
                    }
                except Exception as e:
                    comparison[name] = {
                        "status": "error",
                        "error_message": str(e)
                    }
            else:
                comparison[name] = {
                    "status": "unavailable",
                    "error_message": f"Moteur {name} non installé"
                }

        return comparison
