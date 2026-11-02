#!/usr/bin/env bash
# ==============================================================================
# OCRBookor - Script d'installation automatique en ligne de commande
# Usage: curl -sSL https://raw.githubusercontent.com/nouhailler/OCRBookor/main/install.sh | sudo bash
# ==============================================================================
set -euo pipefail

REPO="nouhailler/OCRBookor"
DEFAULT_VERSION="1.2.0"
DEB_NAME="ocrbookor_${DEFAULT_VERSION}_amd64.deb"
TEMP_DEB="/tmp/${DEB_NAME}"

# Couleurs pour le terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
AMBER='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=================================================================${NC}"
echo -e "${BLUE}  Installation d'OCRBookor (Dernière version Linux x86_64)${NC}"
echo -e "${BLUE}=================================================================${NC}"

# 1. Vérification des droits administrateur
if [ "$(id -u)" -ne 0 ]; then
  echo -e "${RED}❌ Ce script nécessite les privilèges administrateur (root ou sudo).${NC}"
  echo -e "Veuillez relancer avec :"
  echo -e "  curl -sSL https://raw.githubusercontent.com/nouhailler/OCRBookor/main/install.sh | sudo bash"
  exit 1
fi

# 2. Vérification de l'architecture
ARCH=$(uname -m)
if [ "$ARCH" != "x86_64" ]; then
  echo -e "${RED}❌ Architecture non supportée : $ARCH (seul amd64 / x86_64 est actuellement fourni).${NC}"
  exit 1
fi

# 3. Vérification des outils de téléchargement
if ! command -v curl >/dev/null 2>&1 && ! command -v wget >/dev/null 2>&1; then
  echo -e "${AMBER}→ Installation de curl...${NC}"
  apt-get update -qq && apt-get install -y -qq curl
fi

# 4. Téléchargement du binaire Debian officiel
DOWNLOAD_URL="https://github.com/${REPO}/raw/main/releases/${DEB_NAME}"
echo -e "→ Téléchargement de ${AMBER}${DEB_NAME}${NC}..."
if command -v curl >/dev/null 2>&1; then
  curl -sSL -L "$DOWNLOAD_URL" -o "$TEMP_DEB"
else
  wget -q -O "$TEMP_DEB" "$DOWNLOAD_URL"
fi

# Vérification que le fichier téléchargé n'est pas vide
if [ ! -s "$TEMP_DEB" ]; then
  echo -e "${RED}❌ Échec du téléchargement du paquet Debian.${NC}"
  rm -f "$TEMP_DEB"
  exit 1
fi

# 5. Installation du paquet .deb
echo -e "→ Installation du paquet système avec dpkg..."
dpkg -i "$TEMP_DEB" || true

# 6. Résolution automatique des dépendances (Node.js, Python, etc.)
echo -e "→ Résolution des dépendances système..."
apt-get update -qq
apt-get install -f -y -qq

# 7. Nettoyage
rm -f "$TEMP_DEB"

# 8. Confirmation de l'installation
if command -v ocrbookor >/dev/null 2>&1; then
  echo -e "\n${GREEN}=================================================================${NC}"
  echo -e "${GREEN}  ✓ OCRBookor v${DEFAULT_VERSION} a été installé avec succès !${NC}"
  echo -e "${GREEN}=================================================================${NC}"
  echo -e "Exécutable : /usr/bin/ocrbookor"
  echo -e "Pour démarrer l'application, tapez simplement dans votre terminal :"
  echo -e "\n    ${AMBER}ocrbookor${NC}\n"
  echo -e "Ou lancez « OCRBookor » depuis le menu des applications de votre bureau."
  echo -e "L'application s'ouvrira sur http://localhost:3000."
  echo -e "${GREEN}=================================================================${NC}\n"
else
  echo -e "${RED}⚠️ L'installation s'est terminée mais l'exécutable n'a pas été trouvé dans le PATH.${NC}"
  exit 1
fi
