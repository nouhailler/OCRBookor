/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { OCRProject, OCRBlock } from '../types/book';

/**
 * Generates structured Markdown from an OCRProject
 */
export function generateMarkdown(project: OCRProject): string {
  const meta = project.metadata;
  let md = `---
title: "${meta.title}"
author: "${meta.author}"
language: "${meta.language}"
date: "${meta.publicationYear || ''}"
publisher: "${meta.publisher || ''}"
generator: "OCRBookor v1.0"
---

# ${meta.title}

*Par ${meta.author}*

`;

  const blockMap = new Map<string, OCRBlock>();
  project.pages.forEach((p) => {
    p.blocks.forEach((b) => blockMap.set(b.id, b));
  });

  const chapters = project.chapters.length > 0 ? project.chapters : [
    {
      id: 'chap-1',
      title: 'Texte Intégral',
      level: 1,
      startPage: 1,
      blockIds: project.pages.flatMap((p) => p.blocks.map((b) => b.id)),
    }
  ];

  chapters.forEach((chap) => {
    md += `\n## ${chap.title}\n\n`;

    chap.blockIds.forEach((bId) => {
      const block = blockMap.get(bId);
      if (!block) return;

      const text = block.text.trim();
      if (!text) return;

      if (block.type === 'heading') {
        const level = (block.headingLevel || 2) + 1;
        const prefix = '#'.repeat(Math.min(6, level));
        md += `${prefix} ${text}\n\n`;
      } else if (block.type === 'quote') {
        md += `> ${text}\n\n`;
      } else {
        md += `${text}\n\n`;
      }
    });
  });

  return md;
}

/**
 * Generates clean plain text with UTF-8 encoding and clear chapter delimiters
 */
export function generatePlainText(project: OCRProject): string {
  const meta = project.metadata;
  let txt = `================================================================================
${meta.title.toUpperCase()}
Auteur : ${meta.author}
${meta.publicationYear ? `Année : ${meta.publicationYear}\n` : ''}${meta.publisher ? `Éditeur : ${meta.publisher}\n` : ''}Document numérisé et structuré avec OCRBookor
================================================================================\n\n`;

  const blockMap = new Map<string, OCRBlock>();
  project.pages.forEach((p) => {
    p.blocks.forEach((b) => blockMap.set(b.id, b));
  });

  const chapters = project.chapters.length > 0 ? project.chapters : [
    {
      id: 'chap-1',
      title: 'Texte Intégral',
      level: 1,
      startPage: 1,
      blockIds: project.pages.flatMap((p) => p.blocks.map((b) => b.id)),
    }
  ];

  chapters.forEach((chap) => {
    txt += `\n--------------------------------------------------------------------------------\n`;
    txt += `${chap.title.toUpperCase()}\n`;
    txt += `--------------------------------------------------------------------------------\n\n`;

    chap.blockIds.forEach((bId) => {
      const block = blockMap.get(bId);
      if (!block) return;

      const text = block.text.trim();
      if (!text) return;

      txt += `${text}\n\n`;
    });
  });

  return txt;
}

/**
 * Generates a standalone, beautiful HTML document
 */
export function generateSingleHtml(project: OCRProject): string {
  const meta = project.metadata;

  const blockMap = new Map<string, OCRBlock>();
  project.pages.forEach((p) => {
    p.blocks.forEach((b) => blockMap.set(b.id, b));
  });

  const chapters = project.chapters.length > 0 ? project.chapters : [
    {
      id: 'chap-1',
      title: 'Texte Intégral',
      level: 1,
      startPage: 1,
      blockIds: project.pages.flatMap((p) => p.blocks.map((b) => b.id)),
    }
  ];

  let chaptersHtml = '';

  chapters.forEach((chap) => {
    chaptersHtml += `<section class="chapter" id="${chap.id}">\n`;
    chaptersHtml += `  <h2>${escapeHtml(chap.title)}</h2>\n`;

    chap.blockIds.forEach((bId) => {
      const block = blockMap.get(bId);
      if (!block) return;

      const text = escapeHtml(block.text);
      if (block.type === 'heading') {
        const level = Math.min(4, (block.headingLevel || 2) + 1);
        chaptersHtml += `  <h${level}>${text}</h${level}>\n`;
      } else if (block.type === 'quote') {
        chaptersHtml += `  <blockquote><p>${text}</p></blockquote>\n`;
      } else {
        const isDialogue = text.startsWith('—') || text.startsWith('-');
        chaptersHtml += `  <p class="${isDialogue ? 'dialogue' : ''}">${text}</p>\n`;
      }
    });

    chaptersHtml += `</section>\n`;
  });

  return `<!DOCTYPE html>
<html lang="${escapeHtml(meta.language || 'fr')}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(meta.title)} — ${escapeHtml(meta.author)}</title>
  <style>
    :root {
      --bg: #fdfcf7;
      --text: #222;
      --accent: #2563eb;
      --border: #e2e8f0;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #121417;
        --text: #e2e8f0;
        --border: #2d3748;
      }
    }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: "Georgia", "Charter", "Times New Roman", serif;
      line-height: 1.7;
      margin: 0;
      padding: 2rem 1.5rem;
    }
    .book-container {
      max-width: 780px;
      margin: 0 auto;
    }
    header {
      text-align: center;
      margin-bottom: 3.5rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 2rem;
    }
    h1 {
      font-size: 2.4rem;
      margin-bottom: 0.5rem;
    }
    .author {
      font-size: 1.25rem;
      font-style: italic;
      color: #64748b;
    }
    .chapter {
      margin-bottom: 4rem;
    }
    h2 {
      font-size: 1.6rem;
      text-align: center;
      margin-top: 3rem;
      margin-bottom: 1.5rem;
      border-bottom: 1px dashed var(--border);
      padding-bottom: 0.5rem;
    }
    p {
      margin-bottom: 0.8rem;
      text-align: justify;
      text-indent: 1.5rem;
    }
    p.dialogue {
      text-indent: 0;
      padding-left: 1rem;
    }
    blockquote {
      margin: 1.5rem 2rem;
      font-style: italic;
      color: #64748b;
      border-left: 3px solid var(--accent);
      padding-left: 1rem;
    }
    footer {
      text-align: center;
      font-size: 0.85rem;
      color: #94a3b8;
      margin-top: 5rem;
      border-top: 1px solid var(--border);
      padding-top: 1.5rem;
    }
  </style>
</head>
<body>
  <div class="book-container">
    <header>
      <h1>${escapeHtml(meta.title)}</h1>
      <div class="author">Par ${escapeHtml(meta.author)}</div>
      ${meta.publicationYear ? `<div>Édition : ${escapeHtml(meta.publicationYear)}</div>` : ''}
    </header>

    <main>
      ${chaptersHtml}
    </main>

    <footer>
      Document généré par <strong>OCRBookor</strong> — Reconnaissance et reconstruction de livres.
    </footer>
  </div>
</body>
</html>`;
}

/**
 * Triggers a file download in the browser
 */
export function downloadFile(content: Blob | string, fileName: string, mimeType: string = 'text/plain;charset=utf-8') {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeHtml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
