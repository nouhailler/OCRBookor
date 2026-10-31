/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PreprocessSettings } from '../types/book';

export interface PreprocessResult {
  processedDataUrl: string;
  isBlank: boolean;
  skewAngle: number;
  width: number;
  height: number;
}

/**
 * Image Preprocessing engine using Canvas 2D API
 * Works 100% locally in browser without external dependencies.
 */
export async function preprocessImage(
  imageSource: string | HTMLImageElement | HTMLCanvasElement,
  settings: PreprocessSettings
): Promise<PreprocessResult> {
  const img = await loadImage(imageSource);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Canvas 2D context non disponible');
  }

  // Scale according to DPI setting (relative to standard 300 DPI baseline)
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

  // 3. Contrast Enhancement (Min-Max Linear Stretch)
  if (settings.contrastEnhance) {
    let min = 255;
    let max = 0;
    for (let i = 0; i < data.length; i += 4) {
      const v = data[i];
      if (v < min) min = v;
      if (v > max) max = v;
    }

    const range = max - min;
    if (range > 15) {
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

  // 5. Deskew: Real projection profile variance calculation
  let skewAngle = 0;
  if (settings.autoDeskew) {
    skewAngle = calculateSkewAngleProjectionProfile(data, canvas.width, canvas.height);
    if (Math.abs(skewAngle) >= 0.5) {
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

  // Sample every 4th pixel for speed
  for (let i = 0; i < data.length; i += 16) {
    const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
    if (gray < 210) {
      darkPixelCount++;
    }
  }

  const ratio = darkPixelCount / totalSampled;
  return ratio < 0.003;
}

/**
 * Real Projection Profile Deskew Algorithm:
 * Evaluates candidate tilt angles between -5.0° and +5.0° in 0.5° increments.
 * Computes horizontal projection line density; the angle that maximizes the variance
 * between line peaks (text) and valleys (interline spaces) is the true skew angle.
 */
function calculateSkewAngleProjectionProfile(
  data: Uint8ClampedArray,
  width: number,
  height: number
): number {
  if (width < 50 || height < 50) return 0.0;

  // Downsample to a center patch for computational efficiency (e.g. 200x200 window)
  const patchW = Math.min(200, width);
  const patchH = Math.min(300, height);
  const startX = Math.floor((width - patchW) / 2);
  const startY = Math.floor((height - patchH) / 2);

  const binaryPatch: boolean[][] = [];
  for (let y = 0; y < patchH; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < patchW; x++) {
      const idx = ((startY + y) * width + (startX + x)) * 4;
      const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      row.push(gray < 180); // true = ink/dark
    }
    binaryPatch.push(row);
  }

  let bestAngle = 0.0;
  let maxVariance = -1;

  // Test candidate angles from -5° to +5° in 0.5° steps
  for (let angleDeg = -5.0; angleDeg <= 5.0; angleDeg += 0.5) {
    const angleRad = (angleDeg * Math.PI) / 180;
    const tanAngle = Math.tan(angleRad);

    const profile = new Array(patchH).fill(0);

    for (let y = 0; y < patchH; y++) {
      for (let x = 0; x < patchW; x++) {
        if (binaryPatch[y][x]) {
          // Calculate project y row under candidate rotation
          const projY = Math.round(y - (x - patchW / 2) * tanAngle);
          if (projY >= 0 && projY < patchH) {
            profile[projY]++;
          }
        }
      }
    }

    // Compute variance of projection profile
    let sum = 0;
    for (let y = 0; y < patchH; y++) sum += profile[y];
    const mean = sum / patchH;

    let variance = 0;
    for (let y = 0; y < patchH; y++) {
      const diff = profile[y] - mean;
      variance += diff * diff;
    }

    if (variance > maxVariance) {
      maxVariance = variance;
      bestAngle = angleDeg;
    }
  }

  return Number(bestAngle.toFixed(1));
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
