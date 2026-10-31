#!/usr/bin/env bash
# OCRBookor - Script d'Installation pour Debian 13 (Trixie) & Ubuntu
set -euo pipefail

echo "=========================================================="
echo "  Installation d'OCRBookor sur Debian 13 / Linux"
echo "=========================================================="

# 1. Vérification des droits
if [ "$EUID" -ne 0 ]; then
  echo "[-] Ce script doit être exécuté avec les droits sudo ou root."
  echo "    Usage : sudo bash scripts/install-debian.sh"
  exit 1
fi

echo "[1/4] Mise à jour des dépôts de paquets..."
apt-get update -qq

echo "[2/4] Installation des dépendances système (Tesseract, Poppler, Python, Node.js)..."
apt-get install -y -qq \
    tesseract-ocr \
    tesseract-ocr-fra \
    tesseract-ocr-fra-old \
    tesseract-ocr-eng \
    poppler-utils \
    libgl1 \
    libglib2.0-0 \
    python3 \
    python3-pip \
    python3-venv \
    nodejs \
    npm

echo "[3/4] Vérification de Tesseract OCR..."
tesseract --version | head -n 1
echo "Langues OCR installées :"
tesseract --list-langs

echo "[4/4] Installation des paquets Python du backend..."
python3 -m pip install -r requirements.txt || true

echo "=========================================================="
echo "  Installation terminée avec succès !"
echo "  Pour lancer l'application :"
echo "  ./scripts/start.sh"
echo "=========================================================="
