#!/usr/bin/env bash
# ==============================================================================
# OCRBookor v1.4.0 - Lanceur macOS Desktop (Finder & Terminal)
# Double-cliquez sur ce fichier dans le Finder pour démarrer l'application.
# ==============================================================================

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$APP_DIR" || exit 1

# Dossier de données standard sur macOS
if [ -z "${OCRBOOKOR_DATA_DIR:-}" ]; then
  export OCRBOOKOR_DATA_DIR="$HOME/Library/Application Support/OCRBookor"
fi
mkdir -p "$OCRBOOKOR_DATA_DIR"

export NODE_ENV="production"
export PORT="3000"
export OCRBOOKOR_APP_ROOT="$APP_DIR"

echo "================================================================="
echo "  Démarrage d'OCRBookor v1.4.0 Desktop pour macOS"
echo "  URL locale : http://localhost:3000"
echo "  Dossier de données : $OCRBOOKOR_DATA_DIR"
echo "================================================================="

# 1. Détection de Node.js (PATH, Homebrew Apple Silicon, Homebrew Intel)
NODE_BIN=""
if command -v node >/dev/null 2>&1; then
  NODE_BIN="$(command -v node)"
elif [ -x "/opt/homebrew/bin/node" ]; then
  NODE_BIN="/opt/homebrew/bin/node"
elif [ -x "/usr/local/bin/node" ]; then
  NODE_BIN="/usr/local/bin/node"
fi

if [ -z "$NODE_BIN" ]; then
  echo ""
  echo "❌ [ERREUR] Node.js est introuvable sur votre Mac."
  echo ""
  echo "Pour installer Node.js :"
  echo "  - Via Homebrew : brew install node"
  echo "  - Ou installez le paquet officiel : https://nodejs.org"
  echo ""
  read -p "Appuyez sur Entrée pour quitter..."
  exit 1
fi

echo "✓ Node.js détecté : $NODE_BIN ($($NODE_BIN --version))"

# 2. Détection de Python 3
PYTHON_BIN=""
if command -v python3 >/dev/null 2>&1; then
  PYTHON_BIN="$(command -v python3)"
elif [ -x "/opt/homebrew/bin/python3" ]; then
  PYTHON_BIN="/opt/homebrew/bin/python3"
elif [ -x "/usr/local/bin/python3" ]; then
  PYTHON_BIN="/usr/local/bin/python3"
elif [ -x "/usr/bin/python3" ]; then
  PYTHON_BIN="/usr/bin/python3"
fi

if [ -n "$PYTHON_BIN" ]; then
  export PYTHON_BIN
  echo "✓ Python 3 détecté : $PYTHON_BIN ($($PYTHON_BIN --version))"
else
  echo "⚠️ [AVERTISSEMENT] Python 3 non détecté dans le PATH."
  echo "Installez Python via Homebrew : brew install python"
fi

# 3. Ouvrir automatiquement le navigateur par défaut dans macOS
(sleep 2 && open "http://localhost:3000") &

# 4. Lancement du serveur Node.js autonome
echo ""
echo "🚀 Serveur OCRBookor en cours d'exécution..."
echo "Fermez cette fenêtre Terminal pour arrêter l'application."
echo "================================================================="
"$NODE_BIN" "$APP_DIR/server.js"
