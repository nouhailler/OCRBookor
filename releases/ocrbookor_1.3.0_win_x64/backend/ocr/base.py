"""
OCRBookor - Interface Abstraite pour Moteurs OCR
"""

from abc import ABC, abstractmethod
from pathlib import Path
from typing import Dict, Any, List

class BaseOCREngine(ABC):
    @property
    @abstractmethod
    def engine_name(self) -> str:
        """Nom identifiant du moteur (ex: 'tesseract', 'paddleocr')"""
        pass

    @abstractmethod
    def is_available(self) -> bool:
        """Vérifie si le binaire ou la bibliothèque est installée et opérationnelle"""
        pass

    @abstractmethod
    def get_supported_languages(self) -> List[str]:
        """Retourne la liste des codes langues installés (ex: ['fra', 'eng'])"""
        pass

    @abstractmethod
    def recognize_page(self, image_path: Path, lang: str = "fra") -> Dict[str, Any]:
        """
        Exécute la reconnaissance sur l'image et retourne les blocs, les coordonnées et confidences.
        Doit lever une exception si le moteur échoue (aucune simulation).
        """
        pass
