/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as pdfjsLib from 'pdfjs-dist';
// Local bundler worker to operate 100% offline without any external CDN
// @ts-ignore
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

export interface PDFAnalysisResult {
  fileName: string;
  fileSizeBytes: number;
  totalPages: number;
  documentType: 'image_only' | 'native_text' | 'hybrid';
  estimatedDpi: number;
  dpiEstimated: boolean;
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
 * Load and analyze an authentic PDF file buffer locally without external network
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
    const viewport = page.getViewport({ scale: 1.5 });
    const textContent = await page.getTextContent();
    const nativeText = textContent.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ')
      .trim();

    const hasNativeText = nativeText.length > 50;
    if (hasNativeText) pagesWithNativeText++;

    // Render to preview canvas
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext('2d');

    let previewImageUrl = '';
    let isBlank = false;

    if (ctx) {
      await (page.render as any)({ canvasContext: ctx, viewport, canvas }).promise;
      previewImageUrl = canvas.toDataURL('image/jpeg', 0.85);

      // Pixel density check for blank detection
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

  // Calculate estimated DPI from standard A4 page dimensions (8.27 x 11.69 inches)
  const firstPage = analyzedPages[0];
  const calculatedDpi = firstPage ? Math.round((firstPage.width / 8.27) * 1.5) : 300;
  const estimatedDpi = Math.max(150, Math.min(600, calculatedDpi));

  return {
    fileName: file.name,
    fileSizeBytes: file.size,
    totalPages,
    documentType,
    estimatedDpi,
    dpiEstimated: true,
    pages: analyzedPages,
  };
}
