"""
Tests du Calculateur de Qualité et Exactitude (CER, WER, Levenshtein)
"""

import unittest
from backend.quality.confidence import levenshtein_distance, calculate_cer, calculate_wer, evaluate_quality_metrics
from backend.quality.diagnostics import PageDiagnostics

class TestQuality(unittest.TestCase):
    def test_levenshtein_identical(self):
        self.assertEqual(levenshtein_distance("bonjour", "bonjour"), 0)

    def test_levenshtein_differences(self):
        # 1 substitution ('a' -> 'e')
        self.assertEqual(levenshtein_distance("chat", "chet"), 1)
        # 1 deletion
        self.assertEqual(levenshtein_distance("chat", "cha"), 1)
        # 1 insertion
        self.assertEqual(levenshtein_distance("chat", "chats"), 1)

    def test_cer_calculation(self):
        ref = "La belle maison"
        hyp = "La bale maison"  # 1 deletion, 1 substitution
        cer = calculate_cer(hyp, ref)
        self.assertIsNotNone(cer)
        self.assertGreater(cer, 0.0)

    def test_wer_calculation(self):
        ref = "Le chat noir dort"
        hyp = "Le chat blanc dort"  # 1 word substitution out of 4 words -> 25%
        wer = calculate_wer(hyp, ref)
        self.assertEqual(wer, 25.0)

    def test_empty_reference_returns_none(self):
        # CER/WER should be None if no reference ground truth is provided
        metrics = evaluate_quality_metrics("Texte extrait sans référence", 95.0, ground_truth=None)
        self.assertIsNone(metrics["cer"])
        self.assertIsNone(metrics["wer"])
        self.assertFalse(metrics["has_ground_truth"])

    def test_diagnostics_repetitive_noise(self):
        anomalies = PageDiagnostics.inspect_page_text("Texte avec bruit |||||||||||| parasite", 90.0)
        self.assertTrue(any("Répétition" in a for a in anomalies))

    def test_diagnostics_empty_page(self):
        anomalies = PageDiagnostics.inspect_page_text("   ", 0.0)
        self.assertTrue(any("quasi-vide" in a for a in anomalies))

if __name__ == "__main__":
    unittest.main()
