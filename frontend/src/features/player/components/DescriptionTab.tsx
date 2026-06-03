'use client'

import type { Course } from '@/src/shared/types';
import styles from './DescriptionTab.module.css';

interface DescriptionTabProps {
  course: Course;
}

export function DescriptionTab({ course }: DescriptionTabProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.contentBlock}>
        <h3 className={styles.title}>{course.title}</h3>
        <p className={styles.text}>{course.description}</p>
      </div>
    </div>
  );
}
