#!/usr/bin/env bash
# OCRBookor - Arrêt des Processus Locaux
set -euo pipefail

echo "Arrêt des processus OCRBookor en écoute sur les ports 3000 et 8000..."
fuser -k 3000/tcp 2>/dev/null || true
fuser -k 8000/tcp 2>/dev/null || true
echo "Processus arrêtés."
