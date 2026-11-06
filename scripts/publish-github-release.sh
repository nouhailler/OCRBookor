#!/usr/bin/env bash
# ==============================================================================
# OCRBookor - Publication automatique d'une Release Multi-Plateforme sur GitHub
# ==============================================================================
set -euo pipefail

REPO_OWNER="nouhailler"
REPO_NAME="OCRBookor"
TAG_NAME="v1.3.0"
RELEASE_TITLE="OCRBookor v1.3.0 — Release Multi-Plateforme (Linux & Windows) & PWA"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
RELEASES_DIR="$ROOT_DIR/releases"

echo "================================================================="
echo "  OCRBookor - Publication GitHub Release v1.3.0 (Linux & Windows)"
echo "================================================================="

# 1. Vérification / Fabrication des binaires locaux
if [ ! -f "$RELEASES_DIR/ocrbookor_1.3.0_amd64.deb" ]; then
  echo "→ Fabrication du paquet Debian (.deb)..."
  bash "$ROOT_DIR/scripts/build-deb.sh"
fi

if [ ! -f "$RELEASES_DIR/ocrbookor_1.3.0_win_x64.zip" ]; then
  echo "→ Fabrication de l'archive portable Windows (.zip)..."
  node "$ROOT_DIR/scripts/build-windows.mjs"
fi

# Recalcul de SHA256SUMS.txt
cd "$RELEASES_DIR"
sha256sum *.* > SHA256SUMS.txt 2>/dev/null || true
cd "$ROOT_DIR"

# 2. Récupération du jeton GitHub
TOKEN="${GITHUB_TOKEN:-${GH_TOKEN:-}}"
if [ -z "$TOKEN" ]; then
  if [ -t 0 ]; then
    echo ""
    echo "Un jeton d'accès personnel GitHub (Personal Access Token avec permission 'contents: write') est requis."
    echo "Vous pouvez le créer en 1 clic sur : https://github.com/settings/tokens/new?scopes=repo"
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
## 🚀 OCRBookor v1.3.0 — Release Multi-Plateforme (Linux & Windows) & PWA

Application locale et souveraine de numérisation, reconnaissance OCR et reconstruction éditoriale de livres imprimés vers EPUB 3, Markdown, TXT et HTML.

---

### 📦 Fichiers et Installateurs Téléchargeables

| Plateforme | Type | Fichier | Description |
| :--- | :--- | :--- | :--- |
| **Windows (x64)** | 🪟 **Installateur .exe** | **`ocrbookor_1.3.0_setup_x64.exe`** | Assistant d'installation officiel avec raccourci Bureau et menu Démarrer. |
| **Windows (x64)** | 📦 **Archive Portable .zip** | **`ocrbookor_1.3.0_win_x64.zip`** | Version autonome zéro-installation avec lanceur `ocrbookor.cmd`. |
| **Linux (amd64)** | 🐧 **Paquet natif .deb** | **`ocrbookor_1.3.0_amd64.deb`** | Pour Debian 12/13, Ubuntu 22.04/24.04 LTS et dérivés. |
| **Vérification** | 🔒 **Checksums SHA256** | **`SHA256SUMS.txt`** | Empreintes cryptographiques d'intégrité binaire. |

---

### ⚡ Installation Express

#### 🪟 Windows Desktop (PowerShell en 1 ligne)
```powershell
irm https://raw.githubusercontent.com/nouhailler/OCRBookor/main/scripts/windows/install-windows.ps1 | iex
```

#### 🐧 Linux Debian / Ubuntu (Terminal en 1 ligne)
```bash
curl -sSL https://raw.githubusercontent.com/nouhailler/OCRBookor/main/install.sh | sudo bash
```

---

### 🔧 Installation Manuelle

#### Sous Windows :
1. Téléchargez `ocrbookor_1.3.0_setup_x64.exe` et lancez l'assistant d'installation.
2. Ou décompressez `ocrbookor_1.3.0_win_x64.zip` et double-cliquez sur `ocrbookor.cmd`.
3. L'application s'ouvre automatiquement sur `http://localhost:3000`.

#### Sous Linux :
```bash
sudo dpkg -i ocrbookor_1.3.0_amd64.deb
sudo apt-get install -f
ocrbookor
```

---

### 🌟 Nouveautés de la Version v1.3.0
- 🪟 **Support Natif Windows (x64) :** Installateur exécutable `.exe` Inno Setup, archive portable `.zip`, script d'installation PowerShell et détection automatique des interpréteurs Python sous Windows.
- 🌐 **Internationalisation Complète (i18n) :** Interface bilingue intégrale en français et anglais avec sélecteur instantané `FR / EN`.
- 📱 **Landing Page PWA Bilingue :** Version autonome (`/en`) sur Cloudflare Pages avec mise en cache hors-ligne.
- 🚀 **Déploiement Simplifié :** Scripts d'installation automatique curl (Linux) et irm (Windows).
- 📚 **Documentation Complète Bilingue :** `README.md`, `README.en.md`, guides d'installation et spécifications.
- 🧪 **Suite de Tests et Validation :** Parité 100% sur les clés de traduction et 20/20 tests backend passés.
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

# 2. Récupération des assets existants
EXISTING_ASSETS=$(curl -s \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/releases/$RELEASE_ID/assets)

upload_file() {
  local file_path="$1"
  local file_name
  file_name="$(basename "$file_path")"

  if [ ! -f "$file_path" ]; then
    return 0
  fi

  local file_size
  file_size=$(stat -c%s "$file_path" 2>/dev/null || stat -f%z "$file_path")

  # Supprimer l'asset existant de même nom si présent
  local asset_id
  asset_id=$(echo "$EXISTING_ASSETS" | python3 -c "import sys, json
assets = json.load(sys.stdin)
if isinstance(assets, list):
    for a in assets:
        if a.get('name') == '$file_name':
            print(a.get('id'))
            break
" 2>/dev/null || echo "")

  if [ -n "$asset_id" ] && [ "$asset_id" != "None" ]; then
    echo "  - Remplacement de l'ancien asset $file_name (ID: $asset_id)..."
    curl -s -X DELETE \
      -H "Accept: application/vnd.github+json" \
      -H "Authorization: Bearer $TOKEN" \
      -H "X-GitHub-Api-Version: 2022-11-28" \
      https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/releases/assets/$asset_id > /dev/null
  fi

  echo "  - Téléversement de $file_name (${file_size} octets)..."
  local content_type="application/octet-stream"
  case "$file_name" in
    *.deb) content_type="application/vnd.debian.binary-package" ;;
    *.zip) content_type="application/zip" ;;
    *.exe) content_type="application/vnd.microsoft.portable-executable" ;;
    *.txt) content_type="text/plain" ;;
  esac

  curl -s -X POST \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer $TOKEN" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    -H "Content-Type: $content_type" \
    "https://uploads.github.com/repos/$REPO_OWNER/$REPO_NAME/releases/$RELEASE_ID/assets?name=$file_name" \
    --data-binary @"$file_path" > /dev/null
  echo "    ✓ $file_name téléversé."
}

echo "→ Téléversement des fichiers de release..."
upload_file "$RELEASES_DIR/ocrbookor_1.3.0_amd64.deb"
upload_file "$RELEASES_DIR/ocrbookor_1.3.0_win_x64.zip"
upload_file "$RELEASES_DIR/SHA256SUMS.txt"
if [ -f "$RELEASES_DIR/ocrbookor_1.3.0_setup_x64.exe" ]; then
  upload_file "$RELEASES_DIR/ocrbookor_1.3.0_setup_x64.exe"
fi

echo ""
echo "================================================================="
echo "  ✓ SUCCÈS ! Release v1.3.0 publiée sur GitHub"
echo "================================================================="
echo "Lien de la release : https://github.com/$REPO_OWNER/$REPO_NAME/releases/tag/$TAG_NAME"
echo "================================================================="
