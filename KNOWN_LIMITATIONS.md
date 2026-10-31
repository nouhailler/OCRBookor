# KNOWN_LIMITATIONS.md — Limites Connues et Travaux Futurs

Ce document dresse un inventaire honnête et transparent des limites techniques actuelles d'**OCRBookor v1.0** et des prérequis matériels ou logiciels associés.

---

## 1. Dépendances de Moteurs OCR Secondaires

- **Tesseract OCR (Moteur Principal) :**
  - Opérationnel à 100% dans l'environnement Web direct (via WebAssembly) et sur système Linux (via CLI `tesseract`).
- **PaddleOCR (Moteur Secondaire) :**
  - Nécessite l'environnement Python avec `paddleocr` et `paddlepaddle` installés.
  - Dans l'interface Web directe sans le démon Python actif, le système indique explicitement que PaddleOCR est indisponible et ne fabrique aucun résultat fictif.
- **RapidOCR (Moteur Optionnel) :**
  - Requiert le runtime ONNX `rapidocr-onnxruntime`.

---

## 2. Analyse Documentaire & Types de Documents

- **Manuscrits et écriture cursive :**
  - OCRBookor v1.0 est conçu pour les textes imprimés (typographie au plomb ou impression moderne). La reconnaissance de manuscrits n'est pas prise en charge dans cette version.
- **Formules mathématiques et partitions musicales :**
  - Les formules mathématiques complexes (LaTeX/MathML) et la notation musicale ne sont pas extraites sous forme sémantique.
- **Tableaux multi-colonnes imbriqués :**
  - Les tableaux simples sont préservés sous forme de blocs de texte réguliers, mais la reconstruction de tableaux HTML complexes avec cellules fusionnées nécessite une vérification manuelle dans l'éditeur.

---

## 3. Prétraitement d'Images

- **Redressement d'angle (Deskew) :**
  - L'algorithme par profil de projection est optimisé pour des angles d'inclinaison compris entre -10° et +10°. Les rotations complètes à 90°, 180° ou 270° doivent être corrigées manuellement via les boutons de rotation de l'interface.
- **Binarisation sur papier fortement dégradé :**
  - Pour les documents présentant des taches d'encre profondes ou des déchirures, la binarisation automatique peut nécessiter un ajustement fin du seuil via le curseur de l'écran d'analyse.

---

## 4. Métrologie CER et WER

- Conformément aux normes scientifiques, le CER et le WER ne peuvent pas être calculés sans transcription de référence certifiée. Sur un PDF importé quelconque, ces indicateurs restent marqués `N/A`.
