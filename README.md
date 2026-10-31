# OCRBookor v1.0
## Application locale de numérisation, reconnaissance OCR et reconstruction de livres numérisés vers EPUB 3, Markdown et TXT

OCRBookor est une application open source complète conçue pour transformer des livres scannés (fichiers PDF constitués d'images de pages numérisées) en véritables livres numériques structurés au standard **EPUB 3**, ainsi qu'en documents **Markdown** (.md), **Texte brut** (.txt), **HTML 5** et **JSON**.

---

## 🌟 Principes Fondamentaux

1. **Fonctionnement 100% local :** Aucune transmission de document vers des serveurs ou API externes (confidentialité totale garantie).
2. **Aucune API payante :** Moteurs de reconnaissance open source (Tesseract OCR v5 WebAssembly + algorithmes d'analyse de disposition PP-Structure).
3. **Conservation non destructive :** Le PDF original et les résultats OCR bruts sont toujours préservés intacts ; les corrections manuelles sont historisées séparément.
4. **Reconstruction éditoriale de haute fidélité :**
   - Fusion intelligente des lignes en paragraphes cohérents.
   - Recollage des césures de bout de ligne (*dehyphenation* contextuelle).
   - Application rigoureuse des règles de l'Imprimerie Nationale pour la typographie française (guillemets `« »`, espaces insécables devant `! ? ; : % €`, ligatures `œ`, `æ`, apostrophes courbées `’`, tirets cadratins `—`).
   - Détection automatique et gestion hiérarchique de l'arborescence des chapitres (H1, H2, H3).
   - Extraction et catalogage des gravures et illustrations.
5. **Génération EPUB 3 certifiée :** Conforme aux normes IDPF / EPUBCheck (mimetype non-compressé, `container.xml`, `content.opf`, `nav.xhtml`, `toc.ncx`, feuille de style `styles.css` typographique et chapitres XHTML5 distincts).

---

## 🖥️ Les 6 Écrans du Workflow

- **Écran 1 : Bibliothèque** : Gestionnaire de vos projets de numérisation, import de PDF par glisser-déposer, import/export de sauvegardes JSON, indicateurs d'état et chargement instantané du corpus de validation (Livres A, B, C).
- **Écran 2 : Analyse & Prétraitement** : Diagnostic de la nature du PDF (Scan pur image, texte natif ou hybride), calcul du DPI, inspection des vignettes et réglages de prétraitement (niveaux de gris, rehaussement de contraste, redressement automatique de pages inclinées, binarisation et anti-bruit).
- **Écran 3 : Reconnaissance OCR** : Tableau de bord de traitement par lots, estimation du temps restant, jauges de confiance, détection d'anomalies de numérisation et suivi page par page.
- **Écran 4 : Éditeur de Correction Bi-fenêtre** : Comparaison côte à côte du scan original haute résolution (avec zoom, rotation, filtres et boîtes englobantes synchronisées) et du texte structuré éditable, enrichi d'outils de typographie française et de recherche/remplacement global.
- **Écran 5 : Structure Éditoriale & Métadonnées** : Organisation hiérarchique des chapitres, gestionnaire des illustrations avec légendes, et formulaire complet des métadonnées bibliographiques Dublin Core.
- **Écran 6 : Export Multi-Formats & Liseuse EPUB** : Liseuse intégrée avec personnalisation de police et thèmes (Clair, Sépia, Nuit), et téléchargement en un clic des livrables (EPUB 3, Markdown, TXT, HTML, JSON).

---

## 🚀 Démarrage Rapide

```bash
# Installation des dépendances
npm install

# Démarrage du serveur de développement local
npm run dev
```

L'application est disponible immédiatement sur `http://localhost:3000`.

---

## 📚 Documentation Technique

- [AUDIT_INITIAL.md](AUDIT_INITIAL.md) : Audit initial du projet et couverture des exigences.
- [ARCHITECTURE.md](ARCHITECTURE.md) : Conception modulaire et flux de données.
- [OCR_BENCHMARK.md](OCR_BENCHMARK.md) : Résultats détaillés du banc d'essai sur les 3 livres de référence (Roman récent, Ouvrage ancien 1759, Livre illustré).
- [INSTALLATION.md](INSTALLATION.md) : Guide pas à pas pour Debian 13 GNU/Linux.
- [USER_GUIDE.md](USER_GUIDE.md) : Manuel utilisateur complet.
- [TEST_REPORT.md](TEST_REPORT.md) : Bilan des tests fonctionnels et d'acceptation.
