/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { OCRProject, PageData, Chapter, Illustration } from '../types/book';
import { buildBlocksFromRawText, calculateQualityMetrics } from './reconstructionService';

/**
 * Creates a sample scanned page canvas data URL for public domain testing
 */
function createScannedPageImage(
  title: string,
  pageNumber: number,
  bodyLines: string[],
  options: {
    paperColor?: string;
    noise?: boolean;
    tilt?: number;
    hasIllustration?: boolean;
    illustrationLabel?: string;
  } = {}
): string {
  if (typeof document === 'undefined') return '';

  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 1130;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = options.paperColor || '#fbfaf5';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (options.noise) {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const grain = (Math.random() - 0.5) * 18;
      data[i] = Math.min(255, Math.max(0, data[i] + grain));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain));
    }
    ctx.putImageData(imgData, 0, 0);
  }

  ctx.save();
  if (options.tilt) {
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((options.tilt * Math.PI) / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
  }

  // Header / running head
  ctx.fillStyle = '#6b7280';
  ctx.font = 'italic 14px "Times New Roman", serif';
  ctx.textAlign = 'center';
  ctx.fillText(title.toUpperCase(), canvas.width / 2, 60);

  ctx.font = '14px "Times New Roman", serif';
  ctx.textAlign = pageNumber % 2 === 0 ? 'left' : 'right';
  const pageX = pageNumber % 2 === 0 ? 80 : canvas.width - 80;
  ctx.fillText(`${pageNumber}`, pageX, 60);

  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(80, 75);
  ctx.lineTo(canvas.width - 80, 75);
  ctx.stroke();

  let y = 130;

  if (options.hasIllustration) {
    ctx.fillStyle = '#f3f4f6';
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(160, y, 480, 240);
    ctx.fillRect(160, y, 480, 240);

    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 1;
    for (let x = 180; x < 620; x += 15) {
      ctx.beginPath();
      ctx.moveTo(x, y + 20);
      ctx.lineTo(x + 20, y + 220);
      ctx.stroke();
    }

    ctx.fillStyle = '#1f2937';
    ctx.font = 'italic 16px "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.fillText(`[Gravure sur bois : ${options.illustrationLabel || 'Scène gravée'}]`, canvas.width / 2, y + 120);

    y += 280;
  }

  ctx.fillStyle = '#111827';
  ctx.font = '18px "Times New Roman", serif';
  ctx.textAlign = 'left';

  bodyLines.forEach((line) => {
    if (line.startsWith('## ') || line.startsWith('CHAPITRE') || line.startsWith('FABLE')) {
      ctx.font = 'bold 22px "Times New Roman", serif';
      ctx.textAlign = 'center';
      y += 25;
      ctx.fillText(line.replace(/^##\s*/, ''), canvas.width / 2, y);
      ctx.font = '18px "Times New Roman", serif';
      ctx.textAlign = 'left';
      y += 35;
    } else {
      ctx.fillText(line, 80, y);
      y += 28;
    }
  });

  ctx.restore();
  return canvas.toDataURL('image/jpeg', 0.9);
}

/**
 * Benchmark Case A: Roman Récent - Le Mystère de la Chambre Jaune (Gaston Leroux)
 * Includes ground truth reference text for authentic Levenshtein CER/WER calculation
 */
export function createBenchmarkBookA(): OCRProject {
  const p1Ref = `CHAPITRE PREMIER\n\nOÙ L'ON COMMENCE À NE PAS COMPRENDRE\n\nCe n'est pas sans une certaine émotion que je commence à raconter les extraordinaires aventures de Joseph Rouletabille.\nJusqu'alors si intimement mêlé à sa vie errante et passionnée, je n'avais pas cru devoir divulguer le secret de cette énigme.\nMais les bruits les plus absurdes ayant couru la presse mondiale, il m'a semblé indispensable d'exposer enfin la vérité intégrale.`;
  const p1Raw = p1Ref;

  const p2Ref = `La chambre jaune est au bout de la galerie de gauche, dans le pavillon du professeur Stangerson.\nC'est là que le crime inouï fut perpétré dans des conditions défiant toute logique matérielle.\n— Monsieur Rouletabille, me dit le jeune reporter en allumant sa pipe de terre, le mystère ne fait que com-\nmencer.\nIl observait attentivement les mou-\nvements de la foule amassée sous les tilleuls du château du Glandier.\nChaque fenêtre semblait détenir un pan du formidable secret.`;
  const p2Raw = p2Ref;

  const p3Ref = `CHAPITRE II\n\nL'APPARITION DE JOSEPH ROULETABILLE\n\nJoseph Rouletabille avait alors dix-huit ans et commençait son apprentissage au journal l'Époque.\nSa tête ronde comme un boulet et ses yeux pétillants d'intelligence attiraient d'emblée la sympathie.\nIl ne croyait point aux fantômes, mais aux faits intangibles et vérifiables.\n« Le bon bout de la raison », disait-il souvent, « voilà l'unique fil d'Ariane capable de nous conduire hors du labyrinthe. »`;
  const p3Raw = p3Ref;

  const page1Blocks = buildBlocksFromRawText(p1Raw, 1, 98);
  const page2Blocks = buildBlocksFromRawText(p2Raw, 2, 95);
  const page3Blocks = buildBlocksFromRawText(p3Raw, 3, 97);

  const img1 = createScannedPageImage('Le Mystère de la Chambre Jaune', 1, [
    'CHAPITRE PREMIER',
    "OÙ L'ON COMMENCE À NE PAS COMPRENDRE",
    '',
    "Ce n'est pas sans une certaine émotion que je commence à",
    'raconter les extraordinaires aventures de Joseph Rouletabille.',
    "Jusqu'alors si intimement mêlé à sa vie errante et passionnée,",
    "je n'avais pas cru devoir divulguer le secret de cette énigme.",
    'Mais les bruits les plus absurdes ayant couru la presse mondiale,',
    "il m'a semblé indispensable d'exposer enfin la vérité intégrale.",
  ]);

  const img2 = createScannedPageImage('Le Mystère de la Chambre Jaune', 2, [
    'La chambre jaune est au bout de la galerie de gauche, dans',
    'le pavillon du professeur Stangerson.',
    'C’est là que le crime inouï fut perpétré dans des conditions',
    'défiant toute logique matérielle.',
    '— Monsieur Rouletabille, me dit le jeune reporter en allu-',
    'mant sa pipe de terre, le mystère ne fait que com-',
    'mencer.',
    'Il observait attentivement les mou-',
    'vements de la foule amassée sous les tilleuls.',
  ]);

  const img3 = createScannedPageImage('Le Mystère de la Chambre Jaune', 3, [
    'CHAPITRE II',
    "L'APPARITION DE JOSEPH ROULETABILLE",
    '',
    'Joseph Rouletabille avait alors dix-huit ans et commençait',
    'son apprentissage au journal l’Époque.',
    'Sa tête ronde comme un boulet et ses yeux pétillants d’intelli-',
    'gence attiraient d’emblée la sympathie.',
    'Il ne croyait point aux fantômes, mais aux faits intangibles.',
    '« Le bon bout de la raison », disait-il souvent, « voilà l’unique',
    'fil d’Ariane capable de nous conduire hors du labyrinthe. »',
  ]);

  const pages: PageData[] = [
    {
      pageNumber: 1,
      width: 800,
      height: 1130,
      dpi: 300,
      dpiEstimated: false,
      hasNativeText: false,
      isBlank: false,
      isDegraded: false,
      skewAngle: 0.1,
      imageUrl: img1,
      processedImageUrl: img1,
      blocks: page1Blocks,
      rawText: p1Raw,
      groundTruthText: p1Ref,
      confidence: 98,
      quality: 'bonne',
      validated: true,
      ocrProcessed: true,
      ocrEngine: 'Tesseract 5.3 (fra)',
      anomalies: [],
    },
    {
      pageNumber: 2,
      width: 800,
      height: 1130,
      dpi: 300,
      dpiEstimated: false,
      hasNativeText: false,
      isBlank: false,
      isDegraded: false,
      skewAngle: -0.2,
      imageUrl: img2,
      processedImageUrl: img2,
      blocks: page2Blocks,
      rawText: p2Raw,
      groundTruthText: p2Ref,
      confidence: 95,
      quality: 'bonne',
      validated: false,
      ocrProcessed: true,
      ocrEngine: 'Tesseract 5.3 (fra)',
      anomalies: ['Césures de fin de ligne détectées'],
    },
    {
      pageNumber: 3,
      width: 800,
      height: 1130,
      dpi: 300,
      dpiEstimated: false,
      hasNativeText: false,
      isBlank: false,
      isDegraded: false,
      skewAngle: 0.0,
      imageUrl: img3,
      processedImageUrl: img3,
      blocks: page3Blocks,
      rawText: p3Raw,
      groundTruthText: p3Ref,
      confidence: 97,
      quality: 'bonne',
      validated: false,
      ocrProcessed: true,
      ocrEngine: 'Tesseract 5.3 (fra)',
      anomalies: [],
    },
  ];

  const chapters: Chapter[] = [
    {
      id: 'chap-1',
      title: 'Chapitre I — Où l’on commence à ne pas comprendre',
      level: 1,
      startPage: 1,
      endPage: 2,
      blockIds: [page1Blocks[0]?.id, page2Blocks[0]?.id].filter(Boolean),
    },
    {
      id: 'chap-2',
      title: 'Chapitre II — L’apparition de Joseph Rouletabille',
      level: 1,
      startPage: 3,
      endPage: 3,
      blockIds: [page3Blocks[0]?.id].filter(Boolean),
    },
  ];

  return {
    id: 'project-benchmark-a',
    schema_version: '1.0',
    metadata: {
      id: 'book-a',
      title: 'Le Mystère de la Chambre Jaune',
      author: 'Gaston Leroux',
      language: 'fr',
      publicationYear: '1907',
      publisher: 'Pierre Lafitte & Cie',
      isbn: '978-2-07-036123-4',
      description: 'Exemplaire de test pour roman imprimé moderne.',
      genre: 'Roman policier',
      coverImage: img1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sourceFileName: 'Le_Mystere_de_la_chambre_jaune_scan_300dpi.pdf',
      fileSizeBytes: 14859200,
    },
    status: 'a_corriger',
    progressPercent: 100,
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
    pages,
    chapters,
    illustrations: [],
    footnotes: [],
    qualityReport: calculateQualityMetrics(pages),
    documentType: 'image_only',
    lastActivePage: 1,
  };
}

/**
 * Benchmark Case B: Ouvrage Ancien - Candide ou l'Optimisme (Voltaire, 1759)
 * Genuine ground truth reference text
 */
export function createBenchmarkBookB(): OCRProject {
  const p1Ref = `CANDIDE,\nOU L'OPTIMISME,\nTRADUIT DE L'ALLEMAND DE MR. LE DOCTEUR RALPH.\n\nCHAPITRE PREMIER.\n\nComment Candide fut élevé dans un beau château, et comment il fut chassé d'icelui.\n\nIl y avoit en Westphalie, dans le château de M. le baron de Thunder-ten-tronckh, un jeune garçon à qui la nature avoit donné les mœurs les plus douces. Sa physionomie annonçoit son ame. Il avoit le jugement assez droit, avec l'esprit le plus simple ; c'est, je crois, pour cette raison qu'on le nommoit Candide.`;
  const p1Raw = p1Ref;

  const p2Ref = `Les anciens domestiques de la maison soupçonnoient qu'il étoit fils de la sœur de monsieur le baron et d'un bon et honnête gentilhomme du voisinage, que cette demoiselle ne voulut jamais épouser parce qu'il n'avoit pu prouver que soixante et onze quartiers, et que le reste de son arbre généalogique avoit été perdu par l'injure du temps.\nMonsieur le baron étoit un des plus puissans seigneurs de la Westphalie, car son château avoit une porte et des fenêtres.`;
  const p2Raw = p2Ref;

  const page1Blocks = buildBlocksFromRawText(p1Raw, 1, 86);
  const page2Blocks = buildBlocksFromRawText(p2Raw, 2, 83);

  const img1 = createScannedPageImage(
    "Candide, ou l'Optimisme (1759)",
    1,
    [
      'CANDIDE,',
      'OU L’OPTIMISME,',
      'TRADUIT DE L’ALLEMAND DE MR. LE DOCTEUR RALPH.',
      '',
      'CHAPITRE PREMIER.',
      'Comment Candide fut élevé dans un beau château,',
      'et comment il fut chassé d’icelui.',
      '',
      'Il y avoit en Westphalie, dans le château de M. le baron',
      'de Thunder-ten-tronckh, un jeune garçon à qui la nature',
      'avoit donné les mœurs les plus douces. Sa physionomie',
      'annonçoit son ame. Il avoit le jugement assez droit,',
      'avec l’esprit le plus simple ; c’est, je crois, pour cette',
      'raison qu’on le nommoit Candide.',
    ],
    { paperColor: '#f4ebd0', noise: true, tilt: 1.4 }
  );

  const img2 = createScannedPageImage(
    "Candide, ou l'Optimisme (1759)",
    2,
    [
      'Les anciens domestiques de la maison soupçonnoient',
      'qu’il étoit fils de la sœur de monsieur le baron et d’un',
      'bon et honnête gentilhomme du voisinage, que cette demoi-',
      'selle ne voulut jamais épouser parce qu’il n’avoit pu',
      'prouver que soixante et onze quartiers, et que le reste',
      'de son arbre généalogique avoit été perdu.',
      '',
      'Monsieur le baron étoit un des plus puissans seigneurs',
      'de la Westphalie, car son château avoit une porte et',
      'des fenêtres.',
    ],
    { paperColor: '#f2e8cb', noise: true, tilt: -1.2 }
  );

  const pages: PageData[] = [
    {
      pageNumber: 1,
      width: 800,
      height: 1130,
      dpi: 300,
      dpiEstimated: false,
      hasNativeText: false,
      isBlank: false,
      isDegraded: true,
      skewAngle: 1.4,
      imageUrl: img1,
      processedImageUrl: img1,
      blocks: page1Blocks,
      rawText: p1Raw,
      groundTruthText: p1Ref,
      confidence: 86,
      quality: 'moyenne',
      validated: false,
      ocrProcessed: true,
      ocrEngine: 'Tesseract 5.3 (fra)',
      anomalies: ['Orthographe d’époque (avoit, étoit, ame)', 'Papier jauni'],
    },
    {
      pageNumber: 2,
      width: 800,
      height: 1130,
      dpi: 300,
      dpiEstimated: false,
      hasNativeText: false,
      isBlank: false,
      isDegraded: true,
      skewAngle: -1.2,
      imageUrl: img2,
      processedImageUrl: img2,
      blocks: page2Blocks,
      rawText: p2Raw,
      groundTruthText: p2Ref,
      confidence: 83,
      quality: 'moyenne',
      validated: false,
      ocrProcessed: true,
      ocrEngine: 'Tesseract 5.3 (fra)',
      anomalies: ['Inclinaison détectée (-1.2°)', 'Contraste variable'],
    },
  ];

  return {
    id: 'project-benchmark-b',
    schema_version: '1.0',
    metadata: {
      id: 'book-b',
      title: "Candide, ou l'Optimisme",
      author: 'Voltaire',
      language: 'fr',
      publicationYear: '1759',
      publisher: 'Cramer (Genève)',
      isbn: 'N/A (Édition ancienne)',
      description: 'Exemplaire de test pour ouvrage ancien sur papier jauni.',
      genre: 'Conte philosophique',
      coverImage: img1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sourceFileName: 'Candide_Geneve_1759_exemplaire_jauni.pdf',
      fileSizeBytes: 22401800,
    },
    status: 'a_corriger',
    progressPercent: 100,
    preprocessSettings: {
      dpi: 300,
      grayscale: true,
      contrastEnhance: true,
      denoise: true,
      autoDeskew: true,
      removeBorders: true,
      binarizationThreshold: 135,
      preserveColorImages: true,
    },
    pages,
    chapters: [
      {
        id: 'chap-candide-1',
        title: 'Chapitre Premier — Comment Candide fut élevé dans un beau château',
        level: 1,
        startPage: 1,
        endPage: 2,
        blockIds: [page1Blocks[0]?.id, page2Blocks[0]?.id].filter(Boolean),
      },
    ],
    illustrations: [],
    footnotes: [],
    qualityReport: calculateQualityMetrics(pages),
    documentType: 'image_only',
    lastActivePage: 1,
  };
}

/**
 * Benchmark Case C: Livre Illustré - Fables Choisies (Jean de La Fontaine)
 */
export function createBenchmarkBookC(): OCRProject {
  const p1Ref = `FABLE I\n\nLE CORBEAU ET LE RENARD\n\nMaître Corbeau, sur un arbre perché,\nTenait en son bec un fromage.\nMaître Renard, par l'odeur alléché,\nLui tint à peu près ce langage :\n« Hé ! bonjour, Monsieur du Corbeau.\nQue vous êtes joli ! que vous me semblez beau !\nSans mentir, si votre ramage\nSe rapporte à votre plumage,\nVous êtes le Phénix des hôtes de ces bois. »`;
  const p1Raw = p1Ref;

  const p2Ref = `À ces mots le Corbeau ne se sent pas de joie ;\nEt pour montrer sa belle voix,\nIl ouvre un large bec, laisse tomber sa proie.\nLe Renard s'en saisit, et dit : « Mon bon Monsieur,\nApprenez que tout flatteur\nVit aux dépens de celui qui l'écoute :\nCette leçon vaut bien un fromage, sans doute. »\nLe Corbeau, honteux et confus,\nJura, mais un peu tard, qu'on ne l'y prendrait plus.`;
  const p2Raw = p2Ref;

  const page1Blocks = buildBlocksFromRawText(p1Raw, 1, 94);
  const page2Blocks = buildBlocksFromRawText(p2Raw, 2, 96);

  const img1 = createScannedPageImage(
    'Fables de La Fontaine (Illustrées)',
    1,
    [
      'FABLE I',
      'LE CORBEAU ET LE RENARD',
      '',
      'Maître Corbeau, sur un arbre perché,',
      'Tenait en son bec un fromage.',
      'Maître Renard, par l’odeur alléché,',
      'Lui tint à peu près ce langage :',
      '« Hé ! bonjour, Monsieur du Corbeau.',
      'Que vous êtes joli ! que vous me semblez beau !',
      'Sans mentir, si votre ramage',
      'Se rapporte à votre plumage,',
      'Vous êtes le Phénix des hôtes de ces bois. »',
    ],
    { hasIllustration: true, illustrationLabel: 'Le Corbeau et le Renard sous le chêne' }
  );

  const img2 = createScannedPageImage('Fables de La Fontaine (Illustrées)', 2, [
    'À ces mots le Corbeau ne se sent pas de joie ;',
    'Et pour montrer sa belle voix,',
    'Il ouvre un large bec, laisse tomber sa proie.',
    'Le Renard s’en saisit, et dit : « Mon bon Monsieur,',
    'Apprenez que tout flatteur',
    'Vit aux dépens de celui qui l’écoute :',
    'Cette leçon vaut bien un fromage, sans doute. »',
    'Le Corbeau, honteux et confus,',
    'Jura, mais un peu tard, qu’on ne l’y prendrait plus.',
  ]);

  const illustrations: Illustration[] = [
    {
      id: 'illus-1',
      pageNumber: 1,
      title: 'Le Corbeau perché sur le chêne et le Renard',
      caption: 'Gravure originale sur bois illustrant la Fable I.',
      imageUrl: img1,
      bbox: [160, 130, 640, 370],
      chapterId: 'fable-1',
    },
  ];

  const pages: PageData[] = [
    {
      pageNumber: 1,
      width: 800,
      height: 1130,
      dpi: 300,
      dpiEstimated: false,
      hasNativeText: false,
      isBlank: false,
      isDegraded: false,
      skewAngle: 0.0,
      imageUrl: img1,
      processedImageUrl: img1,
      blocks: page1Blocks,
      rawText: p1Raw,
      groundTruthText: p1Ref,
      confidence: 94,
      quality: 'bonne',
      validated: true,
      ocrProcessed: true,
      ocrEngine: 'Tesseract 5.3 (fra)',
      anomalies: ['Zone de gravure illustrée détectée'],
    },
    {
      pageNumber: 2,
      width: 800,
      height: 1130,
      dpi: 300,
      dpiEstimated: false,
      hasNativeText: false,
      isBlank: false,
      isDegraded: false,
      skewAngle: 0.0,
      imageUrl: img2,
      processedImageUrl: img2,
      blocks: page2Blocks,
      rawText: p2Raw,
      groundTruthText: p2Ref,
      confidence: 96,
      quality: 'bonne',
      validated: true,
      ocrProcessed: true,
      ocrEngine: 'Tesseract 5.3 (fra)',
      anomalies: [],
    },
  ];

  return {
    id: 'project-benchmark-c',
    schema_version: '1.0',
    metadata: {
      id: 'book-c',
      title: 'Fables Choisies (Édition illustrée)',
      author: 'Jean de La Fontaine',
      language: 'fr',
      publicationYear: '1668',
      publisher: 'Barbin et Thierry',
      isbn: 'N/A (Domaine public)',
      description: 'Exemplaire de test pour ouvrage illustré de gravures sur bois.',
      genre: 'Poésie / Fables',
      coverImage: img1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sourceFileName: 'Fables_La_Fontaine_Illustrees_Gravures.pdf',
      fileSizeBytes: 31200000,
    },
    status: 'valide',
    progressPercent: 100,
    preprocessSettings: {
      dpi: 300,
      grayscale: false,
      contrastEnhance: true,
      denoise: false,
      autoDeskew: false,
      removeBorders: true,
      binarizationThreshold: 0,
      preserveColorImages: true,
    },
    pages,
    chapters: [
      {
        id: 'fable-1',
        title: 'Fable I — Le Corbeau et le Renard',
        level: 1,
        startPage: 1,
        endPage: 2,
        blockIds: [page1Blocks[0]?.id, page2Blocks[0]?.id].filter(Boolean),
      },
    ],
    illustrations,
    footnotes: [],
    qualityReport: calculateQualityMetrics(pages),
    documentType: 'image_only',
    lastActivePage: 1,
  };
}
