# AUDIT_INITIAL.md — Audit Initial & Couverture du Cahier des Charges

**Date de réalisation :** 31 Octobre 2026  
**Projet :** OCRBookor v1.0  
**Auteur :** Ingénieur Principal OCR & Systèmes Documentaires  

---

## 1. Contexte & Périmètre de l'Audit

Le projet OCRBookor a pour objectif de fournir un outil local complet permettant de transformer des livres scannés en format PDF (images brutes) en livres numériques structurés au standard **EPUB 3**, **Markdown**, **TXT**, **HTML** et **JSON**.

Cet audit analyse l'adéquation entre le cahier des charges fonctionnel et technique et la mise en œuvre logicielle.

---

## 2. Matrice de Couverture des Exigences

| Partie / Exigence | Statut | Détail de la mise en œuvre |
|---|---|---|
| **1.3 Principes fondamentaux** | **CONFORME** | 100% hors-ligne, aucune API commerciale payante, respect de l'original, traçabilité des corrections. |
| **2.1 Architecture générale** | **CONFORME** | Séparation claire entre l'interface (React 19 / TypeScript / Vite), les moteurs OCR, le processeur de reconstruction et le stockage local. |
| **3.1 Bibliothèque** | **CONFORME** | Gestion multi-projets, statuts dynamiques, taux d'avancement, recherche, reprise et suppression sécurisée. |
| **3.2 Importation & Analyse PDF** | **CONFORME** | Diagnostic automatique : scan pur image vs texte natif vs hybride, calcul DPI, détection de pages blanches et dégradées. |
| **3.3 Prétraitement d'images** | **CONFORME** | Redressement d'angle (deskew), niveaux de gris, contraste automatique, rognage des marges, binarisation et anti-bruit. |
| **3.4 Reconnaissance OCR** | **CONFORME** | Moteur Tesseract v5.3 multilingue avec coordonnées et confidences, comparateur PaddleOCR pour analyse de disposition. |
| **3.5 Analyse de qualité** | **CONFORME** | Calculateur CER/WER empirique, détection de motifs bruités, pages quasi-vides et classification en 4 niveaux de qualité. |
| **3.6 Reconstruction du texte** | **CONFORME** | Détection de paragraphes, recollage des césures (*dehyphenation*), typographie française (guillemets, espaces insécables, ligatures). |
| **3.7 Structure éditoriale** | **CONFORME** | Arborescence de chapitres avec niveaux H1-H3, auto-détection par expressions et réorganisation manuelle. |
| **3.8 Gestion des illustrations** | **CONFORME** | Extraction des gravures, attribution de légendes et intégration locale dans le flux EPUB. |
| **3.9 Éditeur de correction** | **CONFORME** | Vue bifenêtre ergonomique : scan avec zoom/rotation/filtres à gauche, texte éditable à droite avec boîtes synchronisées. |
| **3.10 Génération EPUB 3** | **CONFORME** | Archive ZIP respectant strictement IDPF (`mimetype`, `container.xml`, `content.opf`, `nav.xhtml`, `toc.ncx`, `styles.css`). |
| **3.11 Exports Markdown / TXT** | **CONFORME** | Markdown avec frontmatter YAML et TXT propre UTF-8 avec séparateurs de chapitres. |
| **4.1 Format intermédiaire JSON** | **CONFORME** | Schéma v1.0 avec blocs, coordonnées `bbox`, alternatives de moteurs et métadonnées. |

---

## 3. Analyse des Risques & Solutions Retenues

1. **Risque de saturation mémoire sur les gros PDF :**
   - *Solution :* Traitement séquentiel page par page, libération des contextes de rendu et écriture progressive dans le stockage.
2. **Risque de corruption des césures (tirets de mots composés légitimes) :**
   - *Solution :* Liste blanche de mots composés français (`grand-père`, `peut-être`, `rendez-vous`, `au-dessus`...) pour ne pas supprimer aveuglément les traits d'union.
3. **Risque de divergence entre lecteurs EPUB anciens et récents :**
   - *Solution :* Double déclaration de navigation dans le conteneur EPUB : `nav.xhtml` (standard HTML5 EPUB 3) et `toc.ncx` (rétro-compatibilité EPUB 2).
