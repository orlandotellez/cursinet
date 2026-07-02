'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Star,
  Users,
  Clock,
  User,
  AlertCircle,
  ArrowLeft,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { getCourseBySlug, type CourseDTO } from '@/src/shared/api/courses';
import { useAuthStore } from '@/src/shared/store/useAuthStore';
import { useEnrollmentStore } from '@/src/shared/store/useEnrollmentStore';
import { ErrorState } from '@/src/shared/components/ErrorState';
import { Spinner } from '@/src/shared/components/Spinner';
import { PayPalCheckoutButton } from './PayPalCheckoutButton';
import styles from '@/app/(public)/checkout/[slug]/page.module.css';

// ─── Helpers ───────────────────────────────────────────────────────────────

function levelLabel(level: string) {
  if (level === 'beginner' || level === 'begginer') return 'Principiante';
  if (level === 'intermediate') return 'Intermedio';
  return 'Avanzado';
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

function durationText(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

// ─── Skeleton ──────────────────────────────────────────────────────────────

function CheckoutSkeleton() {
  return (
    <div className={styles.skeletonPage}>
      <div className={styles.skeletonContainer}>
        <div className={styles.breadcrumb}>
          <div className={`${styles.skeleton}`} style={{ width: 140, height: 16 }} />
        </div>

        <div className={styles.skeletonGrid}>
          <div>
            <div className={`${styles.skeleton} ${styles.skeletonThumb}`} />
            <div className={`${styles.skeleton} ${styles.skeletonTitle}`} />
            <div className={`${styles.skeleton} ${styles.skeletonLine}`} />
            <div className={`${styles.skeleton} ${styles.skeletonLine}`} />
            <div className={`${styles.skeleton} ${styles.skeletonLineShort}`} />
          </div>
          <div>
            <div className={`${styles.skeleton} ${styles.skeletonSidebar}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Payment Sidebar ───────────────────────────────────────────────────────

function PaymentSidebar({
  course,
  isEnrolled,
  firstLessonHref,
}: {
  course: CourseDTO;
  isEnrolled: boolean;
  firstLessonHref: string;
}) {
  const router = useRouter();

  // ── Ya inscripto ──

  if (isEnrolled) {
    return (
      <div className={styles.enrolledCard}>
        <CheckCircle2 className={styles.enrolledIcon} />
        <h3 className={styles.enrolledTitle}>Ya estás inscripto</h3>
        <p className={styles.enrolledText}>
          Ya tenés acceso completo a este curso y todo su contenido.
        </p>
        <button
          onClick={() => router.push(firstLessonHref)}
          className={styles.enrolledBtn}
        >
          Ir al curso
        </button>
      </div>
    );
  }

  // ── Sidebar de pago ──

  return (
    <div className={styles.paymentCard}>
      {/* Price */}
      <div className={styles.priceSection}>
        <p className={styles.priceLabel}>Total a pagar</p>
        <p className={styles.priceValue}>
          ${formatPrice(course.price)}
          <span className={styles.priceCurrency}>USD</span>
        </p>
      </div>

      <hr className={styles.divider} />

      {/* What's included */}
      <div>
        <h4 className={styles.includesTitle}>Incluye:</h4>
        <ul className={styles.includesList}>
          <li className={styles.includesItem}>
            <CheckCircle2 className={styles.includesIcon} />
            <span>Acceso completo de por vida</span>
          </li>
          <li className={styles.includesItem}>
            <CheckCircle2 className={styles.includesIcon} />
            <span>Certificado de finalización</span>
          </li>
          <li className={styles.includesItem}>
            <CheckCircle2 className={styles.includesIcon} />
            <span>
              {course.lessonsCount
                ? `${course.lessonsCount} lecciones en video`
                : 'Múltiples lecciones'}
            </span>
          </li>
          <li className={styles.includesItem}>
            <CheckCircle2 className={styles.includesIcon} />
            <span>Acceso desde cualquier dispositivo</span>
          </li>
        </ul>
      </div>

      <hr className={styles.divider} />

      <div className={styles.buttonPay}>
        {/* PayPal Button */}
        <PayPalCheckoutButton
          courseId={course.id}
          slug={course.slug}
          amount={course.price}
          currency="USD"
          enabled
        />

      </div>

      {/* Security note */}
      <div className={styles.securityNote}>
        <Shield size={14} />
        <span>Pago seguro procesado por PayPal</span>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export function CheckoutClient() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [course, setCourse] = useState<CourseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { isEnrolled } = useEnrollmentStore();

  // ── Auth check ──
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace(`/login?redirect=/checkout/${slug}`);
    }
  }, [isAuthenticated, authLoading, router, slug]);

  // ── Fetch course ──
  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const dto = await getCourseBySlug(slug);
      // Verificar que el curso no sea gratuito
      if (dto.isFree || dto.price <= 0) {
        router.replace(`/cursos/${slug}`);
        return;
      }
      setCourse(dto);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Error al cargar el curso';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [slug, isAuthenticated, router]);

  useEffect(() => {
    if (slug && isAuthenticated) fetchData();
  }, [slug, isAuthenticated, fetchData]);

  // ── Auth loading ──

  if (authLoading) {
    return (
      <div className={styles.centerState}>
        <Spinner size="lg" />
      </div>
    );
  }

  // Not authenticated — the useEffect will redirect
  if (!isAuthenticated) {
    return (
      <div className={styles.centerState}>
        <Spinner size="lg" />
      </div>
    );
  }

  // ── Course loading ──

  if (loading) {
    return <CheckoutSkeleton />;
  }

  // ── Error ──

  if (error) {
    return (
      <div className={styles.errorWrapper}>
        <ErrorState error={error} onRetry={fetchData} />
      </div>
    );
  }

  // ── Not found ──

  if (!course) {
    return (
      <div className={styles.errorWrapper}>
        <ErrorState error="Curso no encontrado" />
      </div>
    );
  }

  // ── Ready ──

  const enrolled = isEnrolled(course.id);
  const firstLessonHref = `/aprender/${course.id}`;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link href={`/cursos/${slug}`}>
            <ArrowLeft size={16} />
            Volver al curso
          </Link>
        </nav>

        <div className={styles.grid}>
          {/* ── LEFT COLUMN: Course Details ── */}
          <div className={styles.leftColumn}>
            {/* Thumbnail */}
            <div className={styles.thumbnail}>
              {course.thumbnailUrl ? (
                <Image
                  src={course.thumbnailUrl}
                  alt={course.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
              ) : (
                <div className={styles.thumbnailPlaceholder}>
                  <AlertCircle size={32} />
                </div>
              )}
            </div>

            {/* Title & Meta */}
            <div className={styles.courseHeader}>
              <div className={styles.tags}>
                <span className={styles.levelBadge}>
                  {levelLabel(course.level)}
                </span>
                {course.categoryName && (
                  <span className={styles.categoryBadge}>
                    {course.categoryName}
                  </span>
                )}
              </div>

              <h1 className={styles.title}>{course.title}</h1>

              <p className={styles.shortDescription}>
                {course.shortDescription ?? course.description}
              </p>
            </div>

            {/* Stats row */}
            <div className={styles.stats}>
              <div className={styles.statItem}>
                <Star className={`${styles.statIcon} ${styles.statIconStar}`} />
                <span>
                  <span className={styles.statValue}>
                    {course.averageRating.toFixed(1)}
                  </span>{' '}
                  ({course.reviewsCount} reseñas)
                </span>
              </div>
              <div className={styles.statItem}>
                <Users className={styles.statIcon} />
                <span>
                  <span className={styles.statValue}>
                    {course.studentsCount}
                  </span>{' '}
                  estudiantes
                </span>
              </div>
              <div className={styles.statItem}>
                <Clock className={styles.statIcon} />
                <span>
                  <span className={styles.statValue}>
                    {durationText(course.durationMinutes)}
                  </span>
                </span>
              </div>
            </div>

            {/* Instructor */}
            <div className={styles.instructorCard}>
              <div className={styles.instructorAvatar}>
                <User className={styles.instructorAvatarIcon} size={20} />
              </div>
              <div>
                <p className={styles.instructorLabel}>Instructor</p>
                <p className={styles.instructorName}>
                  {course.instructorName}
                </p>
              </div>
            </div>

            {/* Description */}
            {course.description && (
              <div className={styles.descriptionSection}>
                <h2 className={styles.sectionTitle}>Descripción del curso</h2>
                <p className={styles.descriptionText}>
                  {course.description}
                </p>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN: Payment ── */}
          <div className={styles.rightColumn}>
            <div className={styles.stickyWrapper}>
              <PaymentSidebar
                course={course}
                isEnrolled={enrolled}
                firstLessonHref={firstLessonHref}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
