"""
Tests de Reconstruction Éditoriale (Typographie, Césures, Paragraphes)
"""

import unittest
from backend.reconstruction.paragraphs import dehyphenate_text, apply_french_typography, build_paragraphs
from backend.reconstruction.chapters import HeadingDetector

class TestReconstruction(unittest.TestCase):
    def test_dehyphenation_standard_word(self):
        # Regular word split across lines should be joined
        text = "Les mou-\nvements de la foule."
        res = dehyphenate_text(text)
        self.assertEqual(res, "Les mouvements de la foule.")

    def test_dehyphenation_legitimate_compound_word(self):
        # Legitimate French compound word should keep its hyphen
        text = "Mon grand-\npère observait."
        res = dehyphenate_text(text)
        self.assertEqual(res, "Mon grand-père observait.")

    def test_french_typography_quotes_and_spaces(self):
        # Straight quotes into French guillemets with non-breaking spaces
        text = '"Bonjour!"'
        res = apply_french_typography(text)
        self.assertEqual(res, "«\u00A0Bonjour\u00A0!\u00A0»")

    def test_french_typography_ligatures(self):
        # Ligatures restoration
        text = "Son coeur et son soeur dans cette oeuvre."
        res = apply_french_typography(text)
        self.assertIn("cœur", res)
        self.assertIn("sœur", res)
        self.assertIn("œuvre", res)

    def test_french_typography_dialogue_dash(self):
        # Dialogue hyphen to em-dash
        text = "- Comment allez-vous ?"
        res = apply_french_typography(text)
        self.assertTrue(res.startswith("—\u00A0"))

    def test_heading_detector(self):
        self.assertTrue(HeadingDetector.is_heading("CHAPITRE PREMIER"))
        self.assertTrue(HeadingDetector.is_heading("LIVRE DEUXIÈME"))
        self.assertFalse(HeadingDetector.is_heading("Ceci est un long paragraphe normal d'un roman."))

if __name__ == "__main__":
    unittest.main()
