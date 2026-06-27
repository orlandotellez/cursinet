import { API_URL } from "../lib/constants";
import { validateOrThrow } from "../lib/validation";
import { createModuleSchema, updateModuleSchema, reorderModulesSchema } from "../validations";
import { authedFetch } from "../lib/api";
import { handleJsonResponse, assertOk } from "./helpers";

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

export async function getModules(courseId: string): Promise<ModuleResponse[]> {
  const res = await authedFetch(`${API_URL}/courses/${courseId}/modules`);
  return handleJsonResponse<ModuleResponse[]>(res);
}

export async function getModule(courseId: string, moduleId: string): Promise<ModuleResponse> {
  const res = await authedFetch(`${API_URL}/courses/${courseId}/modules/${moduleId}`);
  return handleJsonResponse<ModuleResponse>(res);
}

export async function createModule(courseId: string, payload: CreateModulePayload): Promise<ModuleResponse> {
  validateOrThrow(createModuleSchema, payload);
  const res = await authedFetch(`${API_URL}/courses/${courseId}/modules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleJsonResponse<ModuleResponse>(res);
}

export async function updateModule(courseId: string, moduleId: string, payload: UpdateModulePayload): Promise<ModuleResponse> {
  validateOrThrow(updateModuleSchema, payload);
  const res = await authedFetch(`${API_URL}/courses/${courseId}/modules/${moduleId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleJsonResponse<ModuleResponse>(res);
}

export async function deleteModule(courseId: string, moduleId: string): Promise<void> {
  const res = await authedFetch(`${API_URL}/courses/${courseId}/modules/${moduleId}`, {
    method: 'DELETE',
  });
  await assertOk(res, 'Error al eliminar módulo');
}

export async function reorderModules(courseId: string, payload: ReorderPayload): Promise<void> {
  validateOrThrow(reorderModulesSchema, payload);
  const res = await authedFetch(`${API_URL}/courses/${courseId}/modules/reorder`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  await assertOk(res, 'Error al reordenar');
}
