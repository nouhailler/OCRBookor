"""
OCRBookor - Diagnostics des Anomalies de Numérisation
"""

import re
from typing import List, Dict, Any

class PageDiagnostics:
    @staticmethod
    def inspect_page_text(text: str, confidence: float) -> List[str]:
        anomalies = []
        if len(text.strip()) < 15:
            anomalies.append("Page quasi-vide ou échec de détection de texte")
            return anomalies

        # Check for repetitive garbage sequences (e.g. "||||||||", "......")
        if re.search(r'(.)\1{6,}', text):
            anomalies.append("Répétition anormale de caractères (bruit de trame)")

        # High ratio of non-letter characters
        total_chars = len(text)
        alphanumeric = len(re.findall(r'[a-zA-ZÀ-ÖØ-öø-ÿ0-9]', text))
        if total_chars > 0 and (alphanumeric / total_chars) < 0.65:
            anomalies.append("Proportion anormalement élevée de symboles parasites")

        if confidence > 0 and confidence < 65:
            anomalies.append(f"Score de confiance moyen faible ({confidence:.1f}%)")

        return anomalies
