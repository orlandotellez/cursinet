import { API_URL } from "../lib/constants";
import type { Review } from "../types";
import { validateOrThrow } from "../lib/validation";
import { reviewPayloadSchema } from "../validations";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: 'Error del servidor' }));
    throw new Error(body.message || body.title || 'Error del servidor');
  }
  return res.json();
}

export async function getCourseReviews(courseId: string): Promise<Review[]> {
  const res = await fetch(`${API_URL}/courses/${courseId}/reviews`, {
    credentials: 'include',
  });
  return handleResponse<Review[]>(res);
}

export async function createReview(
  courseId: string,
  payload: { rating: number; comment?: string },
): Promise<Review> {
  validateOrThrow(reviewPayloadSchema, payload);
  const res = await fetch(`${API_URL}/courses/${courseId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return handleResponse<Review>(res);
}

export async function updateReview(
  courseId: string,
  reviewId: string,
  payload: { rating: number; comment?: string },
): Promise<Review> {
  validateOrThrow(reviewPayloadSchema, payload);
  const res = await fetch(`${API_URL}/courses/${courseId}/reviews/${reviewId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return handleResponse<Review>(res);
}

export async function deleteReview(courseId: string, reviewId: string): Promise<void> {
  const res = await fetch(`${API_URL}/courses/${courseId}/reviews/${reviewId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: 'Error al eliminar reseña' }));
    throw new Error(body.message || 'Error al eliminar reseña');
  }
}
