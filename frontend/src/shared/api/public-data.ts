import type { CourseCardData, Category } from '@/src/shared/types';
import type { CourseDTO } from './courses';
import type { CategoryDTO } from './categories';
import { coursesToCards, categoriesToMock } from './mappers';

const API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:5000/api/v1';

async function fetchPublicJson<T>(endpoint: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getFeaturedCourses(): Promise<CourseCardData[]> {
  const data = await fetchPublicJson<CourseDTO[]>(
    '/courses?isFeatured=true&isPublished=true',
  );
  if (!data) return [];
  return coursesToCards(data);
}

export async function getPublishedCourses(): Promise<CourseCardData[]> {
  const data = await fetchPublicJson<CourseDTO[]>('/courses?isPublished=true');
  if (!data) return [];
  return coursesToCards(data);
}

export async function getPublicCategories(): Promise<Category[]> {
  const data = await fetchPublicJson<CategoryDTO[]>('/categories');
  if (!data) return [];
  return categoriesToMock(data);
}
