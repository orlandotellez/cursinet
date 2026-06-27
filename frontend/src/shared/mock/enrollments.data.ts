import type { Enrollment } from '@/src/shared/types';
import { featuredCourses } from './course-cards.data';

export const enrollments: Enrollment[] = [
  { id: 'enr-1', courseId: 'course-1', course: featuredCourses[0], progress: 45, enrolledAt: '2026-01-15', lastAccessedAt: '2026-05-20', completedLessons: 29, totalLessons: 64 },
  { id: 'enr-2', courseId: 'course-2', course: featuredCourses[1], progress: 78, enrolledAt: '2026-02-01', lastAccessedAt: '2026-05-21', completedLessons: 75, totalLessons: 96 },
  { id: 'enr-3', courseId: 'course-4', course: featuredCourses[3], progress: 12, enrolledAt: '2026-04-10', lastAccessedAt: '2026-05-19', completedLessons: 10, totalLessons: 80 },
  { id: 'enr-4', courseId: 'course-3', course: featuredCourses[2], progress: 100, enrolledAt: '2025-11-01', lastAccessedAt: '2026-03-15', completedLessons: 56, totalLessons: 56 },
  { id: 'enr-5', courseId: 'course-6', course: featuredCourses[5], progress: 0, enrolledAt: '2026-05-01', lastAccessedAt: '2026-05-01', completedLessons: 0, totalLessons: 88 },
];

export function getEnrolledCourses(): Enrollment[] {
  return enrollments;
}
