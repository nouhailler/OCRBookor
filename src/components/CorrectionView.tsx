/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  Search,
  Replace,
  Sparkles,
  Scissors,
  Split,
  Undo2,
  Redo2,
  Eye,
  Sliders,
  Type,
  Maximize2,
} from 'lucide-react';
import { OCRProject, PageData, OCRBlock } from '../types/book';
import { applyFrenchTypography, dehyphenateText, calculateQualityMetrics } from '../services/reconstructionService';
import { Tooltip } from './Tooltip';
import { useTranslation } from '../i18n';

interface CorrectionViewProps {
  project: OCRProject;
  onUpdateProject: (updated: OCRProject) => void;
}

export const CorrectionView: React.FC<CorrectionViewProps> = ({
  project,
  onUpdateProject,
}) => {
  const { t, language } = useTranslation();
  const isFr = language === 'fr';

  const [currentPageIndex, setCurrentPageIndex] = useState<number>(
    Math.max(0, Math.min(project.lastActivePage ? project.lastActivePage - 1 : 0, project.pages.length - 1))
  );

  // Scan viewer controls
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [invertFilter, setInvertFilter] = useState<boolean>(false);
  const [contrastFilter, setContrastFilter] = useState<boolean>(false);
  const [activeHoverBlockId, setActiveHoverBlockId] = useState<string | null>(null);

  // Search & Replace Modal
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [replaceQuery, setReplaceQuery] = useState<string>('');
  const [searchMatchesCount, setSearchMatchesCount] = useState<number>(0);

  // Multi-engine comparison mode
  const [comparisonEngine, setComparisonEngine] = useState<'tesseract' | 'paddle'>('tesseract');

  const currentPage = project.pages[currentPageIndex] || project.pages[0];

  // Update last active page in project
  useEffect(() => {
    if (project.lastActivePage !== currentPageIndex + 1) {
      onUpdateProject({ ...project, lastActivePage: currentPageIndex + 1 });
    }
  }, [currentPageIndex]);

  const handleUpdateBlockText = (blockId: string, newText: string) => {
    const updatedPages = [...project.pages];
    const page = { ...updatedPages[currentPageIndex] };
    page.blocks = page.blocks.map((b) => (b.id === blockId ? { ...b, text: newText } : b));
    page.rawText = page.blocks.map((b) => b.text).join('\n\n');
    updatedPages[currentPageIndex] = page;

    onUpdateProject({
      ...project,
      pages: updatedPages,
      qualityReport: calculateQualityMetrics(updatedPages),
    });
  };

  const handleToggleBlockType = (blockId: string) => {
    const updatedPages = [...project.pages];
    const page = { ...updatedPages[currentPageIndex] };
    page.blocks = page.blocks.map((b) => {
      if (b.id === blockId) {
        const nextType = b.type === 'paragraph' ? 'heading' : b.type === 'heading' ? 'quote' : 'paragraph';
        return {
          ...b,
          type: nextType,
          headingLevel: nextType === 'heading' ? 2 : undefined,
        };
      }
      return b;
    });
    updatedPages[currentPageIndex] = page;
    onUpdateProject({ ...project, pages: updatedPages });
  };

  const handleApplyFrenchTypographyToPage = () => {
    const updatedPages = [...project.pages];
    const page = { ...updatedPages[currentPageIndex] };
    page.blocks = page.blocks.map((b) => ({
      ...b,
      text: applyFrenchTypography(b.text),
    }));
    page.rawText = page.blocks.map((b) => b.text).join('\n\n');
    updatedPages[currentPageIndex] = page;
    onUpdateProject({ ...project, pages: updatedPages });
  };

  const handleDehyphenatePage = () => {
    const updatedPages = [...project.pages];
    const page = { ...updatedPages[currentPageIndex] };
    page.blocks = page.blocks.map((b) => ({
      ...b,
      text: dehyphenateText(b.text),
    }));
    page.rawText = page.blocks.map((b) => b.text).join('\n\n');
    updatedPages[currentPageIndex] = page;
    onUpdateProject({ ...project, pages: updatedPages });
  };

  const handleTogglePageValidation = () => {
    const updatedPages = [...project.pages];
    const page = { ...updatedPages[currentPageIndex] };
    page.validated = !page.validated;
    updatedPages[currentPageIndex] = page;

    const allValidated = updatedPages.every((p) => p.validated);
    onUpdateProject({
      ...project,
      pages: updatedPages,
      qualityReport: calculateQualityMetrics(updatedPages),
      status: allValidated ? 'valide' : 'a_corriger',
    });
  };

  const handleSearchAndReplaceAll = () => {
    if (!searchQuery) return;

    const updatedPages = project.pages.map((p) => {
      let changed = false;
      const updatedBlocks = p.blocks.map((b) => {
        if (b.text.includes(searchQuery)) {
          changed = true;
          return {
            ...b,
            text: b.text.replaceAll(searchQuery, replaceQuery),
          };
        }
        return b;
      });

      return changed
        ? {
            ...p,
            blocks: updatedBlocks,
            rawText: updatedBlocks.map((b) => b.text).join('\n\n'),
          }
        : p;
    });

    onUpdateProject({
      ...project,
      pages: updatedPages,
    });

    setShowSearchModal(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Top Navigation & Actions Bar */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        {/* Page Nav */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-xs">
            <button
              onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentPageIndex === 0}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition"
              title={isFr ? 'Page précédente (Flèche gauche)' : 'Previous page (Left arrow)'}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <select
              value={currentPageIndex}
              onChange={(e) => setCurrentPageIndex(Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-white px-2 focus:outline-none cursor-pointer"
            >
              {project.pages.map((p, idx) => (
                <option key={p.pageNumber} value={idx} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                  {t('common.page')} {p.pageNumber} {p.validated ? (isFr ? '✓ Validée' : '✓ Validated') : ''}
                </option>
              ))}
            </select>

            <span className="text-xs text-slate-400 dark:text-slate-500 pr-2">/ {project.pages.length}</span>

            <button
              onClick={() => setCurrentPageIndex((prev) => Math.min(project.pages.length - 1, prev + 1))}
              disabled={currentPageIndex === project.pages.length - 1}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition"
              title={isFr ? 'Page suivante (Flèche droite)' : 'Next page (Right arrow)'}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Validation Status Toggle */}
          <div className="inline-flex items-center gap-1">
            <button
              onClick={handleTogglePageValidation}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                currentPage?.validated
                  ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/40 hover:bg-emerald-100 dark:hover:bg-emerald-500/30'
                  : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>
                {currentPage?.validated
                  ? isFr
                    ? 'Page validée'
                    : 'Page validated'
                  : isFr
                  ? 'Marquer comme validée'
                  : 'Mark as validated'}
              </span>
            </button>
            <Tooltip
              title={isFr ? 'Validation de page' : 'Page Validation'}
              content={
                isFr
                  ? 'Indique que la page a été entièrement relue et corrigée par un opérateur humain.'
                  : 'Flags this page as fully proofread and verified by human review.'
              }
            />
          </div>
        </div>

        {/* Quick Editorial Correction Tools */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1">
            <button
              onClick={handleApplyFrenchTypographyToPage}
              className="flex items-center space-x-1.5 rounded-xl bg-indigo-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 hover:text-indigo-900 dark:hover:text-white border border-indigo-200 dark:border-indigo-500/30 transition shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isFr ? 'Typo française' : 'Normalize Typography'}</span>
            </button>
            <Tooltip
              title={isFr ? 'Typographie & Ponctuation' : 'Typography Normalization'}
              content={
                isFr
                  ? 'Remplace les guillemets droits par des guillemets « », insère les espaces insécables avant !?;: et ligature les œ et æ.'
                  : 'Restores proper quotation marks, non-breaking spaces before punctuation, and typographic ligatures.'
              }
              tip={isFr ? 'Gain de temps considérable sur les romans.' : 'Substantial time saver for book texts.'}
            />
          </div>

          <div className="inline-flex items-center gap-1">
            <button
              onClick={handleDehyphenatePage}
              className="flex items-center space-x-1.5 rounded-xl bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition shadow-xs"
            >
              <Scissors className="h-3.5 w-3.5" />
              <span>{isFr ? 'Résoudre césures' : 'Dehyphenate'}</span>
            </button>
            <Tooltip
              title={isFr ? 'Recollage des césures (Dehyphenation)' : 'Line End Dehyphenation'}
              content={
                isFr
                  ? 'Fusionne les mots coupés par un tiret en fin de ligne tout en préservant les mots composés légitimes.'
                  : 'Merges words split by hyphens across line endings while preserving compound words.'
              }
            />
          </div>

          <div className="inline-flex items-center gap-1">
            <button
              onClick={() => setShowSearchModal(true)}
              className="flex items-center space-x-1.5 rounded-xl bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition shadow-xs"
            >
              <Search className="h-3.5 w-3.5" />
              <span>{isFr ? 'Rechercher / Remplacer' : 'Find / Replace'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Pane Side-by-Side Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px]">
        {/* Left: Original Scanned Image Pane (6 cols) */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 flex flex-col overflow-hidden shadow-lg">
          {/* Scan Controls Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {isFr ? `Scan original (Page ${currentPage?.pageNumber})` : `Original Scan (Page ${currentPage?.pageNumber})`}
            </span>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setZoomLevel((prev) => Math.max(50, prev - 25))}
                className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
                title={isFr ? 'Dézoomer' : 'Zoom out'}
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 w-10 text-center">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel((prev) => Math.min(300, prev + 25))}
                className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
                title={isFr ? 'Zoomer' : 'Zoom in'}
              >
                <ZoomIn className="h-4 w-4" />
              </button>

              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

              <button
                onClick={() => setRotationAngle((prev) => (prev + 90) % 360)}
                className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
                title={isFr ? 'Pivoter de 90°' : 'Rotate 90°'}
              >
                <RotateCw className="h-4 w-4" />
              </button>

              <button
                onClick={() => setContrastFilter(!contrastFilter)}
                className={`p-1 rounded ${contrastFilter ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                title={isFr ? 'Rehausser le contraste' : 'Enhance contrast'}
              >
                <Sliders className="h-4 w-4" />
              </button>

              <button
                onClick={() => setInvertFilter(!invertFilter)}
                className={`p-1 rounded ${invertFilter ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                title={isFr ? 'Inverser noir/blanc' : 'Invert black/white'}
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Canvas Scan Area */}
          <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-950 p-6 flex items-center justify-center relative select-none">
            {currentPage?.imageUrl ? (
              <div
                className="relative transition-transform duration-150 origin-center"
                style={{
                  transform: `scale(${zoomLevel / 100}) rotate(${rotationAngle}deg)`,
                  filter: `${invertFilter ? 'invert(100%)' : ''} ${contrastFilter ? 'contrast(160%)' : ''}`,
                }}
              >
                <img
                  src={currentPage.imageUrl}
                  alt={`Page ${currentPage.pageNumber}`}
                  className="max-w-none shadow-2xl rounded border border-slate-300 dark:border-slate-800"
                  style={{ width: '560px' }}
                />

                {/* Bounding box highlight overlay */}
                {currentPage.blocks.map((block) => {
                  const isHovered = activeHoverBlockId === block.id;
                  if (!isHovered) return null;
                  return (
                    <div
                      key={block.id}
                      className="absolute border-2 border-indigo-400 bg-indigo-500/20 pointer-events-none rounded transition-all"
                      style={{
                        left: `${(block.bbox[0] / 800) * 560}px`,
                        top: `${(block.bbox[1] / 1130) * (560 * (1130 / 800))}px`,
                        width: `${((block.bbox[2] - block.bbox[0]) / 800) * 560}px`,
                        height: `${((block.bbox[3] - block.bbox[1]) / 1130) * (560 * (1130 / 800))}px`,
                      }}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-slate-500 dark:text-slate-600 text-xs">
                {isFr ? 'Aucune image disponible' : 'No image available'}
              </div>
            )}
          </div>
        </div>

        {/* Right: Editable Text Blocks Pane (6 cols) */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 flex flex-col overflow-hidden shadow-lg">
          {/* Header & Engine Switcher */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {isFr ? 'Texte reconnu & structuré' : 'Recognized & Structured Text'}
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20 font-medium">
                {isFr ? 'Confiance :' : 'Confidence:'} {currentPage?.confidence}%
              </span>
            </div>

            {/* Engine Tab Toggle */}
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px]">
              <button
                onClick={() => setComparisonEngine('tesseract')}
                className={`px-2 py-0.5 rounded font-medium ${
                  comparisonEngine === 'tesseract'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Tesseract
              </button>
              <button
                onClick={() => setComparisonEngine('paddle')}
                className={`px-2 py-0.5 rounded font-medium ${
                  comparisonEngine === 'paddle'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                RapidOCR
              </button>
            </div>
          </div>

          {/* Block Editor Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 font-serif text-slate-800 dark:text-slate-200">
            {comparisonEngine === 'paddle' ? (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 text-xs text-amber-700 dark:text-amber-300 font-sans space-y-3">
                <div className="flex items-center space-x-2 text-sm font-bold text-slate-900 dark:text-white">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                  <span>{isFr ? 'Moteur RapidOCR (ONNX Runtime)' : 'RapidOCR Engine (ONNX Runtime)'}</span>
                </div>
                <p>
                  {isFr
                    ? 'RapidOCR s’exécute avec des modèles profonds ONNX pour l’analyse de mise en page complexe (PP-Structure).'
                    : 'RapidOCR runs with deep ONNX models for complex page layouts (PP-Structure).'}
                </p>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300">
                  <p># Linux Desktop / Service daemon :</p>
                  <p className="text-emerald-400">ocrbookor-daemon --engine rapidocr</p>
                </div>
              </div>
            ) : currentPage?.blocks.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs">
                {currentPage?.ocrError ? (
                  <span className="text-rose-500 font-sans">
                    {isFr ? `Erreur OCR : ${currentPage.ocrError}` : `OCR Error: ${currentPage.ocrError}`}
                  </span>
                ) : (
                  isFr
                    ? 'Aucun texte reconnu sur cette page. Lancez l’OCR dans l’onglet Reconnaissance.'
                    : 'No text recognized on this page. Run OCR in the Recognition tab.'
                )}
              </div>
            ) : (
              currentPage?.blocks.map((block) => {
                const isHovered = activeHoverBlockId === block.id;
                return (
                  <div
                    key={block.id}
                    onMouseEnter={() => setActiveHoverBlockId(block.id)}
                    onMouseLeave={() => setActiveHoverBlockId(null)}
                    className={`group relative p-3 rounded-xl border transition duration-150 ${
                      isHovered
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/5 ring-1 ring-indigo-500/30'
                        : 'border-slate-200 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {/* Top block tools */}
                    <div className="flex items-center justify-between mb-2">
                      <button
                        onClick={() => handleToggleBlockType(block.id)}
                        className="text-[10px] font-sans font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition"
                        title={isFr ? 'Changer le type : Paragraphe -> Titre -> Citation' : 'Change block type: Paragraph -> Heading -> Quote'}
                      >
                        {block.type === 'heading'
                          ? `${isFr ? 'Titre' : 'Heading'} H${block.headingLevel || 2}`
                          : block.type === 'quote'
                          ? (isFr ? 'Citation' : 'Quote')
                          : (isFr ? 'Paragraphe' : 'Paragraph')}
                      </button>

                      <div className="flex items-center space-x-2">
                        {block.isSuspect && (
                          <span className="flex items-center text-[10px] text-amber-600 dark:text-amber-400 font-sans">
                            <AlertTriangle className="h-3 w-3 mr-0.5" />
                            {isFr ? 'Passage incertain' : 'Low confidence'}
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{block.confidence}%</span>
                      </div>
                    </div>

                    {/* Editable textarea per block */}
                    <textarea
                      value={block.text}
                      onChange={(e) => handleUpdateBlockText(block.id, e.target.value)}
                      rows={Math.max(2, Math.ceil(block.text.length / 70))}
                      className="w-full bg-transparent text-sm leading-relaxed text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-0 resize-none font-serif"
                      style={{
                        fontWeight: block.type === 'heading' ? 'bold' : 'normal',
                        fontStyle: block.type === 'quote' ? 'italic' : 'normal',
                      }}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Search and Replace Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              {isFr ? 'Rechercher et Remplacer dans tout le livre' : 'Find and Replace Across Whole Book'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 font-medium block mb-1">
                  {isFr ? 'Texte recherché' : 'Find query'}
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isFr ? 'ex: com-mencer' : 'e.g. re- cognition'}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 font-medium block mb-1">
                  {isFr ? 'Remplacer par' : 'Replace with'}
                </label>
                <input
                  type="text"
                  value={replaceQuery}
                  onChange={(e) => setReplaceQuery(e.target.value)}
                  placeholder={isFr ? 'ex: commencer' : 'e.g. recognition'}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowSearchModal(false)}
                className="rounded-xl px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSearchAndReplaceAll}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                {isFr ? 'Remplacer partout' : 'Replace All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
