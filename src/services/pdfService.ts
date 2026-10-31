/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as pdfjsLib from 'pdfjs-dist';
import { PageData } from '../types/book';

// Set worker to CDN or local fallback
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
}

export interface PDFAnalysisResult {
  fileName: string;
  fileSizeBytes: number;
  totalPages: number;
  documentType: 'image_only' | 'native_text' | 'hybrid';
  estimatedDpi: number;
  pages: {
    pageNumber: number;
    width: number;
    height: number;
    hasNativeText: boolean;
    nativeTextLength: number;
    hasImages: boolean;
    isBlank: boolean;
    previewImageUrl: string;
    extractedText: string;
  }[];
}

/**
 * Load and analyze a PDF file buffer
 */
export async function analyzePDF(file: File): Promise<PDFAnalysisResult> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const totalPages = pdfDoc.numPages;

  const analyzedPages: PDFAnalysisResult['pages'] = [];
  let pagesWithNativeText = 0;

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 }); // Good resolution for preview & analysis
    const textContent = await page.getTextContent();
    const nativeText = textContent.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ')
      .trim();

    const hasNativeText = nativeText.length > 50;
    if (hasNativeText) pagesWithNativeText++;

    // Render to thumbnail canvas
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    let previewImageUrl = '';
    let isBlank = false;

    if (ctx) {
      await (page.render as any)({ canvasContext: ctx, viewport, canvas }).promise;
      previewImageUrl = canvas.toDataURL('image/jpeg', 0.85);

      // Simple blank detection
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      let nonWhitePixels = 0;
      for (let p = 0; p < data.length; p += 16) {
        if (data[p] < 220 || data[p + 1] < 220 || data[p + 2] < 220) {
          nonWhitePixels++;
        }
      }
      isBlank = nonWhitePixels / (data.length / 16) < 0.005;
    }

    analyzedPages.push({
      pageNumber: i,
      width: Math.round(viewport.width),
      height: Math.round(viewport.height),
      hasNativeText,
      nativeTextLength: nativeText.length,
      hasImages: true,
      isBlank,
      previewImageUrl,
      extractedText: nativeText,
    });
  }

  let documentType: 'image_only' | 'native_text' | 'hybrid' = 'image_only';
  if (pagesWithNativeText === totalPages) {
    documentType = 'native_text';
  } else if (pagesWithNativeText > 0) {
    documentType = 'hybrid';
  }

  // Calculate estimated DPI based on standard A4 page dimensions (8.27 x 11.69 inches)
  const firstPage = analyzedPages[0];
  const estimatedDpi = firstPage ? Math.round((firstPage.width / 8.27) * 1.5) : 300;

  return {
    fileName: file.name,
    fileSizeBytes: file.size,
    totalPages,
    documentType,
    estimatedDpi: Math.max(150, Math.min(600, estimatedDpi)),
    pages: analyzedPages,
  };
}
