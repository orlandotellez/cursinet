import type { CourseCardData, Category as MockCategory } from '@/src/shared/types';
import type { CourseDTO, CategoryDTO } from '../types';

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
    lessonsCount: dto.lessonsCount,
    price: dto.price,
    rating: dto.averageRating,
    reviewsCount: dto.reviewsCount,
    studentsCount: dto.studentsCount,
    status: dto.isPublished ? 'published' : 'draft',
    badge: dto.studentsCount > 50 ? 'Más vendido' : undefined,
  };
}

export function categoryToMock(dto: CategoryDTO, coursesCount = 0): MockCategory {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    icon: dto.iconName ?? dto.name.charAt(0),
    coursesCount,
  };
}

function mapLevel(level: string): 'beginner' | 'intermediate' | 'advanced' {
  const lower = level.toLowerCase();
  if (lower === 'beginner' || lower === 'principiante') return 'beginner';
  if (lower === 'intermediate' || lower === 'intermedio') return 'intermediate';
  if (lower === 'advanced' || lower === 'avanzado') return 'advanced';
  if (lower === 'expert' || lower === 'experto') return 'advanced';
  return 'beginner';
}

export function coursesToCards(dtos: CourseDTO[]): CourseCardData[] {
  return dtos.map(courseToCard);
}

export function categoriesToMock(dtos: CategoryDTO[]): MockCategory[] {
  return dtos.filter((d) => d.isActive).map(categoryToMock);
}
