/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  BookOpen,
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
} from 'lucide-react';
import { OCRProject } from '../types/book';

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
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/95 backdrop-blur shadow-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand logo & name */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-indigo-500/20 shadow-lg">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-tight text-white">OCRBookor</span>
              <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
                v1.0
              </span>
            </div>
            <p className="hidden text-xs text-slate-400 sm:block">Numérisation & Reconstruction de Livres</p>
          </div>
        </div>

        {/* Project quick selector if project active */}
        {activeProject && (
          <div className="hidden md:flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 max-w-xs">
            <FileText className="h-4 w-4 text-indigo-400 shrink-0" />
            <select
              value={activeProject.id}
              onChange={(e) => onSelectProject(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-200 focus:outline-none truncate cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                  {p.metadata.title || 'Sans titre'} ({p.pages.length} p.)
                </option>
              ))}
            </select>
            {lastSavedTime && (
              <span className="flex items-center text-[10px] text-emerald-400 font-mono ml-1 shrink-0" title="Sauvegarde locale automatique">
                <CheckCircle2 className="h-3 w-3 mr-0.5" />
                Auto
              </span>
            )}
          </div>
        )}

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 overflow-x-auto py-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && onSelectTab(tab.id as ActiveTab)}
                disabled={tab.disabled}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : tab.disabled
                    ? 'text-slate-600 cursor-not-allowed opacity-50'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Utilities & Help */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onOpenDocs('README')}
            className="flex items-center space-x-1 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Documentation, architecture et benchmarks"
          >
            <HelpCircle className="h-4 w-4 text-indigo-400" />
            <span className="hidden lg:inline">Docs & Benchmarks</span>
          </button>

          <button
            onClick={onToggleDarkMode}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
            title={darkMode ? 'Basculer en thème clair' : 'Basculer en thème sombre'}
          >
            {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
