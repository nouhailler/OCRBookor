#!/usr/bin/env bash
# OCRBookor - Lancement du Backend FastAPI
set -euo pipefail

echo "Démarrage du Backend Python FastAPI sur http://127.0.0.1:8000..."
uvicorn backend.api.main:app --host 127.0.0.1 --port 8000 --reload
