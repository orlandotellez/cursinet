import { API_URL } from '../lib/constants';
import { authedFetch } from '../lib/api';
import { handleJsonResponse } from './helpers';
import { validateOrThrow } from '../lib/validation';
import { createPaymentSchema } from '../validations';

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
  totalLessons: number;
  completedLessons: number;
  courseDurationMinutes: number;
}

export interface EnrollmentStatusResponse {
  isEnrolled: boolean;
  enrollmentId?: string;
  enrolledAt?: string;
  progressPercentage?: number;
}

export async function enrollFree(courseId: string): Promise<EnrollmentResponse> {
  validateOrThrow(createPaymentSchema, { courseId });
  const res = await authedFetch(`${API_URL}/enrollments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ courseId }),
  });
  return handleJsonResponse<EnrollmentResponse>(res);
}

export async function getMyEnrollments(): Promise<EnrollmentResponse[]> {
  const res = await authedFetch(`${API_URL}/enrollments/mine`, {
    method: 'GET',
    credentials: 'include',
  });
  return handleJsonResponse<EnrollmentResponse[]>(res);
}

export async function getEnrollmentStatus(
  courseId: string,
): Promise<EnrollmentStatusResponse> {
  const res = await authedFetch(`${API_URL}/enrollments/${courseId}/status`, {
    method: 'GET',
    credentials: 'include',
  });
  return handleJsonResponse<EnrollmentStatusResponse>(res);
}
