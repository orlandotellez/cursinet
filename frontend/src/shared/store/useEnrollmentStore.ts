'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as enrollmentApi from '../api/enrollment';
import type { Enrollment } from '../types';
import { enrollments as mockEnrollments } from '@/src/shared/mock/enrollments.data';
import { allCourseCards } from '@/src/shared/mock/course-cards.data';

function mapApiResponseToEnrollment(resp: enrollmentApi.EnrollmentResponse): Enrollment {
  const courseCard = allCourseCards.find((c) => c.id === resp.courseId);

  return {
    id: resp.id,
    courseId: resp.courseId,
    course: courseCard ?? {
      id: resp.courseId,
      slug: resp.courseSlug,
      title: resp.courseTitle,
      shortDescription: '',
      thumbnail: resp.courseThumbnailUrl ?? '',
      instructor: { name: resp.instructorName, avatar: '' },
      category: { name: '' },
      level: 'beginner',
      duration: 0,
      lessonsCount: 0,
      price: 0,
      rating: 0,
      reviewsCount: 0,
      studentsCount: 0,
    },
    progress: resp.progressPercentage,
    enrolledAt: resp.enrolledAt,
    lastAccessedAt: resp.lastAccessedAt ?? '',
    completedLessons: courseCard?.lessonsCount
      ? Math.round((resp.progressPercentage / 100) * courseCard.lessonsCount)
      : 0,
    totalLessons: courseCard?.lessonsCount ?? 0,
  };
}

export interface EnrollmentState {
  enrolledCourseIds: string[];
  enrollments: Enrollment[];
  isLoading: boolean;
  error: string | null;

  enroll: (courseId: string) => Promise<boolean>;
  loadMyEnrollments: () => Promise<void>;
  isEnrolled: (courseId: string) => boolean;
  demoEnroll: (courseId: string) => void;
  clearError: () => void;
}

export const useEnrollmentStore = create<EnrollmentState>()(
  persist(
    (set, get) => ({
      enrolledCourseIds: [],
      enrollments: [],
      isLoading: false,
      error: null,

      enroll: async (courseId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await enrollmentApi.enrollFree(courseId);
          const enrollment = mapApiResponseToEnrollment(response);
          set((state) => {
            if (state.enrolledCourseIds.includes(courseId)) {
              return { isLoading: false };
            }
            return {
              enrolledCourseIds: [...state.enrolledCourseIds, courseId],
              enrollments: [...state.enrollments, enrollment],
              isLoading: false,
            };
          });
          return true;
        } catch (err) {
          if (err instanceof TypeError) {
            // Network error — fall back to demo mode (mock)
            get().demoEnroll(courseId);
            return true;
          }
          // Server error (4xx/5xx) — propagate so caller can handle
          const message = err instanceof Error ? err.message : 'Error al inscribirse';
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      loadMyEnrollments: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await enrollmentApi.getMyEnrollments();
          const mapped = response.map(mapApiResponseToEnrollment);
          set({
            enrollments: mapped,
            enrolledCourseIds: mapped.map((e) => e.courseId),
            isLoading: false,
            error: null,
          });
        } catch (err) {
          if (err instanceof TypeError) {
            // Network error — fall back to mock data
            set({
              enrollments: [...mockEnrollments],
              enrolledCourseIds: mockEnrollments.map((e) => e.courseId),
              isLoading: false,
              error: null,
            });
            return;
          }
          // Server error — keep existing state, set error for UI
          const message = err instanceof Error ? err.message : 'Error al cargar inscripciones';
          set({ isLoading: false, error: message });
        }
      },

      demoEnroll: (courseId: string) => {
        set((state) => {
          if (state.enrolledCourseIds.includes(courseId)) return state;
          const mockEnrollment = mockEnrollments.find((e) => e.courseId === courseId);
          return {
            enrolledCourseIds: [...state.enrolledCourseIds, courseId],
            enrollments: mockEnrollment
              ? [...state.enrollments, mockEnrollment]
              : state.enrollments,
          };
        });
      },

      isEnrolled: (courseId: string) => {
        return get().enrolledCourseIds.includes(courseId);
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'cursinet-enrollments',
      partialize: (state) => ({
        enrolledCourseIds: state.enrolledCourseIds,
        enrollments: state.enrollments,
      }),
    }
  )
);
