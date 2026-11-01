/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { OCRProject, PageData, ProjectStatus } from '../types/book';

const API_BASE = (typeof window !== 'undefined' && (window as any).OCRBOOKOR_API_URL) ||
  import.meta.env.VITE_API_URL ||
  '/api';

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  app: string;
  version: string;
  mode: string;
}

export interface OCREnginesStatus {
  [engineName: string]: {
    available: boolean;
    supported_languages: string[];
  };
}

export interface ApiError {
  message: string;
  statusCode?: number;
  details?: any;
}

export class ApiClientError extends Error {
  statusCode?: number;
  details?: any;

  constructor(message: string, statusCode?: number, details?: any) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs: number = 30000
): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: options.signal || controller.signal,
      headers: {
        'Accept': 'application/json',
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
    });

    clearTimeout(timer);

    if (!res.ok) {
      let errorMsg = `Erreur HTTP ${res.status} (${res.statusText})`;
      let details: any = null;
      try {
        const errJson = await res.json();
        if (errJson.detail) errorMsg = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
        else if (errJson.message) errorMsg = errJson.message;
        details = errJson;
      } catch {
        // ignore json parse error on non-json error responses
      }
      throw new ApiClientError(errorMsg, res.status, details);
    }

    // Check if JSON response
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return (await res.json()) as T;
    }
    return (await res.text()) as unknown as T;
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new ApiClientError(`Délai d’attente dépassé (${timeoutMs / 1000}s) pour l'opération : ${endpoint}`, 408);
    }
    if (err instanceof ApiClientError) {
      throw err;
    }
    throw new ApiClientError(err.message || 'Impossible de joindre le service OCRBookor', 0);
  }
}

/**
 * Service Client API Centralisé pour OCRBookor
 */
export const ApiClient = {
  /**
   * Vérifie l'état du serveur backend
   */
  async checkHealth(): Promise<HealthResponse> {
    return request<HealthResponse>('/health', { method: 'GET' }, 5000);
  },

  /**
   * Récupère l'état de disponibilité réel des moteurs OCR
   */
  async getOCREngines(): Promise<OCREnginesStatus> {
    return request<OCREnginesStatus>('/system/ocr-engines', { method: 'GET' }, 5000);
  },

  /**
   * Liste tous les projets enregistrés
   */
  async getProjects(): Promise<OCRProject[]> {
    const data = await request<{ projects: any[] }>('/projects', { method: 'GET' });
    return (data.projects || []).map((p) => {
      if (typeof p.metadata_json === 'string') {
        try {
          const parsed = JSON.parse(p.metadata_json);
          return { ...parsed, id: p.id, status: p.status || parsed.status };
        } catch {
          // ignore
        }
      }
      return p;
    });
  },

  /**
   * Récupère un projet complet par ID
   */
  async getProject(id: string): Promise<OCRProject> {
    return request<OCRProject>(`/projects/${id}`, { method: 'GET' });
  },

  /**
   * Crée un nouveau projet
   */
  async createProject(project: OCRProject): Promise<{ id: string }> {
    return request<{ id: string }>('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  },

  /**
   * Met à jour un projet existant
   */
  async updateProject(id: string, project: Partial<OCRProject>): Promise<void> {
    await request<void>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    });
  },

  /**
   * Supprime un projet
   */
  async deleteProject(id: string): Promise<void> {
    await request<void>(`/projects/${id}`, { method: 'DELETE' });
  },

  /**
   * Upload d'un document PDF pour un projet donné
   */
  async uploadPdf(projectId: string, file: File): Promise<{ fileName: string; sizeBytes: number; pagesCount: number }> {
    const formData = new FormData();
    formData.append('file', file);

    return request<{ fileName: string; sizeBytes: number; pagesCount: number }>(
      `/projects/${projectId}/upload-pdf`,
      {
        method: 'POST',
        body: formData,
      },
      120000 // 2 minutes for large PDF uploads
    );
  },

  /**
   * Sauvegarde le texte corrigé manuellement pour une page
   */
  async savePageCorrection(projectId: string, pageNumber: number, correctedText: string): Promise<void> {
    await request<void>(`/projects/${projectId}/pages/${pageNumber}/text`, {
      method: 'PUT',
      body: JSON.stringify({ correctedText }),
    });
  },

  /**
   * Lance un export sur le backend et récupère les informations du fichier généré
   */
  async exportDocument(projectId: string, format: 'epub' | 'markdown' | 'text' | 'html'): Promise<{ downloadUrl: string; fileName: string; fileSizeBytes: number }> {
    return request<{ downloadUrl: string; fileName: string; fileSizeBytes: number }>(
      `/projects/${projectId}/export/${format}`,
      { method: 'POST' }
    );
  },
};
