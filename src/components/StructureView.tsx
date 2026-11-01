/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Layers,
  Image as ImageIcon,
  Book,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Edit2,
  Check,
  Upload,
  Info
} from 'lucide-react';
import { OCRProject, Chapter, Illustration } from '../types/book';
import { detectChaptersFromBlocks } from '../services/reconstructionService';
import { Tooltip } from './Tooltip';

interface StructureViewProps {
  project: OCRProject;
  onUpdateProject: (updated: OCRProject) => void;
  onGoToExport: () => void;
}

export const StructureView: React.FC<StructureViewProps> = ({
  project,
  onUpdateProject,
  onGoToExport,
}) => {
  const [activeTab, setActiveTab] = useState<'chapters' | 'illustrations' | 'metadata'>('chapters');
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState<string>('');

  // Auto-detect chapters from all OCR blocks
  const handleAutoDetectChapters = () => {
    const allBlocks = project.pages.flatMap((p) => p.blocks);
    const detected = detectChaptersFromBlocks(allBlocks);
    if (detected.length > 0) {
      onUpdateProject({
        ...project,
        chapters: detected,
      });
    }
  };

  const handleAddChapter = () => {
    const newChapter: Chapter = {
      id: `chap-${Date.now()}`,
      title: `Nouveau Chapitre ${project.chapters.length + 1}`,
      level: 1,
      startPage: 1,
      blockIds: [],
    };
    onUpdateProject({
      ...project,
      chapters: [...project.chapters, newChapter],
    });
  };

  const handleDeleteChapter = (id: string) => {
    onUpdateProject({
      ...project,
      chapters: project.chapters.filter((c) => c.id !== id),
    });
  };

  const handleMoveChapter = (index: number, direction: 'up' | 'down') => {
    const newChapters = [...project.chapters];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newChapters.length) return;

    const temp = newChapters[index];
    newChapters[index] = newChapters[targetIndex];
    newChapters[targetIndex] = temp;

    onUpdateProject({
      ...project,
      chapters: newChapters,
    });
  };

  const handleStartEditTitle = (chap: Chapter) => {
    setEditingChapterId(chap.id);
    setEditedTitle(chap.title);
  };

  const handleSaveEditTitle = (id: string) => {
    onUpdateProject({
      ...project,
      chapters: project.chapters.map((c) => (c.id === id ? { ...c, title: editedTitle } : c)),
    });
    setEditingChapterId(null);
  };

  const handleToggleLevel = (id: string) => {
    onUpdateProject({
      ...project,
      chapters: project.chapters.map((c) => {
        if (c.id === id) {
          const nextLevel = c.level === 1 ? 2 : c.level === 2 ? 3 : 1;
          return { ...c, level: nextLevel as any };
        }
        return c;
      }),
    });
  };

  const handleUpdateMetadata = (key: string, value: string) => {
    onUpdateProject({
      ...project,
      metadata: {
        ...project.metadata,
        [key]: value,
      },
    });
  };

  const handleDeleteIllustration = (id: string) => {
    onUpdateProject({
      ...project,
      illustrations: project.illustrations.filter((ill) => ill.id !== id),
    });
  };

  const handleUpdateIllustrationCaption = (id: string, caption: string) => {
    onUpdateProject({
      ...project,
      illustrations: project.illustrations.map((ill) => (ill.id === id ? { ...ill, caption } : ill)),
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Écran 5</span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{project.metadata.title}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Structure Éditoriale & Métadonnées
            </h1>
            <Tooltip
              title="Organisation éditoriale"
              content="Définit la hiérarchie du livre (table des matières H1/H2), le catalogue des gravures et illustrations, ainsi que les métadonnées Dublin Core requises par les liseuses."
            />
          </div>
        </div>

        <button
          onClick={onGoToExport}
          className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:from-indigo-500 hover:to-blue-500 transition"
        >
          <span>Accéder à la génération EPUB</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('chapters')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'chapters'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Arborescence des Chapitres ({project.chapters.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('illustrations')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'illustrations'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ImageIcon className="h-4 w-4" />
          <span>Illustrations & Gravures ({project.illustrations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('metadata')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'metadata'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Book className="h-4 w-4" />
          <span>Métadonnées Bibliographiques</span>
        </button>
      </div>

      {/* TAB 1: CHAPTERS TREE */}
      {activeTab === 'chapters' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Chaque chapitre constituera un fichier XHTML distinct dans le fichier EPUB 3 généré.
            </p>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleAutoDetectChapters}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition"
                title="Détecter automatiquement les titres et chapitres selon la typographie"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Auto-détecter les chapitres</span>
              </button>

              <button
                onClick={handleAddChapter}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Ajouter un chapitre</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {project.chapters.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center text-slate-500 text-xs">
                Aucun chapitre défini. Utilisez l’auto-détection pour structurer le livre.
              </div>
            ) : (
              project.chapters.map((chap, idx) => (
                <div
                  key={chap.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition"
                  style={{ marginLeft: `${(chap.level - 1) * 24}px` }}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0 mr-4">
                    <button
                      onClick={() => handleToggleLevel(chap.id)}
                      className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-indigo-400 border border-slate-700 hover:bg-slate-700"
                      title="Cliquer pour changer le niveau (H1 -> H2 -> H3)"
                    >
                      Niveau H{chap.level}
                    </button>

                    {editingChapterId === chap.id ? (
                      <div className="flex items-center space-x-2 flex-1">
                        <input
                          type="text"
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          className="flex-1 rounded-lg border border-indigo-500 bg-slate-950 px-2 py-1 text-xs text-white focus:outline-none"
                        />
                        <button
                          onClick={() => handleSaveEditTitle(chap.id)}
                          className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-500"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm font-bold text-white truncate">{chap.title}</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => handleStartEditTitle(chap)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                      title="Renommer"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => handleMoveChapter(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30"
                      title="Monter"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => handleMoveChapter(idx, 'down')}
                      disabled={idx === project.chapters.length - 1}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30"
                      title="Descendre"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteChapter(chap.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                      title="Supprimer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ILLUSTRATIONS */}
      {activeTab === 'illustrations' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Les gravures et illustrations sont extraites des pages scannées et intégrées aux fichiers EPUB et Markdown.
          </p>

          {project.illustrations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center text-slate-500 text-xs">
              Aucune illustration identifiée pour le moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {project.illustrations.map((ill) => (
                <div key={ill.id} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 flex flex-col justify-between">
                  <div>
                    <div className="h-44 bg-slate-950 rounded-xl overflow-hidden mb-3 border border-slate-800 flex items-center justify-center">
                      <img src={ill.imageUrl} alt={ill.title} className="h-full w-full object-cover" />
                    </div>

                    <div className="text-xs font-bold text-white">{ill.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Page source : {ill.pageNumber}</div>

                    <div className="mt-3">
                      <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">Légende</label>
                      <input
                        type="text"
                        value={ill.caption || ''}
                        onChange={(e) => handleUpdateIllustrationCaption(ill.id, e.target.value)}
                        placeholder="Ajouter une légende..."
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={() => handleDeleteIllustration(ill.id)}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center space-x-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Retirer</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: METADATA */}
      {activeTab === 'metadata' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 max-w-2xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5">
            Métadonnées du livre (Standard Dublin Core)
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Titre de l’ouvrage *</label>
              <input
                type="text"
                value={project.metadata.title}
                onChange={(e) => handleUpdateMetadata('title', e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Auteur *</label>
                <input
                  type="text"
                  value={project.metadata.author}
                  onChange={(e) => handleUpdateMetadata('author', e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Langue</label>
                <input
                  type="text"
                  value={project.metadata.language}
                  onChange={(e) => handleUpdateMetadata('language', e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Année d’édition</label>
                <input
                  type="text"
                  value={project.metadata.publicationYear || ''}
                  onChange={(e) => handleUpdateMetadata('publicationYear', e.target.value)}
                  placeholder="ex: 1907"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Éditeur</label>
                <input
                  type="text"
                  value={project.metadata.publisher || ''}
                  onChange={(e) => handleUpdateMetadata('publisher', e.target.value)}
                  placeholder="ex: Éditions Pierre Lafitte"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Identifiant unique / ISBN</label>
              <input
                type="text"
                value={project.metadata.isbn || ''}
                onChange={(e) => handleUpdateMetadata('isbn', e.target.value)}
                placeholder="ex: 978-2-07-036123-4"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Genre ou Sujet</label>
              <input
                type="text"
                value={project.metadata.genre || ''}
                onChange={(e) => handleUpdateMetadata('genre', e.target.value)}
                placeholder="ex: Roman policier, Philosophie, Poésie"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Résumé / Description éditoriale</label>
              <textarea
                value={project.metadata.description || ''}
                onChange={(e) => handleUpdateMetadata('description', e.target.value)}
                rows={3}
                placeholder="Notice bibliographique..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
