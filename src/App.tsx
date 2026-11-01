/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { LibraryView } from './components/LibraryView';
import { AnalysisView } from './components/AnalysisView';
import { RecognitionView } from './components/RecognitionView';
import { CorrectionView } from './components/CorrectionView';
import { StructureView } from './components/StructureView';
import { ExportView } from './components/ExportView';
import { DocumentationModal } from './components/DocumentationModal';
import { HamburgerMenu } from './components/HamburgerMenu';
import { SystemSettingsModal } from './components/SystemSettingsModal';
import { OnboardingModal } from './components/OnboardingModal';
import { ContextualGuide } from './components/ContextualGuide';
import { OCRProject } from './types/book';
import {
  loadProjectsFromStorage,
  saveProjectsToStorage,
  saveSingleProject,
  deleteProject as deleteProjectFromStorage,
  getActiveProjectId,
  setActiveProjectId,
} from './services/storage';
import { createBenchmarkBookA, createBenchmarkBookB, createBenchmarkBookC } from './services/benchmarkData';

export default function App() {
  const [projects, setProjects] = useState<OCRProject[]>([]);
  const [activeProjectId, setActiveId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<ActiveTab>('bibliotheque');
  
  // Theme management: defaults to dark or saved preference
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('ocrbookor_theme');
      if (savedTheme) return savedTheme === 'dark';
    }
    return true;
  });

  // Modals & Navigation
  const [hamburgerOpen, setHamburgerOpen] = useState<boolean>(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);
  const [onboardingModalOpen, setOnboardingModalOpen] = useState<boolean>(false);
  const [onboardingForceReview, setOnboardingForceReview] = useState<boolean>(false);
  const [docsModalOpen, setDocsModalOpen] = useState<boolean>(false);
  const [docsModalKey, setDocsModalKey] = useState<string>('README');
  const [lastSavedTime, setLastSavedTime] = useState<string>('');

  // Synchronize dark class on HTML element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ocrbookor_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ocrbookor_theme', 'light');
    }
  }, [darkMode]);

  // Initial load: projects & legal terms check
  useEffect(() => {
    const loaded = loadProjectsFromStorage();
    setProjects(loaded);

    const savedActiveId = getActiveProjectId();
    if (savedActiveId && loaded.some((p) => p.id === savedActiveId)) {
      setActiveId(savedActiveId);
    } else if (loaded.length > 0) {
      setActiveId(loaded[0].id);
      setActiveProjectId(loaded[0].id);
    }

    // Check if user has already accepted legal terms
    const acceptedTerms = localStorage.getItem('ocrbookor_legal_accepted_v1');
    if (!acceptedTerms) {
      setOnboardingModalOpen(true);
      setOnboardingForceReview(false);
    }
  }, []);

  const activeProject = projects.find((p) => p.id === activeProjectId) || null;

  const handleSelectProject = useCallback((id: string) => {
    setActiveId(id);
    setActiveProjectId(id);
  }, []);

  const handleUpdateProject = useCallback((updated: OCRProject) => {
    setProjects((prev) => {
      const next = prev.map((p) => (p.id === updated.id ? updated : p));
      saveProjectsToStorage(next);
      return next;
    });

    const now = new Date();
    setLastSavedTime(
      `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now
        .getSeconds()
        .toString()
        .padStart(2, '0')}`
    );
  }, []);

  const handleCreateProject = useCallback((newProject: OCRProject) => {
    setProjects((prev) => {
      const next = [newProject, ...prev];
      saveProjectsToStorage(next);
      return next;
    });
    setActiveId(newProject.id);
    setActiveProjectId(newProject.id);
  }, []);

  const handleDeleteProject = useCallback((id: string) => {
    deleteProjectFromStorage(id);
    setProjects((prev) => {
      const next = prev.filter((p) => p.id !== id);
      return next;
    });

    if (activeProjectId === id) {
      const remaining = projects.filter((p) => p.id !== id);
      const nextActive = remaining.length > 0 ? remaining[0].id : null;
      setActiveId(nextActive);
      if (nextActive) setActiveProjectId(nextActive);
      setCurrentTab('bibliotheque');
    }
  }, [activeProjectId, projects]);

  const handleResetBenchmarkCorpus = useCallback(() => {
    const corpus = [
      createBenchmarkBookA(),
      createBenchmarkBookB(),
      createBenchmarkBookC(),
    ];
    setProjects(corpus);
    saveProjectsToStorage(corpus);
    setActiveId(corpus[0].id);
    setActiveProjectId(corpus[0].id);
  }, []);

  const handleOpenProjectTab = useCallback(
    (projectId: string, tab: 'analyse' | 'reconnaissance' | 'correction' | 'structure' | 'export') => {
      handleSelectProject(projectId);
      setCurrentTab(tab);
    },
    [handleSelectProject]
  );

  const handleOpenDocs = (docKey: string) => {
    setDocsModalKey(docKey);
    setDocsModalOpen(true);
  };

  const handleOpenLegalReview = () => {
    setOnboardingForceReview(true);
    setOnboardingModalOpen(true);
  };

  // Keyboard shortcut listener: Ctrl+S or Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (activeProject) {
          saveSingleProject(activeProject);
          const now = new Date();
          setLastSavedTime(
            `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now
              .getSeconds()
              .toString()
              .padStart(2, '0')}`
          );
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeProject]);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} flex flex-col font-sans transition-colors duration-200`}>
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeProject={activeProject}
        projects={projects}
        onSelectProject={handleSelectProject}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenDocs={handleOpenDocs}
        onOpenHamburger={() => setHamburgerOpen(true)}
        onOpenSettings={() => setSettingsModalOpen(true)}
        lastSavedTime={lastSavedTime}
      />

      {/* Contextual Guide for Novice Users */}
      <ContextualGuide
        currentTab={currentTab}
        onNavigateTab={(tab) => setCurrentTab(tab)}
      />

      {/* Main Content Area according to active tab */}
      <main className="flex-1 pb-12">
        {currentTab === 'bibliotheque' && (
          <LibraryView
            projects={projects}
            activeProject={activeProject}
            onSelectProject={handleSelectProject}
            onOpenProjectTab={handleOpenProjectTab}
            onCreateProject={handleCreateProject}
            onDeleteProject={handleDeleteProject}
            onResetBenchmarkCorpus={handleResetBenchmarkCorpus}
          />
        )}

        {currentTab === 'analyse' && activeProject && (
          <AnalysisView
            project={activeProject}
            onUpdateProject={handleUpdateProject}
            onStartOCR={() => setCurrentTab('reconnaissance')}
          />
        )}

        {currentTab === 'reconnaissance' && activeProject && (
          <RecognitionView
            project={activeProject}
            onUpdateProject={handleUpdateProject}
            onGoToCorrection={() => setCurrentTab('correction')}
          />
        )}

        {currentTab === 'correction' && activeProject && (
          <CorrectionView
            project={activeProject}
            onUpdateProject={handleUpdateProject}
          />
        )}

        {currentTab === 'structure' && activeProject && (
          <StructureView
            project={activeProject}
            onUpdateProject={handleUpdateProject}
            onGoToExport={() => setCurrentTab('export')}
          />
        )}

        {currentTab === 'export' && activeProject && (
          <ExportView
            project={activeProject}
            onUpdateProject={handleUpdateProject}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 py-4 text-center text-xs text-slate-500 transition-colors">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            <strong>OCRBookor v1.2</strong> — Logiciel libre de numérisation de livres & conversion EPUB 3 (100% Hors-Ligne)
          </span>
          <div className="flex items-center space-x-4">
            <button onClick={handleOpenLegalReview} className="hover:text-indigo-600 dark:hover:text-slate-300 transition">
              Mentions Légales & Responsabilité
            </button>
            <button onClick={() => setSettingsModalOpen(true)} className="hover:text-indigo-600 dark:hover:text-slate-300 transition">
              Paramètres Système
            </button>
            <button onClick={() => handleOpenDocs('BENCHMARK')} className="hover:text-indigo-600 dark:hover:text-slate-300 transition">
              Banc d’Essai OCR
            </button>
            <button onClick={() => handleOpenDocs('USER_GUIDE')} className="hover:text-indigo-600 dark:hover:text-slate-300 transition">
              Guide Novice
            </button>
          </div>
        </div>
      </footer>

      {/* Hamburger Drawer */}
      <HamburgerMenu
        isOpen={hamburgerOpen}
        onClose={() => setHamburgerOpen(false)}
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeProject={activeProject}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenSystemSettings={() => {
          setHamburgerOpen(false);
          setSettingsModalOpen(true);
        }}
        onOpenLegal={() => {
          setHamburgerOpen(false);
          handleOpenLegalReview();
        }}
        onOpenDocs={(key) => {
          setHamburgerOpen(false);
          handleOpenDocs(key);
        }}
        onResetBenchmarkCorpus={handleResetBenchmarkCorpus}
      />

      {/* System Settings & Updates Modal */}
      <SystemSettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        onOpenLegal={() => {
          setSettingsModalOpen(false);
          handleOpenLegalReview();
        }}
        onOpenDocs={handleOpenDocs}
      />

      {/* Onboarding & Legal Terms Modal */}
      <OnboardingModal
        isOpen={onboardingModalOpen}
        forceReview={onboardingForceReview}
        onClose={() => setOnboardingModalOpen(false)}
        onAccept={() => setOnboardingModalOpen(false)}
      />

      {/* Embedded Documentation Modal */}
      <DocumentationModal
        isOpen={docsModalOpen}
        onClose={() => setDocsModalOpen(false)}
        defaultDoc={docsModalKey}
      />
    </div>
  );
}
