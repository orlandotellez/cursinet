import { API_URL } from "../lib/constants";

// ─── Types aligned with backend ─────────────────────────────────────────────

export interface ModuleResponse {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  sortOrder: number;
  isPublished: boolean;
  lessons?: LessonSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface LessonSummary {
  id: string;
  moduleId: string;
  title: string;
  slug: string;
  type: 'Video' | 'Text' | 'Code' | 'Quiz' | 'Resource';
  sortOrder: number;
  isPublished: boolean;
  isPreview: boolean;
  videoDurationSeconds: number | null;
}

export interface CreateModulePayload {
  title: string;
  description?: string | null;
}

export interface UpdateModulePayload {
  title?: string | null;
  description?: string | null;
  isPublished?: boolean | null;
}

export interface ReorderPayload {
  items: { id: string; sortOrder: number }[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: 'Error del servidor' }));
    throw new Error(body.detail || body.title || 'Error del servidor');
  }
  return res.json();
}

// ─── API functions ──────────────────────────────────────────────────────────

export async function getModules(courseId: string): Promise<ModuleResponse[]> {
  const res = await fetch(`${API_URL}/courses/${courseId}/modules`, { credentials: 'include' });
  return handleResponse<ModuleResponse[]>(res);
}

export async function getModule(courseId: string, moduleId: string): Promise<ModuleResponse> {
  const res = await fetch(`${API_URL}/courses/${courseId}/modules/${moduleId}`, { credentials: 'include' });
  return handleResponse<ModuleResponse>(res);
}

export async function createModule(courseId: string, payload: CreateModulePayload): Promise<ModuleResponse> {
  const res = await fetch(`${API_URL}/courses/${courseId}/modules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return handleResponse<ModuleResponse>(res);
}

export async function updateModule(courseId: string, moduleId: string, payload: UpdateModulePayload): Promise<ModuleResponse> {
  const res = await fetch(`${API_URL}/courses/${courseId}/modules/${moduleId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return handleResponse<ModuleResponse>(res);
}

export async function deleteModule(courseId: string, moduleId: string): Promise<void> {
  const res = await fetch(`${API_URL}/courses/${courseId}/modules/${moduleId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: 'Error al eliminar módulo' }));
    throw new Error(body.detail || body.title || 'Error al eliminar módulo');
  }
}

export async function reorderModules(courseId: string, payload: ReorderPayload): Promise<void> {
  const res = await fetch(`${API_URL}/courses/${courseId}/modules/reorder`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: 'Error al reordenar' }));
    throw new Error(body.detail || body.title || 'Error al reordenar');
  }
}
