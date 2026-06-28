import type { CourseCardData, Category, Stat } from '@/src/shared/types';
import type { CourseDTO, CategoryDTO } from '../types';
import { API_URL } from '@/src/shared/lib/constants';
import { handleJsonResponse } from '@/src/shared/api/lib/helpers';
import { coursesToCards, categoryToMock } from '@/src/shared/api/lib/mappers';

async function fetchPublicJson<T>(endpoint: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      next: { revalidate: 300 },
    });
    return handleJsonResponse<T>(res);
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
  const [categoriesData, coursesData] = await Promise.all([
    fetchPublicJson<CategoryDTO[]>('/categories'),
    fetchPublicJson<CourseDTO[]>('/courses?isPublished=true'),
  ]);
  if (!categoriesData) return [];

  const counts = new Map<string, number>();
  if (coursesData) {
    for (const course of coursesData) {
      const catId = course.categoryId;
      counts.set(catId, (counts.get(catId) || 0) + 1);
    }
  }

  return categoriesData
    .filter((d) => d.isActive)
    .map((d) => categoryToMock(d, counts.get(d.id) || 0));
}

function formatStat(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M+`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K+`;
  return `${n}`;
}

export async function getLandingStats(): Promise<Stat[]> {
  const courses = await getPublishedCourses();
  if (courses.length === 0) {
    return [
      { value: '0', label: 'Cursos publicados' },
      { value: '0', label: 'Estudiantes' },
      { value: '0', label: 'Instructores' },
      { value: '0h', label: 'Contenido' },
    ];
  }

  const totalStudents = courses.reduce((s, c) => s + c.studentsCount, 0);
  const totalHours = Math.round(
    courses.reduce((s, c) => s + c.duration, 0) / 60,
  );
  const uniqueInstructors = new Set(
    courses.map((c) => c.instructor.name),
  ).size;

  return [
    { value: formatStat(courses.length), label: 'Cursos publicados' },
    { value: formatStat(totalStudents), label: 'Estudiantes' },
    { value: formatStat(uniqueInstructors), label: 'Instructores' },
    { value: `${totalHours}h`, label: 'Contenido' },
  ];
}
