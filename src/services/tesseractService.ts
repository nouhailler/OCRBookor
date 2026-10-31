/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createWorker, Worker } from 'tesseract.js';
import { OCRBlock, WordConfidence, OCRResultAlternative } from '../types/book';
import { buildBlocksFromRawText, evaluatePageQuality } from './reconstructionService';

let activeWorker: Worker | null = null;
let currentLanguage = 'fra';

export interface OCRPageResult {
  text: string;
  confidence: number;
  blocks: OCRBlock[];
  words: WordConfidence[];
  anomalies: string[];
  quality: 'bonne' | 'moyenne' | 'insuffisante' | 'echec_probable';
  error?: string;
  alternatives?: OCRResultAlternative[];
}

export async function getTesseractWorker(lang: string = 'fra'): Promise<Worker> {
  if (activeWorker && currentLanguage === lang) {
    return activeWorker;
  }

  if (activeWorker) {
    try {
      await activeWorker.terminate();
    } catch {
      // ignore
    }
    activeWorker = null;
  }

  const worker = await createWorker(lang);
  activeWorker = worker;
  currentLanguage = lang;
  return worker;
}

export async function terminateTesseractWorker(): Promise<void> {
  if (activeWorker) {
    try {
      await activeWorker.terminate();
    } catch {
      // ignore
    }
    activeWorker = null;
  }
}

/**
 * Recognize an image with actual Tesseract OCR
 * No fake simulation or fabricated results are permitted.
 */
export async function performPageOCR(
  imageSrc: string,
  pageNumber: number,
  language: string = 'fra',
  onProgress?: (progress: number, status: string) => void
): Promise<OCRPageResult> {
  try {
    if (!imageSrc) {
      throw new Error('Image source introuvable pour cette page');
    }

    if (onProgress) onProgress(0.1, 'Initialisation du moteur Tesseract local...');
    const worker = await getTesseractWorker(language);

    if (onProgress) onProgress(0.3, 'Reconnaissance des caractères en cours...');
    const result = await worker.recognize(imageSrc);

    if (onProgress) onProgress(0.8, 'Extraction des blocs et scores de confiance réels...');

    const rawText = result.data.text || '';
    const confidence = Math.round(result.data.confidence || 0);

    // Extract word-level bounding boxes and confidences directly from Tesseract
    const pageData = result.data as any;
    const words: WordConfidence[] = (pageData.words || []).map((w: any) => ({
      word: w.text,
      confidence: Math.round(w.confidence || 0),
      bbox: w.bbox
        ? {
            x: w.bbox.x0,
            y: w.bbox.y0,
            width: w.bbox.x1 - w.bbox.x0,
            height: w.bbox.y1 - w.bbox.y0,
          }
        : undefined,
    }));

    // Convert raw OCR lines into structured editorial blocks
    let blocks: OCRBlock[] = [];
    if (pageData.lines && pageData.lines.length > 0) {
      blocks = pageData.lines.map((l: any, index: number) => {
        const text = (l.text || '').trim();
        const isHeading = isProbableHeading(text);
        const lineConf = Math.round(l.confidence || confidence);

        return {
          id: `p${pageNumber}-b${index + 1}`,
          type: isHeading ? 'heading' : 'paragraph',
          headingLevel: isHeading ? 2 : undefined,
          text,
          source_page: pageNumber,
          confidence: lineConf,
          validated: false,
          bbox: l.bbox ? [l.bbox.x0, l.bbox.y0, l.bbox.x1, l.bbox.y1] : [50, 100 + index * 40, 750, 140 + index * 40],
          originalText: text,
          isSuspect: lineConf < 65,
          suspectReason: lineConf < 65 ? `Confiance faible (${lineConf}%)` : undefined,
        };
      });
    } else {
      blocks = buildBlocksFromRawText(rawText, pageNumber, confidence);
    }

    const { quality, anomalies } = evaluatePageQuality(rawText, confidence);

    // Honest secondary engine representation:
    // PaddleOCR is not installed in the browser WASM runtime.
    const alternatives: OCRResultAlternative[] = [
      {
        engine: 'paddleocr',
        text: '',
        confidence: 0,
        status: 'indisponible',
        message: 'PaddleOCR requiert le backend Python (consultez backend/ocr/paddle_engine.py)',
      },
      {
        engine: 'rapidocr',
        text: '',
        confidence: 0,
        status: 'indisponible',
        message: 'RapidOCR optionnel non initialisé',
      },
    ];

    if (onProgress) onProgress(1.0, 'Page terminée');

    return {
      text: rawText,
      confidence,
      blocks,
      words,
      anomalies,
      quality,
      alternatives,
    };
  } catch (err: any) {
    console.error(`Erreur OCR réelle sur la page ${pageNumber}:`, err);
    // Return explicit error state without simulation
    return {
      text: '',
      confidence: 0,
      blocks: [],
      words: [],
      anomalies: [`Échec du traitement OCR : ${err.message || 'Erreur interne'}`],
      quality: 'echec_probable',
      error: err.message || 'Erreur inconnue',
    };
  }
}

function isProbableHeading(text: string): boolean {
  if (text.length > 80) return false;
  if (/^(?:CHAPITRE|Chapitre|LIVRE|Livre|PARTIE|Partie|PROLOGUE|ÉPILOGUE|INTRODUCTION)/i.test(text)) return true;
  if (text.length < 40 && text === text.toUpperCase() && /[A-Z]/.test(text) && !text.includes('.')) return true;
  return false;
}
