import { API_URL } from '../lib/constants';
import { authedFetch } from '../lib/api';
import { handleJsonResponse, assertOk } from './helpers';

export interface BookmarkResponse {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  courseThumbnailUrl: string | null;
  courseShortDescription: string | null;
  instructorName: string;
  instructorAvatar: string | null;
  categoryName: string;
  courseLevel: string;
  durationMinutes: number;
  price: number;
  averageRating: number;
  reviewsCount: number;
  studentsCount: number;
  createdAt: string;
}

export async function getMyBookmarks(): Promise<BookmarkResponse[]> {
  const res = await authedFetch(`${API_URL}/bookmarks`, {
    credentials: 'include',
  });
  return handleJsonResponse<BookmarkResponse[]>(res);
}

export async function addBookmark(courseId: string): Promise<void> {
  const res = await authedFetch(`${API_URL}/bookmarks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ courseId }),
  });
  return assertOk(res, 'Error al agregar favorito');
}

export async function removeBookmark(courseId: string): Promise<void> {
  const res = await authedFetch(`${API_URL}/bookmarks/${courseId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return assertOk(res, 'Error al eliminar favorito');
}
