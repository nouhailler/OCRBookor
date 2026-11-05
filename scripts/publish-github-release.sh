#!/usr/bin/env bash
# ==============================================================================
# OCRBookor - Publication automatique d'une Release avec binaire sur GitHub
# ==============================================================================
set -euo pipefail

REPO_OWNER="nouhailler"
REPO_NAME="OCRBookor"
TAG_NAME="v1.3.0"
RELEASE_TITLE="OCRBookor v1.3.0 — Release Bilingue (FR/EN) & PWA Landing"
DEB_PATH="releases/ocrbookor_1.3.0_amd64.deb"
DEB_FILENAME="ocrbookor_1.3.0_amd64.deb"

echo "================================================================="
echo "  OCRBookor - Publication GitHub Release avec binaire .deb (v1.3.0)"
echo "================================================================="

if [ ! -f "$DEB_PATH" ]; then
  echo "⚠️ Binaire introuvable à $DEB_PATH, génération en cours..."
  ./scripts/build-deb.sh
fi

DEB_SIZE=$(stat -c%s "$DEB_PATH" 2>/dev/null || stat -f%z "$DEB_PATH")
echo "✓ Binaire détecté : $DEB_PATH (${DEB_SIZE} octets)"

# Récupération du jeton GitHub
TOKEN="${GITHUB_TOKEN:-${GH_TOKEN:-}}"
if [ -z "$TOKEN" ]; then
  if [ -t 0 ]; then
    echo ""
    echo "Un jeton d'accès personnel GitHub (Personal Access Token avec permission 'contents: write') est requis."
    echo "Vous pouvez le créer sur : https://github.com/settings/tokens/new?scopes=repo"
    read -r -s -p "Entrez votre jeton GitHub (masqué) : " TOKEN
    echo ""
  else
    echo "❌ Erreur : variable GITHUB_TOKEN ou GH_TOKEN non définie."
    echo "Usage : GITHUB_TOKEN=ghp_xxxx ./scripts/publish-github-release.sh"
    exit 1
  fi
fi

if [ -z "$TOKEN" ]; then
  echo "❌ Jeton vide, abandon."
  exit 1
fi

echo "→ Vérification / Création de la release $TAG_NAME sur GitHub ($REPO_OWNER/$REPO_NAME)..."

RELEASE_NOTES=$(cat << 'EOF'
## 🚀 OCRBookor v1.3.0 — Internationalisation Complète (FR/EN), PWA Landing & curl Installer

Suite logicielle locale et souveraine de numérisation, reconnaissance OCR et reconstruction de livres imprimés vers EPUB 3, Markdown, TXT et HTML.

### 📦 Fichier Binaire Inclus
- **`ocrbookor_1.3.0_amd64.deb`** : Paquet d'installation natif Linux pour Debian (12 / 13 Trixie), Ubuntu (22.04 / 24.04 LTS), Linux Mint.

### ⚡ Installation Express en 1 ligne (Recommandée)
```bash
curl -sSL https://raw.githubusercontent.com/nouhailler/OCRBookor/main/install.sh | sudo bash
```

### 🔧 Installation Manuelle sur Linux Desktop
```bash
# Télécharger et installer le paquet .deb
sudo dpkg -i ocrbookor_1.3.0_amd64.deb
sudo apt-get install -f

# Lancer OCRBookor
ocrbookor
```

### 🌟 Nouveautés de la Version v1.3.0
- 🌐 **Internationalisation Complète (i18n) :** Application intégralement bilingue (Français & Anglais) avec sélecteur `FR / EN` dynamique et persistance locale.
- 📱 **Landing Page PWA en Anglais :** Version anglaise autonome (`/en`) déployable sur Cloudflare Pages avec routage automatique et mise en cache hors-ligne.
- 🚀 **Script d'installation `curl` :** Déploiement automatisé sans téléchargement manuel préalable.
- 📚 **Documentation Bilingue :** `README.en.md`, en-tête multilingue du `README.md` et rapport `docs/INTERNATIONALIZATION_EN_REPORT.md`.
- 🧪 **Suite de tests i18n automatisée :** Validation de parité à 100% (444 clés vérifiées).
EOF
)

# 1. Vérifier si la release existe déjà
EXISTING_RELEASE=$(curl -s \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/releases/tags/$TAG_NAME)

RELEASE_ID=$(echo "$EXISTING_RELEASE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('id', ''))" 2>/dev/null || echo "")

if [ -n "$RELEASE_ID" ] && [ "$RELEASE_ID" != "None" ] && [ "$RELEASE_ID" != "" ]; then
  echo "✓ Release existante trouvée (ID: $RELEASE_ID)"
else
  echo "→ Création de la release $TAG_NAME..."
  CREATE_PAYLOAD=$(python3 -c "import json, sys; print(json.dumps({
    'tag_name': sys.argv[1],
    'target_commitish': 'main',
    'name': sys.argv[2],
    'body': sys.argv[3],
    'draft': False,
    'prerelease': False
  }))" "$TAG_NAME" "$RELEASE_TITLE" "$RELEASE_NOTES")

  CREATE_RES=$(curl -s -X POST \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer $TOKEN" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/releases \
    -d "$CREATE_PAYLOAD")

  RELEASE_ID=$(echo "$CREATE_RES" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('id', ''))" 2>/dev/null || echo "")

  if [ -z "$RELEASE_ID" ] || [ "$RELEASE_ID" = "None" ]; then
    echo "❌ Échec de la création de la release :"
    echo "$CREATE_RES"
    exit 1
  fi
  echo "✓ Release créée avec succès ! (ID: $RELEASE_ID)"
fi

# 2. Supprimer un ancien asset de même nom si présent
EXISTING_ASSETS=$(curl -s \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/releases/$RELEASE_ID/assets)

ASSET_ID=$(echo "$EXISTING_ASSETS" | python3 -c "import sys, json
assets = json.load(sys.stdin)
if isinstance(assets, list):
    for a in assets:
        if a.get('name') == '$DEB_FILENAME':
            print(a.get('id'))
            break
" 2>/dev/null || echo "")

if [ -n "$ASSET_ID" ] && [ "$ASSET_ID" != "None" ]; then
  echo "→ Suppression de l'ancien binaire attaché (Asset ID: $ASSET_ID)..."
  curl -s -X DELETE \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer $TOKEN" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/releases/assets/$ASSET_ID > /dev/null
  echo "✓ Ancien asset supprimé."
fi

# 3. Téléversement du binaire .deb
echo "→ Téléversement du binaire $DEB_FILENAME (${DEB_SIZE} octets) vers GitHub..."

UPLOAD_RES=$(curl -s -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  -H "Content-Type: application/vnd.debian.binary-package" \
  "https://uploads.github.com/repos/$REPO_OWNER/$REPO_NAME/releases/$RELEASE_ID/assets?name=$DEB_FILENAME" \
  --data-binary @"$DEB_PATH")

DOWNLOAD_URL=$(echo "$UPLOAD_RES" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('browser_download_url', ''))" 2>/dev/null || echo "")

if [ -n "$DOWNLOAD_URL" ] && [ "$DOWNLOAD_URL" != "None" ]; then
  echo ""
  echo "================================================================="
  echo "  ✓ SUCCÈS ! Binaire téléversé sur la Release GitHub"
  echo "================================================================="
  echo "Lien de la release : https://github.com/$REPO_OWNER/$REPO_NAME/releases/tag/$TAG_NAME"
  echo "Téléchargement direct du binaire : $DOWNLOAD_URL"
  echo "================================================================="
else
  echo "❌ Erreur lors du téléversement de l'asset :"
  echo "$UPLOAD_RES"
  exit 1
fi
