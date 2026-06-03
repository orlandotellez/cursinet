'use client'

import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Lesson } from '@/src/shared/types';
import styles from './LessonNavigation.module.css';

interface LessonNavigationProps {
  courseId: string;
  prevLesson: Lesson | null;
  nextLesson: Lesson | null;
}

export function LessonNavigation({ courseId, prevLesson, nextLesson }: LessonNavigationProps) {
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
        <Link href={`/aprender/${courseId}/${nextLesson.id}`} className={`${styles.btn} ${styles.btnRight}`}>
          <div>
            <span className={styles.label}>Siguiente</span>
            <span className={styles.title}>{nextLesson.title}</span>
          </div>
          <ArrowRight size={16} />
        </Link>
      ) : <div />}
    </div>
  );
}
