import { API_URL } from "../lib/constants";
import { validateOrThrow } from "../lib/validation";
import { createLessonSchema, updateLessonSchema, reorderLessonsSchema, upsertProgressSchema } from "../validations";
import { authedFetch } from "../lib/api";
import { handleJsonResponse, assertOk } from "./helpers";

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

export async function getLessons(moduleId: string): Promise<LessonResponse[]> {
  const res = await authedFetch(`${API_URL}/modules/${moduleId}/lessons`);
  return handleJsonResponse<LessonResponse[]>(res);
}

export async function getLesson(moduleId: string, lessonId: string): Promise<LessonResponse> {
  const res = await authedFetch(`${API_URL}/modules/${moduleId}/lessons/${lessonId}`);
  return handleJsonResponse<LessonResponse>(res);
}

export async function createLesson(
  moduleId: string,
  payload: CreateLessonPayload,
): Promise<LessonResponse> {
  validateOrThrow(createLessonSchema, payload);
  const res = await authedFetch(`${API_URL}/modules/${moduleId}/lessons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleJsonResponse<LessonResponse>(res);
}

export async function updateLesson(
  moduleId: string,
  lessonId: string,
  payload: UpdateLessonPayload,
): Promise<LessonResponse> {
  validateOrThrow(updateLessonSchema, payload);
  const res = await authedFetch(`${API_URL}/modules/${moduleId}/lessons/${lessonId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleJsonResponse<LessonResponse>(res);
}

export async function deleteLesson(
  moduleId: string,
  lessonId: string,
): Promise<void> {
  const res = await authedFetch(`${API_URL}/modules/${moduleId}/lessons/${lessonId}`, {
    method: 'DELETE',
  });
  await assertOk(res, 'Error al eliminar lección');
}

export async function reorderLessons(
  moduleId: string,
  payload: ReorderPayload,
): Promise<void> {
  validateOrThrow(reorderLessonsSchema, payload);
  const res = await authedFetch(`${API_URL}/modules/${moduleId}/lessons/reorder`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  await assertOk(res, 'Error al reordenar');
}

export async function getProgress(moduleId: string, lessonId: string): Promise<LessonProgressResponse | null> {
  const res = await authedFetch(`${API_URL}/modules/${moduleId}/lessons/${lessonId}/progress`);
  if (res.status === 404) return null;
  await assertOk(res, 'Error al obtener progreso');
  return res.json();
}

export async function upsertProgress(
  moduleId: string,
  lessonId: string,
  payload: UpsertProgressPayload,
): Promise<LessonProgressResponse> {
  validateOrThrow(upsertProgressSchema, payload);
  const res = await authedFetch(`${API_URL}/modules/${moduleId}/lessons/${lessonId}/progress`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleJsonResponse<LessonProgressResponse>(res);
}
