import type { CourseDTO } from '@/src/shared/api/courses';
import type { CurriculumResponse, CurriculumLesson } from '@/src/shared/api/curriculum';
import type { Course, Lesson, Level } from '@/src/shared/types';

/**
 * Mappers: API DTOs → Shared types.
 *
 * The shared `Lesson` / `Course` types are what UI components consume
 * (LessonHeader, LessonNavigation, LessonSidebar). The API returns richer
 * types (CurriculumLesson with moduleId/videoUrl/etc, CourseDTO with flat
 * instructor/category fields) that need flattening for the shared shape.
 */

const LessonTypeMap: Record<CurriculumLesson['type'], Lesson['type']> = {
  Video: 'video',
  Text: 'text',
  Code: 'code',
  Quiz: 'quiz',
  Resource: 'resource',
};

export function toLesson(l: CurriculumLesson, isCompleted?: boolean): Lesson {
  return {
    id: l.id,
    title: l.title,
    type: LessonTypeMap[l.type],
    duration: Math.floor((l.videoDurationSeconds ?? 0) / 60),
    isCompleted: isCompleted ?? l.isCompleted ?? false,
  };
}

export function toCourse(dto: CourseDTO, curriculum: CurriculumResponse): Course {
  return {
    id: dto.id,
    slug: dto.slug,
    title: dto.title,
    shortDescription: dto.shortDescription ?? '',
    description: dto.description ?? '',
    thumbnail: dto.thumbnailUrl ?? '',
    previewVideoUrl: dto.previewVideoUrl ?? null,
    instructor: {
      id: dto.instructorId,
      name: dto.instructorName,
      // CourseDTO no expone estos campos; los componentes los toleran como vacío.
      username: '',
      avatar: '',
      bio: '',
      role: '',
      coursesCount: 0,
      studentsCount: dto.studentsCount,
      rating: dto.averageRating,
    },
    category: {
      id: dto.categoryId,
      name: dto.categoryName,
      slug: dto.categorySlug ?? '',
      icon: '',
      coursesCount: 0,
    },
    level: dto.level as Level,
    duration: dto.durationMinutes,
    lessonsCount: curriculum.modules.reduce((s, m) => s + m.lessons.length, 0),
    price: dto.price,
    rating: dto.averageRating,
    reviewsCount: dto.reviewsCount,
    studentsCount: dto.studentsCount,
    publishedAt: dto.publishedAt ?? '',
    tags: [],
    modules: curriculum.modules.map((m) => ({
      id: m.id,
      title: m.title,
      lessons: m.lessons.map((l) => toLesson(l)),
    })),
    status: dto.isPublished ? 'published' : 'draft',
  };
}
