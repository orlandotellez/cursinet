import { API_URL } from "../lib/constants";
import { authedFetch } from "../lib/api";
import type { Review } from "../types";
import { validateOrThrow } from "../lib/validation";
import { reviewPayloadSchema } from "../validations";
import { handleJsonResponse, assertOk } from "./helpers";

export async function getCourseReviews(courseId: string): Promise<Review[]> {
  const res = await authedFetch(`${API_URL}/courses/${courseId}/reviews`);
  return handleJsonResponse<Review[]>(res);
}

export async function createReview(
  courseId: string,
  payload: { rating: number; comment?: string },
): Promise<Review> {
  validateOrThrow(reviewPayloadSchema, payload);
  const res = await authedFetch(`${API_URL}/courses/${courseId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleJsonResponse<Review>(res);
}

export async function updateReview(
  courseId: string,
  reviewId: string,
  payload: { rating: number; comment?: string },
): Promise<Review> {
  validateOrThrow(reviewPayloadSchema, payload);
  const res = await authedFetch(`${API_URL}/courses/${courseId}/reviews/${reviewId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleJsonResponse<Review>(res);
}

export async function deleteReview(courseId: string, reviewId: string): Promise<void> {
  const res = await authedFetch(`${API_URL}/courses/${courseId}/reviews/${reviewId}`, {
    method: 'DELETE',
  });
  await assertOk(res, 'Error al eliminar reseña');
}
