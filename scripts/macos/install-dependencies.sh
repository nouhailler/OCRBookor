#!/usr/bin/env bash
# ==============================================================================
# OCRBookor - Assistant d'installation des dépendances macOS (Homebrew & Python)
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$SCRIPT_DIR"

echo "================================================================="
echo "  OCRBookor - Assistant de Dépendances pour macOS"
echo "================================================================="

# 1. Vérification de Homebrew
if ! command -v brew >/dev/null 2>&1; then
  echo "ℹ️ Note: Homebrew n'est pas installé. Il est recommandé pour tesseract et python :"
  echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
fi

# 2. Détection de Python 3
PYTHON_BIN=""
if command -v python3 >/dev/null 2>&1; then
  PYTHON_BIN="$(command -v python3)"
elif [ -x "/opt/homebrew/bin/python3" ]; then
  PYTHON_BIN="/opt/homebrew/bin/python3"
elif [ -x "/usr/local/bin/python3" ]; then
  PYTHON_BIN="/usr/local/bin/python3"
fi

if [ -z "$PYTHON_BIN" ]; then
  echo "❌ Python 3 est introuvable. Installez-le avec : brew install python"
  exit 1
fi

echo "✓ Python 3 trouvé : $PYTHON_BIN ($($PYTHON_BIN --version))"

# 3. Installation des modules Python
echo "→ Installation / mise à niveau des modules OCR dans l'environnement Python..."
$PYTHON_BIN -m pip install --upgrade pip --quiet 2>/dev/null || true
if [ -f "$ROOT_DIR/requirements.txt" ]; then
  $PYTHON_BIN -m pip install -r "$ROOT_DIR/requirements.txt"
fi

# 4. Vérification de Tesseract OCR
if command -v tesseract >/dev/null 2>&1; then
  echo "✓ Tesseract OCR détecté : $(tesseract --version 2>&1 | head -n 1)"
else
  echo "ℹ️ Pour un support OCR hors-ligne optimal sous macOS, installez Tesseract :"
  echo "   brew install tesseract tesseract-lang"
fi

echo ""
echo "================================================================="
echo "✓ Dépendances prêtes ! Vous pouvez lancer : ./ocrbookor.command"
echo "================================================================="
