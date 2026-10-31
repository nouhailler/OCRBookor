"""
OCRBookor - Reconstruction des Paragraphes & Typographie
Gère les regroupements de lignes, les dialogues, les césures contextuelles et les règles de l'Imprimerie Nationale.
"""

import re
from typing import List, Dict, Any

LEGITIMATE_HYPHENS = {
    "grand-père", "grand-mère", "grand-chose", "rendez-vous", "peut-être", "arc-en-ciel",
    "après-midi", "va-t-en", "au-dessus", "au-dessous", "chou-fleur", "garde-fou",
    "tire-bouchon", "laissez-passer", "coffre-fort", "croque-monsieur", "porte-monnaie",
    "nord-est", "sud-ouest", "nord-ouest", "sud-est", "belle-sœur", "beau-frère", "avant-propos"
}

def dehyphenate_text(text: str) -> str:
    """
    Recolle les mots coupés en fin de ligne (ex: 'mouve-\nments' -> 'mouvements')
    tout en préservant les traits d'union légitimes des mots composés.
    """
    def _replace_hyphen(match):
        part1 = match.group(1)
        part2 = match.group(2)
        compound = f"{part1.lower()}-{part2.lower()}"
        if compound in LEGITIMATE_HYPHENS:
            return f"{part1}-{part2}"
        return f"{part1}{part2}"

    return re.sub(r'([a-zA-ZÀ-ÖØ-öø-ÿ]+)[-\xAD]\r?\n\s*([a-zA-ZÀ-ÖØ-öø-ÿ]+)', _replace_hyphen, text)

def apply_french_typography(text: str) -> str:
    """
    Normalise la typographie française selon l'Imprimerie Nationale :
    - Guillemets français avec espaces insécables
    - Espaces insécables avant !?;:%€$
    - Apostrophes courbes
    - Restauration des ligatures œ, æ
    - Tirets cadratins pour dialogues
    """
    if not text:
        return ""

    s = text
    # 1. Apostrophes courbes
    s = re.sub(r"(\w)'(\w)", r"\1’\2", s)

    # 2. Guillemets français
    s = re.sub(r'«\s*', '«\u00A0', s)
    s = re.sub(r'\s*»', '\u00A0»', s)
    s = re.sub(r'"([^"]+)"', '«\u00A0\\1\u00A0»', s)

    # 3. Espaces insécables avant ponctuations doubles
    s = re.sub(r'\s*([;!?:%€$£])', '\u00A0\\1', s)

    # 4. Tirets cadratins en début de ligne
    s = re.sub(r'(^|\n)[-–]\s+', '\\1—\u00A0', s)

    # 5. Ligatures œ
    s = re.sub(r'\b([cC])oeur\b', r'\1œur', s)
    s = re.sub(r'\b([oO])euvre\b', r'\1œuvre', s)
    s = re.sub(r'\b([nN])oeud\b', r'\1œud', s)
    s = re.sub(r'\b([vV])oeu\b', r'\1œu', s)
    s = re.sub(r'\b([sS])oeur\b', r'\1œur', s)

    # 6. Espaces multiples
    s = re.sub(r'[ \t]{2,}', ' ', s)
    return s

def build_paragraphs(raw_text: str) -> List[Dict[str, Any]]:
    """
    Regroupe les lignes brutes en paragraphes cohérents.
    """
    clean = dehyphenate_text(raw_text)
    raw_lines = clean.splitlines()
    paragraphs = []
    current_p = []

    for line in raw_lines:
        line_s = line.strip()
        if not line_s:
            if current_p:
                p_text = apply_french_typography(" ".join(current_p))
                paragraphs.append({"text": p_text, "type": "paragraph"})
                current_p = []
            continue

        if re.match(r'^—\s+', line_s) and current_p:
            p_text = apply_french_typography(" ".join(current_p))
            paragraphs.append({"text": p_text, "type": "paragraph"})
            current_p = [line_s]
        else:
            current_p.append(line_s)

    if current_p:
        p_text = apply_french_typography(" ".join(current_p))
        paragraphs.append({"text": p_text, "type": "paragraph"})

    return paragraphs
