'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Loader2,
  AlertCircle,
  Code2,
  Monitor,
  ArrowRight,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { VideoPlayer } from '@/src/shared/components/VideoPlayer';
import { getCourseById, type CourseDTO } from '@/src/shared/api/courses';
import { getCurriculum, type CurriculumResponse, type CurriculumLesson } from '@/src/shared/api/curriculum';
import { getProgress, upsertProgress, type LessonProgressResponse } from '@/src/shared/api/lessons';
import { getLessonContent } from '@/src/features/courses/data/lesson-content';
import type { Course, Lesson, Level } from '@/src/shared/types';

import { LessonHeader } from '@/src/features/player/components/LessonHeader';
import { LessonNavigation } from '@/src/features/player/components/LessonNavigation';
import { PlayerTabs, type TabKey } from '@/src/features/player/components/PlayerTabs';
import { DescriptionTab } from '@/src/features/player/components/DescriptionTab';
import { CommentsTab } from '@/src/features/player/components/CommentsTab';
import { ResourcesTab } from '@/src/features/player/components/ResourcesTab';
import { NotesTab } from '@/src/features/player/components/NotesTab';
import { LessonSidebar } from '@/src/features/player/components/LessonSidebar';
import styles from './page.module.css';

/* ═══════════════════════════════════════
   MAPPERS: API types → Shared types
   ═══════════════════════════════════════ */

function toLesson(l: CurriculumLesson, isCompleted = false): Lesson {
  return {
    id: l.id,
    title: l.title,
    type: l.type.toLowerCase() as Lesson['type'],
    duration: Math.floor((l.videoDurationSeconds ?? 0) / 60),
    isCompleted,
  };
}

function toCourse(dto: CourseDTO, curriculum: CurriculumResponse): Course {
  return {
    id: dto.id,
    slug: dto.slug,
    title: dto.title,
    shortDescription: dto.shortDescription ?? '',
    description: dto.description ?? '',
    thumbnail: dto.thumbnailUrl ?? '',
    instructor: {
      id: dto.instructorId, name: dto.instructorName,
      username: '', avatar: '', bio: '', role: '',
      coursesCount: 0, studentsCount: dto.studentsCount,
      rating: dto.averageRating,
    },
    category: {
      id: dto.categoryId, name: dto.categoryName,
      slug: dto.categorySlug ?? '', icon: '', coursesCount: 0,
    },
    level: dto.level as Level,
    duration: dto.durationMinutes,
    lessonsCount: curriculum.modules.reduce((s, m) => s + m.lessons.length, 0),
    price: dto.price,
    rating: dto.averageRating,
    reviewsCount: dto.reviewsCount,
    studentsCount: dto.studentsCount,
    publishedAt: dto.publishedAt ?? '',
    tags: [],
    modules: curriculum.modules.map((m) => ({
      id: m.id,
      title: m.title,
      lessons: m.lessons.map((l) => toLesson(l)),
    })),
    status: dto.isPublished ? 'published' : 'draft',
  };
}

/* ═══════════════════════════════════════
   CONTENT RENDERER (inline — uses real API + ReactMarkdown)
   ═══════════════════════════════════════ */

function ContentRenderer({ lesson }: { lesson: CurriculumLesson }) {
  const extraContent = getLessonContent(lesson.id);

  switch (lesson.type) {
    case 'Video':
      return lesson.videoUrl ? (
        <section className={styles.contentBlock}>
          <VideoPlayer videoUrl={lesson.videoUrl} title={lesson.title} />
        </section>
      ) : (
        <section className={styles.contentBlock}>
          <div className={styles.emptyState}>No hay URL de video configurada.</div>
        </section>
      );

    case 'Text': {
      const body = lesson.contentMarkdown ?? extraContent?.body;
      return body ? (
        <section className={styles.contentBlock}>
          <div className={styles.markdownBody}>
            <ReactMarkdown>{body}</ReactMarkdown>
          </div>
        </section>
      ) : (
        <section className={styles.contentBlock}>
          <div className={styles.emptyState}>No hay contenido disponible.</div>
        </section>
      );
    }

    case 'Code':
      return extraContent?.code ? (
        <CodeBlock code={extraContent.code} language={extraContent.codeLanguage} />
      ) : lesson.contentMarkdown ? (
        <section className={styles.contentBlock}>
          <div className={styles.markdownBody}>
            <ReactMarkdown>{lesson.contentMarkdown}</ReactMarkdown>
          </div>
        </section>
      ) : (
        <section className={styles.contentBlock}>
          <div className={styles.emptyState}>No hay código disponible.</div>
        </section>
      );

    case 'Quiz':
      return extraContent?.quiz ? (
        <QuizInline quiz={extraContent.quiz} />
      ) : (
        <section className={styles.contentBlock}>
          <div className={styles.emptyState}>Las preguntas del quiz estarán disponibles pronto.</div>
        </section>
      );

    case 'Resource':
      return <ResourcePlaceholder />;

    default:
      return (
        <section className={styles.contentBlock}>
          <div className={styles.emptyState}>Tipo de lección no soportado.</div>
        </section>
      );
  }
}

/* ── Sub-renderers ── */

function CodeBlock({ code, language }: { code: string; language?: string }) {
  return (
    <section className={styles.contentBlock}>
      <div className={styles.codeContentWrapper}>
        <div className={styles.codeHeader}>
          <Code2 size={16} />
          <span>{language || 'Código'}</span>
        </div>
        <pre className={styles.codeBlockFull}><code>{code}</code></pre>
        <div className={styles.codeActions}>
          <button className={styles.codeBtn} onClick={() => navigator.clipboard.writeText(code)}>
            <CopySvg size={14} /> Copiar código
          </button>
        </div>
      </div>
    </section>
  );
}

function CopySvg({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function QuizInline({ quiz }: { quiz: NonNullable<ReturnType<typeof getLessonContent>>['quiz'] }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);

  if (!quiz?.questions.length) {
    return (
      <section className={styles.contentBlock}>
        <p className={styles.emptyState}>No hay preguntas disponibles</p>
      </section>
    );
  }

  const total = quiz.questions.length;
  const question = quiz.questions[currentQ];
  const isLast = currentQ === total - 1;

  const selectOption = (index: number) => {
    if (submitted) return;
    const newAnswers = [...answers];
    newAnswers[currentQ] = index;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (isLast) setSubmitted(true);
    else setCurrentQ(currentQ + 1);
  };

  const correctCount = submitted
    ? quiz.questions.filter((q, i) => answers[i] === q.correctIndex).length
    : 0;

  if (submitted) {
    const percentage = Math.round((correctCount / total) * 100);
    const passed = percentage >= 70;
    return (
      <section className={styles.contentBlock}>
        <div className={`${styles.quizResult} ${passed ? styles.quizPass : styles.quizFail}`}>
          <div className={styles.quizScoreCircle}>
            <span className={styles.quizScoreValue}>{percentage}%</span>
            <span className={styles.quizScoreLabel}>{passed ? 'Aprobado' : 'No aprobado'}</span>
          </div>
          <p className={styles.quizResultText}>
            Respondiste correctamente <strong>{correctCount} de {total}</strong> preguntas.
          </p>
          <button className={styles.quizRetryBtn} onClick={() => { setCurrentQ(0); setAnswers([]); setSubmitted(false); }}>
            Reintentar quiz
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.contentBlock}>
      <div className={styles.quizContainer}>
        <div className={styles.quizHeader}>
          <span className={styles.quizProgress}>Pregunta {currentQ + 1} de {total}</span>
          <div className={styles.quizProgressBar}>
            <div className={styles.quizProgressFill} style={{ width: `${((currentQ + 1) / total) * 100}%` }} />
          </div>
        </div>
        <h3 className={styles.quizQuestion}>{question.text}</h3>
        <div className={styles.quizOptions}>
          {question.options.map((opt, i) => {
            const isSelected = answers[currentQ] === i;
            return (
              <button key={i} className={`${styles.quizOption} ${isSelected ? styles.quizOptionSelected : ''}`} onClick={() => selectOption(i)}>
                <span className={styles.quizOptionLetter}>{String.fromCharCode(65 + i)}</span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>
        <button className={styles.quizNextBtn} onClick={handleNext} disabled={answers[currentQ] === undefined}>
          {isLast ? 'Ver resultados' : 'Siguiente pregunta'} <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}

function ResourcePlaceholder() {
  return (
    <section className={styles.contentBlock}>
      <div className={styles.resourcePreview}>
        <Monitor size={48} className={styles.resourcePreviewIcon} />
        <p className={styles.resourcePreviewText}>Hacé clic en la pestaña Recursos para ver los archivos descargables</p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   PAGE
   ═══════════════════════════════════════ */

export default function LessonViewerPage() {
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

  // ── Tabs state ──
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
        if (l) { found = l; break; }
      }

      if (!found) {
        const firstLesson = curriculumData.modules[0]?.lessons[0];
        if (firstLesson) {
          router.replace(`/aprender/${courseId}/${firstLesson.id}`);
          return;
        }
        setError('No hay lecciones en este curso');
        setLoading(false);
        return;
      }
      setLesson(found);

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
      try { await upsertProgress(lesson.moduleId, lesson.id, { watchedSeconds: 30 }); } catch { /* best-effort */ }
    }, 30000);
    return () => clearInterval(interval);
  }, [lesson]);

  // ── Actions ──

  const handleMarkComplete = async () => {
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
  };

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]);
  };

  // ── Navigation ──

  function getAllLessons(): CurriculumLesson[] {
    if (!curriculum) return [];
    return curriculum.modules.flatMap((m) => m.lessons);
  }

  const allLessons = getAllLessons();
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);

  function getAdjacent(offset: number): CurriculumLesson | null {
    const idx = allLessons.findIndex((l) => l.id === lessonId);
    if (idx === -1) return null;
    return allLessons[idx + offset] ?? null;
  }

  const prevLesson = getAdjacent(-1);
  const nextLesson = getAdjacent(1);

  // ── Mapped props for components ──

  const courseForComponents: Course | null = course && curriculum ? toCourse(course, curriculum) : null;
  const lessonForComponents: Lesson | null = lesson ? toLesson(lesson, completed) : null;
  const prevLessonForComponents: Lesson | null = prevLesson ? toLesson(prevLesson) : null;
  const nextLessonForComponents: Lesson | null = nextLesson ? toLesson(nextLesson) : null;

  // ── Handlers ──

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) setCommentText('');
  };

  // ═══════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.centerState}>
          <Loader2 size={32} className={styles.spinner} />
          <p>Cargando lección...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.centerState}>
          <AlertCircle size={32} />
          <p>{error}</p>
          <button onClick={fetchData} className={styles.retryBtn}>Reintentar</button>
        </div>
      </div>
    );
  }

  if (!lesson || !courseForComponents) {
    return (
      <div className={styles.page}>
        <div className={styles.centerState}>
          <AlertCircle size={32} />
          <p>Lección no encontrada</p>
          <button onClick={() => router.push('/dashboard')} className={styles.retryBtn}>Volver al dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* ─── Main Content Area ─── */}
      <div className={styles.mainArea}>
        <LessonHeader lesson={lessonForComponents!} />

        <ContentRenderer lesson={lesson} />

        {/* Navigation + Complete button */}
        <div className={styles.navWrapper}>
          <LessonNavigation
            courseId={courseId}
            prevLesson={prevLessonForComponents}
            nextLesson={nextLessonForComponents}
          />
        </div>

        <PlayerTabs active={activeTab} onChange={setActiveTab} />

        <div className={styles.tabContent}>
          {activeTab === 'description' && <DescriptionTab course={courseForComponents} />}
          {activeTab === 'comments' && (
            <CommentsTab
              commentText={commentText}
              setCommentText={setCommentText}
              handleSendComment={handleSendComment}
            />
          )}
          {activeTab === 'resources' && <ResourcesTab />}
          {activeTab === 'notes' && <NotesTab notes={notes} setNotes={setNotes} />}
        </div>
      </div>

      {/* ─── Sidebar del curso (derecha) ─── */}
      <LessonSidebar
        course={courseForComponents}
        expandedModules={expandedModules}
        toggleModule={toggleModule}
        lessonId={lessonId}
      />
    </div>
  );
}
