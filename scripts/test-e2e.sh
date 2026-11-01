#!/bin/bash
# ==============================================================================
# OCRBookor - Script d'Exécution des Tests Bout-en-Bout (E2E)
# ==============================================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR"

echo "================================================================="
echo "  OCRBookor - Exécution de la suite de tests E2E et unitaires"
echo "================================================================="

# 1. Vérification de Python 3
if ! command -v python3 &> /dev/null; then
    echo "❌ Erreur : python3 n'est pas installé."
    exit 1
fi
echo "✓ Python : $(python3 --version)"

# 2. Initialisation de la base SQLite
echo "→ Initialisation de la base de données..."
python3 -m backend.api.cli init-db

# 3. Exécution de la suite de tests unitaires et E2E
echo "→ Exécution de tous les tests backend/tests/test_*.py..."
python3 -m unittest discover -s backend/tests -p "test_*.py" -v

echo "================================================================="
echo "  ✓ TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS !"
echo "================================================================="
