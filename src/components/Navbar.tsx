/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Menu,
  Library,
  Search,
  Cpu,
  Edit3,
  Layers,
  Download,
  FileText,
  Moon,
  Sun,
  CheckCircle2,
  HelpCircle,
  Settings,
  Compass,
} from 'lucide-react';
import { OCRProject } from '../types/book';
import { Logo } from './Logo';

export type ActiveTab = 'bibliotheque' | 'analyse' | 'reconnaissance' | 'correction' | 'structure' | 'export';

interface NavbarProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  activeProject: OCRProject | null;
  projects: OCRProject[];
  onSelectProject: (id: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenDocs: (docKey: string) => void;
  onOpenHamburger: () => void;
  onOpenSettings: () => void;
  lastSavedTime?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  activeProject,
  projects,
  onSelectProject,
  darkMode,
  onToggleDarkMode,
  onOpenDocs,
  onOpenHamburger,
  onOpenSettings,
  lastSavedTime,
}) => {
  const tabs = [
    { id: 'bibliotheque', label: '1. Bibliothèque', icon: Library, disabled: false },
    { id: 'analyse', label: '2. Analyse', icon: Search, disabled: !activeProject },
    { id: 'reconnaissance', label: '3. Reconnaissance', icon: Cpu, disabled: !activeProject },
    { id: 'correction', label: '4. Correction', icon: Edit3, disabled: !activeProject },
    { id: 'structure', label: '5. Structure', icon: Layers, disabled: !activeProject },
    { id: 'export', label: '6. Export', icon: Download, disabled: !activeProject },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-sm transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 gap-2">
        {/* Left: Hamburger button + Logo */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          <button
            type="button"
            onClick={onOpenHamburger}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition shadow-sm"
            aria-label="Ouvrir le menu des fonctionnalités"
            title="Menu des fonctionnalités par catégorie"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Logo size="md" showText={true} version="v1.2" />
        </div>

        {/* Project quick selector if project active */}
        {activeProject && (
          <div className="hidden lg:flex items-center space-x-2 bg-slate-100/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 max-w-xs transition">
            <FileText className="h-4 w-4 text-indigo-500 shrink-0" />
            <select
              value={activeProject.id}
              onChange={(e) => onSelectProject(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none truncate cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {p.metadata.title || 'Sans titre'} ({p.pages.length} p.)
                </option>
              ))}
            </select>
            {lastSavedTime && (
              <span className="flex items-center text-[10px] text-emerald-600 dark:text-emerald-400 font-mono ml-1 shrink-0" title="Sauvegarde locale automatique SQLite / IndexedDB">
                <CheckCircle2 className="h-3 w-3 mr-0.5" />
                Auto
              </span>
            )}
          </div>
        )}

        {/* Navigation Tabs (Workflow) */}
        <nav className="flex items-center space-x-1 overflow-x-auto py-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && onSelectTab(tab.id as ActiveTab)}
                disabled={tab.disabled}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                    : tab.disabled
                    ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Utilities: System Settings, Docs, Theme Toggle */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition"
            title="Paramètres Système & Mises à jour"
          >
            <Settings className="h-4 w-4 text-indigo-500" />
            <span className="hidden xl:inline">Système</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenDocs('README')}
            className="hidden md:flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            title="Documentation, architecture et benchmarks"
          >
            <HelpCircle className="h-4 w-4 text-slate-400" />
            <span className="hidden xl:inline">Docs</span>
          </button>

          <button
            type="button"
            onClick={onToggleDarkMode}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 transition"
            title={darkMode ? 'Basculer en thème clair' : 'Basculer en thème sombre'}
            aria-label={darkMode ? 'Passer en mode clair' : 'Passer en mode sombre'}
          >
            {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
