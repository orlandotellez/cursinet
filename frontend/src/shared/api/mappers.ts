import type { CourseCardData, Category as MockCategory, Stat } from '@/src/shared/types';
import type { CourseDTO } from './courses';
import type { CategoryDTO } from './categories';

/** Map a CourseDTO from the API to the CourseCardData type the UI components expect */
export function courseToCard(dto: CourseDTO): CourseCardData {
  return {
    id: dto.id,
    slug: dto.slug,
    title: dto.title,
    shortDescription: dto.shortDescription ?? '',
    thumbnail: dto.thumbnailUrl ?? '',
    instructor: {
      name: dto.instructorName,
      avatar: '',
    },
    category: {
      name: dto.categoryName,
    },
    level: mapLevel(dto.level),
    duration: dto.durationMinutes,
    lessonsCount: 0, // Will be populated when curriculum is fetched
    price: dto.price,
    rating: dto.averageRating,
    reviewsCount: dto.reviewsCount,
    studentsCount: dto.studentsCount,
    status: dto.isPublished ? 'published' : 'draft',
    badge: dto.studentsCount > 50 ? 'Más vendido' : undefined,
  };
}

/** Map CategoryDTO to the mock Category type */
export function categoryToMock(dto: CategoryDTO): MockCategory {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    icon: dto.iconName ?? dto.name.charAt(0),
    coursesCount: 0, // Backend doesn't return this yet
  };
}

/** Normalize level strings from backend (PascalCase) to frontend (lowercase) */
function mapLevel(level: string): 'beginner' | 'intermediate' | 'advanced' {
  const lower = level.toLowerCase();
  if (lower === 'beginner' || lower === 'principiante') return 'beginner';
  if (lower === 'intermediate' || lower === 'intermedio') return 'intermediate';
  if (lower === 'advanced' || lower === 'avanzado') return 'advanced';
  if (lower === 'expert' || lower === 'experto') return 'advanced';
  return 'beginner';
}

/** Map CourseDTO array to CourseCardData array */
export function coursesToCards(dtos: CourseDTO[]): CourseCardData[] {
  return dtos.map(courseToCard);
}

/** Map CategoryDTO array to mock Category array */
export function categoriesToMock(dtos: CategoryDTO[]): MockCategory[] {
  return dtos.filter((d) => d.isActive).map(categoryToMock);
}

/** Hardcoded stats for now — no backend endpoint exists */
export const landingStats: Stat[] = [
  { value: '12K+', label: 'Estudiantes activos' },
  { value: '320+', label: 'Cursos' },
  { value: '4.9 ★', label: 'Rating promedio' },
  { value: '95%', label: 'Tasa de completitud' },
];
