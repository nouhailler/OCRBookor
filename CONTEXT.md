# CONTEXT.md — Contexte Technique & Architecture d’OCRBookor

**Projet :** OCRBookor  
**Dépôt GitHub :** [https://github.com/nouhailler/OCRBookor](https://github.com/nouhailler/OCRBookor)  
**Mainteneur :** Patrick Nouhailler (<patrick.nouhailler@gmail.com>)  
**Version actuelle :** v1.2.0 (Stable)  
**Date de révision :** 1er Novembre 2026  

---

## 1. Objectif & Périmètre

OCRBookor est une application locale conçue pour convertir des documents PDF, notamment des livres anciens ou récents numérisés (scans), en livres électroniques structurés au format **EPUB 3 Strict**, ainsi qu'en **Markdown**, **Texte brut** et **HTML 5**.

### Principes directeurs non négociables :
1. **Zéro simulation :** Aucun faux résultat OCR, aucune fausse comparaison de moteurs et aucune fabrication de taux d'erreur (CER / WER calculés strictement via Levenshtein uniquement en présence de vérité terrain certifiée).
2. **Fonctionnement 100% hors-ligne :** Aucune dépendance CDN obligatoire, aucun appel vers des API payantes ou distantes.
3. **Respect de la typographie de l'Imprimerie Nationale :** Gestion automatisée des espaces insécables avant ponctuations hautes (`! ? ; : % €`), guillemets français `« »`, tirets cadratins `—`, apostrophes courbes et ligatures (`œ`, `æ`).
4. **Conservation non destructive :** Préservation permanente des scans PDF et des textes bruts originaux avec historisation distincte des corrections manuelles.

---

## 2. Architecture Technique

### 2.1. Frontend
- **Framework :** React 19 SPA avec TypeScript strict.
- **Outillage :** Vite 8 + TSX.
- **Styling :** Tailwind CSS v4 avec bascule complète Thème Sombre / Thème Clair.
- **Composants d'ergonomie novice :**
  - `HamburgerMenu` : Tiroir latéral classant l'ensemble des fonctionnalités en 9 catégories.
  - `SystemSettingsModal` : Informations de version (v1.2.0, 1er Novembre 2026), horodatage de dernière vérification, bouton « Vérifier les mises à jour » et lien vers le paquet `.deb`.
  - `OnboardingModal` : Accueil pédagogique avec décharge expresse de responsabilité légale relative aux données et droits d'auteur des livres importés.
  - `ContextualGuide` : Bannière contextuelle expliquant aux débutants les étapes clés de l'écran actif.
  - `Tooltip` : Infobulles interactives sur chaque champ, seuil et bouton d'action.

### 2.2. Backend & Serveur Full-Stack
- **Point d'entrée serveur :** `server.ts` sous Express 4 monté avec les middlewares Vite en développement sur le port `3000`.
- **Base de données :** SQLite locale (`data/ocrbookor.sqlite3`) avec tables `projects`, `pages`, `blocks`, `corrections`, `chapters`, `illustrations` et `jobs`.
- **Passerelle Python :** `backend/api/cli.py` appelant les modules de la bibliothèque standard Python 3.10 :
  - `backend/core/` : Configuration, SQLite, gestionnaire du système de fichiers `data/projects/{id}/`.
  - `backend/pdf/` : Vérification des octets magiques `%PDF`, calcul du DPI, extraction d'images.
  - `backend/preprocessing/` : Profil de projection horizontale pour redressement (*Deskew*), binarisation Otsu, filtrage anti-bruit.
  - `backend/ocr/` : Tesseract WebAssembly côté client + diagnostic d'état honnête des moteurs hôtes (PaddleOCR, RapidOCR).
  - `backend/reconstruction/` : Fusion des lignes, typographie française, recollage des césures avec dictionnaire d'exceptions.
  - `backend/quality/` : Distances de Levenshtein, calcul réel de CER et WER.
  - `backend/export/` : Exportateurs EPUB 3 (mimetype `ZIP_STORED` en tête), Markdown YAML, TXT UTF-8, HTML 5 autonome.

### 2.3. Distribution Desktop Linux
- **Paquet Debian :** `releases/ocrbookor_1.2.0_amd64.deb` généré via `scripts/build-deb.sh` avec `dpkg-deb`.
- **Intégration bureau :** Lanceur bash `/usr/bin/ocrbookor`, fichier desktop `/usr/share/applications/ocrbookor.desktop`, icône vectorielle hicolor `/usr/share/icons/hicolor/scalable/apps/ocrbookor.svg`.

---

## 3. Matrice de Validation des Tests

- **Script automatisé :** `./scripts/test-e2e.sh`
- **Total tests unitaires & scénario E2E :** 20/20 validés avec succès.
- **Typage TypeScript :** `npm run lint` (`tsc --noEmit`) = 0 erreur.
- **Build de production :** `npm run build` = compilation réussie.
