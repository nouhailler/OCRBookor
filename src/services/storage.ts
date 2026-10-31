/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { OCRProject } from '../types/book';
import { createBenchmarkBookA, createBenchmarkBookB, createBenchmarkBookC } from './benchmarkData';

const STORAGE_KEY = 'ocrbookor_projects_v1';
const ACTIVE_PROJECT_KEY = 'ocrbookor_active_id_v1';

export function loadProjectsFromStorage(): OCRProject[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not parse projects from localStorage:', e);
  }

  // Initial seed with the 3 benchmark corpus books
  const initialProjects: OCRProject[] = [
    createBenchmarkBookA(),
    createBenchmarkBookB(),
    createBenchmarkBookC(),
  ];

  saveProjectsToStorage(initialProjects);
  return initialProjects;
}

export function saveProjectsToStorage(projects: OCRProject[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error('Failed to save projects to localStorage:', e);
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
    projects[index] = { ...updatedProject, metadata: { ...updatedProject.metadata, updatedAt: new Date().toISOString() } };
  } else {
    projects.push(updatedProject);
  }
  saveProjectsToStorage(projects);
}

export function deleteProject(id: string): void {
  const projects = loadProjectsFromStorage();
  const filtered = projects.filter((p) => p.id !== id);
  saveProjectsToStorage(filtered);
}
