import type { CourseCardData } from './course.types';

export interface Enrollment {
  id: string;
  courseId: string;
  course: CourseCardData;
  progress: number;
  enrolledAt: string;
  lastAccessedAt: string;
  completedLessons: number;
  totalLessons: number;
}

// Backend-aligned types for API communication
export interface EnrollmentResponse {
  id: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  courseThumbnailUrl?: string;
  instructorName: string;
  enrolledAt: string;
  lastAccessedAt?: string;
  progressPercentage: number;
}

export interface EnrollmentStatusResponse {
  isEnrolled: boolean;
  enrollmentId?: string;
  enrolledAt?: string;
  progressPercentage?: number;
}
