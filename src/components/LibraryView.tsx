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
  ArrowRight
} from 'lucide-react';
import { OCRProject, ProjectStatus } from '../types/book';
import { analyzePDF } from '../services/pdfService';
import { buildBlocksFromRawText, calculateQualityMetrics } from '../services/reconstructionService';
import { createBenchmarkBookA, createBenchmarkBookB, createBenchmarkBookC } from '../services/benchmarkData';

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
      setUploadError('Veuillez sélectionner un fichier au format PDF.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      const analysis = await analyzePDF(file);

      // Convert analyzed pages to project pages
      const newPages = analysis.pages.map((p) => {
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
          ocrEngine: p.hasNativeText ? 'Texte natif extrait' : undefined,
          anomalies: p.isBlank ? ['Page blanche détectée'] : [],
        };
      });

      const titleWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');

      const newProject: OCRProject = {
        id: `proj-${Date.now()}`,
        schema_version: '1.0',
        metadata: {
          id: `book-${Date.now()}`,
          title: titleWithoutExt,
          author: 'Auteur à renseigner',
          language: 'fr',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          sourceFileName: file.name,
          fileSizeBytes: file.size,
          coverImage: newPages[0]?.imageUrl,
        },
        status: analysis.documentType === 'image_only' ? 'pret_ocr' : 'a_corriger',
        progressPercent: analysis.documentType === 'image_only' ? 10 : 60,
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
        chapters: [
          {
            id: 'chap-1',
            title: 'Chapitre Premier',
            level: 1,
            startPage: 1,
            blockIds: newPages.flatMap((p) => p.blocks.map((b) => b.id)),
          },
        ],
        illustrations: [],
        footnotes: [],
        qualityReport: calculateQualityMetrics(newPages),
        documentType: analysis.documentType,
        lastActivePage: 1,
      };

      onCreateProject(newProject);
      onSelectProject(newProject.id);
      onOpenProjectTab(newProject.id, 'analyse');
    } catch (err: any) {
      console.error('Error parsing PDF:', err);
      setUploadError(`Erreur lors de l’analyse du PDF : ${err.message || 'Fichier inaccessible'}`);
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
        if (parsed && parsed.metadata && Array.isArray(parsed.pages)) {
          const importedProject: OCRProject = {
            ...parsed,
            id: `proj-imp-${Date.now()}`,
          };
          onCreateProject(importedProject);
          onSelectProject(importedProject.id);
        } else {
          setUploadError('Le fichier JSON ne respecte pas le schéma de projet OCRBookor.');
        }
      } catch (err: any) {
        setUploadError(`Fichier JSON invalide : ${err.message}`);
      }
    };
    reader.readAsText(file);
    if (jsonInputRef.current) jsonInputRef.current.value = '';
  };

  const getStatusBadge = (status: ProjectStatus) => {
    const map: Record<ProjectStatus, { label: string; bg: string; text: string }> = {
      importe: { label: 'Importé', bg: 'bg-slate-700', text: 'text-slate-300' },
      analyse_en_cours: { label: 'Analyse...', bg: 'bg-amber-900/50', text: 'text-amber-300' },
      pret_ocr: { label: 'Prêt pour OCR', bg: 'bg-blue-900/50', text: 'text-blue-300' },
      ocr_en_cours: { label: 'OCR en cours', bg: 'bg-indigo-900/50', text: 'text-indigo-300' },
      reconstruction_en_cours: { label: 'Reconstruction', bg: 'bg-purple-900/50', text: 'text-purple-300' },
      a_corriger: { label: 'À corriger', bg: 'bg-amber-500/20', text: 'text-amber-400' },
      valide: { label: 'Validé', bg: 'bg-emerald-900/50', text: 'text-emerald-300' },
      exporte: { label: 'Exporté', bg: 'bg-teal-900/50', text: 'text-teal-300' },
      interrompu: { label: 'Interrompu', bg: 'bg-rose-900/50', text: 'text-rose-300' },
      erreur: { label: 'En erreur', bg: 'bg-red-900/50', text: 'text-red-300' },
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
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Bibliothèque des Projets</h1>
          <p className="mt-1 text-sm text-slate-400">
            Gestion locale de vos livres numérisés, numérisation OCR Tesseract et exports EPUB 3
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

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-blue-500 transition disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Analyse du PDF...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>Importer un PDF</span>
              </>
            )}
          </button>

          <button
            onClick={() => jsonInputRef.current?.click()}
            className="flex items-center space-x-1.5 rounded-xl bg-slate-800 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 transition"
            title="Importer une sauvegarde de projet au format JSON"
          >
            <FolderOpen className="h-4 w-4 text-slate-400" />
            <span>Importer JSON</span>
          </button>

          <button
            onClick={onResetBenchmarkCorpus}
            className="flex items-center space-x-1.5 rounded-xl bg-slate-800/80 px-3 py-2.5 text-xs sm:text-sm font-medium text-indigo-300 hover:bg-indigo-900/30 border border-indigo-700/40 transition"
            title="Restaurer les 3 ouvrages de référence du cahier des charges (Roman récent, Ouvrage ancien 1759, Livre illustré)"
          >
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>Charger le Corpus de Test (A, B, C)</span>
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="mb-6 flex items-center space-x-3 rounded-xl bg-rose-500/10 border border-rose-500/30 p-4 text-sm text-rose-300">
          <AlertTriangle className="h-5 w-5 shrink-0 text-rose-400" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Metrics Bar */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Projets</span>
            <BookOpen className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{projects.length}</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Pages Numérisées</span>
            <Layers className="h-4 w-4 text-blue-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{totalPagesCount}</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Ouvrages Prêts / Validés</span>
            <Sparkles className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{validatedBooksCount}</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Moteur OCR Local</span>
            <span className="text-emerald-400 font-mono text-[11px] font-bold">100% Hors-ligne</span>
          </div>
          <div className="mt-2 text-sm font-semibold text-slate-200">Tesseract.js WASM + PP-Structure</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par titre, auteur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-400">Statut :</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none"
          >
            <option value="all">Tous les statuts</option>
            <option value="pret_ocr">Prêt pour OCR</option>
            <option value="ocr_en_cours">OCR en cours</option>
            <option value="a_corriger">À corriger</option>
            <option value="valide">Validé</option>
            <option value="exporte">Exporté</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-slate-600 mb-3" />
          <h3 className="text-lg font-semibold text-slate-200">Aucun projet trouvé</h3>
          <p className="mt-1 text-sm text-slate-400 max-w-md mx-auto">
            Importez un document PDF de livre numérisé ou chargez les trois livres de référence du cahier des charges pour démarrer.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              Importer un PDF
            </button>
            <button
              onClick={onResetBenchmarkCorpus}
              className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-indigo-300 hover:bg-slate-700"
            >
              Charger le corpus de test
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
                className={`group relative rounded-2xl border transition-all duration-200 flex flex-col overflow-hidden bg-slate-900/90 shadow-md ${
                  isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Book Card Header / Preview */}
                <div className="relative h-48 bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-800/80">
                  {p.metadata.coverImage ? (
                    <img
                      src={p.metadata.coverImage}
                      alt={p.metadata.title}
                      className="h-full w-full object-contain p-2 opacity-90 group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-600">
                      <BookOpen className="h-10 w-10 mb-1" />
                      <span className="text-xs">Pas d’aperçu</span>
                    </div>
                  )}

                  <div className="absolute top-3 left-3">{getStatusBadge(p.status)}</div>

                  <div className="absolute top-3 right-3 rounded-md bg-slate-900/90 px-2 py-0.5 text-[11px] font-mono text-slate-300 border border-slate-800">
                    {p.pages.length} {p.pages.length > 1 ? 'pages' : 'page'}
                  </div>

                  {/* Document Type Badge */}
                  <div className="absolute bottom-2 left-3 rounded bg-black/60 backdrop-blur px-2 py-0.5 text-[10px] text-slate-300">
                    {p.documentType === 'image_only'
                      ? '📸 Scanné (Images)'
                      : p.documentType === 'hybrid'
                      ? '🔀 Hybride (Texte + Scan)'
                      : '📄 Texte natif'}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white line-clamp-1 group-hover:text-indigo-400 transition">
                      {p.metadata.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{p.metadata.author}</p>

                    <p className="mt-3 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {p.metadata.description || 'Projet de numérisation OCR'}
                    </p>
                  </div>

                  {/* Quality & Progress */}
                  <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Confiance OCR :</span>
                      <span className="font-semibold text-slate-200">
                        {p.qualityReport.averageConfidence > 0 ? `${p.qualityReport.averageConfidence}%` : 'En attente'}
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${p.progressPercent}%` }}
                      />
                    </div>

                    {/* Actions row */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => {
                            onSelectProject(p.id);
                            // Choose appropriate next step based on status
                            if (p.status === 'pret_ocr') onOpenProjectTab(p.id, 'reconnaissance');
                            else if (p.status === 'valide' || p.status === 'exporte') onOpenProjectTab(p.id, 'export');
                            else onOpenProjectTab(p.id, 'correction');
                          }}
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-medium transition"
                        >
                          <span>Ouvrir</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>

                        <button
                          onClick={() => {
                            onSelectProject(p.id);
                            onOpenProjectTab(p.id, 'analyse');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                          title="Paramètres d'analyse et prétraitement"
                        >
                          Analyse
                        </button>
                      </div>

                      <button
                        onClick={() => setProjectToDelete(p)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Supprimer le projet"
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
              <h3 className="text-lg font-bold text-white">Supprimer le projet ?</h3>
            </div>
            <p className="mt-3 text-sm text-slate-300">
              Êtes-vous certain de vouloir supprimer définitivement le projet «{' '}
              <strong>{projectToDelete.metadata.title}</strong> » ? Cette opération est irréversible.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setProjectToDelete(null)}
                className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  onDeleteProject(projectToDelete.id);
                  setProjectToDelete(null);
                }}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500"
              >
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
