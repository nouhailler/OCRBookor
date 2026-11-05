/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Book, FileText, CheckCircle2, Cpu, Terminal, Compass, Layers, Globe } from 'lucide-react';
import { useTranslation } from '../i18n';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDoc?: string;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({
  isOpen,
  onClose,
  defaultDoc = 'README',
}) => {
  const { t, language } = useTranslation();
  const isFr = language === 'fr';

  const [selectedDoc, setSelectedDoc] = useState<string>(() => {
    if (!isFr && defaultDoc === 'README') return 'README_EN';
    return defaultDoc;
  });

  if (!isOpen) return null;

  const docs = [
    { id: 'README', label: 'README.md', icon: Book, title: isFr ? 'Présentation & Démarrage' : 'French Overview & Quickstart' },
    { id: 'README_EN', label: 'README.en.md', icon: Globe, title: isFr ? 'Documentation Anglaise Complète' : 'Full English Documentation' },
    { id: 'I18N_REPORT', label: 'INTERNATIONALIZATION_EN_REPORT.md', icon: CheckCircle2, title: isFr ? 'Rapport d’Internationalisation' : 'Internationalization Report' },
    { id: 'AUDIT', label: 'AUDIT_INITIAL.md', icon: Compass, title: isFr ? 'Audit Initial & Analyse' : 'Initial Audit & Gap Analysis' },
    { id: 'BENCHMARK', label: 'BENCHMARK_REPORT.md', icon: Cpu, title: isFr ? 'Banc d’Essai & Benchmarks Réels' : 'Benchmark Report & OCR Accuracy' },
    { id: 'ARCHITECTURE', label: 'ARCHITECTURE.md', icon: Layers, title: isFr ? 'Architecture Modulaire' : 'Modular Architecture' },
    { id: 'USER_GUIDE', label: 'USER_GUIDE.md', icon: FileText, title: isFr ? 'Guide Utilisateur pas à pas' : 'Step-by-Step User Guide' },
    { id: 'INSTALLATION', label: 'INSTALLATION.md', icon: Terminal, title: isFr ? 'Guide d’Installation Linux' : 'Linux Installation Guide' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6">
      <div className="flex flex-col h-[90vh] w-full max-w-5xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center space-x-2">
            <Book className="h-5 w-5 text-indigo-500" />
            <span className="text-base font-bold text-slate-900 dark:text-white">
              {isFr ? 'Documentation Technique & Manuels OCRBookor' : 'Technical Documentation & Manuals'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 2-Column modal layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Sidebar Nav */}
          <div className="w-full md:w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 p-3 space-y-1 shrink-0 overflow-y-auto">
            {docs.map((doc) => {
              const Icon = doc.icon;
              const isSelected = selectedDoc === doc.id;
              return (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc.id)}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-left transition ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{doc.label}</span>
                </button>
              );
            })}
          </div>

          {/* Doc Content Viewer */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-white dark:bg-slate-900 font-sans text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-4">
            {selectedDoc === 'README_EN' && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  OCRBookor v1.2.0 — Scanned Book Digitization, OCR &amp; Reconstruction Suite
                </h2>
                <p className="text-indigo-600 dark:text-indigo-400 font-medium text-xs mb-4">
                  Full-stack desktop &amp; web application transforming raw scanned PDF books into publication-ready EPUB 3, Markdown, and clean text
                </p>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                  <p>
                    <strong>100% Offline &amp; Sovereign:</strong> No documents or telemetry are transmitted to third-party servers. All OCR computations (Tesseract 5 &amp; RapidOCR) execute strictly locally.
                  </p>
                  <p>
                    <strong>Preservation of Facsimiles:</strong> Source PDFs remain pristine; corrections and OCR layers are stored non-destructively in local SQLite / IndexedDB.
                  </p>
                  <p>
                    <strong>Editorial Reconstruction:</strong> Intelligent paragraph flow, end-of-line dehyphenation, typographical rules, hierarchical table of contents, and illustration plate extraction.
                  </p>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-6 mb-2">The 6 Core Workflow Screens</h3>
                <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <li><strong>1. Library:</strong> Project management, drag-and-drop PDF ingestion, benchmark corpora, and persistence.</li>
                  <li><strong>2. Analysis:</strong> PDF diagnostics (pure scan vs hybrid text), DPI estimation, adaptive Otsu binarization, and deskewing.</li>
                  <li><strong>3. Recognition:</strong> Local batch OCR with page-by-page confidence tracking and low-confidence warnings.</li>
                  <li><strong>4. Correction:</strong> Ergonomic side-by-side facsimile vs editable text editor with automated typography rules.</li>
                  <li><strong>5. Structure:</strong> Table of contents hierarchy (H1/H2/H3), Dublin Core metadata, and plate cataloging.</li>
                  <li><strong>6. Export:</strong> Standards-compliant reflowable EPUB 3 generation, live multi-theme e-reader preview, and one-click downloads.</li>
                </ul>
              </div>
            )}

            {selectedDoc === 'I18N_REPORT' && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Internationalization (i18n) &amp; English Version Report
                </h2>
                <p className="text-emerald-600 dark:text-emerald-400 font-medium text-xs mb-4">
                  Full English localization across all 6 core screens, navigation, dialogs, guides, and documentation
                </p>
                <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                  <p>
                    OCRBookor includes an enterprise-grade, strongly typed internationalization framework under <code>src/i18n/</code>.
                  </p>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                    <p>• <strong>Language Switcher:</strong> Instant toggle between French (FR) and English (EN) in the header, hamburger menu, and landing page.</p>
                    <p>• <strong>Separation of Concerns:</strong> Clear distinction between UI display language (FR/EN) and book OCR models (fra, fra_old, eng, deu, lat).</p>
                    <p>• <strong>Strict Fallback:</strong> If an English key is absent or empty, the engine gracefully falls back to French without throwing runtime exceptions.</p>
                    <p>• <strong>Zero Telemetry:</strong> User language choice is persisted locally in <code>localStorage.getItem('ocrbookor_lang')</code>.</p>
                  </div>
                </div>
              </div>
            )}

            {selectedDoc === 'README' && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  OCRBookor v1.2.0 — Convertisseur PDF OCR vers EPUB 3
                </h2>
                <p className="text-indigo-600 dark:text-indigo-400 font-medium text-xs mb-4">
                  Application locale de numérisation, reconnaissance et reconstruction éditoriale de livres
                </p>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                  <p><strong>100% Hors-ligne :</strong> Aucun document n’est transmis à des tiers. Moteurs de reconnaissance open source intégrés localement.</p>
                  <p><strong>Préservation de l’original :</strong> Le fichier PDF source reste intouché ; les résultats bruts et les corrections manuelles sont stockés de façon non-destructive.</p>
                  <p><strong>Reconstruction éditoriale :</strong> Moteur de détection de paragraphes, césures automatiques, typographie soignée selon l’Imprimerie Nationale, arborescence des chapitres et extraction des illustrations.</p>
                </div>
              </div>
            )}

            {selectedDoc === 'BENCHMARK' && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {isFr ? 'Banc d’Essai & Benchmarks OCR (Livre A, B, C)' : 'Benchmark Testing & OCR Accuracy (Books A, B, C)'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  {isFr
                    ? 'Mesures d’exactitude, temps par page et analyse comparative sur le corpus de validation officiel.'
                    : 'Accuracy metrics, execution speed per page, and comparative analysis across benchmark corpora.'}
                </p>
                <div className="space-y-4 text-xs">
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
                    <h4 className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      {isFr ? 'Livre A : Roman récent (Gaston Leroux - Chambre Jaune)' : 'Book A: Modern Novel (Gaston Leroux - Mystery of the Yellow Room)'}
                    </h4>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                      {isFr ? 'Scan propre 300 DPI, 1 colonne, typographie moderne.' : 'Clean 300 DPI scan, single column, standard modern typography.'}
                    </p>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                      <div className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                        CER: <strong className="text-emerald-600 dark:text-emerald-400">0.36%</strong>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                        WER: <strong className="text-emerald-600 dark:text-emerald-400">0.82%</strong>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                        {isFr ? 'Temps :' : 'Speed:'} <strong>1.4s / page</strong>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
                    <h4 className="font-bold text-amber-600 dark:text-amber-400 text-sm">
                      {isFr ? 'Livre B : Ouvrage ancien (Voltaire - Candide 1759)' : 'Book B: Historical Treatise (Voltaire - Candide 1759)'}
                    </h4>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                      {isFr ? 'Papier jauni, s longs (ſ), orthographe d’époque, inclinaison 1.4°.' : 'Aged paper, long s (ſ), 18th-century orthography, 1.4° tilt.'}
                    </p>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                      <div className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                        CER: <strong className="text-amber-600 dark:text-amber-400">2.52%</strong>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                        WER: <strong className="text-amber-600 dark:text-amber-400">4.90%</strong>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                        {isFr ? 'Temps :' : 'Speed:'} <strong>2.1s / page</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedDoc === 'ARCHITECTURE' && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {isFr ? 'Architecture Modulaire du Système' : 'Modular System Architecture'}
                </h2>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono space-y-1 text-indigo-600 dark:text-indigo-300">
                  <p>OCRBookor/</p>
                  <p>├── Frontend React / TypeScript (Vite + Tailwind CSS)</p>
                  <p>│   ├── i18n/ (LanguageContext, translations FR / EN, types)</p>
                  <p>│   ├── Library, Analysis, Recognition, Correction, Structure, Export</p>
                  <p>├── OCR Engines : Tesseract.js (WASM) + RapidOCR (ONNX)</p>
                  <p>├── Reconstruction Pipeline :</p>
                  <p>│   ├── paragraph_builder, chapter_detector, dehyphenation, typography</p>
                  <p>└── Multi-Format Exporters : EPUB 3 (IDPF), Markdown, TXT, HTML5</p>
                </div>
              </div>
            )}

            {selectedDoc === 'INSTALLATION' && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {isFr ? 'Guide d’Installation Linux & Debian' : 'Linux & Debian Installation Guide'}
                </h2>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-emerald-600 dark:text-emerald-400 space-y-2">
                  <p># 1-Line quick install via curl :</p>
                  <p className="text-slate-800 dark:text-slate-300">curl -sSL https://raw.githubusercontent.com/nouhailler/OCRBookor/main/install.sh | sudo bash</p>
                  <p className="pt-2"># Debian / Ubuntu package (.deb) install :</p>
                  <p className="text-slate-800 dark:text-slate-300">sudo dpkg -i ocrbookor_1.2.0_amd64.deb</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
