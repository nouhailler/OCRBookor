"""
OCRBookor - Détection des Titres & Chapitres
Identifie les divisions éditoriales d'après la structure textuelle et les motifs typographiques.
"""

import re
from typing import List, Dict, Any

CHAPTER_KEYWORDS = re.compile(
    r'^(?:CHAPITRE|Chapitre|LIVRE|Livre|PARTIE|Partie|PROLOGUE|Prologue|ÉPILOGUE|Épilogue|INTRODUCTION|Introduction|PRÉFACE|Préface)\b',
    re.IGNORECASE
)

class HeadingDetector:
    @staticmethod
    def is_heading(text: str) -> bool:
        s = text.strip()
        if len(s) > 80:
            return False
        if CHAPTER_KEYWORDS.match(s):
            return True
        if s.isupper() and len(s) < 45 and not s.endswith("."):
            return True
        return False

class ChapterDetector:
    @staticmethod
    def detect_chapters(blocks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        chapters = []
        current_chapter = {
            "title": "Introduction",
            "level": 1,
            "blocks": []
        }

        found_explicit = False
        for b in blocks:
            text = (b.get("text") or "").strip()
            if HeadingDetector.is_heading(text):
                if current_chapter["blocks"]:
                    chapters.append(current_chapter)
                found_explicit = True
                current_chapter = {
                    "title": text,
                    "level": 1,
                    "blocks": [b]
                }
            else:
                current_chapter["blocks"].append(b)

        if current_chapter["blocks"]:
            chapters.append(current_chapter)

        if not chapters and blocks:
            chapters.append({
                "title": "Texte intégral",
                "level": 1,
                "blocks": blocks
            })

        return chapters
