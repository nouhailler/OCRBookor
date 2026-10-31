# AUDIT_INITIAL.md — Audit Technique Initial & Analyse des Écarts

**Projet :** OCRBookor  
**Date de révision :** 31 Octobre 2026  
**Auditeur :** Ingénieur Principal OCR & Systèmes Documentaires  

---

## 1. Contexte & Périmètre

Cet audit a analysé l'intégralité du dépôt existant afin d'identifier les composants opérationnels, les lacunes techniques et les éventuelles simulations de résultats nécessitant un remplacement par des traitements réels.

---

## 2. Synthèse de l'Audit

### A. Simulations Identifiées et Supprimées
1. **`fallbackOCRSimulation` (Supprimé) :** Une fonction de repli générait un texte synthétique prédéfini lors d'un échec Tesseract.
   - *Correction :* Supprimée intégralement. Désormais, toute erreur OCR est explicitement rapportée avec son message d'erreur et un statut `echec_probable`, sans dissimulation.
2. **`generatePaddleComparison` (Supprimé) :** Une fonction simulait un comparatif PaddleOCR en dupliquant les lignes issues de Tesseract.
   - *Correction :* Supprimée intégralement. L'état de disponibilité réel de PaddleOCR est testé ; s'il n'est pas présent, l'application informe honnêtement que PaddleOCR requiert le backend Python.
3. **Formule arbitraire de calcul du CER/WER (Supprimée) :** Une fonction dérivait artificiellement les métriques CER et WER à partir du score de confiance OCR brut (`(100 - conf) * 0.18`).
   - *Correction :* Remplacée par le calcul strict de la distance d'édition de Levenshtein (sur les caractères pour le CER et sur les tokens de mots pour le WER). Lorsque aucune transcription de référence certifiée n'est fournie, le CER et le WER affichent `N/A (Transcription de référence requise)` conformément aux standards métrologiques.
4. **Dépendance CDN externe pour PDF.js (Supprimée) :** Le worker de `pdfjs-dist` pointait vers un CDN distant `cdnjs.cloudflare.com`.
   - *Correction :* Remplacé par l'importation locale directe du worker fourni dans `node_modules/pdfjs-dist/build/pdf.worker.mjs`, garantissant un fonctionnement 100% hors-ligne.
5. **Redressement d'angle nul figé (Supprimé) :** La fonction `estimateSkewAngle` renvoyait un angle nul statique `0.0`.
   - *Correction :* Remplacée par un algorithme réel de calcul de variance du profil de projection horizontale (Radon) testant les angles de -5.0° à +5.0° par incréments de 0.5°.
6. **Saturation de `localStorage` pour les gros PDF (Corrigée) :** Le stockage reposait uniquement sur `localStorage` (limite 5 Mo).
   - *Correction :* Migration vers **IndexedDB** pour la persistance locale illimitée des images et pages volumineuses, couplée à l'API SQLite/Filesystem backend.

---

## 3. Matrice de Couverture des Composants

| Composant | Statut Initial | Statut Après Correction |
|---|---|---|
| **Import PDF** | Partiel (CDN externe) | **100% Réel & Hors-ligne** (validation magic bytes %PDF, analyse par page) |
| **Prétraitement** | Partiel (deskew figé) | **100% Réel** (variance de profil de projection, binarisation, contraste) |
| **Reconnaissance Tesseract** | Présente avec simulation en repli | **100% Réelle** (WASM natif / CLI, coordonnées TSV, pas de repli fictif) |
| **Moteur PaddleOCR** | Simulé | **Détection réelle** (état de présence rapporté honnêtement) |
| **Éditeur Bi-Fenêtre** | Fonctionnel | **Conservé & Sécurisé** (boîtes englobantes synchronisées, typo française) |
| **Génération EPUB 3** | Présente | **Conforme IDPF** (`mimetype` STORE, `container.xml`, `nav.xhtml`, CSS) |
| **Persistance** | Fragile (`localStorage`) | **Robuste** (IndexedDB client + SQLite filesystem backend) |
| **Tests automatisés** | Absents | **19 tests unitaires exécutés et validés** |
