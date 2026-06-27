'use client';

import { useParams } from 'next/navigation';
import { useLessonData } from './useLessonData';
import { useLessonNavigation } from './useLessonNavigation';
import { useLessonUI } from './useLessonUI';
import { useVideoProgress } from './useVideoProgress';
import { toLesson, toCourse } from '@/src/features/player/utils/mappers';
import type { Course, Lesson } from '@/src/shared/types';
import type { CourseDTO } from '@/src/shared/api/courses';
import type { CurriculumResponse, CurriculumLesson } from '@/src/shared/api/curriculum';
import type { LessonProgressResponse } from '@/src/shared/api/lessons';
import type { TabKey } from '@/src/features/player/components/PlayerTabs';

export interface UseLessonViewer {
  // Routing
  courseId: string;
  lessonId: string;

  // Raw API data
  course: CourseDTO | null;
  curriculum: CurriculumResponse | null;
  lesson: CurriculumLesson | null;
  progress: LessonProgressResponse | null;

  // Mapped for UI components
  courseForComponents: Course | null;
  lessonForComponents: Lesson | null;
  prevLesson: Lesson | null;
  nextLesson: Lesson | null;

  // Status
  loading: boolean;
  error: string | null;
  completed: boolean;
  savingProgress: boolean;

  // Tab UI state
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  expandedModules: string[];
  toggleModule: (id: string) => void;
  commentText: string;
  setCommentText: (text: string) => void;
  notes: string;
  setNotes: (text: string) => void;

  // Actions
  handleMarkComplete: () => Promise<void>;
  handleSendComment: (e: React.FormEvent) => void;
  retry: () => void;
}

export function useLessonViewer(): UseLessonViewer {
  const params = useParams();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;

  // ── Delegar a hooks especializados ──
  const data = useLessonData(courseId, lessonId);
  const ui = useLessonUI();
  const navigation = useLessonNavigation(
    lessonId,
    data.curriculum,
    data.lesson,
    data.progress,
  );

  // Side-effect: tracking de progreso de video
  useVideoProgress(data.lesson);

  // ── Computed: mappers para los componentes UI ──
  const courseForComponents: Course | null =
    data.course && data.curriculum
      ? toCourse(data.course, data.curriculum)
      : null;

  const lessonForComponents: Lesson | null = data.lesson
    ? toLesson(data.lesson, navigation.completed)
    : null;

  return {
    courseId,
    lessonId,
    course: data.course,
    curriculum: data.curriculum,
    lesson: data.lesson,
    progress: data.progress,
    courseForComponents,
    lessonForComponents,
    prevLesson: navigation.prevLesson,
    nextLesson: navigation.nextLesson,
    loading: data.loading,
    error: data.error,
    completed: navigation.completed,
    savingProgress: navigation.savingProgress,
    activeTab: ui.activeTab,
    setActiveTab: ui.setActiveTab,
    expandedModules: ui.expandedModules,
    toggleModule: ui.toggleModule,
    commentText: ui.commentText,
    setCommentText: ui.setCommentText,
    notes: ui.notes,
    setNotes: ui.setNotes,
    handleMarkComplete: navigation.handleMarkComplete,
    handleSendComment: ui.handleSendComment,
    retry: data.retry,
  };
}
