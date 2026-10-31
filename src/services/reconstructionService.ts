/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { OCRBlock, Chapter, Footnote, PageData, QualityReport, PageQuality } from '../types/book';

/**
 * Common French compound words that legitimately have hyphens and should NOT be joined
 */
const LEGITIMATE_HYPHENATED_WORDS = new Set([
  'grand-père', 'grand-mère', 'grand-chose', 'rendez-vous', 'peut-être', 'arc-en-ciel',
  'après-midi', 'va-t-en', 'au-dessus', 'au-dessous', 'chou-fleur', 'garde-fou',
  'tire-bouchon', 'laissez-passer', 'coffre-fort', 'croque-monsieur', 'porte-monnaie',
  'porte-plume', 'nord-est', 'sud-ouest', 'nord-ouest', 'sud-est', 'belle-sœur',
  'beau-frère', 'contre-jour', 'court-circuit', 'sous-sol', 'avant-propos'
]);

/**
 * French Typography Formatter
 * Complies with Imprimerie Nationale standards for French book publishing
 */
export function applyFrenchTypography(text: string): string {
  if (!text) return '';

  let formatted = text;

  // 1. Replace straight apostrophes with curly apostrophes
  formatted = formatted.replace(/(\w)'(\w)/g, '$1’$2');
  formatted = formatted.replace(/'(?=[A-Za-zÀ-ÖØ-öø-ÿ])/g, '’');

  // 2. French Guillemets with non-breaking spaces
  formatted = formatted.replace(/«\s*/g, '«\u00A0');
  formatted = formatted.replace(/\s*»/g, '\u00A0»');
  formatted = formatted.replace(/"([^"]+)"/g, '«\u00A0$1\u00A0»');

  // 3. Non-breaking spaces before double punctuation: ; : ! ? % € $ £
  formatted = formatted.replace(/\s*([;!?:%€$£])/g, '\u00A0$1');

  // 4. Dialogue dashes: convert hyphen or double hyphen at line start to em-dash
  formatted = formatted.replace(/(^|\n)[-–]\s+/g, '$1—\u00A0');

  // 5. Common ligatures restoration (oe -> œ, ae -> æ)
  formatted = formatted.replace(/\b([cC])oeur\b/g, '$1œur');
  formatted = formatted.replace(/\b([oO])euvre\b/g, '$1œuvre');
  formatted = formatted.replace(/\b([oO])eufs?\b/g, (m) => m.toLowerCase().startsWith('o') ? 'œuf' + (m.endsWith('s') ? 's' : '') : 'Œuf' + (m.endsWith('s') ? 's' : ''));
  formatted = formatted.replace(/\b([nN])oeud\b/g, '$1œud');
  formatted = formatted.replace(/\b([vV])oeu\b/g, '$1œu');
  formatted = formatted.replace(/\b([sS])oeur\b/g, '$1œur');

  // 6. Normalize multiple spaces
  formatted = formatted.replace(/[ \t]{2,}/g, ' ');

  return formatted;
}

/**
 * Dehyphenation: Recombines words split at line ends (e.g., "mouve-\nments" -> "mouvements")
 */
export function dehyphenateText(text: string): string {
  if (!text) return '';

  return text.replace(/([a-zA-ZÀ-ÖØ-öø-ÿ]+)[-\xAD]\r?\n\s*([a-zA-ZÀ-ÖØ-öø-ÿ]+)/g, (match, part1, part2) => {
    const hyphenated = `${part1.toLowerCase()}-${part2.toLowerCase()}`;

    // If it's a known legitimate hyphenated word, keep the hyphen (without newline)
    if (LEGITIMATE_HYPHENATED_WORDS.has(hyphenated)) {
      return `${part1}-${part2}`;
    }

    // Otherwise merge as single continuous word
    return `${part1}${part2}`;
  });
}

/**
 * Detect chapters from raw text lines and block properties
 */
export function detectChaptersFromBlocks(blocks: OCRBlock[]): Chapter[] {
  const chapters: Chapter[] = [];
  const chapterKeywordsRegex = /^(?:CHAPITRE|Chapitre|LIVRE|Livre|PARTIE|Partie|PROLOGUE|Prologue|ÉPILOGUE|Épilogue|INTRODUCTION|Introduction|PRÉFACE|Préface|AVANT-PROPOS|Avant-propos|TABLE DES MATIÈRES|Table des matières)(?:\s+[IVXLCDM\d]+|\s*[:.—-]|\s*$)/i;
  const romanNumeralOnly = /^[IVXLCDM]+(?:\.|\s*[-—]|$)/;

  let currentChapter: Chapter = {
    id: 'chap-intro',
    title: 'Introduction',
    level: 1,
    startPage: blocks.length > 0 ? blocks[0].source_page : 1,
    blockIds: [],
  };

  let foundFirstExplicit = false;

  blocks.forEach((block) => {
    const trimmed = block.text.trim();
    const isHeadingType = block.type === 'heading';
    const matchesKeyword = chapterKeywordsRegex.test(trimmed);
    const matchesRoman = romanNumeralOnly.test(trimmed) && trimmed.length < 20;
    const isShortUppercase = trimmed.length < 50 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed) && !trimmed.includes('.') && block.text.length > 3;

    if (matchesKeyword || (isHeadingType && (matchesRoman || isShortUppercase))) {
      if (currentChapter.blockIds.length > 0) {
        if (!foundFirstExplicit && currentChapter.id === 'chap-intro') {
          chapters.push(currentChapter);
        } else if (foundFirstExplicit) {
          chapters.push(currentChapter);
        }
      }

      foundFirstExplicit = true;
      currentChapter = {
        id: `chap-${chapters.length + 1}`,
        title: trimmed.replace(/^[#\s]+/, '').slice(0, 80),
        level: 1,
        startPage: block.source_page,
        blockIds: [block.id],
      };
      block.type = 'heading';
      block.headingLevel = 1;
    } else {
      currentChapter.blockIds.push(block.id);
    }
  });

  if (currentChapter.blockIds.length > 0) {
    chapters.push(currentChapter);
  }

  if (chapters.length === 0 && blocks.length > 0) {
    chapters.push({
      id: 'chap-1',
      title: 'Texte intégral',
      level: 1,
      startPage: blocks[0].source_page,
      blockIds: blocks.map((b) => b.id),
    });
  }

  return chapters;
}

/**
 * Paragraph Builder: Groups raw OCR lines into coherent paragraphs and editorial blocks
 */
export function buildBlocksFromRawText(rawText: string, pageNumber: number, initialConfidence: number = 0): OCRBlock[] {
  const dehyphenated = dehyphenateText(rawText);
  const lines = dehyphenated.split(/\r?\n/);
  const blocks: OCRBlock[] = [];

  let currentParagraph = '';
  let blockIndex = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      if (currentParagraph.trim()) {
        const text = applyFrenchTypography(currentParagraph.trim());
        const isHeading = isLikelyHeading(text);
        blocks.push({
          id: `p${pageNumber}-b${blockIndex++}`,
          type: isHeading ? 'heading' : 'paragraph',
          headingLevel: isHeading ? 2 : undefined,
          text,
          source_page: pageNumber,
          confidence: initialConfidence,
          validated: false,
          bbox: [50, 100 + blockIndex * 40, 750, 140 + blockIndex * 40],
          originalText: currentParagraph.trim(),
        });
        currentParagraph = '';
      }
      continue;
    }

    const isDialogue = /^[-—–]/.test(line);

    if (isDialogue && currentParagraph.trim()) {
      const text = applyFrenchTypography(currentParagraph.trim());
      blocks.push({
        id: `p${pageNumber}-b${blockIndex++}`,
        type: 'paragraph',
        text,
        source_page: pageNumber,
        confidence: initialConfidence,
        validated: false,
        bbox: [50, 100 + blockIndex * 40, 750, 140 + blockIndex * 40],
        originalText: currentParagraph.trim(),
      });
      currentParagraph = line;
    } else {
      if (currentParagraph) {
        currentParagraph += ' ' + line;
      } else {
        currentParagraph = line;
      }
    }
  }

  if (currentParagraph.trim()) {
    const text = applyFrenchTypography(currentParagraph.trim());
    const isHeading = isLikelyHeading(text);
    blocks.push({
      id: `p${pageNumber}-b${blockIndex++}`,
      type: isHeading ? 'heading' : 'paragraph',
      headingLevel: isHeading ? 2 : undefined,
      text,
      source_page: pageNumber,
      confidence: initialConfidence,
      validated: false,
      bbox: [50, 100 + blockIndex * 40, 750, 140 + blockIndex * 40],
      originalText: currentParagraph.trim(),
    });
  }

  return blocks;
}

function isLikelyHeading(text: string): boolean {
  if (text.length > 90) return false;
  if (/^(?:CHAPITRE|Chapitre|LIVRE|Livre|PARTIE|Partie|PROLOGUE|ÉPILOGUE|INTRODUCTION|PRÉFACE)/i.test(text)) return true;
  if (text.length < 40 && text === text.toUpperCase() && /[A-Z]/.test(text) && !text.includes('.')) return true;
  return false;
}

/**
 * Levenshtein distance on generic arrays or strings
 */
export function calculateLevenshteinDistance<T>(a: T[] | string, b: T[] | string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // Deletion
        dp[i][j - 1] + 1,      // Insertion
        dp[i - 1][j - 1] + cost // Substitution
      );
    }
  }

  return dp[m][n];
}

/**
 * Character Error Rate (CER) calculation using true Levenshtein edit distance
 * CER = Levenshtein(hypothesis, reference) / reference.length
 */
export function calculateCER(recognizedText: string, referenceText: string): number {
  if (!referenceText || referenceText.length === 0) return 0;
  const dist = calculateLevenshteinDistance(recognizedText, referenceText);
  return Number(((dist / referenceText.length) * 100).toFixed(2));
}

/**
 * Word Error Rate (WER) calculation using word token edit distance
 */
export function calculateWER(recognizedText: string, referenceText: string): number {
  const recWords = recognizedText.trim().split(/\s+/).filter(Boolean);
  const refWords = referenceText.trim().split(/\s+/).filter(Boolean);
  if (refWords.length === 0) return 0;

  const dist = calculateLevenshteinDistance(recWords, refWords);
  return Number(((dist / refWords.length) * 100).toFixed(2));
}

/**
 * Quality Analyzer & metrics computation
 * Note: CER and WER are strictly computed when reference transcription exists.
 * When not available, they remain null and are never fabricated.
 */
export function calculateQualityMetrics(pages: PageData[]): QualityReport {
  let totalWords = 0;
  let totalCharacters = 0;
  let goodPages = 0;
  let mediumPages = 0;
  let badPages = 0;
  let confidenceSum = 0;
  let processedPages = 0;
  let validatedPages = 0;
  let anomaliesDetected = 0;
  let lowConfidenceWordsCount = 0;

  let totalRefChars = 0;
  let totalCharEdits = 0;
  let totalRefWords = 0;
  let totalWordEdits = 0;
  let pagesWithGroundTruth = 0;

  pages.forEach((p) => {
    if (p.ocrProcessed) {
      processedPages++;
      confidenceSum += p.confidence;
      if (p.validated) validatedPages++;

      if (p.quality === 'bonne') goodPages++;
      else if (p.quality === 'moyenne') mediumPages++;
      else badPages++;

      anomaliesDetected += p.anomalies.length;

      p.blocks.forEach((b) => {
        const text = b.text || '';
        totalCharacters += text.length;
        const words = text.split(/\s+/).filter(Boolean);
        totalWords += words.length;

        if (b.words) {
          b.words.forEach((w) => {
            if (w.confidence < 70) lowConfidenceWordsCount++;
          });
        }
      });

      // Ground truth CER/WER computation if reference text exists
      if (p.groundTruthText && p.groundTruthText.trim().length > 0) {
        pagesWithGroundTruth++;
        const refChars = p.groundTruthText.length;
        const charDist = calculateLevenshteinDistance(p.rawText, p.groundTruthText);
        totalRefChars += refChars;
        totalCharEdits += charDist;

        const refWords = p.groundTruthText.trim().split(/\s+/).filter(Boolean);
        const hypWords = p.rawText.trim().split(/\s+/).filter(Boolean);
        totalRefWords += refWords.length;
        totalWordEdits += calculateLevenshteinDistance(hypWords, refWords);
      }
    }
  });

  const averageConfidence = processedPages > 0 ? Math.round(confidenceSum / processedPages) : 0;

  const hasGroundTruth = pagesWithGroundTruth > 0 && totalRefChars > 0;
  const groundTruthCER = hasGroundTruth ? Number(((totalCharEdits / totalRefChars) * 100).toFixed(2)) : null;
  const groundTruthWER = hasGroundTruth ? Number(((totalWordEdits / totalRefWords) * 100).toFixed(2)) : null;

  return {
    totalPages: pages.length,
    processedPages,
    goodPages,
    mediumPages,
    badPages,
    averageConfidence,
    hasGroundTruth,
    groundTruthCER,
    groundTruthWER,
    lowConfidenceWordsCount,
    totalWords,
    totalCharacters,
    anomaliesDetected,
    validatedPages,
  };
}

/**
 * Analyze a page for anomalies and quality category based on actual extracted content
 */
export function evaluatePageQuality(text: string, confidence: number): { quality: PageQuality; anomalies: string[] } {
  const anomalies: string[] = [];
  const chars = text.length;

  if (chars < 15) {
    anomalies.push('Page quasi-vide ou échec de détection');
    return { quality: 'echec_probable', anomalies };
  }

  // Detect unusual characters (high ratio of non-alphanumeric noise)
  const abnormalChars = text.replace(/[a-zA-Z0-9À-ÖØ-öø-ÿ\s.,;:!?«»'’"—()–-]/g, '');
  const abnormalRatio = abnormalChars.length / chars;

  if (abnormalRatio > 0.08) {
    anomalies.push(`Taux élevé de caractères bruités (${Math.round(abnormalRatio * 100)}%)`);
  }

  if (/(.)\1{6,}/.test(text)) {
    anomalies.push('Répétition anormale de caractères (bruit de scan)');
  }

  if (confidence > 0 && confidence < 65) {
    anomalies.push(`Score de confiance OCR faible (${Math.round(confidence)}%)`);
  }

  let quality: PageQuality = 'bonne';
  if ((confidence > 0 && confidence < 60) || abnormalRatio > 0.12) {
    quality = 'insuffisante';
  } else if ((confidence > 0 && confidence < 80) || anomalies.length > 0) {
    quality = 'moyenne';
  }

  return { quality, anomalies };
}
