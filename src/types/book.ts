/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ProjectStatus =
  | 'importe'
  | 'analyse_en_cours'
  | 'pret_ocr'
  | 'ocr_en_cours'
  | 'reconstruction_en_cours'
  | 'a_corriger'
  | 'valide'
  | 'exporte'
  | 'interrompu'
  | 'erreur';

export type PageQuality = 'bonne' | 'moyenne' | 'insuffisante' | 'echec_probable';

export type BlockType =
  | 'heading'
  | 'paragraph'
  | 'quote'
  | 'footnote'
  | 'image'
  | 'caption'
  | 'table'
  | 'page_break'
  | 'separator';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WordConfidence {
  word: string;
  confidence: number; // 0 to 100
  bbox?: BoundingBox;
}

export interface OCRResultAlternative {
  engine: 'tesseract' | 'paddleocr' | 'rapidocr';
  text: string;
  confidence: number;
}

export interface OCRBlock {
  id: string;
  type: BlockType;
  headingLevel?: 1 | 2 | 3 | 4;
  text: string;
  source_page: number;
  confidence: number; // 0 - 100
  validated: boolean;
  bbox: [number, number, number, number]; // [x0, y0, x1, y1]
  words?: WordConfidence[];
  alternatives?: OCRResultAlternative[];
  originalText?: string;
  isSuspect?: boolean;
  suspectReason?: string;
}

export interface PageData {
  pageNumber: number;
  width: number;
  height: number;
  dpi: number;
  hasNativeText: boolean;
  isBlank: boolean;
  isDegraded: boolean;
  skewAngle: number;
  imageUrl?: string;
  processedImageUrl?: string;
  blocks: OCRBlock[];
  rawText: string;
  correctedText?: string;
  confidence: number;
  quality: PageQuality;
  validated: boolean;
  ocrProcessed: boolean;
  ocrEngine?: string;
  anomalies: string[];
}

export interface Chapter {
  id: string;
  title: string;
  level: 1 | 2 | 3;
  startPage: number;
  endPage?: number;
  blockIds: string[];
}

export interface Illustration {
  id: string;
  pageNumber: number;
  title: string;
  caption?: string;
  imageUrl: string;
  bbox: [number, number, number, number];
  chapterId?: string;
}

export interface Footnote {
  id: string;
  pageNumber: number;
  marker: string; // e.g. "1", "*", "a"
  text: string;
}

export interface BookMetadata {
  id: string;
  title: string;
  author: string;
  language: string; // 'fr', 'en', etc.
  publisher?: string;
  publicationYear?: string;
  isbn?: string;
  description?: string;
  genre?: string;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
  sourceFileName: string;
  fileSizeBytes: number;
}

export interface PreprocessSettings {
  dpi: 200 | 300 | 400;
  grayscale: boolean;
  contrastEnhance: boolean;
  denoise: boolean;
  autoDeskew: boolean;
  removeBorders: boolean;
  binarizationThreshold: number; // 0 = off, 1-255 threshold
  preserveColorImages: boolean;
}

export interface QualityReport {
  totalPages: number;
  processedPages: number;
  goodPages: number;
  mediumPages: number;
  badPages: number;
  averageConfidence: number;
  estimatedCER: number; // Character error rate %
  estimatedWER: number; // Word error rate %
  totalWords: number;
  totalCharacters: number;
  anomaliesDetected: number;
  validatedPages: number;
}

export interface OCRProject {
  id: string;
  schema_version: '1.0';
  metadata: BookMetadata;
  status: ProjectStatus;
  progressPercent: number;
  preprocessSettings: PreprocessSettings;
  pages: PageData[];
  chapters: Chapter[];
  illustrations: Illustration[];
  footnotes: Footnote[];
  qualityReport: QualityReport;
  documentType: 'image_only' | 'native_text' | 'hybrid';
  lastActivePage: number;
}
