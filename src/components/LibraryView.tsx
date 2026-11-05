/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Upload,
  Plus,
  Search,
  BookOpen,
  Trash2,
  FileText,
  Clock,
  Sparkles,
  Download,
  AlertTriangle,
  FolderOpen,
  RefreshCw,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { OCRProject, ProjectStatus } from '../types/book';
import { analyzePDF } from '../services/pdfService';
import { buildBlocksFromRawText, calculateQualityMetrics } from '../services/reconstructionService';
import { createBenchmarkBookA, createBenchmarkBookB, createBenchmarkBookC } from '../services/benchmarkData';
import { Tooltip } from './Tooltip';
import { useTranslation } from '../i18n';

interface LibraryViewProps {
  projects: OCRProject[];
  activeProject: OCRProject | null;
  onSelectProject: (id: string) => void;
  onOpenProjectTab: (projectId: string, tab: 'analyse' | 'reconnaissance' | 'correction' | 'structure' | 'export') => void;
  onCreateProject: (project: OCRProject) => void;
  onDeleteProject: (id: string) => void;
  onResetBenchmarkCorpus: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  projects,
  activeProject,
  onSelectProject,
  onOpenProjectTab,
  onCreateProject,
  onDeleteProject,
  onResetBenchmarkCorpus,
}) => {
  const { t, language } = useTranslation();
  const isFr = language === 'fr';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<OCRProject | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.metadata.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.metadata.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.metadata.sourceFileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPagesCount = projects.reduce((acc, p) => acc + p.pages.length, 0);
  const validatedBooksCount = projects.filter((p) => p.status === 'valide' || p.status === 'exporte').length;

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError(isFr ? 'Veuillez sélectionner un fichier au format PDF.' : 'Please select a PDF file.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      const analysis = await analyzePDF(file);

      // Convert analyzed pages to project pages
      const newPages: any[] = analysis.pages.map((p) => {
        const blocks = p.extractedText ? buildBlocksFromRawText(p.extractedText, p.pageNumber, 92) : [];
        return {
          pageNumber: p.pageNumber,
          width: p.width,
          height: p.height,
          dpi: analysis.estimatedDpi,
          dpiEstimated: analysis.dpiEstimated,
          hasNativeText: p.hasNativeText,
          isBlank: p.isBlank,
          isDegraded: false,
          skewAngle: 0,
          imageUrl: p.previewImageUrl,
          processedImageUrl: p.previewImageUrl,
          blocks,
          rawText: p.extractedText,
          confidence: p.hasNativeText ? 92 : 0,
          quality: (p.isBlank ? 'bonne' : p.hasNativeText ? 'bonne' : 'moyenne') as any,
          validated: false,
          ocrProcessed: p.hasNativeText,
          anomalies: [],
        };
      });

      const initialQualityReport = calculateQualityMetrics(newPages);

      const newProject: OCRProject = {
        id: `proj-${Date.now()}`,
        schema_version: '1.0',
        status: (analysis.documentType === 'native_text' ? 'a_corriger' : 'pret_ocr') as ProjectStatus,
        documentType: analysis.documentType,
        metadata: {
          id: `meta-${Date.now()}`,
          title: file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
          author: isFr ? 'Auteur inconnu' : 'Unknown Author',
          language: 'fra',
          sourceFileName: file.name,
          fileSizeBytes: file.size,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          description: isFr
            ? `Projet créé à partir de ${file.name} (${analysis.totalPages} pages, ~${analysis.estimatedDpi} DPI)`
            : `Project created from ${file.name} (${analysis.totalPages} pages, ~${analysis.estimatedDpi} DPI)`,
        },
        preprocessSettings: {
          dpi: 300,
          grayscale: true,
          contrastEnhance: true,
          denoise: false,
          autoDeskew: true,
          removeBorders: true,
          binarizationThreshold: 0,
          preserveColorImages: true,
        },
        pages: newPages,
        chapters: [],
        illustrations: [],
        footnotes: [],
        qualityReport: initialQualityReport,
        progressPercent: analysis.documentType === 'native_text' ? 50 : 10,
        lastActivePage: 1,
      };

      onCreateProject(newProject);
      onSelectProject(newProject.id);
    } catch (err: any) {
      console.error('PDF upload error:', err);
      setUploadError(err.message || (isFr ? 'Erreur lors de l’analyse du PDF.' : 'Error analyzing PDF.'));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleJsonImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.id && parsed.pages && parsed.metadata) {
          onCreateProject(parsed);
          onSelectProject(parsed.id);
        } else {
          setUploadError(isFr ? 'Format JSON de projet invalide.' : 'Invalid JSON project format.');
        }
      } catch (err) {
        setUploadError(isFr ? 'Fichier JSON corrompu ou illisible.' : 'Corrupted or unreadable JSON file.');
      }
    };
    reader.readAsText(file);
    if (jsonInputRef.current) jsonInputRef.current.value = '';
  };

  const getStatusBadge = (status: ProjectStatus) => {
    const map: Record<ProjectStatus, { label: string; bg: string; text: string }> = {
      importe: { label: isFr ? 'Importé' : 'Imported', bg: 'bg-slate-700/60', text: 'text-slate-200' },
      analyse_en_cours: { label: isFr ? 'Analyse...' : 'Analyzing...', bg: 'bg-amber-900/50', text: 'text-amber-300' },
      pret_ocr: { label: isFr ? 'Prêt OCR' : 'Ready for OCR', bg: 'bg-blue-900/50', text: 'text-blue-300' },
      ocr_en_cours: { label: isFr ? 'OCR en cours' : 'OCR Running', bg: 'bg-indigo-900/50', text: 'text-indigo-300' },
      reconstruction_en_cours: { label: isFr ? 'Reconstruction...' : 'Reconstructing...', bg: 'bg-indigo-900/60', text: 'text-indigo-300' },
      a_corriger: { label: isFr ? 'À corriger' : 'Needs Review', bg: 'bg-amber-900/60', text: 'text-amber-300' },
      valide: { label: isFr ? 'Validé' : 'Validated', bg: 'bg-emerald-900/50', text: 'text-emerald-300' },
      exporte: { label: isFr ? 'Exporté' : 'Exported', bg: 'bg-teal-900/50', text: 'text-teal-300' },
      interrompu: { label: isFr ? 'Interrompu' : 'Paused', bg: 'bg-rose-900/50', text: 'text-rose-300' },
      erreur: { label: isFr ? 'En erreur' : 'Error', bg: 'bg-red-900/50', text: 'text-red-300' },
    };
    const s = map[status] || { label: status, bg: 'bg-slate-700', text: 'text-slate-300' };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border border-white/5 ${s.bg} ${s.text}`}>
        {s.label}
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Top Banner & Stats */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isFr ? 'Bibliothèque des Projets' : 'Project Library'}
            </h1>
            <Tooltip
              title={isFr ? 'Bibliothèque de numérisation' : 'Digitization Library'}
              content={
                isFr
                  ? 'Point central de gestion de tous vos livres numérisés. Vos documents sont stockés en local sur votre poste (IndexedDB / SQLite).'
                  : 'Central hub for all your digitized book projects. Stored locally on your machine.'
              }
              tip={isFr ? 'Vous pouvez importer n’importe quel livre au format PDF pour démarrer.' : 'Import any scanned PDF book to get started.'}
            />
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {isFr
              ? 'Gestion locale de vos livres numérisés, reconnaissance OCR Tesseract/RapidOCR et exports EPUB 3'
              : 'Local management of scanned books, Tesseract/RapidOCR recognition, and EPUB 3 exports'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePdfUpload}
            accept=".pdf,application/pdf"
            className="hidden"
          />
          <input
            type="file"
            ref={jsonInputRef}
            onChange={handleJsonImport}
            accept=".json,application/json"
            className="hidden"
          />

          <div className="inline-flex items-center gap-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:from-indigo-500 hover:to-blue-500 transition disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>{isFr ? 'Analyse du PDF...' : 'Analyzing PDF...'}</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>{isFr ? 'Importer un PDF' : 'Import Scanned PDF'}</span>
                </>
              )}
            </button>
            <Tooltip
              title={isFr ? 'Importer un scan PDF' : 'Import PDF Scan'}
              content={
                isFr
                  ? 'Sélectionnez un document PDF composé de scans de pages. L’analyse calculera le DPI estimé et le type de scan.'
                  : 'Select a PDF document containing scanned pages. Pre-analysis will estimate DPI and document structure.'
              }
              placement="bottom"
            />
          </div>

          <div className="inline-flex items-center gap-1">
            <button
              onClick={() => jsonInputRef.current?.click()}
              className="flex items-center space-x-1.5 rounded-xl bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition shadow-sm"
              title={isFr ? 'Importer une sauvegarde de projet au format JSON' : 'Import project backup from JSON'}
            >
              <FolderOpen className="h-4 w-4 text-slate-400" />
              <span>{isFr ? 'Importer JSON' : 'Import JSON'}</span>
            </button>
          </div>

          <div className="inline-flex items-center gap-1">
            <button
              onClick={onResetBenchmarkCorpus}
              className="flex items-center space-x-1.5 rounded-xl bg-indigo-50 dark:bg-slate-800/80 px-3 py-2.5 text-xs sm:text-sm font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700/40 transition shadow-sm"
              title={
                isFr
                  ? 'Restaurer les 3 ouvrages de référence (Candide 1759, Descartes, Montesquieu)'
                  : 'Restore the 3 benchmark books (Voltaire 1759, Descartes, Montesquieu)'
              }
            >
              <Sparkles className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
              <span>{isFr ? 'Charger le Corpus de Test' : 'Load Benchmark Corpus'}</span>
            </button>
          </div>
        </div>
      </div>

      {uploadError && (
        <div className="mb-6 flex items-center space-x-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 p-4 text-sm text-rose-800 dark:text-rose-300">
          <AlertTriangle className="h-5 w-5 shrink-0 text-rose-500" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Metrics Bar */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 shadow-sm transition">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>{isFr ? 'Total Projets' : 'Total Projects'}</span>
            <BookOpen className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{projects.length}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 shadow-sm transition">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>{isFr ? 'Pages Numérisées' : 'Scanned Pages'}</span>
            <Layers className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{totalPagesCount}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 shadow-sm transition">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>{isFr ? 'Ouvrages Validés' : 'Validated Books'}</span>
            <Sparkles className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{validatedBooksCount}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 shadow-sm transition">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>{isFr ? 'Moteur OCR Actif' : 'Active OCR Engine'}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold">100% Local</span>
          </div>
          <div className="mt-2 text-xs font-semibold text-slate-800 dark:text-slate-200">Tesseract + RapidOCR</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80 flex items-center gap-1.5">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={isFr ? 'Rechercher par titre, auteur...' : 'Search by title, author...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none shadow-sm"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-500 dark:text-slate-400">{isFr ? 'Statut :' : 'Status:'}</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:border-indigo-500 focus:outline-none shadow-sm"
          >
            <option value="all">{isFr ? 'Tous les statuts' : 'All statuses'}</option>
            <option value="pret_ocr">{isFr ? 'Prêt pour OCR' : 'Ready for OCR'}</option>
            <option value="ocr_en_cours">{isFr ? 'OCR en cours' : 'OCR Running'}</option>
            <option value="a_corriger">{isFr ? 'À corriger' : 'Needs review'}</option>
            <option value="valide">{isFr ? 'Validé' : 'Validated'}</option>
            <option value="exporte">{isFr ? 'Exporté' : 'Exported'}</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-slate-600 mb-3" />
          <h3 className="text-lg font-semibold text-slate-200">
            {isFr ? 'Aucun projet trouvé' : 'No projects found'}
          </h3>
          <p className="mt-1 text-sm text-slate-400 max-w-md mx-auto">
            {isFr
              ? 'Importez un document PDF de livre numérisé ou chargez les trois livres de référence du cahier des charges pour démarrer.'
              : 'Import a scanned PDF book or load the three reference benchmark books to start exploring.'}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              {isFr ? 'Importer un PDF' : 'Import PDF'}
            </button>
            <button
              onClick={onResetBenchmarkCorpus}
              className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-indigo-300 hover:bg-slate-700"
            >
              {isFr ? 'Charger le corpus de test' : 'Load Benchmark Corpus'}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((p) => {
            const isSelected = activeProject?.id === p.id;
            return (
              <div
                key={p.id}
                className={`group relative rounded-2xl border transition-all duration-200 flex flex-col overflow-hidden bg-white dark:bg-slate-900/90 shadow-sm hover:shadow-md ${
                  isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Book Card Header / Preview */}
                <div className="relative h-48 bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-200 dark:border-slate-800/80">
                  {p.metadata.coverImage ? (
                    <img
                      src={p.metadata.coverImage}
                      alt={p.metadata.title}
                      className="h-full w-full object-contain p-2 opacity-95 group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
                      <BookOpen className="h-10 w-10 mb-1" />
                      <span className="text-xs">{isFr ? 'Pas d’aperçu' : 'No preview'}</span>
                    </div>
                  )}

                  <div className="absolute top-3 left-3">{getStatusBadge(p.status)}</div>

                  <div className="absolute top-3 right-3 rounded-md bg-white/90 dark:bg-slate-900/90 px-2 py-0.5 text-[11px] font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shadow-xs">
                    {p.pages.length} {p.pages.length > 1 ? t('common.pages') : t('common.page')}
                  </div>

                  {/* Document Type Badge */}
                  <div className="absolute bottom-2 left-3 rounded bg-white/80 dark:bg-black/60 backdrop-blur px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                    {p.documentType === 'image_only'
                      ? (isFr ? '📸 Scanné (Images)' : '📸 Scanned (Images)')
                      : p.documentType === 'hybrid'
                      ? (isFr ? '🔀 Hybride (Texte + Scan)' : '🔀 Hybrid (Text + Scan)')
                      : (isFr ? '📄 Texte natif' : '📄 Native Text')}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                      {p.metadata.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{p.metadata.author}</p>

                    <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {p.metadata.description || (isFr ? 'Projet de numérisation OCR' : 'OCR digitization project')}
                    </p>
                  </div>

                  {/* Quality & Progress */}
                  <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span>{isFr ? 'Confiance OCR :' : 'OCR Confidence:'}</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-200">
                        {p.qualityReport.averageConfidence > 0 ? `${p.qualityReport.averageConfidence}%` : (isFr ? 'En attente' : 'Pending')}
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-indigo-600 dark:bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${p.progressPercent}%` }}
                      />
                    </div>

                    {/* Actions row */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => {
                            onSelectProject(p.id);
                            // Choose appropriate next step based on status
                            if (p.status === 'pret_ocr') onOpenProjectTab(p.id, 'reconnaissance');
                            else if (p.status === 'valide' || p.status === 'exporte') onOpenProjectTab(p.id, 'export');
                            else onOpenProjectTab(p.id, 'correction');
                          }}
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
                        >
                          <span>{isFr ? 'Ouvrir' : 'Open'}</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>

                        <button
                          onClick={() => {
                            onSelectProject(p.id);
                            onOpenProjectTab(p.id, 'analyse');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
                          title={isFr ? 'Paramètres d’analyse et prétraitement' : 'Analysis and preprocessing parameters'}
                        >
                          {isFr ? 'Analyse' : 'Analysis'}
                        </button>
                      </div>

                      <button
                        onClick={() => setProjectToDelete(p)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition"
                        title={isFr ? 'Supprimer le projet' : 'Delete project'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center space-x-3 text-rose-400">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-bold text-white">
                {isFr ? 'Supprimer le projet ?' : 'Delete Project?'}
              </h3>
            </div>
            <p className="mt-3 text-sm text-slate-300">
              {isFr ? (
                <>
                  Êtes-vous certain de vouloir supprimer définitivement le projet «{' '}
                  <strong>{projectToDelete.metadata.title}</strong> » ? Cette opération est irréversible.
                </>
              ) : (
                <>
                  Are you sure you want to permanently delete project "
                  <strong>{projectToDelete.metadata.title}</strong>"? This action cannot be undone.
                </>
              )}
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setProjectToDelete(null)}
                className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => {
                  onDeleteProject(projectToDelete.id);
                  setProjectToDelete(null);
                }}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500"
              >
                {isFr ? 'Supprimer définitivement' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
