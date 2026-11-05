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
  Maximize2,
} from 'lucide-react';
import { OCRProject, PreprocessSettings } from '../types/book';
import { Tooltip } from './Tooltip';
import { useTranslation } from '../i18n';

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
  const { t, language } = useTranslation();
  const isFr = language === 'fr';

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
    if (!bytes) return isFr ? 'Inconnu' : 'Unknown';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Title & Action Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
              {isFr ? 'Écran 2' : 'Screen 2'}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{project.metadata.title}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
            {isFr ? 'Analyse & Prétraitement du Document' : 'Document Analysis & Preprocessing'}
          </h1>
        </div>

        <button
          onClick={onStartOCR}
          className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-blue-500 transition"
        >
          <Play className="h-4 w-4 fill-white" />
          <span>{isFr ? 'Lancer la reconnaissance OCR' : 'Launch OCR Recognition'}</span>
        </button>
      </div>

      {/* Top Document Diagnostic Cards */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Document Classification */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {isFr ? 'Nature du document' : 'Document Nature'}
          </div>
          <div className="mt-2 flex items-center space-x-2">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {project.documentType === 'image_only'
                ? (isFr ? 'Scan pur (100% images)' : 'Pure Scan (100% images)')
                : project.documentType === 'hybrid'
                ? (isFr ? 'Document hybride' : 'Hybrid Document')
                : (isFr ? 'Texte numérique natif' : 'Native Digital Text')}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {project.documentType === 'image_only'
              ? (isFr ? 'Nécessite une reconnaissance complète par OCR' : 'Requires full OCR recognition pass')
              : (isFr ? 'Extraction sélective possible pour accélérer le traitement' : 'Selective extraction available to accelerate processing')}
          </p>
        </div>

        {/* Dimensions & Resolution */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {isFr ? `Résolution & Dimensions (Page ${currentPage?.pageNumber || 1})` : `Resolution & Dimensions (Page ${currentPage?.pageNumber || 1})`}
          </div>
          <div className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
            {currentPage?.dpi
              ? `${currentPage.dpi} DPI ${currentPage.dpiEstimated ? (isFr ? '(calculé A4)' : '(estimated A4)') : ''}`
              : (isFr ? 'Non mesurable' : 'Unmeasured')}{' '}
            ({currentPage?.width || 0} × {currentPage?.height || 0} px)
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {isFr ? 'Fichier source :' : 'Source file:'} {formatFileSize(project.metadata.fileSizeBytes || 0)} ({project.pages.length} {t('common.pages')})
          </p>
        </div>

        {/* Blank Pages & Anomalies */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {isFr ? 'Contrôle d’intégrité' : 'Integrity Check'}
          </div>
          <div className="mt-2 text-sm font-bold text-slate-800 dark:text-slate-200">
            {project.pages.filter((p) => p.isBlank).length > 0
              ? `${project.pages.filter((p) => p.isBlank).length} ${isFr ? 'page(s) blanche(s)' : 'blank page(s)'}`
              : (isFr ? '0 page blanche' : '0 blank pages')}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {project.pages.filter((p) => p.isDegraded).length > 0
              ? `${project.pages.filter((p) => p.isDegraded).length} ${isFr ? 'scan(s) à contraste jauni' : 'scan(s) with variable contrast'}`
              : (isFr ? 'Qualité globale des scans homogène' : 'Homogeneous overall scan quality')}
          </p>
        </div>

        {/* Engine Target */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-sm">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {isFr ? 'Moteur OCR principal' : 'Primary OCR Engine'}
          </div>
          <div className="mt-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
            Tesseract 5 + RapidOCR
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {isFr ? '+ Détection automatique des blocs' : '+ Layout & block detection'}
          </p>
        </div>
      </div>

      {/* Main 2-Column Working Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Page Thumbnails List (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 flex flex-col h-[650px] shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300">
              {isFr ? `Pages du livre (${project.pages.length})` : `Book Pages (${project.pages.length})`}
            </h3>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              {isFr ? 'Sélectionner pour aperçu' : 'Click to preview'}
            </span>
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
                      ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-500/10 ring-1 ring-indigo-500'
                      : 'border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="h-14 w-10 shrink-0 bg-slate-100 dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-700/60 overflow-hidden flex items-center justify-center">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={`Page ${p.pageNumber}`} className="h-full w-full object-cover" />
                    ) : (
                      <FileText className="h-4 w-4 text-slate-400 dark:text-slate-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {t('common.page')} {p.pageNumber}
                      </span>
                      {p.isBlank ? (
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded">
                          {isFr ? 'Blanche' : 'Blank'}
                        </span>
                      ) : p.isDegraded ? (
                        <span className="text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded">
                          {isFr ? 'Jaunie/Dégradée' : 'Degraded'}
                        </span>
                      ) : p.hasNativeText ? (
                        <span className="text-[10px] bg-blue-500/20 text-blue-600 dark:text-blue-300 px-1.5 py-0.5 rounded">
                          {isFr ? 'Texte natif' : 'Native Text'}
                        </span>
                      ) : (
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded">
                          {isFr ? 'Scan image' : 'Image Scan'}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {p.rawText ? p.rawText.slice(0, 50) : (isFr ? 'En attente d’OCR' : 'Pending OCR')}
                    </p>

                    <div className="mt-1 flex items-center space-x-2 text-[10px] text-slate-400 dark:text-slate-500">
                      <span>
                        {p.width} × {p.height} px
                      </span>
                      {p.skewAngle !== 0 && (
                        <span>{isFr ? `Inclinaison ${p.skewAngle}°` : `Tilt ${p.skewAngle}°`}</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Interactive Page Preview (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 flex flex-col h-[650px] shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {isFr ? `Aperçu : Page ${currentPage?.pageNumber}` : `Preview: Page ${currentPage?.pageNumber}`}
              </span>
              {currentPage?.skewAngle !== 0 && (
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded">
                  Angle: {currentPage?.skewAngle}°
                </span>
              )}
            </div>

            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
              <button
                onClick={() => setPreviewMode('original')}
                className={`px-2 py-1 rounded font-medium ${
                  previewMode === 'original'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {isFr ? 'Original' : 'Original'}
              </button>
              <button
                onClick={() => setPreviewMode('processed')}
                className={`px-2 py-1 rounded font-medium ${
                  previewMode === 'processed'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {isFr ? 'Prétraité' : 'Processed'}
              </button>
            </div>
          </div>

          {/* Canvas or Image View */}
          <div className="mt-3 flex-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800/80 flex items-center justify-center overflow-auto p-4 relative">
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
              <div className="text-slate-500 dark:text-slate-600 text-center text-xs">
                {isFr ? 'Aucune image disponible' : 'No image available'}
              </div>
            )}
          </div>
        </div>

        {/* Right: Preprocessing Config Panel (3 cols) */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 flex flex-col h-[650px] overflow-y-auto shadow-sm">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Sliders className="h-4 w-4 text-indigo-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300">
              {isFr ? 'Réglages Prétraitement' : 'Preprocessing Settings'}
            </h3>
            <Tooltip
              title={isFr ? 'Filtres d’amélioration d’image' : 'Image Enhancement Filters'}
              content={
                isFr
                  ? 'Ces paramètres optimisent le rendu des scans avant qu’ils ne soient soumis au moteur OCR afin de réduire le taux d’erreur de reconnaissance.'
                  : 'These settings optimize scan quality before OCR processing to minimize character recognition error rates.'
              }
            />
          </div>

          <div className="mt-4 space-y-4 text-xs">
            {/* Resolution DPI */}
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <label className="text-slate-800 dark:text-slate-300 font-semibold">
                  {isFr ? 'Résolution cible (DPI)' : 'Target Resolution (DPI)'}
                </label>
                <Tooltip
                  title={isFr ? 'Résolution en DPI' : 'Resolution in DPI'}
                  content={
                    isFr
                      ? 'Nombre de points par pouce (Dots Per Inch). En dessous de 200 DPI, les caractères sont flous et difficiles à lire pour le moteur OCR.'
                      : 'Dots Per Inch. Under 200 DPI, characters are blurred and harder for OCR engines to parse.'
                  }
                  tip={isFr ? '300 DPI est la norme optimale pour les livres imprimés.' : '300 DPI is optimal for printed books.'}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[200, 300, 400].map((dpiVal) => (
                  <button
                    key={dpiVal}
                    onClick={() => updateSettings('dpi', dpiVal as any)}
                    className={`py-1.5 px-2 rounded-lg font-semibold border text-center transition ${
                      project.preprocessSettings.dpi === dpiVal
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {dpiVal} DPI
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                {isFr ? '300 DPI recommandé pour Tesseract' : '300 DPI recommended for Tesseract'}
              </span>
            </div>

            {/* Checkbox Options */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <label className="flex items-center justify-between text-slate-700 dark:text-slate-300 cursor-pointer">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={project.preprocessSettings.grayscale}
                    onChange={(e) => updateSettings('grayscale', e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-indigo-600 focus:ring-0"
                  />
                  <span>{isFr ? 'Conversion en niveaux de gris' : 'Convert to Grayscale'}</span>
                </div>
                <Tooltip
                  title={isFr ? 'Niveaux de gris' : 'Grayscale'}
                  content={
                    isFr
                      ? 'Convertit l’image en 256 nuances de gris pour éliminer les teintes de papier jauni.'
                      : 'Converts image to 256 gray levels to eliminate paper yellowing and discoloration.'
                  }
                />
              </label>

              <label className="flex items-center justify-between text-slate-700 dark:text-slate-300 cursor-pointer">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={project.preprocessSettings.contrastEnhance}
                    onChange={(e) => updateSettings('contrastEnhance', e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-indigo-600 focus:ring-0"
                  />
                  <span>{isFr ? 'Rehaussement du contraste' : 'Contrast Enhancement'}</span>
                </div>
                <Tooltip
                  title={isFr ? 'Rehaussement de contraste' : 'Contrast Enhancement'}
                  content={
                    isFr
                      ? 'Éclaircit les fonds clairs et assombrit les caractères noirs estompés.'
                      : 'Brightens backgrounds and darkens faded black text.'
                  }
                />
              </label>

              <label className="flex items-center justify-between text-slate-700 dark:text-slate-300 cursor-pointer">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={project.preprocessSettings.autoDeskew}
                    onChange={(e) => updateSettings('autoDeskew', e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-indigo-600 focus:ring-0"
                  />
                  <span>{isFr ? 'Redressement automatique (Deskew)' : 'Automatic Deskewing'}</span>
                </div>
                <Tooltip
                  title={isFr ? 'Redressement des pages (Deskew)' : 'Automatic Deskew'}
                  content={
                    isFr
                      ? 'Calcule l’angle d’inclinaison des lignes via le profil de projection et pivote la page pour la rendre droite.'
                      : 'Calculates tilt angle via projection profile and straightens the page horizontally.'
                  }
                  tip={isFr ? 'Essentiel pour éviter la fusion de deux lignes contiguës.' : 'Crucial to prevent accidental line merging.'}
                />
              </label>

              <label className="flex items-center justify-between text-slate-700 dark:text-slate-300 cursor-pointer">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={project.preprocessSettings.removeBorders}
                    onChange={(e) => updateSettings('removeBorders', e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-indigo-600 focus:ring-0"
                  />
                  <span>{isFr ? 'Suppression des bordures noires' : 'Remove Black Borders'}</span>
                </div>
                <Tooltip
                  title={isFr ? 'Suppression des bordures' : 'Border Removal'}
                  content={
                    isFr
                      ? 'Supprime les marges noires produites par les bords du scanner ou la reliure du livre.'
                      : 'Trims dark margins produced by flatbed scanner borders or book spine shadows.'
                  }
                />
              </label>

              <label className="flex items-center justify-between text-slate-700 dark:text-slate-300 cursor-pointer">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={project.preprocessSettings.denoise}
                    onChange={(e) => updateSettings('denoise', e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-indigo-600 focus:ring-0"
                  />
                  <span>{isFr ? 'Filtre anti-bruit pour papier texturé' : 'Denoise Filter (Speckles)'}</span>
                </div>
                <Tooltip
                  title={isFr ? 'Filtre anti-bruit' : 'Noise Filter'}
                  content={
                    isFr
                      ? 'Efface les petits grains d’encre isolés et les taches fréquentes sur les livres anciens.'
                      : 'Cleans isolated ink speckles and foxing marks common in historical prints.'
                  }
                />
              </label>

              <label className="flex items-center justify-between text-slate-700 dark:text-slate-300 cursor-pointer">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={project.preprocessSettings.preserveColorImages}
                    onChange={(e) => updateSettings('preserveColorImages', e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-indigo-600 focus:ring-0"
                  />
                  <span>{isFr ? 'Préserver les gravures en couleur' : 'Preserve Color Illustrations'}</span>
                </div>
                <Tooltip
                  title={isFr ? 'Conservation des gravures' : 'Preserve Engravings'}
                  content={
                    isFr
                      ? 'Conserve la version originale en couleur des zones identifiées comme images ou gravures lors de l’export EPUB.'
                      : 'Retains high-res full-color graphics for detected engravings during EPUB 3 export.'
                  }
                />
              </label>
            </div>

            {/* Binarization Slider */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-800 dark:text-slate-300 font-semibold">
                    {isFr ? 'Seuil de binarisation (Otsu)' : 'Binarization Threshold (Otsu)'}
                  </span>
                  <Tooltip
                    title={isFr ? 'Binarisation Noir & Blanc' : 'Black & White Binarization'}
                    content={
                      isFr
                        ? 'Transforme les pixels en noir pur ou blanc pur selon un seuil d’intensité lumineuse.'
                        : 'Converts pixels to pure black or white based on luminance threshold.'
                    }
                    tip={isFr ? '0 = mode automatique recommandé.' : '0 = recommended automatic mode.'}
                  />
                </div>
                <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                  {project.preprocessSettings.binarizationThreshold === 0
                    ? (isFr ? 'Désactivé' : 'Auto/Disabled')
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
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                {isFr ? '0 = Niveaux de gris doux (recommandé)' : '0 = Soft grayscale (recommended)'}
              </span>
            </div>

            {/* Document Language Selection (OCR Model) */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-1.5 mb-1">
                <label className="text-slate-800 dark:text-slate-300 font-semibold block">
                  {isFr ? 'Modèle linguistique OCR du livre' : 'Book Document OCR Language Model'}
                </label>
                <Tooltip
                  title={isFr ? 'Dictionnaire linguistique' : 'OCR Language Dictionary'}
                  content={
                    isFr
                      ? 'Charge le dictionnaire de grammaire et de lexique adapté à la langue et à l’époque du livre scanné.'
                      : 'Loads grammar and dictionary patterns corresponding to the book’s publication period and language.'
                  }
                  tip={isFr ? 'Pour les ouvrages anciens avec le "s" long (ſ), sélectionnez Français ancien.' : 'For pre-1800 books with long s (ſ), select Historical French.'}
                />
              </div>
              <select
                value={project.metadata.language}
                onChange={(e) =>
                  onUpdateProject({
                    ...project,
                    metadata: { ...project.metadata, language: e.target.value },
                  })
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:border-indigo-500 focus:outline-none shadow-xs"
              >
                <option value="fr">{isFr ? 'Français moderne (fra) — Recommandé' : 'Modern French (fra) — Recommended'}</option>
                <option value="fra_old">{isFr ? 'Français ancien (XVIIe - XVIIIe s.)' : 'Historical French (17th - 18th century)'}</option>
                <option value="en">{isFr ? 'Anglais (eng)' : 'English (eng)'}</option>
                <option value="de">{isFr ? 'Allemand (deu)' : 'German (deu)'}</option>
                <option value="la">{isFr ? 'Latin classique (lat)' : 'Classical Latin (lat)'}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
