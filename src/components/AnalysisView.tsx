/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  Sliders,
  Play,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  Eye,
  Settings,
  Sparkles,
  Info,
  Maximize2
} from 'lucide-react';
import { OCRProject, PreprocessSettings } from '../types/book';

interface AnalysisViewProps {
  project: OCRProject;
  onUpdateProject: (updated: OCRProject) => void;
  onStartOCR: () => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({
  project,
  onUpdateProject,
  onStartOCR,
}) => {
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);
  const [previewMode, setPreviewMode] = useState<'original' | 'processed'>('original');

  const currentPage = project.pages[selectedPageIndex] || project.pages[0];

  const updateSettings = (key: keyof PreprocessSettings, value: any) => {
    const updated: OCRProject = {
      ...project,
      preprocessSettings: {
        ...project.preprocessSettings,
        [key]: value,
      },
    };
    onUpdateProject(updated);
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return 'Inconnu';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Title & Action Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Écran 2</span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400">{project.metadata.title}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-0.5">Analyse & Prétraitement du Document</h1>
        </div>

        <button
          onClick={onStartOCR}
          className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-blue-500 transition"
        >
          <Play className="h-4 w-4 fill-white" />
          <span>Lancer la reconnaissance OCR</span>
        </button>
      </div>

      {/* Top Document Diagnostic Cards */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Document Classification */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
          <div className="text-xs text-slate-400 font-medium">Nature du document</div>
          <div className="mt-2 flex items-center space-x-2">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
            <span className="text-sm font-bold text-white">
              {project.documentType === 'image_only'
                ? 'Scan pur (100% images)'
                : project.documentType === 'hybrid'
                ? 'Document hybride'
                : 'Texte numérique natif'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {project.documentType === 'image_only'
              ? 'Nécessite une reconnaissance complète par OCR'
              : 'Extraction sélective possible pour accélérer le traitement'}
          </p>
        </div>

        {/* Dimensions & Resolution */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
          <div className="text-xs text-slate-400 font-medium">Résolution & Dimensions (Page {currentPage?.pageNumber || 1})</div>
          <div className="mt-2 text-sm font-bold text-white">
            {currentPage?.dpi ? `${currentPage.dpi} DPI ${currentPage.dpiEstimated ? '(calculé sur dimensions A4)' : ''}` : 'Résolution non mesurable'} ({currentPage?.width || 0} × {currentPage?.height || 0} px)
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Fichier source : {formatFileSize(project.metadata.fileSizeBytes)} ({project.pages.length} pages)
          </p>
        </div>

        {/* Blank Pages & Anomalies */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
          <div className="text-xs text-slate-400 font-medium">Contrôle d’intégrité</div>
          <div className="mt-2 text-sm font-bold text-slate-200">
            {project.pages.filter((p) => p.isBlank).length > 0
              ? `${project.pages.filter((p) => p.isBlank).length} page(s) blanche(s)`
              : '0 page blanche'}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {project.pages.filter((p) => p.isDegraded).length > 0
              ? `${project.pages.filter((p) => p.isDegraded).length} scan(s) à contraste variable ou jauni`
              : 'Qualité globale des scans homogène'}
          </p>
        </div>

        {/* Engine Target */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4">
          <div className="text-xs text-slate-400 font-medium">Moteur OCR principal</div>
          <div className="mt-2 text-sm font-bold text-emerald-400">
            Tesseract v5.3 (Français)
          </div>
          <p className="mt-1 text-xs text-slate-400">
            + Détection des blocs et paragraphes PP-Structure
          </p>
        </div>
      </div>

      {/* Main 2-Column Working Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Page Thumbnails List (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 flex flex-col h-[650px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Pages du livre ({project.pages.length})
            </h3>
            <span className="text-[11px] text-slate-500">Sélectionner pour prévisualiser</span>
          </div>

          <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1">
            {project.pages.map((p, idx) => {
              const isSelected = selectedPageIndex === idx;
              return (
                <button
                  key={p.pageNumber}
                  onClick={() => setSelectedPageIndex(idx)}
                  className={`w-full flex items-center space-x-3 p-2.5 rounded-xl border text-left transition ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500'
                      : 'border-slate-800/80 bg-slate-950/60 hover:bg-slate-800/50'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="h-14 w-10 shrink-0 bg-slate-900 rounded border border-slate-700/60 overflow-hidden flex items-center justify-center">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={`Page ${p.pageNumber}`} className="h-full w-full object-cover" />
                    ) : (
                      <FileText className="h-4 w-4 text-slate-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Page {p.pageNumber}</span>
                      {p.isBlank ? (
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Blanche</span>
                      ) : p.isDegraded ? (
                        <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">Jaunie/Dégradée</span>
                      ) : p.hasNativeText ? (
                        <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">Texte natif</span>
                      ) : (
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded">Scan image</span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {p.rawText ? p.rawText.slice(0, 50) : 'En attente d’OCR'}
                    </p>

                    <div className="mt-1 flex items-center space-x-2 text-[10px] text-slate-500">
                      <span>{p.width} × {p.height} px</span>
                      {p.skewAngle !== 0 && <span>Inclinaison {p.skewAngle}°</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Interactive Page Preview (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 flex flex-col h-[650px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white">Aperçu : Page {currentPage?.pageNumber}</span>
              {currentPage?.skewAngle !== 0 && (
                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                  Angle : {currentPage?.skewAngle}°
                </span>
              )}
            </div>

            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setPreviewMode('original')}
                className={`px-2 py-1 rounded font-medium ${
                  previewMode === 'original' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Original
              </button>
              <button
                onClick={() => setPreviewMode('processed')}
                className={`px-2 py-1 rounded font-medium ${
                  previewMode === 'processed' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Prétraité
              </button>
            </div>
          </div>

          {/* Canvas or Image View */}
          <div className="mt-3 flex-1 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-center overflow-auto p-4 relative">
            {currentPage?.imageUrl ? (
              <img
                src={previewMode === 'processed' && currentPage.processedImageUrl ? currentPage.processedImageUrl : currentPage.imageUrl}
                alt={`Page ${currentPage.pageNumber}`}
                className="max-h-full max-w-full object-contain shadow-2xl rounded"
                style={{
                  filter:
                    previewMode === 'processed'
                      ? `${project.preprocessSettings.grayscale ? 'grayscale(100%)' : ''} ${
                          project.preprocessSettings.contrastEnhance ? 'contrast(135%)' : ''
                        }`
                      : 'none',
                }}
              />
            ) : (
              <div className="text-slate-600 text-center text-xs">Aucune image disponible</div>
            )}
          </div>
        </div>

        {/* Right: Preprocessing Config Panel (3 cols) */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 flex flex-col h-[650px] overflow-y-auto">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <Sliders className="h-4 w-4 text-indigo-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Réglages Prétraitement
            </h3>
          </div>

          <div className="mt-4 space-y-4 text-xs">
            {/* Resolution DPI */}
            <div>
              <label className="text-slate-300 font-semibold block mb-1.5">Résolution cible (DPI)</label>
              <div className="grid grid-cols-3 gap-2">
                {[200, 300, 400].map((dpiVal) => (
                  <button
                    key={dpiVal}
                    onClick={() => updateSettings('dpi', dpiVal as any)}
                    className={`py-1.5 px-2 rounded-lg font-medium border text-center transition ${
                      project.preprocessSettings.dpi === dpiVal
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {dpiVal} DPI
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">300 DPI recommandé pour Tesseract</span>
            </div>

            {/* Checkbox Options */}
            <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
              <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={project.preprocessSettings.grayscale}
                  onChange={(e) => updateSettings('grayscale', e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                />
                <span>Conversion en niveaux de gris</span>
              </label>

              <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={project.preprocessSettings.contrastEnhance}
                  onChange={(e) => updateSettings('contrastEnhance', e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                />
                <span>Correction & rehaussement du contraste</span>
              </label>

              <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={project.preprocessSettings.autoDeskew}
                  onChange={(e) => updateSettings('autoDeskew', e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                />
                <span>Redressement automatique des pages inclinées</span>
              </label>

              <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={project.preprocessSettings.removeBorders}
                  onChange={(e) => updateSettings('removeBorders', e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                />
                <span>Suppression des bordures noires de scanner</span>
              </label>

              <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={project.preprocessSettings.denoise}
                  onChange={(e) => updateSettings('denoise', e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                />
                <span>Filtre anti-bruit pour papier texturé</span>
              </label>

              <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={project.preprocessSettings.preserveColorImages}
                  onChange={(e) => updateSettings('preserveColorImages', e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                />
                <span>Préserver les illustrations en couleur</span>
              </label>
            </div>

            {/* Binarization Slider */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-300 font-semibold">Seuil de binarisation</span>
                <span className="text-[11px] font-mono text-indigo-400">
                  {project.preprocessSettings.binarizationThreshold === 0
                    ? 'Désactivé'
                    : project.preprocessSettings.binarizationThreshold}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="240"
                step="5"
                value={project.preprocessSettings.binarizationThreshold}
                onChange={(e) => updateSettings('binarizationThreshold', Number(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                0 = Niveaux de gris doux (recommandé pour roman & gravures)
              </span>
            </div>

            {/* Language Selection */}
            <div className="pt-2 border-t border-slate-800/80">
              <label className="text-slate-300 font-semibold block mb-1">Modèle linguistique OCR</label>
              <select
                value={project.metadata.language}
                onChange={(e) =>
                  onUpdateProject({
                    ...project,
                    metadata: { ...project.metadata, language: e.target.value },
                  })
                }
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
              >
                <option value="fr">Français (fra) — Recommandé</option>
                <option value="fra_old">Français ancien (XVIIe - XVIIIe s.)</option>
                <option value="en">Anglais (eng)</option>
                <option value="de">Allemand (deu)</option>
                <option value="la">Latin classique (lat)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
