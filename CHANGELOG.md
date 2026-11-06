# CHANGELOG.md — Historique des Versions d’OCRBookor

Toutes les modifications notables apportées à ce projet sont consignées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère à la spécification [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.3.0] - 2026-11-05

### Ajouté
- **Internationalisation Complète (i18n) Français & Anglais :**
  - Architecture d'i18n stricte (`src/i18n/`) avec 14 espaces de noms typés et 444 clés bilingues complètes.
  - Sélecteur de langue dynamique (`FR / EN`) avec détection automatique de la langue du navigateur et persistance dans `localStorage`.
  - Découplage strict entre la langue de l'interface utilisateur et la langue d'océrisation des livres (Dublin Core / modèles Tesseract).
  - Traduction intégrale de tous les écrans, guides contextuels, formulaires, modales de diagnostic et avertissements juridiques.
- **Landing Page PWA en Anglais (Cloudflare Pages) :**
  - Création de `landing/en.html` et `landing/en/index.html` pour un accès direct via `https://decouvrir-ocrbookor.pages.dev/en`.
  - Bouton interactif de basculement de langue `FR / EN` dans l'en-tête de la landing page.
  - Balises de référencement multilingue `hreflang` et mise en cache PWA hors-ligne via `sw.js`.
- **Installation Express 1-Ligne via `curl` :**
  - Commande d'installation automatique : `curl -sSL https://raw.githubusercontent.com/nouhailler/OCRBookor/main/install.sh | sudo bash`.
  - Téléchargement automatique de la dernière version du binaire Debian, résolution des dépendances et configuration du lanceur `/usr/bin/ocrbookor`.
- **Support Complet de l’Environnement Windows (x64) :**
  - **Installateur Windows (.exe) Inno Setup :** Script `scripts/windows/ocrbookor-installer.iss` compilant `ocrbookor_1.3.0_setup_x64.exe` avec assistant d'installation bilingue, raccourci Bureau, menu Démarrer et désinstallateur propre.
  - **Archive Portable Zéro-Installation (.zip) :** Script `scripts/build-windows.mjs` produisant `ocrbookor_1.3.0_win_x64.zip` prêt à l'emploi avec lanceurs Windows (`ocrbookor.cmd` et `install-dependencies.cmd`).
  - **Installation Automatisée en 1 Ligne (PowerShell) :** Commande `irm https://raw.githubusercontent.com/nouhailler/OCRBookor/main/scripts/windows/install-windows.ps1 | iex` automatisant le téléchargement et la création du raccourci Bureau.
  - **Passerelle Python Multi-Plateforme :** Détection automatique dynamique de l'interpréteur Python (`python.exe`, `py.exe`, `python3`), résolution des chemins Windows (`%LOCALAPPDATA%\OCRBookor`), encodage UTF-8 forcé et support des chemins d'installation standards de Tesseract sous Windows.
  - **Workflow GitHub Actions Multi-OS :** Pipeline de release GitHub (`.github/workflows/release.yml`) avec jobs `ubuntu-latest` et `windows-latest` publiant simultanément les paquets `.deb`, `.exe` et `.zip` avec sommes SHA256 unifiées.
- **Documentation et Validation Automatisée :**
  - Création du `README.en.md` et mise en place d'un en-tête bilingue dans `README.md`.
  - Rédaction du rapport d'audit et de conformité `docs/INTERNATIONALIZATION_EN_REPORT.md`.
  - Suite de tests de parité i18n automatisée (`npm test` / `scripts/test-i18n.mjs`) vérifiant 100% des clés.

### Modifié & Corrigé
- **Exécution Autonome du Binaire Debian :**
  - Résolution de l'import dynamique de Vite en production dans `server.js` pour éviter toute dépendance résiduelle aux outils de dev.
  - Mise à jour d'esbuild à la version ^0.28.0 résolvant les conflits de dépendances de Vite.

---

## [1.2.0] - 2026-11-01

### Ajouté
- **Menu Hamburger Catégorisé :**
  - Tiroir latéral d’accès rapide classant l'ensemble des fonctionnalités en 9 catégories fonctionnelles (Numérisation, Prétraitement, OCR, Édition, Structure, Export, Système, Légal, Documentation).
  - Barre de recherche textuelle instantanée pour filtrer rapidement une fonctionnalité.
  - Indicateur d'état du livre en cours avec nombre de pages.
- **Menu Paramètres Système :**
  - Date officielle de sortie : **1er Novembre 2026**.
  - Horodatage mémorisé de la dernière vérification des mises à jour.
  - Bouton interactif **« Vérifier les mises à jour »** avec diagnostic en temps réel.
  - Détection dynamique des moteurs OCR hôtes (Tesseract CLI, PaddleOCR, RapidOCR).
  - Bouton de téléchargement du paquet Debian Linux Desktop.
- **Thème Clair & Thème Sombre :**
  - Implémentation d'un thème clair soigné, à haut contraste et harmonieux en complément du thème sombre.
  - Bascule en un clic avec synchronisation immédiate sur `document.documentElement` et mémorisation dans `localStorage`.
- **Onboarding Juridique & Décharge de Responsabilité :**
  - Modale d'accueil obligatoire au premier lancement rappelant que l'auteur décline toute responsabilité quant aux données fournies dans l'application et au respect de la propriété intellectuelle.
  - Case à cocher d'acceptation obligatoire mémorisée localement.
  - Accès permanent aux mentions légales depuis le menu Hamburger et le pied de page.
- **Guide Contextuel Novice & Infobulles Interactives :**
  - Composant `ContextualGuide` affichant un résumé pédagogique et les 3 étapes recommandées sur chaque écran.
  - Composant `Tooltip` déployé sur tous les champs de formulaire, curseurs de prétraitement, boutons d'action et filtres.
- **Identité Visuelle & Logo :**
  - Logo vectoriel SVG officiel intégrant un livre ouvert géométrique, un faisceau laser de numérisation et la typographie OCRBookor.
  - Favicon SVG adaptatif pour l'onglet du navigateur.
- **Distribution Linux Desktop (.deb) & GitHub Releases :**
  - Script automatisé `scripts/build-deb.sh` pour assembler `releases/ocrbookor_1.2.0_amd64.deb` avec `dpkg-deb`.
  - Lanceur exécutable `/usr/bin/ocrbookor`, raccourci d’application `ocrbookor.desktop` et icône système SVG.
  - Workflow GitHub Actions `.github/workflows/release.yml` publiant automatiquement la release avec les binaires attachés et les sommes de contrôle SHA256.
  - Script autonome `scripts/publish-github-release.sh` pour téléverser directement la release et le binaire vers l'API GitHub Releases.
- **Documentation & Visuel :**
  - Capture d'écran haute résolution de l'application intégrée dans `README.md`.
  - Liens de téléchargement direct du binaire et documentation détaillée du processus de release.
  - Création du document d'architecture et de contexte technique `CONTEXT.md`.

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
