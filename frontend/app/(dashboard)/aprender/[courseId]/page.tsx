'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { Spinner } from '@/src/shared/components/Spinner';
import { getCourseById } from '@/src/shared/api/courses';
import { getCurriculum } from '@/src/shared/api/curriculum';
import styles from './[lessonId]/page.module.css';

export default function AprenderCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;

    let cancelled = false;

    async function load() {
      try {
        const [, curriculum] = await Promise.all([
          getCourseById(courseId),
          getCurriculum(courseId),
        ]);
        if (cancelled) return;

        // Redirigir siempre a la primera lección
        const first = curriculum.modules?.[0]?.lessons?.[0];
        if (first) {
          router.replace(`/aprender/${courseId}/${first.id}`);
        } else {
          setError('No hay lecciones en este curso');
        }
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : 'Error al cargar el curso';
        setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => { cancelled = true; };
  }, [courseId, router]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.centerState}>
          <Spinner size="lg" className={styles.spinner} />
          <p>Cargando curso...</p>
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
          <button onClick={() => router.push('/mis-cursos')} className={styles.retryBtn}>
            Volver a mis cursos
          </button>
        </div>
      </div>
    );
  }

  return null;
}
