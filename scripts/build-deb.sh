#!/bin/bash
# ==============================================================================
# OCRBookor - Script de Fabrication du Paquet Debian (.deb)
# ==============================================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR"

APP_NAME="ocrbookor"
VERSION="1.2.0"
ARCH="amd64"
DEB_PACKAGE_NAME="${APP_NAME}_${VERSION}_${ARCH}"
BUILD_ROOT="/tmp/build-${APP_NAME}-deb"
RELEASES_DIR="$ROOT_DIR/releases"

echo "================================================================="
echo "  Construction du Paquet Debian Desktop (.deb) pour OCRBookor"
echo "  Version : ${VERSION} | Architecture : ${ARCH}"
echo "================================================================="

# 1. Compilation préalable du frontend & backend
echo "→ 1/5 Compilation du frontend (Vite build)..."
npm run build

echo "→ 1b/5 Compilation du serveur autonome Node.js (server.js)..."
npx esbuild server.ts --bundle --platform=node --target=node18 --format=esm --banner:js="import { createRequire } from 'module'; const require = createRequire(import.meta.url);" --outfile="$ROOT_DIR/server.js" --external:vite

# 2. Préparation de l'arborescence du paquet
echo "→ 2/5 Préparation de l'arborescence /opt et /usr..."
rm -rf "$BUILD_ROOT"
mkdir -p "$BUILD_ROOT/DEBIAN"
mkdir -p "$BUILD_ROOT/usr/bin"
mkdir -p "$BUILD_ROOT/usr/share/applications"
mkdir -p "$BUILD_ROOT/usr/share/icons/hicolor/scalable/apps"
mkdir -p "$BUILD_ROOT/usr/share/doc/${APP_NAME}"
mkdir -p "$BUILD_ROOT/opt/${APP_NAME}"
mkdir -p "$RELEASES_DIR"

# 3. Fichier DEBIAN/control
echo "→ 3/5 Génération des métadonnées DEBIAN/control..."
cat << 'EOF' > "$BUILD_ROOT/DEBIAN/control"
Package: ocrbookor
Version: 1.2.0
Section: graphics
Priority: optional
Architecture: amd64
Maintainer: Patrick Nouhailler <patrick.nouhailler@gmail.com>
Depends: nodejs (>= 18.0.0), python3 (>= 3.10.0), python3-pip
Recommends: tesseract-ocr, tesseract-ocr-fra, poppler-utils
Homepage: https://github.com/nouhailler/OCRBookor
Description: Numerisation et conversion EPUB 3 de livres imprimes
 OCRBookor est une application locale de numerisation et de reconnaissance
 optique (OCR) permettant de transformer des scans PDF en livres numeriques
 conformes au standard EPUB 3 IDPF, ainsi qu'en Markdown, TXT et HTML.
 Traitement 100% hors-ligne avec respect strict de la typographie francaise.
EOF

# Fichier DEBIAN/postinst (permissions)
cat << 'EOF' > "$BUILD_ROOT/DEBIAN/postinst"
#!/bin/sh
set -e
chmod +x /usr/bin/ocrbookor
exit 0
EOF
chmod 755 "$BUILD_ROOT/DEBIAN/postinst"

# 4. Exécutable lanceur bash /usr/bin/ocrbookor
cat << 'EOF' > "$BUILD_ROOT/usr/bin/ocrbookor"
#!/bin/bash
set -e
export OCRBOOKOR_DATA_DIR="${OCRBOOKOR_DATA_DIR:-$HOME/.local/share/ocrbookor}"
mkdir -p "$OCRBOOKOR_DATA_DIR"
export NODE_ENV=production

echo "================================================================="
echo "  Démarrage d'OCRBookor v1.2.0 Desktop"
echo "  URL locale : http://localhost:3000"
echo "  Données : $OCRBOOKOR_DATA_DIR"
echo "================================================================="

cd /opt/ocrbookor
exec node /opt/ocrbookor/server.js "$@"
EOF
chmod 755 "$BUILD_ROOT/usr/bin/ocrbookor"

# 5. Raccourci .desktop
cat << 'EOF' > "$BUILD_ROOT/usr/share/applications/ocrbookor.desktop"
[Desktop Entry]
Name=OCRBookor
GenericName=Numérisation & EPUB 3
Comment=Numérisation et conversion EPUB 3 de livres imprimés
Exec=ocrbookor
Icon=ocrbookor
Terminal=false
Type=Application
Categories=Office;Publishing;Graphics;OCR;
Keywords=OCR;EPUB;Book;Livre;Scanner;Tesseract;PDF;
StartupNotify=true
EOF
chmod 644 "$BUILD_ROOT/usr/share/applications/ocrbookor.desktop"

# 6. Icône SVG de l'application
if [ -f "$ROOT_DIR/public/logo.svg" ]; then
    cp "$ROOT_DIR/public/logo.svg" "$BUILD_ROOT/usr/share/icons/hicolor/scalable/apps/ocrbookor.svg"
fi

# 7. Copie des fichiers d'application dans /opt/ocrbookor/
echo "→ 4/5 Copie des sources, du build et des modules backend..."
cp -r "$ROOT_DIR/dist" "$BUILD_ROOT/opt/${APP_NAME}/"
cp -r "$ROOT_DIR/backend" "$BUILD_ROOT/opt/${APP_NAME}/"
cp "$ROOT_DIR/server.js" "$BUILD_ROOT/opt/${APP_NAME}/"
cp "$ROOT_DIR/package.json" "$BUILD_ROOT/opt/${APP_NAME}/"
if [ -f "$ROOT_DIR/README.md" ]; then
    cp "$ROOT_DIR/README.md" "$BUILD_ROOT/usr/share/doc/${APP_NAME}/"
fi

# 8. Construction du paquet binaire avec dpkg-deb
echo "→ 5/5 Assemblage du paquet Debian via dpkg-deb..."
dpkg-deb --build "$BUILD_ROOT" "$RELEASES_DIR/${DEB_PACKAGE_NAME}.deb"

echo "================================================================="
echo "✓ SUCCÈS : Paquet généré avec succès !"
echo "Emplacement : $RELEASES_DIR/${DEB_PACKAGE_NAME}.deb"
ls -lh "$RELEASES_DIR/${DEB_PACKAGE_NAME}.deb"
echo "================================================================="
