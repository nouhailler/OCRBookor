"""
Tests d'Import et Validation des Fichiers PDF
"""

import unittest
import tempfile
from pathlib import Path
from backend.pdf.importer import PDFImporter
from backend.core.exceptions import InvalidPDFError

class TestPDFImporter(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.TemporaryDirectory()

    def tearDown(self):
        self.test_dir.cleanup()

    def test_nonexistent_file(self):
        fake_path = Path(self.test_dir.name) / "nonexistent.pdf"
        with self.assertRaises(InvalidPDFError):
            PDFImporter.validate_file(fake_path)

    def test_empty_file(self):
        empty_path = Path(self.test_dir.name) / "empty.pdf"
        empty_path.write_bytes(b"")
        with self.assertRaises(InvalidPDFError):
            PDFImporter.validate_file(empty_path)

    def test_invalid_header(self):
        bad_path = Path(self.test_dir.name) / "not_a_pdf.pdf"
        bad_path.write_bytes(b"Hello world this is not a PDF")
        with self.assertRaises(InvalidPDFError):
            PDFImporter.validate_file(bad_path)

    def test_valid_pdf_header(self):
        valid_path = Path(self.test_dir.name) / "valid.pdf"
        valid_path.write_bytes(b"%PDF-1.4 sample pdf content stream")
        res = PDFImporter.validate_file(valid_path)
        self.assertTrue(res["valid"])
        self.assertEqual(res["file_name"], "valid.pdf")

if __name__ == "__main__":
    unittest.main()
