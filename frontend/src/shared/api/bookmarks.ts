import { API_URL } from "../lib/constants";
import { authedFetch } from "../lib/api";

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

/**
 * Obtiene los cursos favoritos del usuario con datos completos.
 */
export async function getMyBookmarks(): Promise<BookmarkResponse[]> {
  const res = await authedFetch(`${API_URL}/bookmarks`, {
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error al obtener favoritos' }));
    throw new Error(error.message || 'Error al obtener favoritos');
  }

  return res.json();
}

/**
 * Agrega un curso a favoritos.
 */
export async function addBookmark(courseId: string): Promise<void> {
  const res = await authedFetch(`${API_URL}/bookmarks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ courseId }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error al agregar favorito' }));
    throw new Error(error.message || 'Error al agregar favorito');
  }
}

/**
 * Elimina un curso de favoritos.
 */
export async function removeBookmark(courseId: string): Promise<void> {
  const res = await authedFetch(`${API_URL}/bookmarks/${courseId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error al eliminar favorito' }));
    throw new Error(error.message || 'Error al eliminar favorito');
  }
}
