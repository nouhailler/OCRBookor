"""
OCRBookor - Moteur Tesseract OCR Réel
Exécute la reconnaissance Tesseract native avec extraction des coordonnées TSV et confidences.
"""

import subprocess
import shutil
import csv
import io
from pathlib import Path
from typing import Dict, Any, List
from backend.ocr.base import BaseOCREngine
from backend.core.exceptions import OCREngineNotInstalledError, LanguageNotAvailableError

class TesseractEngine(BaseOCREngine):
    def __init__(self, cmd: str = "tesseract"):
        self.cmd = cmd

    @property
    def engine_name(self) -> str:
        return "tesseract"

    def is_available(self) -> bool:
        return shutil.which(self.cmd) is not None

    def get_supported_languages(self) -> List[str]:
        if not self.is_available():
            return []
        try:
            res = subprocess.run([self.cmd, "--list-langs"], capture_output=True, text=True, check=True)
            lines = res.stdout.strip().split("\n")
            # First line is usually "List of available languages..."
            return [line.strip() for line in lines[1:] if line.strip()]
        except Exception:
            return []

    def recognize_page(self, image_path: Path, lang: str = "fra") -> Dict[str, Any]:
        if not self.is_available():
            raise OCREngineNotInstalledError("Tesseract OCR n'est pas installé sur le système (apt install tesseract-ocr)")

        langs = self.get_supported_languages()
        if lang not in langs and f"{lang}" not in langs:
            # Fallback to fra if available or first installed
            if "fra" in langs:
                lang = "fra"
            elif "eng" in langs:
                lang = "eng"
            elif langs:
                lang = langs[0]
            else:
                raise LanguageNotAvailableError(f"Aucune langue OCR installée pour Tesseract.")

        # Execute Tesseract with TSV output for full layout and word confidence
        cmd = [self.cmd, str(image_path), "stdout", "-l", lang, "tsv"]
        proc = subprocess.run(cmd, capture_output=True, text=True)

        if proc.returncode != 0:
            raise RuntimeError(f"Échec de l'exécution Tesseract : {proc.stderr}")

        tsv_data = proc.stdout
        blocks: List[Dict[str, Any]] = []
        words: List[Dict[str, Any]] = []
        lines_text: List[str] = []
        total_conf = 0.0
        word_count = 0

        reader = csv.DictReader(io.StringIO(tsv_data), delimiter="\t")
        current_line_words: List[str] = []

        for row in reader:
            text = (row.get("text") or "").strip()
            conf_str = row.get("conf") or "-1"
            try:
                conf = float(conf_str)
            except ValueError:
                conf = -1.0

            if conf >= 0 and text:
                total_conf += conf
                word_count += 1
                current_line_words.append(text)
                words.append({
                    "word": text,
                    "confidence": round(conf, 1),
                    "bbox": [
                        int(row.get("left", 0)),
                        int(row.get("top", 0)),
                        int(row.get("left", 0)) + int(row.get("width", 0)),
                        int(row.get("top", 0)) + int(row.get("height", 0))
                    ]
                })

        full_text = " ".join([w["word"] for w in words])
        avg_confidence = round(total_conf / max(1, word_count), 1) if word_count > 0 else 0.0

        return {
            "engine": "tesseract",
            "lang": lang,
            "text": full_text,
            "confidence": avg_confidence,
            "word_count": word_count,
            "words": words,
            "blocks": blocks
        }
