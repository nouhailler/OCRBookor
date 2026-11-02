/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Search,
  Library,
  FileSearch,
  Cpu,
  Edit3,
  Layers,
  Download,
  BookOpen,
  Settings,
  Scale,
  HelpCircle,
  Sun,
  Moon,
  ChevronRight,
  Package,
  Compass,
  FilePlus,
  RefreshCw,
  FolderSync,
} from 'lucide-react';
import { ActiveTab } from './Navbar';
import { Logo } from './Logo';
import { OCRProject } from '../types/book';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  activeProject: OCRProject | null;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSystemSettings: () => void;
  onOpenLegal: () => void;
  onOpenDocs: (docKey: string) => void;
  onResetBenchmarkCorpus: () => void;
  onOpenLanding?: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  description: string;
  tab?: ActiveTab;
  action?: () => void;
  requiresProject?: boolean;
  badge?: string;
}

interface MenuCategory {
  id: string;
  name: string;
  icon: any;
  items: MenuItem[];
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  isOpen,
  onClose,
  currentTab,
  onSelectTab,
  activeProject,
  darkMode,
  onToggleDarkMode,
  onOpenSystemSettings,
  onOpenLegal,
  onOpenDocs,
  onResetBenchmarkCorpus,
  onOpenLanding,
}) => {
  const [searchFilter, setSearchFilter] = useState('');

  if (!isOpen) return null;

  const handleNavigate = (tab?: ActiveTab, action?: () => void) => {
    if (action) {
      action();
    } else if (tab) {
      onSelectTab(tab);
    }
    onClose();
  };

  const categories: MenuCategory[] = [
    {
      id: 'numerisation',
      name: 'Numérisation & Projets',
      icon: Library,
      items: [
        {
          id: 'biblio',
          label: '1. Bibliothèque de Projets',
          description: 'Gérer, importer et organiser vos livres numérisés',
          tab: 'bibliotheque',
        },
        {
          id: 'corpus',
          label: 'Charger le Corpus de Test',
          description: 'Initialiser immédiatement les 3 livres d’essai (Roman, 1759, Fables)',
          action: () => {
            onResetBenchmarkCorpus();
            onSelectTab('bibliotheque');
          },
          badge: 'Démo',
        },
      ],
    },
    {
      id: 'analyse',
      name: 'Prétraitement & Analyse',
      icon: FileSearch,
      items: [
        {
          id: 'diag',
          label: '2. Diagnostic PDF & Amélioration Scan',
          description: 'Redressement (deskew), détection DPI et binarisation d’image',
          tab: 'analyse',
          requiresProject: true,
        },
      ],
    },
    {
      id: 'ocr',
      name: 'Reconnaissance Optique (OCR)',
      icon: Cpu,
      items: [
        {
          id: 'recon',
          label: '3. Reconnaissance par Lots (Tesseract Wasm)',
          description: 'Extraction du texte, modèles de langue et scores de confiance',
          tab: 'reconnaissance',
          requiresProject: true,
        },
      ],
    },
    {
      id: 'revision',
      name: 'Révision & Édition',
      icon: Edit3,
      items: [
        {
          id: 'corr',
          label: '4. Éditeur de Correction Bi-Fenêtre',
          description: 'Scan haute résolution vs texte, règles typographiques de l’Imprimerie Nationale',
          tab: 'correction',
          requiresProject: true,
        },
      ],
    },
    {
      id: 'structure',
      name: 'Structure Éditoriale',
      icon: Layers,
      items: [
        {
          id: 'struct',
          label: '5. Chapitres & Métadonnées Dublin Core',
          description: 'Arborescence des titres H1/H2, catalogue des gravures et illustrations',
          tab: 'structure',
          requiresProject: true,
        },
      ],
    },
    {
      id: 'export',
      name: 'Exportations & Liseuse',
      icon: Download,
      items: [
        {
          id: 'exp',
          label: '6. Export Multi-Formats & Liseuse EPUB',
          description: 'Génération IDPF EPUB 3, Markdown, TXT, HTML 5 et test sur liseuse',
          tab: 'export',
          requiresProject: true,
        },
      ],
    },
    {
      id: 'systeme',
      name: 'Système & Paramètres',
      icon: Settings,
      items: [
        {
          id: 'params',
          label: 'Paramètres Système & Mises à Jour',
          description: 'Date de sortie, vérification des versions et moteurs OCR',
          action: onOpenSystemSettings,
        },
        {
          id: 'deb',
          label: 'Paquet Linux Debian (.deb)',
          description: 'Télécharger le binaire natif pour bureau Debian 13 / Ubuntu',
          action: () => {
            window.location.href = '/releases/ocrbookor_1.2.0_amd64.deb';
          },
          badge: 'Desktop',
        },
        {
          id: 'landing-pwa',
          label: 'Site Officiel & Landing Page PWA',
          description: 'Présentation complète, pipeline, démonstrateur et téléchargement',
          action: () => {
            onClose();
            onOpenLanding?.();
          },
          badge: 'PWA',
        },
      ],
    },
    {
      id: 'legal',
      name: 'Légal & Conformité',
      icon: Scale,
      items: [
        {
          id: 'terms',
          label: 'Mentions Légales & Responsabilité',
          description: 'Décharge de responsabilité sur les données et engagement hors-ligne',
          action: onOpenLegal,
        },
      ],
    },
    {
      id: 'aide',
      name: 'Documentation & Guides',
      icon: HelpCircle,
      items: [
        {
          id: 'doc-user',
          label: 'Guide Utilisateur Pas-à-Pas',
          description: 'Tutoriel complet pour numériser un premier livre',
          action: () => onOpenDocs('USER_GUIDE'),
        },
        {
          id: 'doc-bench',
          label: 'Banc d’Essai & Benchmarks OCR',
          description: 'Résultats comparatifs réels sur les corpus A, B et C',
          action: () => onOpenDocs('BENCHMARK'),
        },
        {
          id: 'doc-install',
          label: 'Installation Linux Debian 13',
          description: 'Instructions de déploiement et dépendances système',
          action: () => onOpenDocs('INSTALLATION'),
        },
        {
          id: 'doc-audit',
          label: 'Matrice d’Audit & Architecture',
          description: 'Spécifications techniques et conformité IDPF EPUB 3',
          action: () => onOpenDocs('AUDIT_INITIAL'),
        },
      ],
    },
  ];

  // Filtering
  const filteredCategories = categories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (it) =>
          it.label.toLowerCase().includes(searchFilter.toLowerCase()) ||
          it.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
          cat.name.toLowerCase().includes(searchFilter.toLowerCase())
      ),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 left-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-left duration-250">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/80">
            <Logo size="sm" showText={true} version="v1.2" />
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onToggleDarkMode}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title={darkMode ? 'Passer en thème clair' : 'Passer en thème sombre'}
              >
                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search box inside menu */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Rechercher une fonctionnalité..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Active project quick status badge */}
          {activeProject && (
            <div className="px-4 py-2 bg-indigo-50/70 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between text-xs">
              <div className="truncate">
                <span className="text-[10px] text-indigo-700 dark:text-indigo-400 font-semibold block uppercase tracking-wider">
                  Livre en cours de traitement
                </span>
                <span className="font-bold text-slate-900 dark:text-white truncate block">
                  {activeProject.metadata.title || 'Sans titre'}
                </span>
              </div>
              <span className="text-[11px] font-mono bg-indigo-600 text-white px-2 py-0.5 rounded-full shrink-0">
                {activeProject.pages.length} p.
              </span>
            </div>
          )}

          {/* Categorized menu list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {filteredCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div key={cat.id} className="space-y-1">
                  <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    <Icon className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{cat.name}</span>
                  </div>

                  <div className="space-y-0.5">
                    {cat.items.map((item) => {
                      const isCurrent = item.tab && currentTab === item.tab;
                      const isDisabled = item.requiresProject && !activeProject;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => !isDisabled && handleNavigate(item.tab, item.action)}
                          className={`w-full text-left p-2 rounded-xl transition flex items-center justify-between group ${
                            isCurrent
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : isDisabled
                              ? 'opacity-40 cursor-not-allowed text-slate-400'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <div className="pr-2 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-xs font-semibold truncate ${
                                isCurrent ? 'text-white' : 'text-slate-900 dark:text-slate-100'
                              }`}>
                                {item.label}
                              </span>
                              {item.badge && (
                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                                  isCurrent
                                    ? 'bg-white/20 text-white'
                                    : 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300'
                                }`}>
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className={`text-[11px] truncate mt-0.5 ${
                              isCurrent ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'
                            }`}>
                              {item.description}
                            </p>
                          </div>

                          <ChevronRight className={`w-4 h-4 shrink-0 transition ${
                            isCurrent
                              ? 'text-white'
                              : isDisabled
                              ? 'text-slate-300 dark:text-slate-700'
                              : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 group-hover:translate-x-0.5'
                          }`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer of Hamburger Menu */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex items-center justify-between text-xs text-slate-500">
            <button
              onClick={() => {
                onClose();
                onOpenSystemSettings();
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Paramètres Système</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenLegal();
              }}
              className="text-[11px] hover:underline"
            >
              Mentions Légales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
