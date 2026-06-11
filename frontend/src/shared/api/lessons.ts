import { API_URL } from "../lib/constants";
import { validateOrThrow } from "../lib/validation";
import { createLessonSchema, updateLessonSchema, reorderLessonsSchema, upsertProgressSchema } from "../validations";

// ─── Types aligned with backend ─────────────────────────────────────────────

export interface LessonResponse {
  id: string;
  moduleId: string;
  courseId: string;
  title: string;
  slug: string;
  type: 'Video' | 'Text' | 'Code' | 'Quiz' | 'Resource';
  sortOrder: number;
  isPublished: boolean;
  isPreview: boolean;
  videoUrl: string | null;
  videoDurationSeconds: number | null;
  contentMarkdown: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LessonProgressResponse {
  isCompleted: boolean;
  watchedSeconds: number;
  lastPositionSeconds: number;
  updatedAt: string;
}

export interface UpsertProgressPayload {
  isCompleted?: boolean;
  watchedSeconds?: number;
  lastPositionSeconds?: number;
}

export interface CreateLessonPayload {
  title: string;
  type: 'Video' | 'Text' | 'Code' | 'Quiz' | 'Resource';
  isPreview?: boolean;
  videoUrl?: string | null;
  videoDurationSeconds?: number | null;
  contentMarkdown?: string | null;
}

export interface UpdateLessonPayload {
  title?: string | null;
  type?: string | null;
  isPublished?: boolean | null;
  isPreview?: boolean | null;
  videoUrl?: string | null;
  videoDurationSeconds?: number | null;
  contentMarkdown?: string | null;
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

// ─── Lessons API (routes match backend: /api/v1/modules/{moduleId}/lessons) ─

export async function getLessons(moduleId: string): Promise<LessonResponse[]> {
  const res = await fetch(`${API_URL}/modules/${moduleId}/lessons`, {
    credentials: 'include',
  });
  return handleResponse<LessonResponse[]>(res);
}

export async function getLesson(moduleId: string, lessonId: string): Promise<LessonResponse> {
  const res = await fetch(`${API_URL}/modules/${moduleId}/lessons/${lessonId}`, {
    credentials: 'include',
  });
  return handleResponse<LessonResponse>(res);
}

export async function createLesson(
  moduleId: string,
  payload: CreateLessonPayload,
): Promise<LessonResponse> {
  validateOrThrow(createLessonSchema, payload);
  const res = await fetch(`${API_URL}/modules/${moduleId}/lessons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return handleResponse<LessonResponse>(res);
}

export async function updateLesson(
  moduleId: string,
  lessonId: string,
  payload: UpdateLessonPayload,
): Promise<LessonResponse> {
  validateOrThrow(updateLessonSchema, payload);
  const res = await fetch(`${API_URL}/modules/${moduleId}/lessons/${lessonId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return handleResponse<LessonResponse>(res);
}

export async function deleteLesson(
  moduleId: string,
  lessonId: string,
): Promise<void> {
  const res = await fetch(`${API_URL}/modules/${moduleId}/lessons/${lessonId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: 'Error al eliminar lección' }));
    throw new Error(body.detail || body.title || 'Error al eliminar lección');
  }
}

export async function reorderLessons(
  moduleId: string,
  payload: ReorderPayload,
): Promise<void> {
  validateOrThrow(reorderLessonsSchema, payload);
  const res = await fetch(`${API_URL}/modules/${moduleId}/lessons/reorder`, {
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

// ─── Progress API (routes: /api/v1/modules/{moduleId}/lessons/{id}/progress) ─

export async function getProgress(moduleId: string, lessonId: string): Promise<LessonProgressResponse | null> {
  const res = await fetch(`${API_URL}/modules/${moduleId}/lessons/${lessonId}/progress`, {
    credentials: 'include',
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: 'Error al obtener progreso' }));
    throw new Error(body.detail || body.title || 'Error al obtener progreso');
  }
  return res.json();
}

export async function upsertProgress(
  moduleId: string,
  lessonId: string,
  payload: UpsertProgressPayload,
): Promise<LessonProgressResponse> {
  validateOrThrow(upsertProgressSchema, payload);
  const res = await fetch(`${API_URL}/modules/${moduleId}/lessons/${lessonId}/progress`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return handleResponse<LessonProgressResponse>(res);
}
