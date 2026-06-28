import { api } from '../lib/client';
import { ApiError } from '../lib/helpers';
import { validateOrThrow } from '@/src/shared/lib/validation';
import { createLessonSchema, updateLessonSchema, reorderLessonsSchema, upsertProgressSchema } from '@/src/shared/validations';
import type { LessonResponse, LessonProgressResponse, UpsertProgressPayload, CreateLessonPayload, UpdateLessonPayload, ReorderPayload } from '../types';

export async function getLessons(moduleId: string): Promise<LessonResponse[]> {
  return api.get<LessonResponse[]>(`/modules/${moduleId}/lessons`);
}

export async function getLesson(moduleId: string, lessonId: string): Promise<LessonResponse> {
  return api.get<LessonResponse>(`/modules/${moduleId}/lessons/${lessonId}`);
}

export async function createLesson(
  moduleId: string,
  payload: CreateLessonPayload,
): Promise<LessonResponse> {
  validateOrThrow(createLessonSchema, payload);
  return api.post<LessonResponse>(`/modules/${moduleId}/lessons`, payload);
}

export async function updateLesson(
  moduleId: string,
  lessonId: string,
  payload: UpdateLessonPayload,
): Promise<LessonResponse> {
  validateOrThrow(updateLessonSchema, payload);
  return api.put<LessonResponse>(`/modules/${moduleId}/lessons/${lessonId}`, payload);
}

export async function deleteLesson(
  moduleId: string,
  lessonId: string,
): Promise<void> {
  return api.delete<void>(`/modules/${moduleId}/lessons/${lessonId}`);
}

export async function reorderLessons(
  moduleId: string,
  payload: ReorderPayload,
): Promise<void> {
  validateOrThrow(reorderLessonsSchema, payload);
  return api.put<void>(`/modules/${moduleId}/lessons/reorder`, payload);
}

export async function getProgress(moduleId: string, lessonId: string): Promise<LessonProgressResponse | null> {
  try {
    return await api.get<LessonProgressResponse>(`/modules/${moduleId}/lessons/${lessonId}/progress`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export async function upsertProgress(
  moduleId: string,
  lessonId: string,
  payload: UpsertProgressPayload,
): Promise<LessonProgressResponse> {
  validateOrThrow(upsertProgressSchema, payload);
  return api.put<LessonProgressResponse>(`/modules/${moduleId}/lessons/${lessonId}/progress`, payload);
}
