'use client';

import { useEffect } from 'react';
import type { CurriculumLesson } from '@/src/shared/api/curriculum';
import { upsertProgress } from '@/src/shared/api/lessons';

const VIDEO_PROGRESS_INTERVAL_MS = 30_000;
const VIDEO_PROGRESS_INCREMENT_S = 30;

export function useVideoProgress(lesson: CurriculumLesson | null): void {
  useEffect(() => {
    if (!lesson || lesson.type !== 'Video' || lesson.isPreview) return;

    const interval = setInterval(async () => {
      try {
        await upsertProgress(lesson.moduleId, lesson.id, {
          watchedSeconds: VIDEO_PROGRESS_INCREMENT_S,
        });
      } catch {
        // best-effort — no interrumpir la experiencia del usuario
      }
    }, VIDEO_PROGRESS_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [lesson]);
}
