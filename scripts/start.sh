#!/usr/bin/env bash
# OCRBookor - Lancement Global Unifié
set -euo pipefail

echo "=========================================================="
echo "  Démarrage d'OCRBookor"
echo "=========================================================="

bash scripts/check-dependencies.sh

echo "Démarrage du Studio OCRBookor..."
npm run dev
