'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { CurriculumLesson } from '@/src/shared/api/courses';
import type { CurriculumResponse } from '@/src/shared/api/courses';
import type { LessonProgressResponse } from '@/src/shared/api/courses';
import { upsertProgress } from '@/src/shared/api/courses';
import { toLesson } from '@/src/features/player/utils/mappers';
import type { Lesson } from '@/src/shared/types';
import { useToastStore } from '@/src/shared/store/useToastStore';

export interface LessonNavigationResult {
  prevLesson: Lesson | null;
  nextLesson: Lesson | null;
  completed: boolean;
  savingProgress: boolean;
  handleMarkComplete: () => Promise<void>;
}

export function useLessonNavigation(
  lessonId: string,
  curriculum: CurriculumResponse | null,
  lesson: CurriculumLesson | null,
  progress: LessonProgressResponse | null,
): LessonNavigationResult {
  const [completed, setCompleted] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  useEffect(() => {
    if (progress?.isCompleted) {
      setCompleted(true);
    }
  }, [progress?.isCompleted]);

  // ── Prev / Next ──

  const { prevLesson, nextLesson } = useMemo(() => {
    if (!curriculum) return { prevLesson: null, nextLesson: null };
    const all = curriculum.modules.flatMap((m) => m.lessons);
    const idx = all.findIndex((l) => l.id === lessonId);
    if (idx === -1) return { prevLesson: null, nextLesson: null };
    return {
      prevLesson: all[idx - 1] ? toLesson(all[idx - 1]) : null,
      nextLesson: all[idx + 1] ? toLesson(all[idx + 1]) : null,
    };
  }, [curriculum, lessonId]);

  // ── Mark complete ──

  const handleMarkComplete = useCallback(async () => {
    if (!lesson) return;
    setSavingProgress(true);
    try {
      await upsertProgress(lesson.moduleId, lesson.id, { isCompleted: true });
      setCompleted(true);
    } catch {
      useToastStore.getState().error('Error al marcar lección como completada');
    } finally {
      setSavingProgress(false);
    }
  }, [lesson]);

  return {
    prevLesson,
    nextLesson,
    completed,
    savingProgress,
    handleMarkComplete,
  };
}
