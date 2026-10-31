# ARCHITECTURE.md — Architecture Système & Flux de Données

## 1. Vue d’Ensemble

L’application **OCRBookor** sépare rigoureusement la couche présentation, l'orchestration des tâches longues, les moteurs de vision/OCR, le moteur de reconstruction éditoriale et la génération des livrables.

```text
                               ┌────────────────────────────────┐
                               │   Interface Utilisateur (UI)   │
                               │  React 19 / TypeScript / Vite  │
                               └────────────────┬───────────────┘
                                                │
                 ┌──────────────────────────────┴──────────────────────────────┐
                 ▼                                                             ▼
     ┌───────────────────────┐                                     ┌───────────────────────┐
     │  Analyse & Rendu PDF  │                                     │ Prétraitement d'Image │
     │     pdfjs-dist API    │                                     │  Filtres Canvas / DIP │
     └───────────┬───────────┘                                     └───────────┬───────────┘
                 │                                                             │
                 └──────────────────────────────┬──────────────────────────────┘
                                                ▼
                               ┌────────────────────────────────┐
                               │     Moteurs de Reconnaissance  │
                               │      - Tesseract v5.3 WASM     │
                               │      - PP-Structure Layout     │
                               └────────────────┬───────────────┘
                                                │
                                                ▼
                               ┌────────────────────────────────┐
                               │   Reconstruction Éditoriale    │
                               │    - Paragraph Builder         │
                               │    - Dehyphenation & Typo      │
                               │    - Chapter & Footnote Tree   │
                               └────────────────┬───────────────┘
                                                │
                 ┌──────────────────────────────┴──────────────────────────────┐
                 ▼                                                             ▼
     ┌───────────────────────┐                                     ┌───────────────────────┐
     │  Éditeur de Correction│                                     │ Exportateurs Multiples│
     │ Bi-fenêtre synchronisé│                                     │ EPUB 3 / MD / TXT /   │
     │  avec Bounding Boxes  │                                     │ HTML / JSON v1.0      │
     └───────────────────────┘                                     └───────────────────────┘
```

---

## 2. Modèle de Données Intermédiaire (Schema Version 1.0)

Le fichier `book.json` constitue la source de vérité pour tous les exports :

```json
{
  "schema_version": "1.0",
  "metadata": {
    "id": "book-001",
    "title": "Le Mystère de la Chambre Jaune",
    "author": "Gaston Leroux",
    "language": "fr",
    "publicationYear": "1907",
    "publisher": "Pierre Lafitte",
    "isbn": "978-2-07-036123-4"
  },
  "status": "a_corriger",
  "progressPercent": 100,
  "pages": [
    {
      "pageNumber": 1,
      "width": 800,
      "height": 1130,
      "dpi": 300,
      "confidence": 98,
      "quality": "bonne",
      "validated": true,
      "blocks": [
        {
          "id": "p1-b1",
          "type": "heading",
          "headingLevel": 1,
          "text": "CHAPITRE PREMIER",
          "confidence": 99,
          "bbox": [100, 80, 700, 130]
        }
      ]
    }
  ],
  "chapters": [
    {
      "id": "chap-1",
      "title": "Chapitre Premier",
      "level": 1,
      "startPage": 1,
      "blockIds": ["p1-b1"]
    }
  ]
}
```

---

## 3. Conformité EPUB 3

L'archive `.epub` générée par `epubExporter.ts` est construite dans l'ordre strict imposé par la spécification IDPF :
1. Fichier `mimetype` avec contenu `application/epub+zip`, sans compression (`compression: 'STORE'`).
2. Dossier `META-INF/` contenant `container.xml`.
3. Dossier `OEBPS/` contenant :
   - `content.opf` (manifeste complet, identifiant Dublin Core unique, ordre de lecture `spine`).
   - `nav.xhtml` (navigation HTML5 standard EPUB 3 avec balise `<nav epub:type="toc">`).
   - `toc.ncx` (table des matières XML pour rétro-compatibilité avec les liseuses anciennes).
   - `styles.css` (typographie, alinéas, espacements et mise en page adaptée au confort de lecture).
   - `chapter_*.xhtml` (fichiers distincts par chapitre avec balises sémantiques).
