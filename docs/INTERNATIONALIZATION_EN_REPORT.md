# OCRBookor — Internationalization (i18n) & English Version Report

**Document Version:** 1.0.0  
**Application Version:** v1.2.0  
**Release Date:** November 2026  
**Status:** Completed & Verified  

---

## 1. Executive Summary

This report documents the architectural design, implementation, and quality verification of the complete English version of **OCRBookor** (`https://github.com/nouhailler/OCRBookor`).

The objective was not merely to translate a documentation file, but to provide a fully operational English application experience across every screen, dialog, navigation bar, tooltip, alert, and contextual guide, while strictly preserving 100% of the authentic French version and avoiding any regression in the core OCR pipelines, image preprocessing algorithms, or EPUB 3 export engines.

---

## 2. Initial Audit Findings

Prior to implementation, a comprehensive audit of the repository was performed:
1. **Existing Internationalization:** No i18n framework or translation tables previously existed; strings were directly embedded in JSX markup in French.
2. **Document Language vs UI Language:** The data model (`BookMetadata.language`) defined the linguistic model used by OCR engines (`fra`, `fra_old`, `eng`, `lat`, `deu`). This distinction had to be strictly decoupled from the interface display language.
3. **Persistence Strategy:** Local user preferences (`ocrbookor_theme`, `ocrbookor_show_guide`) were managed via `localStorage`. The i18n state naturally follows this sovereign offline pattern using `ocrbookor_lang`.
4. **Zero-Telemetry Constraint:** In accordance with OCRBookor’s offline privacy constitution, no language analytics or external localization CDNs are permitted.

---

## 3. i18n System Architecture

Rather than adding heavy runtime dependencies with large bundle footprints, a lightweight, type-safe, native React Context architecture was engineered in `src/i18n/`:

```
src/i18n/
├── types.ts          # Strongly typed translation schema (Translations, Language)
├── locales/
│   ├── fr.ts         # Exhaustive French dictionary (Source of truth)
│   └── en.ts         # High-fidelity English dictionary
└── index.tsx         # LanguageContext, LanguageProvider, useTranslation hook
```

### Key Technical Properties:
- **Strict TypeScript Typing:** All translation namespaces (`common`, `nav`, `landing`, `library`, `analysis`, `ocr`, `correction`, `structure`, `export`, `guide`, `settings`, `onboarding`, `docs`, `pwa`) are strictly typed in `types.ts`.
- **Browser Language Auto-Detection:** Defaults to French if `navigator.language.startsWith('fr')`, otherwise defaults to English.
- **Local Persistence:** Stored under key `'ocrbookor_lang'` with instant DOM synchronisation (`document.documentElement.lang = language`).
- **Safe Fallback:** If an English key is undefined or empty, `t(key)` automatically falls back to the French string, and ultimately returns the key itself to prevent runtime crashes.
- **Interpolation Engine:** Dynamic parameters (e.g. `{pageNumber}`, `{count}`) are interpolated via regular expression replacement.

---

## 4. UI Language vs Document OCR Language Separation

A critical requirement of the brief was maintaining a strict boundary between:
1. **UI Language (`Language = 'fr' | 'en'`):** Dictates button labels, tooltips, dialogs, titles, and step-by-step guides. Toggled via the `FR | EN` button in the Navbar, Hamburger Menu, and Landing View.
2. **Document Language (`BookMetadata.language`):** Dictates the dictionary used by OCR engines (`fra` for modern French, `fra_old` for classical French with long s `ſ`, `eng` for English, `lat` for Latin, `deu` for German). Configured in `AnalysisView` and stored within the book’s Dublin Core `dc:language` manifest.

---

## 5. Screen-by-Screen Implementation Matrix

| Component | File Path | Scope of Localization | Switcher Present |
|---|---|---|:---:|
| **Navigation Bar** | `src/components/Navbar.tsx` | All 6 workflow tabs, quick project selector, tooltips | Yes (`FR / EN`) |
| **Main Menu** | `src/components/HamburgerMenu.tsx` | 9 categorized sections, search filter placeholder, legal & settings links | Yes (`FR / EN`) |
| **Contextual Guide** | `src/components/ContextualGuide.tsx` | Steps 1 through 6, badges, action buttons, pro tips | Dynamic |
| **Screen 1: Library** | `src/components/LibraryView.tsx` | Search, status filters, dropzone, benchmark corpus cards, project deletion dialog | Dynamic |
| **Screen 2: Analysis** | `src/components/AnalysisView.tsx` | DPI diagnostics, deskew, Otsu binarization sliders, document classification | Dynamic |
| **Screen 3: Recognition** | `src/components/RecognitionView.tsx` | Batch OCR buttons, progress tracking, confidence indicators, quality table | Dynamic |
| **Screen 4: Correction** | `src/components/CorrectionView.tsx` | Dual-pane controls, zoom/rotate, typography normalization, search & replace | Dynamic |
| **Screen 5: Structure** | `src/components/StructureView.tsx` | Chapter tree (H1/H2/H3), Dublin Core metadata fields, illustration captions | Dynamic |
| **Screen 6: Export** | `src/components/ExportView.tsx` | EPUB 3, Markdown, HTML, TXT, e-reader preview themes, EPUBCheck report | Dynamic |
| **System Settings** | `src/components/SystemSettingsModal.tsx` | Version info, release date, dynamic engine diagnostic, .deb download | Dynamic |
| **Onboarding & Legal** | `src/components/OnboardingModal.tsx` | Welcome overview, disclaimer of liability, copyright warnings, acceptance checkbox | Dynamic |
| **Documentation** | `src/components/DocumentationModal.tsx` | English README tab, architecture overview, benchmarks, changelog | Dynamic |
| **Landing Page** | `src/components/LandingView.tsx` | Hero, pipeline, features, interactive comparator, curl install, FAQ, footer | Yes (`FR / EN`) |

---

## 6. Automated Testing & Verification

An automated translation audit script (`scripts/test-i18n.mjs`) was established to continuously verify:
1. **Key Parity:** Every single key existing in `fr.ts` exists identically in `en.ts`.
2. **No Empty Values:** No translated key in English is an empty string or whitespace.
3. **Interpolation Compliance:** Parameter tokens (e.g., `{param}`) match between both languages.
4. **Fallback Mechanism:** Verified that non-existent keys fall back to French cleanly.

### Verification Results:
- Total translation keys: **180+ keys per locale**
- Missing keys in English: **0**
- Empty keys in English: **0**
- TypeScript compilation (`tsc --noEmit`): **Passed cleanly with zero errors**
- Application build (`compile_applet` & `lint_applet`): **Passed cleanly**
- E2E Backend Test Suite (`./scripts/test-e2e.sh`): **20/20 tests passed**

---

## 7. Documentation Updates

- **`README.en.md`**: Created full-length English documentation with workflow breakdown, installation instructions (curl and .deb), architecture diagram, benchmark scores, and sovereign offline guarantee.
- **`README.md`**: Updated with top-level language switcher links (`🌐 Version française | English Version`).
- **`docs/INTERNATIONALIZATION_EN_REPORT.md`**: This formal implementation report.

---

## 8. Conclusion

OCRBookor v1.2.0 is now fully bilingual, offering an uncompromising user experience for both Francophone and Anglophone users. The implementation strictly adheres to the project's foundational values: 100% offline sovereignty, zero telemetry, typography rigor, and strict IDPF EPUB 3 standard compliance.
