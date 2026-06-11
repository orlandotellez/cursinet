import { API_URL } from "../lib/constants";
import { authedFetch } from "../lib/api";
import { validateOrThrow } from "../lib/validation";
import { createCourseSchema, updateCourseSchema } from "../validations";

// ─── Types aligned with backend ───────────────────────────────────────────

export interface CourseDTO {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  previewVideoUrl: string | null;
  level: string;
  language: string;
  durationMinutes: number;
  price: number;
  originalPrice: number | null;
  isFree: boolean;
  isPublished: boolean;
  isFeatured: boolean;
  requirements: string[] | null;
  learningObjectives: string[] | null;
  studentsCount: number;
  averageRating: number;
  reviewsCount: number;
  instructorId: string;
  instructorName: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCoursePayload {
  title: string;
  categoryId: string;
  level: string;
  shortDescription?: string | null;
  description?: string | null;
  thumbnailUrl?: string | null;
  previewVideoUrl?: string | null;
  language?: string;
  durationMinutes?: number;
  price?: number;
  originalPrice?: number | null;
  isFree?: boolean;
  requirements?: string[];
  learningObjectives?: string[];
}

export interface UpdateCoursePayload {
  title?: string | null;
  categoryId?: string | null;
  level?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  thumbnailUrl?: string | null;
  previewVideoUrl?: string | null;
  language?: string | null;
  durationMinutes?: number | null;
  price?: number | null;
  originalPrice?: number | null;
  isFree?: boolean | null;
  requirements?: string[] | null;
  learningObjectives?: string[] | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: 'Error del servidor' }));
    throw new Error(body.detail || body.title || 'Error del servidor');
  }
  return res.json();
}

// ─── API functions ────────────────────────────────────────────────────────

export async function getCourses(params?: {
  categoryId?: string;
  level?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  search?: string;
}): Promise<CourseDTO[]> {
  const searchParams = new URLSearchParams();
  if (params?.categoryId) searchParams.set('categoryId', params.categoryId);
  if (params?.level) searchParams.set('level', params.level);
  if (params?.isPublished !== undefined) searchParams.set('isPublished', String(params.isPublished));
  if (params?.isFeatured !== undefined) searchParams.set('isFeatured', String(params.isFeatured));
  if (params?.search) searchParams.set('search', params.search);

  const qs = searchParams.toString();
  const url = `${API_URL}/courses${qs ? `?${qs}` : ''}`;

  const res = await authedFetch(url, { credentials: 'include' });
  return handleResponse<CourseDTO[]>(res);
}

export async function getCourseById(id: string): Promise<CourseDTO> {
  const res = await authedFetch(`${API_URL}/courses/${id}`, { credentials: 'include' });
  return handleResponse<CourseDTO>(res);
}

export async function getCourseBySlug(slug: string): Promise<CourseDTO> {
  const res = await authedFetch(`${API_URL}/courses/by-slug/${encodeURIComponent(slug)}`, {
    credentials: 'include',
  });
  return handleResponse<CourseDTO>(res);
}

export async function createCourse(payload: CreateCoursePayload): Promise<CourseDTO> {
  validateOrThrow(createCourseSchema, payload);
  const res = await authedFetch(`${API_URL}/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return handleResponse<CourseDTO>(res);
}

export async function updateCourse(id: string, payload: UpdateCoursePayload): Promise<CourseDTO> {
  validateOrThrow(updateCourseSchema, payload);
  const res = await authedFetch(`${API_URL}/courses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return handleResponse<CourseDTO>(res);
}

export async function deleteCourse(id: string): Promise<void> {
  const res = await authedFetch(`${API_URL}/courses/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: 'Error al eliminar el curso' }));
    throw new Error(body.detail || body.title || 'Error al eliminar el curso');
  }
}

export async function publishCourse(id: string): Promise<CourseDTO> {
  const res = await authedFetch(`${API_URL}/courses/${id}/publish`, {
    method: 'POST',
    credentials: 'include',
  });
  return handleResponse<CourseDTO>(res);
}
