#!/usr/bin/env bash
# ==============================================================================
# OCRBookor - Installateur Automatique macOS (1-ligne Terminal)
# Usage :
#   curl -sSL https://raw.githubusercontent.com/nouhailler/OCRBookor/main/scripts/macos/install-macos.sh | bash
# ==============================================================================
set -euo pipefail

VERSION="1.4.0"
INSTALL_DIR="$HOME/Applications/OCRBookor"

echo "================================================================="
echo "  Installation d'OCRBookor v$VERSION pour macOS Desktop"
echo "================================================================="

# 1. Vérification de Node.js
NODE_BIN=""
if command -v node >/dev/null 2>&1; then
  NODE_BIN="$(command -v node)"
elif [ -x "/opt/homebrew/bin/node" ]; then
  NODE_BIN="/opt/homebrew/bin/node"
elif [ -x "/usr/local/bin/node" ]; then
  NODE_BIN="/usr/local/bin/node"
fi

if [ -z "$NODE_BIN" ]; then
  echo "❌ Node.js est requis. Installez-le via Homebrew : brew install node"
  echo "Ou téléchargez-le sur https://nodejs.org"
  exit 1
fi
echo "✓ Node.js détecté : $NODE_BIN"

# 2. Vérification de Python 3
PYTHON_BIN=""
if command -v python3 >/dev/null 2>&1; then
  PYTHON_BIN="$(command -v python3)"
elif [ -x "/opt/homebrew/bin/python3" ]; then
  PYTHON_BIN="/opt/homebrew/bin/python3"
elif [ -x "/usr/local/bin/python3" ]; then
  PYTHON_BIN="/usr/local/bin/python3"
fi

if [ -z "$PYTHON_BIN" ]; then
  echo "❌ Python 3 est requis. Installez-le avec : brew install python"
  exit 1
fi
echo "✓ Python détecté : $PYTHON_BIN"

# 3. Création du dossier d'installation
mkdir -p "$INSTALL_DIR"

# 4. Téléchargement du binaire macOS Universal
ARCHIVE_NAME="ocrbookor_${VERSION}_macos_universal.zip"
DOWNLOAD_URL="https://github.com/nouhailler/OCRBookor/raw/main/releases/$ARCHIVE_NAME"
TEMP_ZIP="/tmp/$ARCHIVE_NAME"

echo "→ Téléchargement de l'archive macOS ($ARCHIVE_NAME)..."
if curl -sSL -f "$DOWNLOAD_URL" -o "$TEMP_ZIP" 2>/dev/null; then
  echo "✓ Archive téléchargée avec succès."
  echo "→ Décompression dans $INSTALL_DIR..."
  unzip -q -o "$TEMP_ZIP" -d "$INSTALL_DIR"
  rm -f "$TEMP_ZIP"
else
  echo "⚠️ Téléchargement distant non accessible. Recherche de l'archive locale..."
  if [ -f "./releases/$ARCHIVE_NAME" ]; then
    unzip -q -o "./releases/$ARCHIVE_NAME" -d "$INSTALL_DIR"
    echo "✓ Installé depuis l'archive locale."
  else
    echo "❌ Impossible de récupérer $ARCHIVE_NAME."
    exit 1
  fi
fi

# 5. Droits d'exécution
chmod +x "$INSTALL_DIR/ocrbookor.command" 2>/dev/null || true
chmod +x "$INSTALL_DIR/install-dependencies.sh" 2>/dev/null || true

# 6. Installation des dépendances Python
if [ -f "$INSTALL_DIR/requirements.txt" ]; then
  echo "→ Installation des modules Python OCR..."
  $PYTHON_BIN -m pip install -r "$INSTALL_DIR/requirements.txt" --quiet 2>/dev/null || true
fi

# 7. Création du raccourci sur le Bureau de l'utilisateur
DESKTOP_DIR="$HOME/Desktop"
if [ -d "$DESKTOP_DIR" ]; then
  ln -sf "$INSTALL_DIR/ocrbookor.command" "$DESKTOP_DIR/OCRBookor.command"
  echo "✓ Raccourci créé sur votre Bureau : $DESKTOP_DIR/OCRBookor.command"
fi

echo ""
echo "================================================================="
echo "✓ OCRBookor v$VERSION a été installé avec succès sur macOS !"
echo "================================================================="
echo "Pour démarrer :"
echo "  1. Double-cliquez sur OCRBookor.command sur votre Bureau"
echo "  2. Ou lancez dans le Terminal : $INSTALL_DIR/ocrbookor.command"
echo "L'application s'ouvrira automatiquement sur http://localhost:3000"
echo "================================================================="
