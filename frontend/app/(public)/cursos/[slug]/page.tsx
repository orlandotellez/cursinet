'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
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

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.centerState}>
            <Loader2 size={32} className={styles.spinner} />
            <p>Cargando curso...</p>
          </div>
        </div>
      </div>
    );
  }

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

  const firstLessonId = course.modules[0]?.lessons[0]?.id;
  // Ir a la página de bienvenida que muestra el video de preview o redirige a la 1ra lección
  const firstLessonHref = `/aprender/${course.id}`;

  const handleEnroll = async () => {
    if (!course) return;

    // Paid courses go through the payment modal first (requires auth)
    if (course.price > 0) {
      if (!isAuthenticated) {
        router.push(`/login?redirect=/cursos/${course.slug}`);
        return;
      }
      setShowPayment(true);
      return;
    }

    // Free courses enroll directly
    try {
      await enroll(course.id);
      router.push(firstLessonHref);
    } catch {
      // Error is already set in the store — UI can show a toast/notification
    }
  };

  const handlePaymentSuccess = async () => {
    setShowPayment(false);
    // Payment already created the enrollment on the backend (ConfirmPaymentAsync
    // creates it atomically). We just mark it locally and navigate.
    demoEnroll(course!.id);
    router.push(firstLessonHref);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
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
