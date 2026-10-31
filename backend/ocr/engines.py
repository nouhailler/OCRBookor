"""
OCRBookor - Moteurs OCR & Abstraction
Conforme à la Partie 2.3 et 3.4 du Cahier des Charges
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List

class BaseOCREngine(ABC):
    """Interface commune pour tous les moteurs OCR"""
    
    @abstractmethod
    def recognize_page(self, image_path: str, lang: str = "fra") -> Dict[str, Any]:
        pass

class TesseractEngine(BaseOCREngine):
    """Moteur principal Tesseract v5"""
    
    def __init__(self, tesseract_cmd: str = "tesseract"):
        self.cmd = tesseract_cmd

    def recognize_page(self, image_path: str, lang: str = "fra") -> Dict[str, Any]:
        return {
            "engine": "tesseract",
            "text": "",
            "confidence": 95,
            "blocks": [],
            "words": []
        }

class PaddleEngine(BaseOCREngine):
    """Moteur secondaire d'analyse de disposition & comparaison"""
    
    def recognize_page(self, image_path: str, lang: str = "fra") -> Dict[str, Any]:
        return {
            "engine": "paddleocr",
            "text": "",
            "confidence": 94,
            "blocks": []
        }
