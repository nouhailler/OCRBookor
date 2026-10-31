# TEST_REPORT.md — Rapport Réel d’Exécution des Tests

**Date d’exécution :** 31 Octobre 2026  
**Outil de test :** Python `unittest` standard & TypeScript Compiler (`tsc --noEmit`)  
**Environnement :** Linux Debian x86_64 / Python 3.10 / Node.js 22  

---

## 1. Exécution des Tests Unitaires Backend

### Commande exécutée :
```bash
python3 -m unittest discover -s backend/tests -p "test_*.py"
```

### Résultat de l'exécution :
```text
...................
----------------------------------------------------------------------
Ran 19 tests in 0.008s

OK
```

### Détail des 19 Tests Validés :

1. **`test_export.py` :**
   - `test_epub3_structure` : Vérification du conteneur ZIP, présence de `mimetype` non-compressé en tête (`ZIP_STORED`), présence de `META-INF/container.xml`, `OEBPS/content.opf`, `OEBPS/nav.xhtml`, `OEBPS/styles.css` et chapitres XHTML — **SUCCÈS**.
   - `test_markdown_export` : Vérification de la génération du document Markdown avec en-têtes YAML, titres H1/H2 et contenu des paragraphes — **SUCCÈS**.

2. **`test_pdf.py` :**
   - `test_nonexistent_file` : Détection de fichier inexistant et levée de `InvalidPDFError` — **SUCCÈS**.
   - `test_empty_file` : Rejet des fichiers de taille 0 octets — **SUCCÈS**.
   - `test_invalid_header` : Détection de l'absence de l'en-tête `%PDF` — **SUCCÈS**.
   - `test_valid_pdf_header` : Validation d'un document conforme — **SUCCÈS**.

3. **`test_reconstruction.py` :**
   - `test_dehyphenation_standard_word` : Recollage des césures de bout de ligne (`mou-\nvements` -> `mouvements`) — **SUCCÈS**.
   - `test_dehyphenation_legitimate_compound_word` : Préservation du trait d'union pour les mots composés français (`grand-père`) — **SUCCÈS**.
   - `test_french_typography_quotes_and_spaces` : Remplacement des guillemets droits par des guillemets français avec espaces insécables (`«\u00A0...\u00A0»`) — **SUCCÈS**.
   - `test_french_typography_ligatures` : Restauration des ligatures `cœur`, `sœur`, `œuvre` — **SUCCÈS**.
   - `test_french_typography_dialogue_dash` : Conversion des tirets de dialogue en tirets cadratins `—\u00A0` — **SUCCÈS**.
   - `test_heading_detector` : Détection des titres H1 par expressions clés (« CHAPITRE PREMIER », « LIVRE DEUXIÈME ») — **SUCCÈS**.

4. **`test_quality.py` :**
   - `test_levenshtein_identical` : Distance 0 pour deux chaînes identiques — **SUCCÈS**.
   - `test_levenshtein_differences` : Calcul exact des suppressions, insertions et substitutions — **SUCCÈS**.
   - `test_cer_calculation` : Taux d'erreur caractère (CER) calculé sur base de Levenshtein — **SUCCÈS**.
   - `test_wer_calculation` : Taux d'erreur mot (WER) calculé sur base de Levenshtein de tokens — **SUCCÈS**.
   - `test_empty_reference_returns_none` : Aucune fabrication de CER/WER si la transcription de référence est absente — **SUCCÈS**.
   - `test_diagnostics_repetitive_noise` : Détection des bruits de trame répétitifs — **SUCCÈS**.
   - `test_diagnostics_empty_page` : Détection des pages blanches ou vides — **SUCCÈS**.

---

## 2. Validation Frontend & Typage TypeScript

### Commande exécutée :
```bash
npm run lint
# tsc --noEmit
```

### Résultat :
```text
$ tsc --noEmit
(Sortie vide : 0 erreur de typage détectée)
```

### Commande de compilation :
```bash
npm run build
```

### Résultat :
```text
✓ built in 1.48s
(Compilation réussie sans avertissement ni erreur)
```
