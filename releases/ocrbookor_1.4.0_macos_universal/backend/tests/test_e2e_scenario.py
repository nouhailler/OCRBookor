"""
OCRBookor - Test Scénario E2E Complet (Intégration Bout en Bout)
Valide le parcours complet :
1. Initialisation de la base de données SQLite
2. Création de projet
3. Enregistrement des pages et blocs OCR
4. Correction textuelle manuelle avec journal d'audit
5. Génération et vérification des exports EPUB 3, Markdown, TXT et HTML
6. Validation de l'intégrité de l'archive EPUB 3 selon la norme IDPF
7. Calcul strict des métriques CER/WER
"""

import unittest
import json
import zipfile
import tempfile
import shutil
from pathlib import Path

from backend.core.database import get_db_connection, init_db
from backend.core.storage import ProjectStorage
from backend.export.epub import EPUBExporter
from backend.export.markdown import MarkdownExporter, TextExporter, HTMLExporter
from backend.quality.confidence import evaluate_quality_metrics, calculate_cer, calculate_wer

class TestE2EScenario(unittest.TestCase):
    def setUp(self):
        init_db()
        self.project_id = "e2e-test-projet-001"
        self.storage = ProjectStorage(self.project_id)

    def tearDown(self):
        # Clean database record
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM projects WHERE id = ?", (self.project_id,))
        cursor.execute("DELETE FROM pages WHERE project_id = ?", (self.project_id,))
        cursor.execute("DELETE FROM corrections WHERE block_id LIKE ?", (f"{self.project_id}%",))
        conn.commit()
        conn.close()

        # Clean filesystem
        self.storage.delete_project_data()

    def test_full_document_lifecycle(self):
        # 1. Création de projet
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO projects (id, title, author, language, status)
            VALUES (?, ?, ?, ?, ?)
        """, (self.project_id, "Traité de Minéralogie", "René Just Haüy", "fra", "ocr_en_cours"))
        conn.commit()

        # 2. Ajout de pages avec texte brut OCR
        page_1_text = "CHAPITRE PREMIER.\nDe la structure des cristaux en général."
        page_2_text = "Tous les corps organisés offrent une forme déterminée."

        cursor.execute("""
            INSERT INTO pages (id, project_id, page_number, width, height, dpi, raw_text, confidence)
            VALUES (?, ?, 1, 1400, 2100, 300, ?, 88.5)
        """, (f"{self.project_id}-page-1", self.project_id, page_1_text))

        cursor.execute("""
            INSERT INTO pages (id, project_id, page_number, width, height, dpi, raw_text, confidence)
            VALUES (?, ?, 2, 1400, 2100, 300, ?, 92.0)
        """, (f"{self.project_id}-page-2", self.project_id, page_2_text))
        conn.commit()

        # 3. Correction manuelle sur la page 1
        corrected_p1 = "CHAPITRE PREMIER.\nDe la structure des cristaux en général et de leurs lois."
        cursor.execute("""
            UPDATE pages SET raw_text = ?, validated = 1 WHERE id = ?
        """, (corrected_p1, f"{self.project_id}-page-1"))

        cursor.execute("""
            INSERT INTO corrections (id, block_id, original_text, corrected_text)
            VALUES (?, ?, ?, ?)
        """, ("corr-001", f"{self.project_id}-page-1", page_1_text, corrected_p1))
        conn.commit()

        # Vérification persistance correction
        cursor.execute("SELECT raw_text, validated FROM pages WHERE id = ?", (f"{self.project_id}-page-1",))
        updated_row = cursor.fetchone()
        self.assertEqual(updated_row["raw_text"], corrected_p1)
        self.assertEqual(updated_row["validated"], 1)

        cursor.execute("SELECT * FROM corrections WHERE block_id = ?", (f"{self.project_id}-page-1",))
        corr_row = cursor.fetchone()
        self.assertIsNotNone(corr_row)
        self.assertEqual(corr_row["original_text"], page_1_text)
        self.assertEqual(corr_row["corrected_text"], corrected_p1)
        conn.close()

        # 4. Exports (EPUB 3, Markdown, Text, HTML)
        project_payload = {
            "id": self.project_id,
            "metadata": {
                "title": "Traité de Minéralogie",
                "author": "René Just Haüy",
                "language": "fra"
            },
            "chapters": [
                {
                    "title": "Chapitre I",
                    "blocks": [{"text": corrected_p1}]
                },
                {
                    "title": "Chapitre II",
                    "blocks": [{"text": page_2_text}]
                }
            ]
        }

        # 4.a EPUB 3
        epub_file = self.storage.exports_dir / "traite_mineralogie.epub"
        res_epub = EPUBExporter.generate_epub(project_payload, epub_file)
        self.assertTrue(res_epub)
        self.assertTrue(epub_file.exists())
        self.assertGreater(epub_file.stat().st_size, 500)

        # Vérification conformité EPUB 3
        with zipfile.ZipFile(epub_file, "r") as zf:
            files = zf.namelist()
            self.assertEqual(files[0], "mimetype")
            self.assertEqual(zf.read("mimetype"), b"application/epub+zip")
            self.assertIn("META-INF/container.xml", files)
            self.assertIn("OEBPS/content.opf", files)
            self.assertIn("OEBPS/chapter_1.xhtml", files)
            ch1_content = zf.read("OEBPS/chapter_1.xhtml").decode("utf-8")
            self.assertIn("De la structure des cristaux", ch1_content)

        # 4.b Markdown
        md_file = self.storage.exports_dir / "traite_mineralogie.md"
        res_md = MarkdownExporter.export(project_payload, md_file)
        self.assertTrue(res_md)
        self.assertTrue(md_file.exists())
        md_text = md_file.read_text(encoding="utf-8")
        self.assertIn("# Traité de Minéralogie", md_text)
        self.assertIn("## Chapitre I", md_text)
        self.assertIn(corrected_p1, md_text)

        # 4.c Text Brut
        txt_file = self.storage.exports_dir / "traite_mineralogie.txt"
        res_txt = TextExporter.export(project_payload, txt_file)
        self.assertTrue(res_txt)
        txt_content = txt_file.read_text(encoding="utf-8")
        self.assertIn("TRAITÉ DE MINÉRALOGIE", txt_content)

        # 4.d HTML
        html_file = self.storage.exports_dir / "traite_mineralogie.html"
        res_html = HTMLExporter.export(project_payload, html_file)
        self.assertTrue(res_html)
        html_content = html_file.read_text(encoding="utf-8")
        self.assertIn("<!DOCTYPE html>", html_content)
        self.assertIn("René Just Haüy", html_content)

        # 5. Métriques qualité CER & WER
        metrics_no_truth = evaluate_quality_metrics(page_1_text, 88.5, ground_truth=None)
        self.assertIsNone(metrics_no_truth["cer"])
        self.assertIsNone(metrics_no_truth["wer"])
        self.assertFalse(metrics_no_truth["has_ground_truth"])

        # Avec vérité terrain
        ground_truth = "CHAPITRE PREMIER.\nDe la structure des cristaux en général."
        metrics_with_truth = evaluate_quality_metrics(page_1_text, 88.5, ground_truth=ground_truth)
        self.assertEqual(metrics_with_truth["cer"], 0.0)
        self.assertEqual(metrics_with_truth["wer"], 0.0)
        self.assertTrue(metrics_with_truth["has_ground_truth"])

if __name__ == "__main__":
    unittest.main()
