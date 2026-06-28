import { api } from '../lib/client';
import type { BookmarkResponse } from '../types';

export async function getMyBookmarks(): Promise<BookmarkResponse[]> {
  return api.get<BookmarkResponse[]>('/bookmarks');
}

export async function addBookmark(courseId: string): Promise<void> {
  return api.post<void>('/bookmarks', { courseId });
}

export async function removeBookmark(courseId: string): Promise<void> {
  return api.delete<void>(`/bookmarks/${courseId}`);
}
