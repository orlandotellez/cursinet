import type { CourseDTO } from '@/src/shared/api/courses';
import type { CourseFormData } from '@/src/features/courses/components/CourseFormModal';

export function courseToFormData(course: CourseDTO): CourseFormData {
  return {
    title: course.title,
    shortDescription: course.shortDescription ?? '',
    description: course.description ?? '',
    categoryId: course.categoryId,
    level: course.level,
    price: String(course.price),
    previewVideoUrl: course.previewVideoUrl ?? '',
    durationMinutes: String(course.durationMinutes),
    requirements: (course.requirements ?? []).join('\n'),
    learningObjectives: (course.learningObjectives ?? []).join('\n'),
    isFree: course.isFree,
  };
}
