import { api } from '../lib/client';
import { validateOrThrow } from '@/src/shared/lib/validation';
import { createCourseSchema, updateCourseSchema } from '@/src/shared/validations';
import type { CourseDTO, CreateCoursePayload, UpdateCoursePayload } from '../types';

export async function getCourses(params?: {
  categoryId?: string;
  level?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  search?: string;
  includeDeleted?: boolean;
  instructorId?: string;
}): Promise<CourseDTO[]> {
  const searchParams = new URLSearchParams();
  if (params?.categoryId) searchParams.set('categoryId', params.categoryId);
  if (params?.level) searchParams.set('level', params.level);
  if (params?.isPublished !== undefined) searchParams.set('isPublished', String(params.isPublished));
  if (params?.isFeatured !== undefined) searchParams.set('isFeatured', String(params.isFeatured));
  if (params?.search) searchParams.set('search', params.search);
  if (params?.includeDeleted !== undefined) searchParams.set('includeDeleted', String(params.includeDeleted));
  if (params?.instructorId) searchParams.set('instructorId', params.instructorId);

  const qs = searchParams.toString();
  return api.get<CourseDTO[]>(`/courses${qs ? `?${qs}` : ''}`);
}

export async function getCourseById(id: string): Promise<CourseDTO> {
  return api.get<CourseDTO>(`/courses/${id}`);
}

export async function getCourseBySlug(slug: string): Promise<CourseDTO> {
  return api.get<CourseDTO>(`/courses/by-slug/${encodeURIComponent(slug)}`);
}

export async function createCourse(payload: CreateCoursePayload): Promise<CourseDTO> {
  validateOrThrow(createCourseSchema, payload);
  return api.post<CourseDTO>('/courses', payload);
}

export async function updateCourse(id: string, payload: UpdateCoursePayload): Promise<CourseDTO> {
  validateOrThrow(updateCourseSchema, payload);
  return api.put<CourseDTO>(`/courses/${id}`, payload);
}

export async function deleteCourse(id: string): Promise<void> {
  return api.delete<void>(`/courses/${id}`);
}

export async function publishCourse(id: string): Promise<CourseDTO> {
  return api.post<CourseDTO>(`/courses/${id}/publish`);
}

export async function unpublishCourse(id: string): Promise<CourseDTO> {
  return api.post<CourseDTO>(`/courses/${id}/unpublish`);
}

export async function uploadCourseImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);
  return api.upload<{ url: string }>('/upload', formData);
}
