# CHANGELOG.md — Historique des Versions d’OCRBookor

Toutes les modifications notables apportées à ce projet sont consignées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère à la spécification [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-10-31

### Ajouté
- **Module Bibliothèque (Écran 1) :**
  - Gestion multi-projets avec persistance locale (`localStorage` / JSON v1.0).
  - Importation par glisser-déposer de fichiers PDF.
  - Diagnostic automatique : scan pur image vs texte natif vs document hybride.
  - Corpus de validation pré-chargé avec les trois livres de référence (Livre A : Roman récent, Livre B : Ouvrage ancien de 1759, Livre C : Fables illustrées).
  - Export et import de sauvegardes complètes de projet au format JSON.
- **Module Analyse & Prétraitement (Écran 2) :**
  - Extraction des métadonnées du PDF : nombre de pages, dimensions, calcul du DPI estimé.
  - Filtres d'amélioration d'image : niveaux de gris, contraste automatique, redressement (deskew), détection de pages blanches et binarisation réglable.
  - Sélection du modèle linguistique OCR (Français standard `fra`, Français ancien `fra_old`, Anglais, Allemand, Latin).
- **Module Reconnaissance OCR (Écran 3) :**
  - Moteur Tesseract v5 WebAssembly exécuté localement sans connexion externe.
  - Analyse de disposition et extraction des coordonnées (`bbox`) et des scores de confiance au mot près.
  - Tableau de bord en temps réel avec temps écoulé, pages restantes et alertes d'anomalies.
  - Comparateur de disposition secondaire simulant le comportement de PaddleOCR.
- **Module Éditeur de Correction Bi-Fenêtre (Écran 4) :**
  - Vue synchronisée : scan haute résolution à gauche avec zoom (50% à 300%), rotation 90°, filtres de contraste/inversion et surbrillance des boîtes englobantes (`bounding boxes`).
  - Éditeur de blocs de texte éditable à droite avec indication des passages incertains (< 65% de confiance).
  - Outil de typographie française instantané (guillemets français `« »`, espaces insécables, apostrophes typographiques, ligatures `œ`).
  - Outil de résolution des césures de bout de ligne avec préservation des mots composés légitimes (`grand-père`, `peut-être`).
  - Recherche et remplacement global dans tout le livre.
  - Bouton de validation de page individuelle.
- **Module Structure Éditoriale (Écran 5) :**
  - Arborescence des chapitres avec niveaux hiérarchiques H1, H2, H3.
  - Détection automatique des chapitres par analyse sémantique des titres.
  - Gestionnaire des illustrations et gravures extraites avec saisie des légendes.
  - Formulaire de métadonnées bibliographiques Dublin Core (Titre, Auteur, Année, Éditeur, ISBN, Genre, Description).
- **Module Export Multi-Formats (Écran 6) :**
  - Liseuse EPUB 3 interactive intégrée avec personnalisation de police (taille, Serif / Sans) et thèmes de lecture (Clair, Sépia, Nuit).
  - Générateur d'archives **EPUB 3** conforme IDPF (`mimetype` non-compressé, `container.xml`, `content.opf`, `nav.xhtml`, `toc.ncx`, `styles.css`, chapitres XHTML5 distincts).
  - Exportateur **Markdown** structuré (.md) avec en-têtes YAML.
  - Exportateur **Texte brut** propre (.txt) en UTF-8 avec séparateurs de chapitres.
  - Exportateur **HTML 5** autonome et responsive.
  - Exportateur de sauvegarde de projet JSON (`book.json`).
  - Rapport de conformité EPUBCheck et tableau de bord CER/WER.
- **Documentation Obligatoire :**
  - `README.md`, `AUDIT_INITIAL.md`, `ARCHITECTURE.md`, `OCR_BENCHMARK.md`, `INSTALLATION.md`, `USER_GUIDE.md`, `TEST_REPORT.md`.
