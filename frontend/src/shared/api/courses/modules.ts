import { api } from '../lib/client';
import { validateOrThrow } from '@/src/shared/lib/validation';
import { createModuleSchema, updateModuleSchema, reorderModulesSchema } from '@/src/shared/validations';
import type { ModuleResponse, CreateModulePayload, UpdateModulePayload, ReorderPayload } from '../types';

export async function getModules(courseId: string): Promise<ModuleResponse[]> {
  return api.get<ModuleResponse[]>(`/courses/${courseId}/modules`);
}

export async function getModule(courseId: string, moduleId: string): Promise<ModuleResponse> {
  return api.get<ModuleResponse>(`/courses/${courseId}/modules/${moduleId}`);
}

export async function createModule(courseId: string, payload: CreateModulePayload): Promise<ModuleResponse> {
  validateOrThrow(createModuleSchema, payload);
  return api.post<ModuleResponse>(`/courses/${courseId}/modules`, payload);
}

export async function updateModule(courseId: string, moduleId: string, payload: UpdateModulePayload): Promise<ModuleResponse> {
  validateOrThrow(updateModuleSchema, payload);
  return api.put<ModuleResponse>(`/courses/${courseId}/modules/${moduleId}`, payload);
}

export async function deleteModule(courseId: string, moduleId: string): Promise<void> {
  return api.delete<void>(`/courses/${courseId}/modules/${moduleId}`);
}

export async function reorderModules(courseId: string, payload: ReorderPayload): Promise<void> {
  validateOrThrow(reorderModulesSchema, payload);
  return api.put<void>(`/courses/${courseId}/modules/reorder`, payload);
}
