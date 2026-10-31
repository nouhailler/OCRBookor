/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import JSZip from 'jszip';
import { OCRProject, Chapter, OCRBlock } from '../types/book';

/**
 * Escapes text for XML/XHTML
 */
function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generates a standard-compliant EPUB 3 archive from an OCRProject
 */
export async function generateEpub3Blob(project: OCRProject): Promise<Blob> {
  const zip = new JSZip();

  // 1. mimetype MUST be the very first file and NOT compressed
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

  // 2. META-INF/container.xml
  const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
  zip.file('META-INF/container.xml', containerXml);

  // 3. Stylesheet OEBPS/styles.css
  const stylesCss = `/* OCRBookor EPUB 3 Standard Editorial Stylesheet */
@charset "utf-8";

body {
  margin: 5% 8%;
  font-family: "Georgia", "Times New Roman", "Charter", serif;
  font-size: 1.05em;
  line-height: 1.6;
  color: #1a1a1a;
  background-color: transparent;
  text-align: justify;
  hyphens: auto;
}

h1 {
  font-size: 1.8em;
  font-weight: bold;
  text-align: center;
  margin-top: 2em;
  margin-bottom: 1.2em;
  line-height: 1.3;
}

h2 {
  font-size: 1.4em;
  font-weight: 600;
  text-align: center;
  margin-top: 1.6em;
  margin-bottom: 1em;
}

p {
  margin: 0;
  padding: 0;
  text-indent: 1.5em;
  margin-bottom: 0.3em;
}

p.first, h1 + p, h2 + p {
  text-indent: 0;
}

p.dialogue {
  text-indent: 0;
  padding-left: 1em;
}

blockquote {
  margin: 1.2em 2em;
  font-style: italic;
  color: #4a5568;
}

figure {
  margin: 1.8em auto;
  text-align: center;
}

figure img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

figcaption {
  font-size: 0.88em;
  font-style: italic;
  color: #555;
  margin-top: 0.5em;
}

.footnote {
  font-size: 0.85em;
  border-top: 1px solid #ccc;
  margin-top: 2em;
  padding-top: 0.8em;
}
`;
  zip.file('OEBPS/styles.css', stylesCss);

  const bookId = project.metadata.isbn || `urn:uuid:${project.id}`;
  const title = escapeXml(project.metadata.title || 'Livre Numérisé');
  const author = escapeXml(project.metadata.author || 'Auteur Inconnu');
  const language = escapeXml(project.metadata.language || 'fr');
  const date = new Date().toISOString().slice(0, 10);

  // Group blocks by chapters
  const chapters = project.chapters.length > 0 ? project.chapters : [
    {
      id: 'chap-1',
      title: 'Texte Intégral',
      level: 1,
      startPage: 1,
      blockIds: project.pages.flatMap((p) => p.blocks.map((b) => b.id)),
    } as Chapter
  ];

  // Map block id to block object
  const blockMap = new Map<string, OCRBlock>();
  project.pages.forEach((p) => {
    p.blocks.forEach((b) => blockMap.set(b.id, b));
  });

  // Create chapter XHTML files
  const chapterManifestItems: { id: string; href: string; title: string }[] = [];

  chapters.forEach((chap, idx) => {
    const chapFile = `chapter_${idx + 1}.xhtml`;
    const chapId = `chap_${idx + 1}`;
    chapterManifestItems.push({ id: chapId, href: chapFile, title: chap.title });

    let contentHtml = `<h1>${escapeXml(chap.title)}</h1>\n`;

    chap.blockIds.forEach((bId) => {
      const block = blockMap.get(bId);
      if (!block) return;

      const text = escapeXml(block.text);
      if (block.type === 'heading') {
        const level = block.headingLevel || 2;
        contentHtml += `<h${level}>${text}</h${level}>\n`;
      } else if (block.type === 'quote') {
        contentHtml += `<blockquote><p>${text}</p></blockquote>\n`;
      } else {
        const isDialogue = text.startsWith('—') || text.startsWith('-');
        contentHtml += `<p class="${isDialogue ? 'dialogue' : ''}">${text}</p>\n`;
      }
    });

    const xhtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${language}" lang="${language}">
<head>
  <meta charset="utf-8" />
  <title>${escapeXml(chap.title)}</title>
  <link rel="stylesheet" type="text/css" href="styles.css" />
</head>
<body>
  ${contentHtml}
</body>
</html>`;

    zip.file(`OEBPS/${chapFile}`, xhtml);
  });

  // 4. OEBPS/nav.xhtml (HTML5 Navigation document)
  const navXhtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${language}" lang="${language}">
<head>
  <meta charset="utf-8" />
  <title>Table des Matières</title>
  <link rel="stylesheet" type="text/css" href="styles.css" />
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>Table des Matières</h1>
    <ol>
      ${chapterManifestItems
        .map((ch) => `<li><a href="${ch.href}">${escapeXml(ch.title)}</a></li>`)
        .join('\n      ')}
    </ol>
  </nav>
</body>
</html>`;
  zip.file('OEBPS/nav.xhtml', navXhtml);

  // 5. OEBPS/toc.ncx (legacy e-reader support)
  const tocNcx = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="${bookId}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle><text>${title}</text></docTitle>
  <docAuthor><text>${author}</text></docAuthor>
  <navMap>
    ${chapterManifestItems
      .map(
        (ch, i) => `
    <navPoint id="navPoint-${i + 1}" playOrder="${i + 1}">
      <navLabel><text>${escapeXml(ch.title)}</text></navLabel>
      <content src="${ch.href}"/>
    </navPoint>`
      )
      .join('')}
  </navMap>
</ncx>`;
  zip.file('OEBPS/toc.ncx', tocNcx);

  // 6. OEBPS/content.opf (Packaging & Manifest)
  const contentOpf = `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="BookId">${bookId}</dc:identifier>
    <dc:title>${title}</dc:title>
    <dc:creator>${author}</dc:creator>
    <dc:language>${language}</dc:language>
    <dc:date>${date}</dc:date>
    <dc:publisher>${escapeXml(project.metadata.publisher || 'OCRBookor')}</dc:publisher>
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.[0-9]{3}/, '')}</meta>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="css" href="styles.css" media-type="text/css"/>
    ${chapterManifestItems
      .map((ch) => `<item id="${ch.id}" href="${ch.href}" media-type="application/xhtml+xml"/>`)
      .join('\n    ')}
  </manifest>
  <spine toc="ncx">
    ${chapterManifestItems.map((ch) => `<itemref idref="${ch.id}"/>`).join('\n    ')}
  </spine>
</package>`;
  zip.file('OEBPS/content.opf', contentOpf);

  return zip.generateAsync({ type: 'blob', mimeType: 'application/epub+zip' });
}
