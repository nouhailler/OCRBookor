#!/usr/bin/env bash
# OCRBookor - Vérificateur de Dépendances Système & Moteurs OCR
set -uo pipefail

echo "=========================================================="
echo "  Vérification de l'environnement OCRBookor"
echo "=========================================================="

echo -n "• Python 3 : "
if command -v python3 &>/dev/null; then
  python3 --version
else
  echo "NON INSTALLÉ (requis)"
fi

echo -n "• Node.js : "
if command -v node &>/dev/null; then
  node --version
else
  echo "NON INSTALLÉ (requis)"
fi

echo -n "• Tesseract OCR : "
if command -v tesseract &>/dev/null; then
  tesseract --version | head -n 1
  echo -n "  Modèles linguistiques détectés : "
  tesseract --list-langs | tr '\n' ' '
  echo ""
else
  echo "NON INSTALLÉ (apt install tesseract-ocr tesseract-ocr-fra)"
fi

echo -n "• PaddleOCR (Python) : "
if python3 -c "import paddleocr" &>/dev/null; then
  echo "INSTALLÉ & DISPONIBLE"
else
  echo "NON INSTALLÉ (optionnel, pour second passage avancé)"
fi

echo -n "• Poppler (pdftoppm) : "
if command -v pdftoppm &>/dev/null; then
  echo "INSTALLÉ"
else
  echo "NON INSTALLÉ (apt install poppler-utils)"
fi

echo "=========================================================="
