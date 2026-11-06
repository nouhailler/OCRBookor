"""
Tests d'Exportation EPUB 3 et Markdown
"""

import unittest
import tempfile
import zipfile
from pathlib import Path
from backend.export.epub import EPUBExporter
from backend.export.markdown import MarkdownExporter

class TestExport(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.TemporaryDirectory()
        self.sample_project = {
            "id": "test-book-01",
            "metadata": {
                "title": "Livre de Test",
                "author": "Auteur Test",
                "language": "fra"
            },
            "chapters": [
                {
                    "title": "Chapitre I",
                    "blocks": [{"text": "Premier paragraphe du livre de test."}]
                }
            ]
        }

    def tearDown(self):
        self.test_dir.cleanup()

    def test_epub3_structure(self):
        epub_path = Path(self.test_dir.name) / "test.epub"
        res = EPUBExporter.generate_epub(self.sample_project, epub_path)
        self.assertTrue(res)
        self.assertTrue(epub_path.exists())

        # Verify ZIP compliance
        with zipfile.ZipFile(epub_path, "r") as zf:
            namelist = zf.namelist()
            # mimetype must be first file
            self.assertEqual(namelist[0], "mimetype")
            self.assertEqual(zf.read("mimetype"), b"application/epub+zip")
            # Required EPUB 3 structure files
            self.assertIn("META-INF/container.xml", namelist)
            self.assertIn("OEBPS/content.opf", namelist)
            self.assertIn("OEBPS/nav.xhtml", namelist)
            self.assertIn("OEBPS/styles.css", namelist)
            self.assertIn("OEBPS/chapter_1.xhtml", namelist)

    def test_markdown_export(self):
        md_path = Path(self.test_dir.name) / "test.md"
        res = MarkdownExporter.export(self.sample_project, md_path)
        self.assertTrue(res)
        content = md_path.read_text(encoding="utf-8")
        self.assertIn("# Livre de Test", content)
        self.assertIn("## Chapitre I", content)
        self.assertIn("Premier paragraphe du livre de test.", content)

if __name__ == "__main__":
    unittest.main()
