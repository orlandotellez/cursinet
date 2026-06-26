'use client';

import { create } from 'zustand';
import type { CourseCardData } from '../types';
import * as bookmarkApi from '../api/bookmarks';

function mapToCourseCard(b: bookmarkApi.BookmarkResponse): CourseCardData {
  return {
    id: b.courseId,
    slug: b.courseSlug,
    title: b.courseTitle,
    shortDescription: b.courseShortDescription ?? '',
    thumbnail: b.courseThumbnailUrl ?? '',
    instructor: { name: b.instructorName, avatar: b.instructorAvatar ?? '' },
    category: { name: b.categoryName },
    level: b.courseLevel.toLowerCase() as CourseCardData['level'],
    duration: b.durationMinutes,
    lessonsCount: 0, // Backend doesn't return this; will be enriched later
    price: b.price,
    rating: b.averageRating,
    reviewsCount: b.reviewsCount,
    studentsCount: b.studentsCount,
  };
}

export interface BookmarkState {
  bookmarks: bookmarkApi.BookmarkResponse[];
  isLoading: boolean;
  error: string | null;

  loadBookmarks: () => Promise<void>;
  toggleBookmark: (courseId: string) => Promise<void>;
  isBookmarked: (courseId: string) => boolean;
  getFavoriteCourses: () => CourseCardData[];
}

export const useBookmarkStore = create<BookmarkState>()((set, get) => ({
  bookmarks: [],
  isLoading: false,
  error: null,

  loadBookmarks: async () => {
    set({ isLoading: true, error: null });
    try {
      const bookmarks = await bookmarkApi.getMyBookmarks();
      set({ bookmarks, isLoading: false });
    } catch (err) {
      if (err instanceof TypeError) {
        // Network error — silent
        set({ isLoading: false });
        return;
      }
      const message = err instanceof Error ? err.message : 'Error al cargar favoritos';
      set({ isLoading: false, error: message });
    }
  },

  toggleBookmark: async (courseId: string) => {
    const { bookmarks } = get();
    const existing = bookmarks.find((b) => b.courseId === courseId);
    const isCurrentlyBookmarked = !!existing;

    // Optimistic update
    if (isCurrentlyBookmarked) {
      set({ bookmarks: bookmarks.filter((b) => b.courseId !== courseId) });
    }
    // When adding, we don't have the full response yet — we'll reload on next load
    // For now, the heart just appears filled immediately in EnrolledCard via isBookmarked check

    try {
      if (isCurrentlyBookmarked) {
        await bookmarkApi.removeBookmark(courseId);
      } else {
        await bookmarkApi.addBookmark(courseId);
        // After adding, reload to get the full response with course data
        const updated = await bookmarkApi.getMyBookmarks();
        set({ bookmarks: updated });
      }
    } catch {
      // Revert on failure
      if (isCurrentlyBookmarked) {
        set({ bookmarks: [...bookmarks, existing!] });
      } else {
        set({ bookmarks: bookmarks.filter((b) => b.courseId !== courseId) });
      }
    }
  },

  isBookmarked: (courseId: string) => {
    return get().bookmarks.some((b) => b.courseId === courseId);
  },

  getFavoriteCourses: () => {
    return get().bookmarks.map(mapToCourseCard);
  },
}));
