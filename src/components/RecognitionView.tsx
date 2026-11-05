/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Cpu,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Activity,
  Zap,
  Sparkles,
  FileText,
} from 'lucide-react';
import { OCRProject, PageData } from '../types/book';
import { performPageOCR } from '../services/tesseractService';
import { calculateQualityMetrics, detectChaptersFromBlocks } from '../services/reconstructionService';
import { preprocessImage } from '../services/imagePreprocessor';
import { Tooltip } from './Tooltip';
import { useTranslation } from '../i18n';

interface RecognitionViewProps {
  project: OCRProject;
  onUpdateProject: (updated: OCRProject) => void;
  onGoToCorrection: () => void;
}

export const RecognitionView: React.FC<RecognitionViewProps> = ({
  project,
  onUpdateProject,
  onGoToCorrection,
}) => {
  const { t, language } = useTranslation();
  const isFr = language === 'fr';

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [currentStepStatus, setCurrentStepStatus] = useState<string>(
    isFr ? 'Prêt pour la reconnaissance' : 'Ready for recognition'
  );
  const [pageProgress, setPageProgress] = useState<number>(0);

  const isRunningRef = useRef(isRunning);
  const isPausedRef = useRef(isPaused);
  isRunningRef.current = isRunning;
  isPausedRef.current = isPaused;

  // Timer
  useEffect(() => {
    let timer: any = null;
    if (isRunning && !isPaused) {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, isPaused]);

  const startBatchOCR = async () => {
    setIsRunning(true);
    setIsPaused(false);

    const updatedPages = [...project.pages];

    for (let i = 0; i < updatedPages.length; i++) {
      if (!isRunningRef.current) break;

      // Handle pause loop
      while (isPausedRef.current && isRunningRef.current) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      const page = updatedPages[i];
      setCurrentPageIndex(i);

      if (page.isBlank) {
        // Skip blank page
        page.ocrProcessed = true;
        page.confidence = 100;
        continue;
      }

      setCurrentStepStatus(
        isFr ? `Prétraitement de la page ${page.pageNumber}...` : `Preprocessing page ${page.pageNumber}...`
      );
      setPageProgress(0.2);

      let imageToRecognize = page.imageUrl || '';
      try {
        if (imageToRecognize) {
          const preprocessed = await preprocessImage(imageToRecognize, project.preprocessSettings);
          page.processedImageUrl = preprocessed.processedDataUrl;
          imageToRecognize = preprocessed.processedDataUrl;
        }
      } catch (e) {
        console.warn('Preprocessing skipped:', e);
      }

      setCurrentStepStatus(
        isFr ? `Reconnaissance OCR page ${page.pageNumber}...` : `Running OCR on page ${page.pageNumber}...`
      );
      setPageProgress(0.5);

      const ocrResult = await performPageOCR(
        imageToRecognize,
        page.pageNumber,
        project.metadata.language,
        (progress, status) => {
          setPageProgress(progress);
          setCurrentStepStatus(`${isFr ? 'Page' : 'Page'} ${page.pageNumber}: ${status}`);
        }
      );

      if (ocrResult.error) {
        page.ocrError = ocrResult.error;
        page.ocrProcessed = true;
        page.confidence = 0;
        page.quality = 'echec_probable';
        page.anomalies = [...page.anomalies, `Erreur OCR : ${ocrResult.error}`];
      } else {
        page.blocks = ocrResult.blocks;
        page.rawText = ocrResult.text;
        page.confidence = ocrResult.confidence;
        page.quality = ocrResult.quality;
        page.anomalies = ocrResult.anomalies;
        page.ocrProcessed = true;
        page.ocrEngine = 'Tesseract 5.3 (WASM)';
      }

      // Intermediate state save
      const intermediateQuality = calculateQualityMetrics(updatedPages);
      const allBlocks = updatedPages.flatMap((p) => p.blocks);
      const chapters = detectChaptersFromBlocks(allBlocks);

      const updatedProject: OCRProject = {
        ...project,
        pages: updatedPages,
        chapters: chapters.length > 0 ? chapters : project.chapters,
        qualityReport: intermediateQuality,
        progressPercent: Math.round(((i + 1) / updatedPages.length) * 100),
        status: i + 1 === updatedPages.length ? 'a_corriger' : 'ocr_en_cours',
      };

      onUpdateProject(updatedProject);
    }

    setIsRunning(false);
    setCurrentStepStatus(
      isFr ? 'Reconnaissance terminée pour toutes les pages.' : 'OCR recognition completed for all pages.'
    );
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentStepStatus(isFr ? 'Traitement interrompu.' : 'Processing paused/stopped.');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const processedCount = project.pages.filter((p) => p.ocrProcessed).length;
  const totalCount = project.pages.length;
  const progressRatio = totalCount > 0 ? Math.round((processedCount / totalCount) * 100) : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {isFr ? 'Écran 3' : 'Screen 3'}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{project.metadata.title}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isFr ? 'Reconnaissance OCR & Détection Éditoriale' : 'OCR Recognition & Editorial Detection'}
            </h1>
            <Tooltip
              title={isFr ? 'Pipeline OCR Local' : 'Local OCR Pipeline'}
              content={
                isFr
                  ? 'Convertit les images numérisées en texte structuré avec calcul des boîtes englobantes et détection automatique des chapitres.'
                  : 'Converts scanned images into structured text with bounding boxes and automatic chapter detection.'
              }
              tip={isFr ? 'L’exécution s’effectue à 100% dans votre navigateur via WebAssembly.' : 'Runs 100% locally on your machine.'}
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {processedCount > 0 && (
            <button
              onClick={onGoToCorrection}
              className="flex items-center space-x-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-4 py-2.5 text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-700 transition shadow-xs"
            >
              <span>{isFr ? 'Accéder à la correction' : 'Proceed to Correction'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}

          {!isRunning ? (
            <div className="inline-flex items-center gap-1.5">
              <button
                onClick={startBatchOCR}
                className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:from-indigo-500 hover:to-blue-500 transition"
              >
                <Play className="h-4 w-4 fill-white" />
                <span>
                  {processedCount > 0
                    ? isFr
                      ? 'Relancer l’OCR'
                      : 'Re-run OCR'
                    : isFr
                    ? 'Démarrer l’OCR'
                    : 'Start Batch OCR'}
                </span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePauseResume}
                className="flex items-center space-x-1.5 rounded-xl bg-amber-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-amber-500 transition"
              >
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                <span>{isPaused ? (isFr ? 'Reprendre' : 'Resume') : isFr ? 'Pause' : 'Pause'}</span>
              </button>
              <button
                onClick={handleStop}
                className="flex items-center space-x-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-rose-500 transition"
              >
                <RotateCcw className="h-4 w-4" />
                <span>{isFr ? 'Interrompre' : 'Stop'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Real-time Status Card */}
      <div className="mb-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div
              className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                isRunning
                  ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                {isFr ? 'Statut du pipeline' : 'Pipeline Status'}
              </div>
              <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{currentStepStatus}</div>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-xs text-slate-600 dark:text-slate-400">
            <div>
              <span className="block text-slate-400 dark:text-slate-500">
                {isFr ? 'Temps écoulé :' : 'Time elapsed:'}
              </span>
              <span className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200">
                {formatTime(elapsedSeconds)}
              </span>
            </div>
            <div>
              <span className="block text-slate-400 dark:text-slate-500">
                {isFr ? 'Pages traitées :' : 'Processed pages:'}
              </span>
              <span className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {processedCount} / {totalCount} ({progressRatio}%)
              </span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-5">
          <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1.5">
            <span>{isFr ? 'Avancement global' : 'Overall Progress'}</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{progressRatio}%</span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${progressRatio}%` }}
            />
          </div>
        </div>
      </div>

      {/* Pages Progress & Quality Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            {isFr ? 'Détail des pages & Contrôle qualité' : 'Page Details & Quality Control'}
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {isFr ? 'Moteur :' : 'Engine:'} <strong className="text-slate-700 dark:text-slate-200">Tesseract 5 + RapidOCR</strong>
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-[500px] overflow-y-auto">
          {project.pages.map((p, idx) => {
            const isCurrent = isRunning && currentPageIndex === idx;
            return (
              <div
                key={p.pageNumber}
                className={`px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition ${
                  isCurrent ? 'bg-indigo-50/80 dark:bg-indigo-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-8 bg-slate-100 dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <FileText className="h-3 w-3 text-slate-400 dark:text-slate-600" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {t('common.page')} {p.pageNumber}
                      </span>
                      {p.ocrProcessed ? (
                        <span className="inline-flex items-center text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20 font-medium">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {isFr ? 'Reconnu' : 'Recognized'} ({p.confidence}%)
                        </span>
                      ) : isCurrent ? (
                        <span className="inline-flex items-center text-[10px] text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/20 font-medium animate-pulse">
                          {isFr ? 'En cours...' : 'Processing...'}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {isFr ? 'En attente' : 'Pending'}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-lg mt-0.5">
                      {p.rawText ? p.rawText.slice(0, 80) : (isFr ? 'Aucun texte extrait pour le moment' : 'No text extracted yet')}
                    </p>

                    {p.anomalies.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {p.anomalies.map((ano, aIdx) => (
                          <span
                            key={aIdx}
                            className="inline-flex items-center text-[10px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-1.5 py-0.2 rounded"
                          >
                            <AlertTriangle className="h-2.5 w-2.5 mr-1" />
                            {ano}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {isFr ? 'Blocs éditoriaux :' : 'Editorial blocks:'}{' '}
                    <strong className="text-slate-800 dark:text-slate-200">{p.blocks.length}</strong>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {isFr ? 'Qualité :' : 'Quality:'}{' '}
                    <span
                      className={`font-semibold ${
                        p.quality === 'bonne'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : p.quality === 'moyenne'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {p.quality === 'bonne'
                        ? isFr
                          ? 'bonne'
                          : 'good'
                        : p.quality === 'moyenne'
                        ? isFr
                          ? 'moyenne'
                          : 'average'
                        : isFr
                        ? 'à vérifier'
                        : 'review'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
