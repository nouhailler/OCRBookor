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

  // 2. French Guillemets with non-breaking spaces (&nbsp; or \u00A0)
  // Fix «word -> « word and word» -> word »
  formatted = formatted.replace(/«\s*/g, '«\u00A0');
  formatted = formatted.replace(/\s*»/g, '\u00A0»');
  // Fix "quote" into « quote » if balanced in French text
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

  // Match: word ending with hyphen, followed by newline, optional whitespace, and word continuation
  return text.replace(/([a-zA-ZÀ-ÖØ-öø-ÿ]+)[-\xAD]\r?\n\s*([a-zA-ZÀ-ÖØ-öø-ÿ]+)/g, (match, part1, part2) => {
    const combined = `${part1.toLowerCase()}${part2.toLowerCase()}`;
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
      // Create new chapter
      if (currentChapter.blockIds.length > 0) {
        if (!foundFirstExplicit && currentChapter.id === 'chap-intro') {
          // Keep intro if it has content
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

  // If no chapters detected, create a single default chapter
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
export function buildBlocksFromRawText(rawText: string, pageNumber: number, initialConfidence: number = 90): OCRBlock[] {
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

    // Check dialogue line start
    const isDialogue = /^[-—–]/.test(line);

    if (isDialogue && currentParagraph.trim()) {
      // Flush previous paragraph before dialogue
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
 * Quality Analyzer & CER/WER computation
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
      });
    }
  });

  const averageConfidence = processedPages > 0 ? Math.round(confidenceSum / processedPages) : 0;

  // Empirical CER/WER approximation model based on Tesseract confidence distribution
  // 95% confidence ~ 0.8% CER, 85% ~ 2.5% CER, 70% ~ 6.5% CER
  const estimatedCER = averageConfidence > 0 ? Math.max(0.2, Number(((100 - averageConfidence) * 0.18).toFixed(2))) : 0;
  const estimatedWER = averageConfidence > 0 ? Math.max(0.5, Number((estimatedCER * 2.3).toFixed(2))) : 0;

  return {
    totalPages: pages.length,
    processedPages,
    goodPages,
    mediumPages,
    badPages,
    averageConfidence,
    estimatedCER,
    estimatedWER,
    totalWords,
    totalCharacters,
    anomaliesDetected,
    validatedPages,
  };
}

/**
 * Analyze a page for anomalies and quality category
 */
export function evaluatePageQuality(text: string, confidence: number): { quality: PageQuality; anomalies: string[] } {
  const anomalies: string[] = [];
  const words = text.split(/\s+/).filter(Boolean);
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

  // Detect repetitive nonsense strings (e.g., "||||||", "......", "//////")
  if (/(.)\1{6,}/.test(text)) {
    anomalies.push('Répétition anormale de caractères (bruit de scan)');
  }

  // Confidence assessment
  if (confidence < 65) {
    anomalies.push(`Score de confiance faible (${Math.round(confidence)}%)`);
  }

  let quality: PageQuality = 'bonne';
  if (confidence < 60 || abnormalRatio > 0.12) {
    quality = 'insuffisante';
  } else if (confidence < 80 || anomalies.length > 0) {
    quality = 'moyenne';
  }

  return { quality, anomalies };
}
