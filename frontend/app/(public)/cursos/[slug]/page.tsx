'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getCourseBySlug, type CourseDTO } from '@/src/shared/api/courses';
import { getCurriculum, type CurriculumResponse, type CurriculumModule, type CurriculumLesson } from '@/src/shared/api/curriculum';
import { ErrorState } from '@/src/shared/components/ErrorState';
import { useEnrollmentStore } from '@/src/shared/store/useEnrollmentStore';
import { useAuthStore } from '@/src/shared/store/useAuthStore';
import { CourseHero } from '@/src/features/courses/detail/CourseHero';
import { CourseDescription } from '@/src/features/courses/detail/CourseDescription';
import { WhatYouLearn } from '@/src/features/courses/detail/WhatYouLearn';
import { CurriculumAccordion } from '@/src/features/courses/detail/CurriculumAccordion';
import { InstructorCard } from '@/src/features/courses/detail/InstructorCard';
import { ReviewSection } from '@/src/features/courses/detail/ReviewSection';
import { PaymentModal } from '@/src/features/payment/PaymentModal';
import type { Course, Instructor, Category, CourseModule, Lesson } from '@/src/shared/types';
import s from '@/src/shared/styles/skeleton.module.css';
import styles from './page.module.css';

// ─── Adapter: map API data to the mock Course shape ───────────────────────

function mapToCourse(
  dto: CourseDTO,
  curriculum: CurriculumResponse,
): Course {
  return {
    id: dto.id,
    slug: dto.slug,
    title: dto.title,
    shortDescription: dto.shortDescription ?? '',
    description: dto.description ?? '',
    thumbnail: dto.thumbnailUrl ?? '',
    previewVideoUrl: dto.previewVideoUrl ?? null,
    instructor: {
      id: dto.instructorId,
      name: dto.instructorName,
      username: dto.instructorName.toLowerCase().replace(/\s+/g, '-'),
      avatar: '',
      bio: '',
      role: 'Instructor',
      coursesCount: 0,
      studentsCount: dto.studentsCount,
      rating: dto.averageRating,
    },
    category: {
      id: dto.categoryId,
      name: dto.categoryName,
      slug: dto.categorySlug ?? '',
      icon: '',
      coursesCount: 0,
    },
    level: mapLevel(dto.level),
    duration: Math.round(dto.durationMinutes / 60),
    lessonsCount: curriculum.modules.reduce(
      (sum, m) => sum + m.lessons.length, 0,
    ),
    price: dto.price,
    rating: dto.averageRating,
    reviewsCount: dto.reviewsCount,
    studentsCount: dto.studentsCount,
    publishedAt: dto.publishedAt ?? '',
    tags: [],
    modules: curriculum.modules.map(mapModule),
    status: dto.isPublished ? 'published' : 'draft',
  };
}

function mapLevel(level: string): 'beginner' | 'intermediate' | 'advanced' {
  if (level.toLowerCase() === 'beginner' || level.toLowerCase() === 'begginer') return 'beginner';
  if (level.toLowerCase() === 'intermediate') return 'intermediate';
  return 'advanced';
}

function mapModule(mod: CurriculumModule): CourseModule {
  return {
    id: mod.id,
    title: mod.title,
    lessons: mod.lessons.map(mapLesson),
  };
}

function mapLesson(lesson: CurriculumLesson): Lesson {
  return {
    id: lesson.id,
    title: lesson.title,
    type: lesson.type.toLowerCase() as Lesson['type'],
    duration: lesson.videoDurationSeconds
      ? Math.round(lesson.videoDurationSeconds / 60)
      : 0,
  };
}

// ─── Skeleton ─────────────────────────────────────────────────────────────

function CourseDetailSkeleton() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Breadcrumb — always visible */}
        <nav className={styles.breadcrumb}>
          <Link href="/cursos">Cursos</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={s.base} style={{ width: 220, height: 15, display: 'inline-block', borderRadius: 4 }} />
        </nav>

        {/* Hero skeleton */}
        <div className={styles.heroSkeleton}>
          <div className={styles.heroSkeletonBody}>
            <div className={s.base} style={{ width: 80, height: 22, borderRadius: 100 }} />
            <div className={s.base} style={{ width: '90%', height: 34, marginTop: 4 }} />
            <div className={s.base} style={{ width: '70%', height: 34 }} />
            <div className={s.base} style={{ width: '100%', height: 16, marginTop: 8 }} />
            <div className={s.base} style={{ width: '60%', height: 16 }} />
            <div className={styles.heroSkeletonMeta}>
              <div className={s.base} style={{ width: 120, height: 16 }} />
              <div className={s.base} style={{ width: 100, height: 16 }} />
              <div className={s.base} style={{ width: 60, height: 16 }} />
            </div>
            <div className={styles.heroSkeletonMeta}>
              <div className={s.base} style={{ width: 160, height: 40, borderRadius: 8 }} />
              <div className={s.base} style={{ width: 140, height: 48, borderRadius: 8 }} />
            </div>
          </div>
          <div className={styles.heroSkeletonThumb}>
            <div className={s.base} style={{ width: '100%', height: '100%', borderRadius: 12 }} />
          </div>
        </div>

        {/* Description section skeleton */}
        <section className={styles.section}>
          <div className={s.base} style={{ width: 120, height: 22, marginBottom: 20 }} />
          <div className={s.base} style={{ width: '100%', height: 14, marginBottom: 10 }} />
          <div className={s.base} style={{ width: '100%', height: 14, marginBottom: 10 }} />
          <div className={s.base} style={{ width: '70%', height: 14 }} />
        </section>

        {/* What you'll learn skeleton */}
        <section className={styles.section}>
          <div className={s.base} style={{ width: 180, height: 22, marginBottom: 20 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className={s.base} style={{ width: 18, height: 18, borderRadius: 4, flexShrink: 0 }} />
                <div className={s.base} style={{ flex: 1, height: 14 }} />
              </div>
            ))}
          </div>
        </section>

        {/* Curriculum skeleton */}
        <section className={styles.section}>
          <div className={s.base} style={{ width: 200, height: 22, marginBottom: 20 }} />
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={s.base}
              style={{
                width: '100%',
                height: 48,
                borderRadius: 8,
                marginBottom: 8,
              }}
            />
          ))}
        </section>

        {/* Instructor skeleton */}
        <section className={styles.section}>
          <div className={s.base} style={{ width: 120, height: 22, marginBottom: 20 }} />
          <div
            className={s.base}
            style={{
              width: '100%',
              height: 120,
              borderRadius: 12,
            }}
          />
        </section>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const { enroll, demoEnroll, isEnrolled } = useEnrollmentStore();
  const { isAuthenticated } = useAuthStore();
  const enrolled = course ? isEnrolled(course.id) : false;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dto = await getCourseBySlug(slug);
      const curriculum = await getCurriculum(dto.id);
      const mapped = mapToCourse(dto, curriculum);
      setCourse(mapped);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar el curso';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (slug) fetchData();
  }, [slug, fetchData]);

  // ── Loading ──

  if (loading) {
    return <CourseDetailSkeleton />;
  }

  // ── Error ──

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <ErrorState error={error} onRetry={fetchData} />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <ErrorState error="Curso no encontrado" />
        </div>
      </div>
    );
  }

  // ── Ready ──

  const firstLessonId = course.modules[0]?.lessons[0]?.id;
  const firstLessonHref = firstLessonId
    ? `/aprender/${course.id}/${firstLessonId}`
    : `/aprender/${course.id}`;

  const handleEnroll = async () => {
    if (!course) return;

    if (course.price > 0) {
      if (!isAuthenticated) {
        router.push(`/login?redirect=/cursos/${course.slug}`);
        return;
      }
      setShowPayment(true);
      return;
    }

    try {
      await enroll(course.id);
      router.push(firstLessonHref);
    } catch {
      // Error is already set in the store — UI can show a toast/notification
    }
  };

  const handlePaymentSuccess = async () => {
    setShowPayment(false);
    demoEnroll(course!.id);
    router.push(firstLessonHref);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <nav className={styles.breadcrumb}>
          <Link href="/cursos">Cursos</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>{course.title}</span>
        </nav>

        <CourseHero
          course={course}
          enrolled={enrolled}
          firstLessonHref={firstLessonHref}
          onEnroll={handleEnroll}
        />

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Descripción</h2>
          <CourseDescription description={course.description} />
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Lo que aprenderás</h2>
          <WhatYouLearn />
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Contenido del curso</h2>
          <CurriculumAccordion course={course} enrolled={enrolled} />
          {!enrolled && (
            <p className={styles.curriculumHint}>
              Inscribite para acceder a todas las lecciones
            </p>
          )}
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Tu instructor</h2>
          <InstructorCard instructor={course.instructor} />
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Reseñas</h2>
          <ReviewSection courseId={course.id} enrolled={enrolled} />
        </section>
      </div>

      {showPayment && (
        <PaymentModal
          courseId={course.id}
          courseTitle={course.title}
          price={course.price}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  );
}
