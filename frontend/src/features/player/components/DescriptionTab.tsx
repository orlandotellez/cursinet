'use client'

import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import type { Course, Lesson } from '@/src/shared/types';
import styles from './DescriptionTab.module.css';

interface DescriptionTabProps {
  course: Course;
  courseId: string;
  prevLesson: Lesson | null;
  nextLesson: Lesson | null;
}

export function DescriptionTab({ course, courseId, prevLesson, nextLesson }: DescriptionTabProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.contentBlock}>
        <h3 className={styles.title}>{course.title}</h3>
        <p className={styles.text}>{course.description}</p>
      </div>

      <div className={styles.navButtons}>
        {prevLesson ? (
          <Link href={`/aprender/${courseId}/${prevLesson.id}`} className={styles.navBtn}>
            <ArrowLeft size={16} /> Anterior
          </Link>
        ) : <div />}

        <button className={styles.completeBtn}>
          <Check size={16} /> Completar y continuar
        </button>

        {nextLesson ? (
          <Link href={`/aprender/${courseId}/${nextLesson.id}`} className={`${styles.navBtn} ${styles.navBtnPrimary}`}>
            Siguiente <ArrowRight size={16} />
          </Link>
        ) : <div />}
      </div>
    </div>
  );
}
