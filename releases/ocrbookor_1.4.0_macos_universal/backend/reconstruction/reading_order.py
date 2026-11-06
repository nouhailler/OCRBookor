"""
OCRBookor - Détection des Colonnes et Ordre de Lecture
Trie les boîtes englobantes selon l'ordre naturel de lecture (haut en bas, gauche à droite).
"""

from typing import List, Dict, Any

class ReadingOrderSorter:
    @staticmethod
    def sort_blocks(blocks: List[Dict[str, Any]], multi_column: bool = False) -> List[Dict[str, Any]]:
        """
        Trie les blocs OCR par coordonnées [x0, y0, x1, y1].
        """
        if not multi_column:
            # Simple top-to-bottom sort with small vertical tolerance (e.g. 10px)
            return sorted(blocks, key=lambda b: (b.get("bbox", [0, 0, 0, 0])[1] // 10, b.get("bbox", [0, 0, 0, 0])[0]))

        # Two-column separation heuristic based on page center
        # Partition by X coordinate
        return sorted(blocks, key=lambda b: (0 if b.get("bbox", [0, 0, 0, 0])[0] < 400 else 1, b.get("bbox", [0, 0, 0, 0])[1]))
