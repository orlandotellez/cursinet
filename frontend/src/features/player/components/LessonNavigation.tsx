'use client'

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Spinner } from '@/src/shared/components/Spinner';
import type { Lesson } from '@/src/shared/types';
import styles from './LessonNavigation.module.css';

interface LessonNavigationProps {
  courseId: string;
  prevLesson: Lesson | null;
  nextLesson: Lesson | null;
  completed: boolean;
  savingProgress: boolean;
  onNext?: () => void;
}

export function LessonNavigation({ courseId, prevLesson, nextLesson, completed, savingProgress, onNext }: LessonNavigationProps) {
  const router = useRouter();

  const handleCompleteAndRedirect = async () => {
    if (!onNext) return;
    await onNext();
    router.push('/mis-cursos');
  };

  return (
    <div className={styles.nav}>
      {prevLesson ? (
        <Link href={`/aprender/${courseId}/${prevLesson.id}`} className={styles.btn}>
          <ArrowLeft size={16} />
          <div>
            <span className={styles.label}>Anterior</span>
            <span className={styles.title}>{prevLesson.title}</span>
          </div>
        </Link>
      ) : <div />}

      {nextLesson ? (
        <Link
          href={`/aprender/${courseId}/${nextLesson.id}`}
          className={`${styles.btn} ${styles.btnRight}`}
          onClick={onNext}
        >
          <div>
            <span className={styles.label}>Siguiente</span>
            <span className={styles.title}>{nextLesson.title}</span>
          </div>
          <ArrowRight size={16} />
        </Link>
      ) : completed ? (
        <Link href="/mis-cursos" className={`${styles.completeBtn}`}>
          <Check size={16} />
          Ir a Mis Cursos
        </Link>
      ) : (
        <button
          className={styles.completeBtn}
          onClick={handleCompleteAndRedirect}
          disabled={savingProgress}
        >
          {savingProgress ? (
            <Spinner size="sm" />
          ) : (
            <Check size={16} />
          )}
          {savingProgress ? 'Completando...' : 'Completar lección final'}
        </button>
      )}
    </div>
  );
}
