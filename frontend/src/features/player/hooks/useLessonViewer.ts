'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { CourseDTO } from '@/src/shared/api/courses';
import { getCourseById } from '@/src/shared/api/courses';
import type { CurriculumResponse, CurriculumLesson } from '@/src/shared/api/curriculum';
import { getCurriculum } from '@/src/shared/api/curriculum';
import type { LessonProgressResponse } from '@/src/shared/api/lessons';
import { getProgress, upsertProgress, getLesson } from '@/src/shared/api/lessons';
import { toLesson, toCourse } from '@/src/features/player/utils/mappers';
import type { Course, Lesson } from '@/src/shared/types';
import type { TabKey } from '@/src/features/player/components/PlayerTabs';

const VIDEO_PROGRESS_INTERVAL_MS = 30_000;
const VIDEO_PROGRESS_INCREMENT_S = 30;

export interface UseLessonViewer {
  // Routing
  courseId: string;
  lessonId: string;

  // Raw API data
  course: CourseDTO | null;
  curriculum: CurriculumResponse | null;
  lesson: CurriculumLesson | null;
  progress: LessonProgressResponse | null;

  // Mapped for UI components (LessonHeader / LessonNavigation / LessonSidebar)
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
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;

  const [course, setCourse] = useState<CourseDTO | null>(null);
  const [curriculum, setCurriculum] = useState<CurriculumResponse | null>(null);
  const [lesson, setLesson] = useState<CurriculumLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);
  const [progress, setProgress] = useState<LessonProgressResponse | null>(null);

  const [activeTab, setActiveTab] = useState<TabKey>('description');
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [commentText, setCommentText] = useState('');
  const [notes, setNotes] = useState('');

  // ── Fetch data ──

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [courseData, curriculumData] = await Promise.all([
        getCourseById(courseId),
        getCurriculum(courseId),
      ]);
      setCourse(courseData);
      setCurriculum(curriculumData);
      setExpandedModules(curriculumData.modules.map((m) => m.id));

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

      // Enriquecer la lección con el detail (videoUrl, contentMarkdown).
      // El endpoint /curriculum devuelve LessonSummary (sin VideoUrl);
      // el endpoint individual devuelve LessonResponse con todos los campos.
      try {
        const detail = await getLesson(found.moduleId, lessonId);
        setLesson({
          ...found,
          videoUrl: detail.videoUrl,
          contentMarkdown: detail.contentMarkdown,
        });
      } catch {
        // best-effort: si falla el detail, renderizamos con lo que tengamos
        setLesson(found);
      }

      try {
        const p = await getProgress(found.moduleId, lessonId);
        setProgress(p);
        if (p?.isCompleted) setCompleted(true);
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
    if (courseId && lessonId) fetchData();
  }, [courseId, lessonId, fetchData]);

  // ── Video progress tracking ──

  useEffect(() => {
    if (!lesson || lesson.type !== 'Video' || lesson.isPreview) return;
    const interval = setInterval(async () => {
      try {
        await upsertProgress(lesson.moduleId, lesson.id, {
          watchedSeconds: VIDEO_PROGRESS_INCREMENT_S,
        });
      } catch {
        // best-effort
      }
    }, VIDEO_PROGRESS_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [lesson]);

  // ── Actions ──

  const handleMarkComplete = useCallback(async () => {
    if (!lesson) return;
    setSavingProgress(true);
    try {
      await upsertProgress(lesson.moduleId, lesson.id, { isCompleted: true });
      setCompleted(true);
    } catch (err) {
      console.error('Error marking lesson complete:', err);
    } finally {
      setSavingProgress(false);
    }
  }, [lesson]);

  const toggleModule = useCallback((id: string) => {
    setExpandedModules((prev) =>
      prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id],
    );
  }, []);

  const handleSendComment = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) setCommentText('');
  }, [commentText]);

  // ── Computed: navigation + mapped props ──

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

  const courseForComponents: Course | null =
    course && curriculum ? toCourse(course, curriculum) : null;

  const lessonForComponents: Lesson | null = lesson
    ? toLesson(lesson, completed)
    : null;

  return {
    courseId,
    lessonId,
    course,
    curriculum,
    lesson,
    progress,
    courseForComponents,
    lessonForComponents,
    prevLesson,
    nextLesson,
    loading,
    error,
    completed,
    savingProgress,
    activeTab,
    setActiveTab,
    expandedModules,
    toggleModule,
    commentText,
    setCommentText,
    notes,
    setNotes,
    handleMarkComplete,
    handleSendComment,
    retry: fetchData,
  };
}
