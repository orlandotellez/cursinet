import { api } from '../lib/client';
import type { Review } from '@/src/shared/types';
import { validateOrThrow } from '@/src/shared/lib/validation';
import { reviewPayloadSchema } from '@/src/shared/validations';

export async function getCourseReviews(courseId: string): Promise<Review[]> {
  return api.get<Review[]>(`/courses/${courseId}/reviews`);
}

export async function createReview(
  courseId: string,
  payload: { rating: number; comment?: string },
): Promise<Review> {
  validateOrThrow(reviewPayloadSchema, payload);
  return api.post<Review>(`/courses/${courseId}/reviews`, payload);
}

export async function updateReview(
  courseId: string,
  reviewId: string,
  payload: { rating: number; comment?: string },
): Promise<Review> {
  validateOrThrow(reviewPayloadSchema, payload);
  return api.put<Review>(`/courses/${courseId}/reviews/${reviewId}`, payload);
}

export async function deleteReview(courseId: string, reviewId: string): Promise<void> {
  return api.delete<void>(`/courses/${courseId}/reviews/${reviewId}`);
}
