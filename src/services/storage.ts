/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { OCRProject } from '../types/book';
import { createBenchmarkBookA, createBenchmarkBookB, createBenchmarkBookC } from './benchmarkData';

const STORAGE_KEY = 'ocrbookor_projects_v1';
const ACTIVE_PROJECT_KEY = 'ocrbookor_active_id_v1';
const DB_NAME = 'ocrbookor_storage_db';
const STORE_NAME = 'projects';

let inMemoryProjectsCache: OCRProject[] | null = null;

// IndexedDB Helper
function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB non disponible'));
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function loadProjectsFromStorage(): OCRProject[] {
  if (inMemoryProjectsCache && inMemoryProjectsCache.length > 0) {
    return inMemoryProjectsCache;
  }

  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryProjectsCache = parsed;
        // Asynchronously sync with IndexedDB
        syncToIndexedDB(parsed);
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Erreur lecture localStorage:', e);
  }

  // Initial seed with reference public domain test corpus
  const initialProjects: OCRProject[] = [
    createBenchmarkBookA(),
    createBenchmarkBookB(),
    createBenchmarkBookC(),
  ];

  saveProjectsToStorage(initialProjects);
  inMemoryProjectsCache = initialProjects;
  return initialProjects;
}

export function saveProjectsToStorage(projects: OCRProject[]): void {
  inMemoryProjectsCache = projects;
  if (typeof window === 'undefined') return;

  // Save to IndexedDB (supports large images & PDFs)
  syncToIndexedDB(projects);

  // Also try saving metadata/summary to localStorage for fast bootstrap
  try {
    const lightweight = projects.map((p) => ({
      ...p,
      pages: p.pages.map((pg) => ({
        ...pg,
        // Strip heavy base64 strings in localStorage if large
        imageUrl: pg.imageUrl && pg.imageUrl.length > 300000 ? pg.imageUrl.slice(0, 100) + '...' : pg.imageUrl,
        processedImageUrl: undefined,
      })),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lightweight));
  } catch (e) {
    console.warn('LocalStorage saturé, persistance assurée par IndexedDB:', e);
  }
}

async function syncToIndexedDB(projects: OCRProject[]): Promise<void> {
  try {
    const db = await openIndexedDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    for (const p of projects) {
      store.put(p);
    }
  } catch (err) {
    console.warn('IndexedDB sync error:', err);
  }
}

export function getActiveProjectId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACTIVE_PROJECT_KEY);
}

export function setActiveProjectId(id: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACTIVE_PROJECT_KEY, id);
}

export function saveSingleProject(updatedProject: OCRProject): void {
  const projects = loadProjectsFromStorage();
  const index = projects.findIndex((p) => p.id === updatedProject.id);
  if (index >= 0) {
    projects[index] = {
      ...updatedProject,
      metadata: { ...updatedProject.metadata, updatedAt: new Date().toISOString() },
    };
  } else {
    projects.push(updatedProject);
  }
  saveProjectsToStorage(projects);
}

export function deleteProject(id: string): void {
  const projects = loadProjectsFromStorage();
  const filtered = projects.filter((p) => p.id !== id);
  saveProjectsToStorage(filtered);

  if (typeof window !== 'undefined' && window.indexedDB) {
    openIndexedDB().then((db) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(id);
    }).catch(() => {});
  }
}
