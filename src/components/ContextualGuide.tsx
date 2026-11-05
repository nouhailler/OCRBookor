/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Compass, ChevronDown, ChevronUp, Lightbulb, ArrowRight } from 'lucide-react';
import { ActiveTab } from './Navbar';
import { useTranslation } from '../i18n';

interface ContextualGuideProps {
  currentTab: ActiveTab;
  onNavigateTab?: (tab: ActiveTab) => void;
}

interface GuideContent {
  title: string;
  badge: string;
  description: string;
  steps: string[];
  noviceTip: string;
  nextTab?: ActiveTab;
  nextLabel?: string;
}

const GUIDES_FR: Record<ActiveTab, GuideContent> = {
  bibliotheque: {
    title: 'Étape 1 : Gestion de votre Bibliothèque & Import de PDF',
    badge: 'Démarrage',
    description: 'Cet écran vous permet d’importer des fichiers PDF de livres numérisés et de sélectionner le livre sur lequel vous souhaitez travailler.',
    steps: [
      'Glissez-déposez un livre PDF ou cliquez sur « Importer un document PDF ».',
      'Si vous découvrez l’application, cliquez sur « Charger le Corpus de Test » pour tester immédiatement un roman ou un livre ancien.',
      'Cliquez sur « Ouvrir ce livre » pour démarrer l’analyse et le traitement.',
    ],
    noviceTip: 'Un PDF propre avec des scans à 300 DPI donnera une précision de reconnaissance supérieure à 98%.',
    nextTab: 'analyse',
    nextLabel: 'Passer à l’Analyse',
  },
  analyse: {
    title: 'Étape 2 : Diagnostic du Scan & Prétraitement Graphique',
    badge: 'Préparation',
    description: 'Vérifiez la qualité des pages numérisées avant la reconnaissance optique. Des filtres d’image permettent de redresser les pages et d’effacer le bruit de fond.',
    steps: [
      'Examinez la résolution estimée (DPI) et la nature du PDF (Scan pur ou hybride).',
      'Activez le « Redressement automatique » (Deskew) si les lignes de texte penchent.',
      'Ajustez le contraste ou la binarisation pour faire ressortir les caractères estompés.',
    ],
    noviceTip: 'Le redressement supprime les inclinaisons d’angle et divise par 3 les erreurs de césure et de lecture de caractères.',
    nextTab: 'reconnaissance',
    nextLabel: 'Lancer l’OCR',
  },
  reconnaissance: {
    title: 'Étape 3 : Reconnaissance Optique de Caractères (OCR)',
    badge: 'Traitement',
    description: 'Le moteur OCR local convertit les images en texte brut, identifie la position des mots et calcule un score de confiance pour chaque bloc.',
    steps: [
      'Sélectionnez la langue du livre (ex. Français moderne `fra` ou Français ancien `fra_old`).',
      'Lancez le traitement par lots (« Tout traiter ») ou page par page.',
      'Surveillez la jauge de confiance moyenne : les pages surlignées en orange contiennent des mots incertains.',
    ],
    noviceTip: 'Tout le calcul s’effectue en local dans votre navigateur via WebAssembly ou daemon sans envoyer la moindre donnée sur Internet.',
    nextTab: 'correction',
    nextLabel: 'Ouvrir l’Éditeur de Correction',
  },
  correction: {
    title: 'Étape 4 : Relecture Côte-à-Côte & Typographie Française',
    badge: 'Édition & Qualité',
    description: 'L’écran central de travail : visualisez le scan original haute résolution à gauche et le texte éditable à droite.',
    steps: [
      'Cliquez sur les mots surlignés en jaune pour comparer immédiatement avec le scan original.',
      'Utilisez le bouton « Typographie Française » pour corriger en un clic les guillemets « », espaces insécables et ligatures œ.',
      'Utilisez le bouton « Recollage des Césures » pour fusionner les mots coupés en bout de ligne (ex. « mou- vement »).',
    ],
    noviceTip: 'Raccourci clavier : pressez Ctrl+S (ou Cmd+S) à tout moment pour enregistrer vos corrections.',
    nextTab: 'structure',
    nextLabel: 'Structurer le Livre',
  },
  structure: {
    title: 'Étape 5 : Structure Éditoriale, Chapitres & Illustrations',
    badge: 'Mise en page',
    description: 'Organisez la table des matières hiérarchique (H1, H2) et complétez les métadonnées Dublin Core nécessaires aux liseuses.',
    steps: [
      'Vérifiez la détection automatique des chapitres ou ajoutez-en manuellement.',
      'Complétez le Titre, Auteur, Année et ISBN pour que votre EPUB apparaisse parfaitement dans les bibliothèques d’e-readers.',
      'Attribuez des légendes aux gravures et illustrations extraites.',
    ],
    noviceTip: 'Une table des matières claire au niveau H1 garantit la conformité stricte EPUB 3 et une navigation fluide sur Kobo et Kindle.',
    nextTab: 'export',
    nextLabel: 'Exporter le Livre',
  },
  export: {
    title: 'Étape 6 : Exportations Multi-Formats & Liseuse EPUB',
    badge: 'Finalisation',
    description: 'Générez et téléchargez votre livre au standard IDPF EPUB 3, Markdown, TXT ou HTML 5, et testez-le directement dans la liseuse intégrée.',
    steps: [
      'Cliquez sur « Exporter en EPUB 3 » pour obtenir le fichier pour liseuses et smartphones.',
      'Testez le rendu visuel dans la liseuse intégrée avec les thèmes Clair, Sépia ou Nuit.',
      'Téléchargez si besoin les formats Markdown ou Texte brut pour vos archives ou outils de prise de notes.',
    ],
    noviceTip: 'Le fichier EPUB 3 produit contient le mimetype IDPF non compressé en tête d’archive, garantissant une compatibilité totale avec Apple Books, Calibre et EPUBCheck.',
  },
};

const GUIDES_EN: Record<ActiveTab, GuideContent> = {
  bibliotheque: {
    title: 'Step 1: Library Management & PDF Ingestion',
    badge: 'Getting Started',
    description: 'This screen allows you to import scanned book PDF files, manage your collection, and pick the book you want to work on.',
    steps: [
      'Drag and drop a scanned PDF book or click "Import Scanned Book (PDF)".',
      'If you are new to the app, click "Load Benchmark Corpus" to test a classical novel or historic book right away.',
      'Click "Open this book" to start preprocessing and recognition.',
    ],
    noviceTip: 'A clean PDF with 300 DPI scans achieves recognition accuracy greater than 98%.',
    nextTab: 'analyse',
    nextLabel: 'Go to Analysis',
  },
  analyse: {
    title: 'Step 2: Scan Diagnostics & Preprocessing Filters',
    badge: 'Preparation',
    description: 'Inspect scan quality before OCR. Image filters allow you to straighten tilted pages and clean up noise or spine bleed-through.',
    steps: [
      'Review estimated resolution (DPI) and PDF nature (Pure scan or hybrid vector).',
      'Turn on "Auto Deskew" if lines of text are angled or tilted.',
      'Adjust contrast or Otsu binarization to enhance faded or low-contrast characters.',
    ],
    noviceTip: 'Deskewing eliminates rotational tilt and drastically reduces end-of-line hyphenation and misrecognition errors.',
    nextTab: 'reconnaissance',
    nextLabel: 'Run OCR',
  },
  reconnaissance: {
    title: 'Step 3: Optical Character Recognition (OCR)',
    badge: 'Processing',
    description: 'The local OCR engine converts scanned images into raw text, pinpoints word bounding boxes, and calculates confidence scores.',
    steps: [
      'Select document language (e.g., Modern French `fra`, Historical French `fra_old`, or English `eng`).',
      'Launch batch processing ("Process All") or run page by page.',
      'Monitor average confidence: orange highlighted pages indicate words needing proofreading.',
    ],
    noviceTip: 'All computations run locally on your machine without transmitting any data over the Internet.',
    nextTab: 'correction',
    nextLabel: 'Open Correction Studio',
  },
  correction: {
    title: 'Step 4: Side-by-Side Review & Typography Studio',
    badge: 'Editing & Quality',
    description: 'The primary workspace: view the high-resolution original scan on the left and the editable text on the right.',
    steps: [
      'Click on yellow-highlighted words to compare directly with the original scan facsimile.',
      'Use the "Typography Normalization" tool to fix guillemets, non-breaking spaces, and ligatures in one click.',
      'Use "Dehyphenate Line Ends" to automatically rejoin split words (e.g., "re- construction").',
    ],
    noviceTip: 'Keyboard shortcut: press Ctrl+S (or Cmd+S) at any time to immediately save your corrections.',
    nextTab: 'structure',
    nextLabel: 'Structure Book',
  },
  structure: {
    title: 'Step 5: Editorial Structure, Chapters & Illustrations',
    badge: 'Layout',
    description: 'Organize the hierarchical table of contents (H1, H2) and fill out Dublin Core metadata required by e-readers.',
    steps: [
      'Verify automated chapter detection or manually add new chapter headings.',
      'Fill in Title, Author, Year, and ISBN so your EPUB renders gorgeously in e-reader bookshelves.',
      'Assign captions and options to detected engravings and illustration plates.',
    ],
    noviceTip: 'A clear H1 table of contents guarantees strict EPUB 3 compliance and smooth navigation on Kobo, Kindle, and Apple Books.',
    nextTab: 'export',
    nextLabel: 'Export Book',
  },
  export: {
    title: 'Step 6: Multi-Format Exports & EPUB E-Reader',
    badge: 'Finalization',
    description: 'Generate and download your publication-ready book in IDPF EPUB 3, Markdown, TXT, or HTML 5, and preview it in the built-in reader.',
    steps: [
      'Click "Download .epub" to obtain the reflowable digital book for e-readers and smartphones.',
      'Test reading comfort in the integrated reader with Light, Sepia, and Dark themes.',
      'Download Markdown or plain text versions if needed for personal archives or LLM text analysis.',
    ],
    noviceTip: 'The generated EPUB 3 archive places the uncompressed mimetype first, ensuring full compatibility with Apple Books, Calibre, and EPUBCheck.',
  },
};

export const ContextualGuide: React.FC<ContextualGuideProps> = ({ currentTab, onNavigateTab }) => {
  const { language } = useTranslation();
  const [isOpen, setIsOpen] = useState(() => {
    return localStorage.getItem('ocrbookor_show_guide') !== 'false';
  });

  const guides = language === 'fr' ? GUIDES_FR : GUIDES_EN;
  const guide = guides[currentTab];
  if (!guide) return null;

  const toggleOpen = () => {
    const next = !isOpen;
    setIsOpen(next);
    localStorage.setItem('ocrbookor_show_guide', String(next));
  };

  const isFr = language === 'fr';

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-3 pb-1">
      <div className="rounded-xl border border-indigo-200/80 dark:border-indigo-900/50 bg-gradient-to-r from-indigo-50/90 via-blue-50/60 to-purple-50/50 dark:from-indigo-950/40 dark:via-slate-900/60 dark:to-purple-950/30 p-3.5 shadow-sm transition-all duration-200">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shrink-0 shadow-sm">
              <Compass className="h-4 w-4" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 truncate">
                  {guide.title}
                </span>
                <span className="rounded-full bg-indigo-600/10 dark:bg-indigo-400/20 px-2 py-0.2 text-[10px] font-semibold text-indigo-700 dark:text-indigo-300">
                  {guide.badge}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={toggleOpen}
              className="flex items-center gap-1 text-xs font-medium text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-white px-2 py-1 rounded-md hover:bg-indigo-100/60 dark:hover:bg-slate-800 transition"
            >
              <span>{isOpen ? (isFr ? 'Masquer le guide' : 'Hide guide') : (isFr ? 'Afficher le guide' : 'Show guide')}</span>
              {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="mt-3 pt-3 border-t border-indigo-100 dark:border-slate-800/80 text-xs space-y-2.5 animate-in fade-in duration-150">
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {guide.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
              {guide.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 bg-white/80 dark:bg-slate-900/60 p-2.5 rounded-lg border border-indigo-100/70 dark:border-slate-800"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 text-[11.5px] leading-tight">
                    {step}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[11.5px]">
              <div className="flex items-center gap-1.5 text-indigo-800 dark:text-indigo-300 bg-indigo-100/50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-md">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>
                  <strong>{isFr ? 'Astuce pratique :' : 'Pro tip:'}</strong> {guide.noviceTip}
                </span>
              </div>

              {guide.nextTab && onNavigateTab && (
                <button
                  onClick={() => onNavigateTab(guide.nextTab!)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-lg shadow-sm transition shrink-0"
                >
                  <span>{guide.nextLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
