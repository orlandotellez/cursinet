'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as enrollmentApi from '../api/student';
import { useToastStore } from './useToastStore';
import type { Enrollment } from '../types';

function mapApiResponseToEnrollment(resp: enrollmentApi.EnrollmentResponse): Enrollment {
  return {
    id: resp.id,
    courseId: resp.courseId,
    course: {
      id: resp.courseId,
      slug: resp.courseSlug,
      title: resp.courseTitle,
      shortDescription: '',
      thumbnail: resp.courseThumbnailUrl ?? '',
      instructor: { name: resp.instructorName, avatar: '' },
      category: { name: '' },
      level: 'beginner',
      duration: resp.courseDurationMinutes,
      lessonsCount: resp.totalLessons,
      price: 0,
      rating: 0,
      reviewsCount: 0,
      studentsCount: 0,
    },
    progress: resp.progressPercentage,
    enrolledAt: resp.enrolledAt,
    lastAccessedAt: resp.lastAccessedAt ?? '',
    completedLessons: resp.completedLessons,
    totalLessons: resp.totalLessons,
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
          const message = err instanceof Error ? err.message : 'Error al inscribirse';
          set({ isLoading: false, error: message });
          useToastStore.getState().error(message);
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
          const message = err instanceof Error ? err.message : 'Error al cargar inscripciones';
          set({ isLoading: false, error: message });
          useToastStore.getState().error(message);
        }
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
