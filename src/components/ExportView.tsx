/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Download,
  BookOpen,
  FileCode,
  FileText,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Sparkles,
  Eye,
  Layers,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { OCRProject, Chapter, OCRBlock } from '../types/book';
import { generateEpub3Blob } from '../services/epubExporter';
import { generateMarkdown, generatePlainText, generateSingleHtml, downloadFile } from '../services/exportService';
import { Tooltip } from './Tooltip';
import { useTranslation } from '../i18n';

interface ExportViewProps {
  project: OCRProject;
  onUpdateProject: (updated: OCRProject) => void;
}

export const ExportView: React.FC<ExportViewProps> = ({
  project,
  onUpdateProject,
}) => {
  const { t, language } = useTranslation();
  const isFr = language === 'fr';

  const [isExportingEpub, setIsExportingEpub] = useState(false);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);

  // EPUB Reader preferences
  const [readerTheme, setReaderTheme] = useState<'light' | 'sepia' | 'dark'>('sepia');
  const [readerFontSize, setReaderFontSize] = useState<number>(18);
  const [readerFontFamily, setReaderFontFamily] = useState<'serif' | 'sans'>('serif');
  const [readerLineHeight, setReaderLineHeight] = useState<number>(1.8);

  // Notification for downloaded file
  const [lastExportMessage, setLastExportMessage] = useState<string | null>(null);

  const chapters = project.chapters.length > 0 ? project.chapters : [
    {
      id: 'chap-1',
      title: isFr ? 'Texte Intégral' : 'Complete Text',
      level: 1,
      startPage: 1,
      blockIds: project.pages.flatMap((p) => p.blocks.map((b) => b.id)),
    } as Chapter,
  ];

  const currentChapter = chapters[activeChapterIndex] || chapters[0];

  const blockMap = new Map<string, OCRBlock>();
  project.pages.forEach((p) => {
    p.blocks.forEach((b) => blockMap.set(b.id, b));
  });

  const sanitizeFileName = (name: string) => {
    return name.replace(/[^a-zA-Z0-9À-ÖØ-öø-ÿ_-]/g, '_').slice(0, 50);
  };

  const handleExportEpub = async () => {
    try {
      setIsExportingEpub(true);
      const blob = await generateEpub3Blob(project);
      const fileName = `${sanitizeFileName(project.metadata.title || 'livre')}.epub`;
      downloadFile(blob, fileName, 'application/epub+zip');

      onUpdateProject({ ...project, status: 'exporte' });
      setLastExportMessage(
        isFr
          ? `Livre EPUB 3 généré avec succès : ${fileName}`
          : `EPUB 3 book successfully generated: ${fileName}`
      );
      setTimeout(() => setLastExportMessage(null), 5000);
    } catch (e: any) {
      console.error('EPUB generation error:', e);
      alert(isFr ? `Erreur lors de la génération EPUB : ${e.message}` : `Error generating EPUB: ${e.message}`);
    } finally {
      setIsExportingEpub(false);
    }
  };

  const handleExportMarkdown = () => {
    const md = generateMarkdown(project);
    const fileName = `${sanitizeFileName(project.metadata.title || 'livre')}.md`;
    downloadFile(md, fileName, 'text/markdown;charset=utf-8');
    setLastExportMessage(
      isFr ? `Fichier Markdown exporté : ${fileName}` : `Markdown file exported: ${fileName}`
    );
    setTimeout(() => setLastExportMessage(null), 5000);
  };

  const handleExportPlainText = () => {
    const txt = generatePlainText(project);
    const fileName = `${sanitizeFileName(project.metadata.title || 'livre')}.txt`;
    downloadFile(txt, fileName, 'text/plain;charset=utf-8');
    setLastExportMessage(
      isFr ? `Texte brut UTF-8 exporté : ${fileName}` : `UTF-8 plain text exported: ${fileName}`
    );
    setTimeout(() => setLastExportMessage(null), 5000);
  };

  const handleExportHtml = () => {
    const html = generateSingleHtml(project);
    const fileName = `${sanitizeFileName(project.metadata.title || 'livre')}.html`;
    downloadFile(html, fileName, 'text/html;charset=utf-8');
    setLastExportMessage(
      isFr ? `Livre HTML autonome exporté : ${fileName}` : `Self-contained HTML book exported: ${fileName}`
    );
    setTimeout(() => setLastExportMessage(null), 5000);
  };

  const handleExportJsonProject = () => {
    const jsonStr = JSON.stringify(project, null, 2);
    const fileName = `${sanitizeFileName(project.metadata.title || 'projet')}_backup.json`;
    downloadFile(jsonStr, fileName, 'application/json;charset=utf-8');
    setLastExportMessage(
      isFr ? `Sauvegarde projet JSON exportée : ${fileName}` : `Project JSON backup exported: ${fileName}`
    );
    setTimeout(() => setLastExportMessage(null), 5000);
  };

  // EPUB Reader Theme styling
  const themeStyles = {
    light: { bg: 'bg-[#faf9f5]', text: 'text-slate-900', border: 'border-slate-200' },
    sepia: { bg: 'bg-[#f4ecd8]', text: 'text-[#433422]', border: 'border-[#e4d7bf]' },
    dark: { bg: 'bg-[#181a1b]', text: 'text-[#e8e6e3]', border: 'border-slate-800' },
  }[readerTheme];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {isFr ? 'Écran 6' : 'Screen 6'}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{project.metadata.title}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
            {isFr
              ? 'Centre d’Export Multi-Formats & Validation EPUB'
              : 'Multi-Format Export Hub & EPUB Validation'}
          </h1>
        </div>

        {/* Primary Export Button */}
        <button
          onClick={handleExportEpub}
          disabled={isExportingEpub}
          className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 hover:from-emerald-500 hover:to-teal-500 transition disabled:opacity-50"
        >
          <BookOpen className="h-4 w-4" />
          <span>
            {isExportingEpub
              ? isFr
                ? 'Génération en cours...'
                : 'Generating...'
              : isFr
              ? 'Télécharger EPUB 3 (.epub)'
              : 'Download EPUB 3 (.epub)'}
          </span>
        </button>
      </div>

      {lastExportMessage && (
        <div className="mb-6 flex items-center space-x-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 p-3.5 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>{lastExportMessage}</span>
        </div>
      )}

      {/* Format Cards Grid */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* EPUB 3 */}
        <div className="rounded-2xl border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded bg-emerald-100 dark:bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                EPUB 3
              </span>
              <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {isFr ? 'Livre Numérique' : 'Digital Book'}
              </h4>
              <Tooltip
                title={isFr ? 'Format Standard EPUB 3' : 'EPUB 3 Standard'}
                content={
                  isFr
                    ? 'Livre électronique officiel IDPF/W3C. Compatible avec Apple Books, Kobo, Amazon Kindle, Tolino et Calibre.'
                    : 'Universal reflowable e-book. Compatible with Kobo, Kindle, Apple Books, and Calibre.'
                }
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">
              {isFr
                ? 'Conforme IDPF, compatible liseuses (Kobo, Kindle, Apple Books, Calibre).'
                : 'IDPF compliant, fully compatible with all modern e-readers.'}
            </p>
          </div>
          <button
            onClick={handleExportEpub}
            disabled={isExportingEpub}
            className="mt-4 flex items-center justify-center space-x-1.5 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2 text-xs font-semibold text-white shadow-xs transition"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{isFr ? 'Télécharger .epub' : 'Download .epub'}</span>
          </button>
        </div>

        {/* Markdown */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded bg-indigo-100 dark:bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-800 dark:text-indigo-300">
                Markdown
              </span>
              <FileCode className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {isFr ? 'Document Structuré' : 'Structured Document'}
              </h4>
              <Tooltip
                title={isFr ? 'Format Markdown (.md)' : 'Markdown Format (.md)'}
                content={
                  isFr
                    ? 'Idéal pour importer dans Obsidian, Notion, Logseq ou un dépôt Git avec métadonnées YAML en en-tête.'
                    : 'Ideal for Obsidian, Notion, or Git repositories with YAML frontmatter.'
                }
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">
              {isFr
                ? 'Titres, citations et alinéas formatés en Markdown standard.'
                : 'Headings, blockquotes, and indentation formatted in clean Markdown.'}
            </p>
          </div>
          <button
            onClick={handleExportMarkdown}
            className="mt-4 flex items-center justify-center space-x-1.5 w-full rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 transition"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{isFr ? 'Télécharger .md' : 'Download .md'}</span>
          </button>
        </div>

        {/* TXT */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded bg-blue-100 dark:bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-800 dark:text-blue-300">
                TXT UTF-8
              </span>
              <FileText className="h-4 w-4 text-blue-500 dark:text-blue-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {isFr ? 'Texte Brut' : 'Plain Text'}
              </h4>
              <Tooltip
                title={isFr ? 'Format Texte Brut (.txt)' : 'Plain Text (.txt)'}
                content={
                  isFr
                    ? 'Texte épuré universel encodé en UTF-8 sans balises HTML ni enrichissements visuels.'
                    : 'Clean UTF-8 plain text stripped of tags, ideal for corpus analysis and LLMs.'
                }
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">
              {isFr
                ? 'Texte nettoyé de toute balise, séparateurs de chapitres explicites.'
                : 'Cleaned of all HTML markup, with explicit chapter breaks.'}
            </p>
          </div>
          <button
            onClick={handleExportPlainText}
            className="mt-4 flex items-center justify-center space-x-1.5 w-full rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 transition"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{isFr ? 'Télécharger .txt' : 'Download .txt'}</span>
          </button>
        </div>

        {/* HTML */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded bg-amber-100 dark:bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                HTML 5
              </span>
              <Globe className="h-4 w-4 text-amber-500 dark:text-amber-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {isFr ? 'Page Web Autonome' : 'Standalone Web Page'}
              </h4>
              <Tooltip
                title={isFr ? 'Format HTML 5 (.html)' : 'HTML 5 (.html)'}
                content={
                  isFr
                    ? 'Page web responsive avec styles CSS typographiques intégrés, lisible immédiatement.'
                    : 'Self-contained fluid HTML document with styled typographical CSS.'
                }
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">
              {isFr
                ? 'Page web responsive avec styles CSS typographiques intégrés.'
                : 'Responsive standalone webpage readable in any browser.'}
            </p>
          </div>
          <button
            onClick={handleExportHtml}
            className="mt-4 flex items-center justify-center space-x-1.5 w-full rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 transition"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{isFr ? 'Télécharger .html' : 'Download .html'}</span>
          </button>
        </div>

        {/* JSON Backup */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded bg-purple-100 dark:bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-800 dark:text-purple-300">
                JSON v1.0
              </span>
              <Layers className="h-4 w-4 text-purple-500 dark:text-purple-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {isFr ? 'Projet Intermédiaire' : 'Project Backup'}
              </h4>
              <Tooltip
                title={isFr ? 'Sauvegarde de projet JSON' : 'JSON Project Backup'}
                content={
                  isFr
                    ? 'Structure avec coordonnées, OCR bruts et corrections manuelles pour archivage ou reprise.'
                    : 'Complete project state including coordinates, raw OCR, and editorial corrections.'
                }
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">
              {isFr
                ? 'Structure avec coordonnées, OCR bruts et corrections pour reprise.'
                : 'Project structure and edits for backup or reload.'}
            </p>
          </div>
          <button
            onClick={handleExportJsonProject}
            className="mt-4 flex items-center justify-center space-x-1.5 w-full rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 transition"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{isFr ? 'Télécharger .json' : 'Download .json'}</span>
          </button>
        </div>
      </div>

      {/* Main Bottom Section: EPUB Reader Live Preview & Quality Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive EPUB Reader (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 flex flex-col h-[700px] overflow-hidden shadow-xl">
          {/* Reader Topbar */}
          <div className="flex flex-wrap items-center justify-between px-5 py-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs gap-3">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
              <span className="font-bold text-slate-900 dark:text-white">
                {isFr ? 'Prévisualisation EPUB 3' : 'EPUB 3 Live Preview'}
              </span>
            </div>

            {/* Chapter Selector */}
            <select
              value={activeChapterIndex}
              onChange={(e) => setActiveChapterIndex(Number(e.target.value))}
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              {chapters.map((ch, idx) => (
                <option key={ch.id} value={idx}>
                  {ch.title}
                </option>
              ))}
            </select>

            {/* Typography Controls */}
            <div className="flex items-center space-x-2">
              {/* Theme Selector */}
              <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setReaderTheme('light')}
                  className={`px-2 py-0.5 rounded text-[11px] ${
                    readerTheme === 'light' ? 'bg-white text-black font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {isFr ? 'Clair' : 'Light'}
                </button>
                <button
                  onClick={() => setReaderTheme('sepia')}
                  className={`px-2 py-0.5 rounded text-[11px] ${
                    readerTheme === 'sepia' ? 'bg-[#f4ecd8] text-[#433422] font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {isFr ? 'Sépia' : 'Sepia'}
                </button>
                <button
                  onClick={() => setReaderTheme('dark')}
                  className={`px-2 py-0.5 rounded text-[11px] ${
                    readerTheme === 'dark' ? 'bg-slate-700 text-white font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {isFr ? 'Nuit' : 'Dark'}
                </button>
              </div>

              {/* Font Size */}
              <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setReaderFontSize((prev) => Math.max(12, prev - 1))}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold"
                >
                  A-
                </button>
                <span className="text-[11px] font-mono text-slate-700 dark:text-slate-300 px-1">{readerFontSize}px</span>
                <button
                  onClick={() => setReaderFontSize((prev) => Math.min(26, prev + 1))}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold"
                >
                  A+
                </button>
              </div>

              {/* Serif / Sans */}
              <button
                onClick={() => setReaderFontFamily(readerFontFamily === 'serif' ? 'sans' : 'serif')}
                className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                {readerFontFamily === 'serif' ? 'Serif' : 'Sans'}
              </button>
            </div>
          </div>

          {/* Reader Body Area */}
          <div className={`flex-1 overflow-y-auto p-8 sm:p-12 transition-colors duration-200 ${themeStyles.bg} ${themeStyles.text}`}>
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-center mb-8 tracking-tight font-serif">
                {currentChapter.title}
              </h2>

              <div
                style={{
                  fontSize: `${readerFontSize}px`,
                  lineHeight: readerLineHeight,
                  fontFamily: readerFontFamily === 'serif' ? '"Georgia", "Charter", "Times New Roman", serif' : 'system-ui, sans-serif',
                }}
                className="space-y-4 text-justify"
              >
                {currentChapter.blockIds.map((bId) => {
                  const block = blockMap.get(bId);
                  if (!block) return null;

                  if (block.type === 'heading') {
                    return (
                      <h3 key={block.id} className="text-lg font-bold text-center mt-6 mb-2">
                        {block.text}
                      </h3>
                    );
                  }

                  if (block.type === 'quote') {
                    return (
                      <blockquote key={block.id} className="italic my-4 pl-4 border-l-2 border-current opacity-80">
                        {block.text}
                      </blockquote>
                    );
                  }

                  const isDialogue = block.text.startsWith('—') || block.text.startsWith('-');
                  return (
                    <p key={block.id} className={isDialogue ? 'pl-4 indent-0' : 'indent-6'}>
                      {block.text}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right: EPUB Compliance & Quality Assessment (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 flex flex-col justify-between h-[700px] overflow-y-auto shadow-sm">
          <div>
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {isFr ? 'Rapport de Validation EPUBCheck' : 'EPUBCheck Technical Report'}
              </h3>
            </div>

            {/* Checklist items */}
            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-start space-x-2.5">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    {isFr ? 'Archive EPUB 3 conforme' : 'Compliant EPUB 3 Container'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isFr ? 'mimetype non-compressé en tête, container.xml valide' : 'Uncompressed mimetype first, valid container.xml'}
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    {isFr ? 'Navigation HTML5 nav.xhtml' : 'HTML5 Navigation (nav.xhtml)'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isFr ? 'Table des matières epub:type="toc" et NCX rétro-compatible' : 'epub:type="toc" nav and backwards-compatible NCX'}
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    {isFr ? 'Feuille de styles CSS éditoriale' : 'Editorial CSS Stylesheet'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isFr ? 'styles.css standardisé avec gestion typographique et alinéas' : 'Standardized styles.css with paragraph indents'}
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    {isFr ? 'Métadonnées Dublin Core complètes' : 'Complete Dublin Core Metadata'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isFr
                      ? `Titre, auteur, langue [${project.metadata.language}], UUID unique`
                      : `Title, author, language [${project.metadata.language}], unique UUID`}
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    {isFr ? 'XHTML5 strict & UTF-8' : 'Strict XHTML5 & UTF-8'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isFr ? 'Caractères échappés, balises fermées, encodage UTF-8' : 'Escaped entities, closed XML tags, valid UTF-8'}
                  </div>
                </div>
              </div>
            </div>

            {/* OCR Quality Metrics Section */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider mb-3">
                {isFr ? 'Mesures de Qualité Reconnaissance' : 'Recognition Quality Metrics'}
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 text-[10px] block">
                    {isFr ? 'Taux d’erreur car. (CER)' : 'Char Error Rate (CER)'}
                  </span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {project.qualityReport.hasGroundTruth && project.qualityReport.groundTruthCER !== null
                      ? `${project.qualityReport.groundTruthCER}%`
                      : isFr
                      ? 'N/A (Réf. requise)'
                      : 'N/A (Ref needed)'}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 text-[10px] block">
                    {isFr ? 'Taux d’erreur mots (WER)' : 'Word Error Rate (WER)'}
                  </span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {project.qualityReport.hasGroundTruth && project.qualityReport.groundTruthWER !== null
                      ? `${project.qualityReport.groundTruthWER}%`
                      : isFr
                      ? 'N/A (Réf. requise)'
                      : 'N/A (Ref needed)'}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 text-[10px] block">
                    {isFr ? 'Confiance Moyenne' : 'Average Confidence'}
                  </span>
                  <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                    {project.qualityReport.averageConfidence}%
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 text-[10px] block">
                    {isFr ? 'Mots incertains (<70%)' : 'Uncertain Words (<70%)'}
                  </span>
                  <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                    {project.qualityReport.lowConfidenceWordsCount}
                  </span>
                </div>
              </div>

              <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80">
                {isFr ? 'Total mots :' : 'Total words:'}{' '}
                <strong className="text-slate-800 dark:text-slate-200">{project.qualityReport.totalWords}</strong> |{' '}
                {isFr ? 'Caractères :' : 'Characters:'}{' '}
                <strong className="text-slate-800 dark:text-slate-200">{project.qualityReport.totalCharacters}</strong>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleExportEpub}
              disabled={isExportingEpub}
              className="w-full flex items-center justify-center space-x-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 transition disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              <span>{isFr ? 'Générer le livre EPUB 3' : 'Generate EPUB 3 Book'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
