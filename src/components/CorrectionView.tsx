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
  Maximize2
} from 'lucide-react';
import { OCRProject, PageData, OCRBlock } from '../types/book';
import { applyFrenchTypography, dehyphenateText, calculateQualityMetrics } from '../services/reconstructionService';

interface CorrectionViewProps {
  project: OCRProject;
  onUpdateProject: (updated: OCRProject) => void;
}

export const CorrectionView: React.FC<CorrectionViewProps> = ({
  project,
  onUpdateProject,
}) => {
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
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-800 pb-4">
        {/* Page Nav */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentPageIndex === 0}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition"
              title="Page précédente (Flèche gauche)"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <select
              value={currentPageIndex}
              onChange={(e) => setCurrentPageIndex(Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-white px-2 focus:outline-none cursor-pointer"
            >
              {project.pages.map((p, idx) => (
                <option key={p.pageNumber} value={idx} className="bg-slate-900 text-slate-200">
                  Page {p.pageNumber} {p.validated ? '✓ Validée' : ''}
                </option>
              ))}
            </select>

            <span className="text-xs text-slate-500 pr-2">/ {project.pages.length}</span>

            <button
              onClick={() => setCurrentPageIndex((prev) => Math.min(project.pages.length - 1, prev + 1))}
              disabled={currentPageIndex === project.pages.length - 1}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition"
              title="Page suivante (Flèche droite)"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Validation Status Toggle */}
          <button
            onClick={handleTogglePageValidation}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              currentPage?.validated
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{currentPage?.validated ? 'Page validée' : 'Marquer comme validée'}</span>
          </button>
        </div>

        {/* Quick Editorial Correction Tools */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleApplyFrenchTypographyToPage}
            className="flex items-center space-x-1.5 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-medium text-indigo-300 hover:bg-indigo-900/40 hover:text-white border border-indigo-500/30 transition"
            title="Normaliser la typographie française (guillemets « », espaces insécables devant !?;:, tirets cadratins —, ligatures œ)"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Typo française</span>
          </button>

          <button
            onClick={handleDehyphenatePage}
            className="flex items-center space-x-1.5 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 transition"
            title="Recoller les mots coupés en fin de ligne (mouve- ments -> mouvements)"
          >
            <Scissors className="h-3.5 w-3.5" />
            <span>Résoudre césures</span>
          </button>

          <button
            onClick={() => setShowSearchModal(true)}
            className="flex items-center space-x-1.5 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 transition"
            title="Rechercher et remplacer dans tout le livre"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Rechercher / Remplacer</span>
          </button>
        </div>
      </div>

      {/* Main 2-Pane Side-by-Side Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px]">
        {/* Left: Original Scanned Image Pane (6 cols) */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/90 flex flex-col overflow-hidden shadow-lg">
          {/* Scan Controls Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-xs">
            <span className="font-bold text-slate-300">Scan original (Page {currentPage?.pageNumber})</span>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setZoomLevel((prev) => Math.max(50, prev - 25))}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                title="Dézoomer"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-[11px] font-mono text-slate-400 w-10 text-center">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel((prev) => Math.min(300, prev + 25))}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                title="Zoomer"
              >
                <ZoomIn className="h-4 w-4" />
              </button>

              <div className="h-4 w-px bg-slate-800 mx-1" />

              <button
                onClick={() => setRotationAngle((prev) => (prev + 90) % 360)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                title="Pivoter de 90°"
              >
                <RotateCw className="h-4 w-4" />
              </button>

              <button
                onClick={() => setContrastFilter(!contrastFilter)}
                className={`p-1 rounded ${contrastFilter ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Rehausser le contraste"
              >
                <Sliders className="h-4 w-4" />
              </button>

              <button
                onClick={() => setInvertFilter(!invertFilter)}
                className={`p-1 rounded ${invertFilter ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Inverser noir/blanc"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Canvas Scan Area */}
          <div className="flex-1 overflow-auto bg-slate-950 p-6 flex items-center justify-center relative select-none">
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
                  className="max-w-none shadow-2xl rounded border border-slate-800"
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
              <div className="text-slate-600 text-xs">Aucune image disponible</div>
            )}
          </div>
        </div>

        {/* Right: Editable Text Blocks Pane (6 cols) */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/90 flex flex-col overflow-hidden shadow-lg">
          {/* Header & Engine Switcher */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800 text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-300">Texte reconnu & structuré</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">
                Confiance : {currentPage?.confidence}%
              </span>
            </div>

            {/* Engine Tab Toggle */}
            <div className="flex items-center space-x-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[11px]">
              <button
                onClick={() => setComparisonEngine('tesseract')}
                className={`px-2 py-0.5 rounded font-medium ${
                  comparisonEngine === 'tesseract' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tesseract
              </button>
              <button
                onClick={() => setComparisonEngine('paddle')}
                className={`px-2 py-0.5 rounded font-medium ${
                  comparisonEngine === 'paddle' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                PaddleOCR
              </button>
            </div>
          </div>

          {/* Block Editor Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 font-serif text-slate-200">
            {currentPage?.blocks.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs">
                Aucun texte reconnu sur cette page. Lancez l’OCR dans l’onglet Reconnaissance.
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
                        ? 'border-indigo-500 bg-indigo-500/5 ring-1 ring-indigo-500/30'
                        : 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700'
                    }`}
                  >
                    {/* Top block tools */}
                    <div className="flex items-center justify-between mb-2">
                      <button
                        onClick={() => handleToggleBlockType(block.id)}
                        className="text-[10px] font-sans font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                        title="Cliquer pour changer le type : Paragraphe -> Titre -> Citation"
                      >
                        {block.type === 'heading'
                          ? `Titre H${block.headingLevel || 2}`
                          : block.type === 'quote'
                          ? 'Citation'
                          : 'Paragraphe'}
                      </button>

                      <div className="flex items-center space-x-2">
                        {block.isSuspect && (
                          <span className="flex items-center text-[10px] text-amber-400 font-sans">
                            <AlertTriangle className="h-3 w-3 mr-0.5" />
                            Passage incertain
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-slate-500">{block.confidence}%</span>
                      </div>
                    </div>

                    {/* Editable textarea per block */}
                    <textarea
                      value={block.text}
                      onChange={(e) => handleUpdateBlockText(block.id, e.target.value)}
                      rows={Math.max(2, Math.ceil(block.text.length / 70))}
                      className="w-full bg-transparent text-sm leading-relaxed text-slate-100 focus:outline-none focus:ring-0 resize-none font-serif"
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
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Rechercher et Remplacer dans tout le livre</h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Texte recherché</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ex: com-mencer"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Remplacer par</label>
                <input
                  type="text"
                  value={replaceQuery}
                  onChange={(e) => setReplaceQuery(e.target.value)}
                  placeholder="ex: commencer"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowSearchModal(false)}
                className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800"
              >
                Annuler
              </button>
              <button
                onClick={handleSearchAndReplaceAll}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                Remplacer partout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
