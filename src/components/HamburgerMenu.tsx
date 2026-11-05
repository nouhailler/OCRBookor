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
  Globe,
} from 'lucide-react';
import { ActiveTab } from './Navbar';
import { Logo } from './Logo';
import { OCRProject } from '../types/book';
import { useTranslation } from '../i18n';

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
  const { t, language, toggleLanguage } = useTranslation();
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

  const isFr = language === 'fr';

  const categories: MenuCategory[] = [
    {
      id: 'numerisation',
      name: isFr ? 'Numérisation & Projets' : 'Digitization & Projects',
      icon: Library,
      items: [
        {
          id: 'biblio',
          label: isFr ? '1. Bibliothèque de Projets' : '1. Project Library',
          description: isFr ? 'Gérer, importer et organiser vos livres numérisés' : 'Manage, import, and organize your scanned books',
          tab: 'bibliotheque',
        },
        {
          id: 'corpus',
          label: isFr ? 'Charger le Corpus de Test' : 'Load Benchmark Corpus',
          description: isFr ? 'Initialiser immédiatement les 3 livres d’essai (Roman, 1759, Fables)' : 'Initialize the 3 demo sample books right away',
          action: () => {
            onResetBenchmarkCorpus();
            onSelectTab('bibliotheque');
          },
          badge: isFr ? 'Démo' : 'Demo',
        },
      ],
    },
    {
      id: 'analyse',
      name: isFr ? 'Prétraitement & Analyse' : 'Preprocessing & Analysis',
      icon: FileSearch,
      items: [
        {
          id: 'diag',
          label: isFr ? '2. Diagnostic PDF & Amélioration Scan' : '2. PDF Diagnostics & Scan Enhancement',
          description: isFr ? 'Redressement (deskew), détection DPI et binarisation d’image' : 'Deskewing, DPI detection, and Otsu binarization',
          tab: 'analyse',
          requiresProject: true,
        },
      ],
    },
    {
      id: 'ocr',
      name: isFr ? 'Reconnaissance Optique (OCR)' : 'Optical Recognition (OCR)',
      icon: Cpu,
      items: [
        {
          id: 'recon',
          label: isFr ? '3. Reconnaissance par Lots (Tesseract / RapidOCR)' : '3. Batch Recognition (Tesseract / RapidOCR)',
          description: isFr ? 'Extraction du texte, modèles de langue et scores de confiance' : 'Text extraction, language models, and confidence scores',
          tab: 'reconnaissance',
          requiresProject: true,
        },
      ],
    },
    {
      id: 'revision',
      name: isFr ? 'Révision & Édition' : 'Revision & Typography Studio',
      icon: Edit3,
      items: [
        {
          id: 'corr',
          label: isFr ? '4. Éditeur de Correction Bi-Fenêtre' : '4. Dual-Pane Correction Studio',
          description: isFr ? 'Scan haute résolution vs texte, règles typographiques' : 'Side-by-side scan vs editable text, typographic normalization',
          tab: 'correction',
          requiresProject: true,
        },
      ],
    },
    {
      id: 'structure',
      name: isFr ? 'Structure Éditoriale' : 'Editorial Structure & Metadata',
      icon: Layers,
      items: [
        {
          id: 'struct',
          label: isFr ? '5. Chapitres & Métadonnées Dublin Core' : '5. Chapters & Dublin Core Metadata',
          description: isFr ? 'Arborescence des titres H1/H2, catalogue des gravures' : 'Hierarchical TOC headings, engraving and illustration catalog',
          tab: 'structure',
          requiresProject: true,
        },
      ],
    },
    {
      id: 'export',
      name: isFr ? 'Exportations & Liseuse' : 'Exports & E-Reader',
      icon: Download,
      items: [
        {
          id: 'exp',
          label: isFr ? '6. Export Multi-Formats & Liseuse EPUB' : '6. Multi-Format Export & EPUB Reader',
          description: isFr ? 'Génération IDPF EPUB 3, Markdown, TXT, HTML 5 et test liseuse' : 'Certified EPUB 3 generation, Markdown, HTML 5, and live reader test',
          tab: 'export',
          requiresProject: true,
        },
      ],
    },
    {
      id: 'systeme',
      name: isFr ? 'Système & Paramètres' : 'System & Settings',
      icon: Settings,
      items: [
        {
          id: 'params',
          label: isFr ? 'Paramètres Système & Mises à Jour' : 'System Settings & Updates',
          description: isFr ? 'Date de sortie, vérification des versions et moteurs OCR' : 'Release date, version check, and OCR service state',
          action: onOpenSystemSettings,
        },
        {
          id: 'deb',
          label: isFr ? 'Paquet Linux Debian (.deb)' : 'Linux Debian Package (.deb)',
          description: isFr ? 'Télécharger le binaire natif pour bureau Debian 13 / Ubuntu' : 'Download native standalone binary for Debian 13 / Ubuntu',
          action: () => {
            window.location.href = '/releases/ocrbookor_1.2.0_amd64.deb';
          },
          badge: 'Desktop',
        },
        {
          id: 'landing-pwa',
          label: isFr ? 'Site Officiel & Landing Page PWA' : 'Official Site & PWA Landing Page',
          description: isFr ? 'Présentation complète, pipeline, démonstrateur et téléchargement' : 'Complete overview, pipeline tour, interactive demo, and downloads',
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
      name: isFr ? 'Légal & Conformité' : 'Legal & Compliance',
      icon: Scale,
      items: [
        {
          id: 'terms',
          label: isFr ? 'Mentions Légales & Responsabilité' : 'Legal Notice & Privacy',
          description: isFr ? 'Décharge de responsabilité sur les données et engagement hors-ligne' : 'Offline processing commitment, local data privacy, and disclaimers',
          action: onOpenLegal,
        },
      ],
    },
    {
      id: 'aide',
      name: isFr ? 'Documentation & Guides' : 'Documentation & Guides',
      icon: HelpCircle,
      items: [
        {
          id: 'doc-user',
          label: isFr ? 'Guide Utilisateur Pas-à-Pas' : 'Step-by-Step User Guide',
          description: isFr ? 'Tutoriel complet pour numériser un premier livre' : 'Complete walkthrough to digitize your first book',
          action: () => onOpenDocs('USER_GUIDE'),
        },
        {
          id: 'doc-bench',
          label: isFr ? 'Banc d’Essai & Benchmarks OCR' : 'Benchmarking & Accuracy Scores',
          description: isFr ? 'Résultats comparatifs réels sur les corpus A, B et C' : 'Real benchmark results across historical corpora A, B, and C',
          action: () => onOpenDocs('BENCHMARK'),
        },
        {
          id: 'doc-install',
          label: isFr ? 'Installation Linux Debian 13' : 'Linux Debian Installation Guide',
          description: isFr ? 'Instructions de déploiement et dépendances système' : 'Deployment instructions and system dependencies',
          action: () => onOpenDocs('INSTALLATION'),
        },
        {
          id: 'doc-audit',
          label: isFr ? 'Matrice d’Audit & Architecture' : 'Audit Matrix & Architecture',
          description: isFr ? 'Spécifications techniques et conformité IDPF EPUB 3' : 'Technical specifications and EPUB 3 compliance',
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
            <div className="flex items-center gap-1.5">
              {/* Language Switcher */}
              <button
                type="button"
                onClick={toggleLanguage}
                className="px-2 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
                title={t('common.switchLanguage')}
              >
                <span className={language === 'fr' ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'text-slate-400 font-normal'}>FR</span>
                <span className="text-slate-300 dark:text-slate-600 mx-0.5">/</span>
                <span className={language === 'en' ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'text-slate-400 font-normal'}>EN</span>
              </button>

              <button
                type="button"
                onClick={onToggleDarkMode}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title={darkMode ? t('nav.lightTheme') : t('nav.darkTheme')}
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
                placeholder={isFr ? 'Rechercher une fonctionnalité...' : 'Search for a feature...'}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Active project quick status badge */}
          {activeProject && (
            <div className="px-4 py-2 bg-indigo-50/70 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between text-xs">
              <div className="truncate">
                <span className="text-[10px] text-indigo-700 dark:text-indigo-400 font-semibold block uppercase tracking-wider">
                  {isFr ? 'Livre en cours de traitement' : 'Current Book in Progress'}
                </span>
                <span className="font-bold text-slate-900 dark:text-white truncate block">
                  {activeProject.metadata.title || (isFr ? 'Sans titre' : 'Untitled')}
                </span>
              </div>
              <span className="text-[11px] font-mono bg-indigo-600 text-white px-2 py-0.5 rounded-full shrink-0">
                {activeProject.pages.length} {t('common.pages')}
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
                              <span
                                className={`text-xs font-semibold truncate ${
                                  isCurrent ? 'text-white' : 'text-slate-900 dark:text-slate-100'
                                }`}
                              >
                                {item.label}
                              </span>
                              {item.badge && (
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                                    isCurrent
                                      ? 'bg-white/20 text-white'
                                      : 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300'
                                  }`}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p
                              className={`text-[11px] truncate mt-0.5 ${
                                isCurrent ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'
                              }`}
                            >
                              {item.description}
                            </p>
                          </div>

                          <ChevronRight
                            className={`w-4 h-4 shrink-0 transition ${
                              isCurrent
                                ? 'text-white'
                                : isDisabled
                                ? 'text-slate-300 dark:text-slate-700'
                                : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 group-hover:translate-x-0.5'
                            }`}
                          />
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
              <span>{isFr ? 'Paramètres Système' : 'System Settings'}</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenLegal();
              }}
              className="text-[11px] hover:underline"
            >
              {isFr ? 'Mentions Légales' : 'Legal Notice'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
