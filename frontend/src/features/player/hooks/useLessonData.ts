'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { CourseDTO } from '@/src/shared/api/courses';
import { getCourseById } from '@/src/shared/api/courses';
import type { CurriculumResponse, CurriculumLesson } from '@/src/shared/api/curriculum';
import { getCurriculum } from '@/src/shared/api/curriculum';
import type { LessonProgressResponse } from '@/src/shared/api/lessons';
import { getProgress, getLesson } from '@/src/shared/api/lessons';

export interface LessonDataResult {
  course: CourseDTO | null;
  curriculum: CurriculumResponse | null;
  lesson: CurriculumLesson | null;
  progress: LessonProgressResponse | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export function useLessonData(courseId: string, lessonId: string): LessonDataResult {
  const router = useRouter();

  const [course, setCourse] = useState<CourseDTO | null>(null);
  const [curriculum, setCurriculum] = useState<CurriculumResponse | null>(null);
  const [lesson, setLesson] = useState<CurriculumLesson | null>(null);
  const [progress, setProgress] = useState<LessonProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!courseId || !lessonId) return;
    setLoading(true);
    setError(null);

    try {
      const [courseData, curriculumData] = await Promise.all([
        getCourseById(courseId),
        getCurriculum(courseId),
      ]);

      setCourse(courseData);
      setCurriculum(curriculumData);

      // Find the current lesson in the curriculum
      let found: CurriculumLesson | null = null;
      for (const mod of curriculumData.modules) {
        const l = mod.lessons.find((l) => l.id === lessonId || l.slug === lessonId);
        if (l) {
          found = l;
          break;
        }
      }

      if (!found) {
        const firstLesson = curriculumData.modules[0]?.lessons[0];
        if (firstLesson) {
          router.replace(`/aprender/${courseId}/${firstLesson.id}`);
          return;
        }
        setError('No hay lecciones en este curso');
        return;
      }

      // Enrich the lesson with detail (videoUrl, contentMarkdown).
      // The /curriculum endpoint returns a summary (without videoUrl);
      // the individual endpoint returns the full LessonResponse.
      try {
        const detail = await getLesson(found.moduleId, lessonId);
        setLesson({
          ...found,
          videoUrl: detail.videoUrl,
          contentMarkdown: detail.contentMarkdown,
        });
      } catch {
        // best-effort: render with what we have from the curriculum
        setLesson(found);
      }

      try {
        const p = await getProgress(found.moduleId, lessonId);
        setProgress(p);
      } catch {
        // best-effort
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar la lección';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [courseId, lessonId, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    course,
    curriculum,
    lesson,
    progress,
    loading,
    error,
    retry: fetchData,
  };
}
