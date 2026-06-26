'use client'

import Link from 'next/link';
import { ChevronDown, ChevronRight, CheckCircle, Play } from 'lucide-react';
import type { Course } from '@/src/shared/types';
import styles from './LessonSidebar.module.css';

interface LessonSidebarProps {
  course: Course;
  expandedModules: string[];
  toggleModule: (id: string) => void;
  lessonId: string;
  isWelcomeActive?: boolean;
}

export function LessonSidebar({ course, expandedModules, toggleModule, lessonId, isWelcomeActive }: LessonSidebarProps) {
  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <h3 className={styles.courseTitle}>{course.title}</h3>
        <div className={styles.progress}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: '45%' }} />
          </div>
          <span className={styles.progressLabel}>45%</span>
        </div>
      </div>

      {course.previewVideoUrl && (
        <Link
          href={`/aprender/${course.id}/${lessonId}?welcome=1`}
          className={`${styles.welcomeItem} ${isWelcomeActive ? styles.lessonActive : ''}`}
        >
          <Play size={14} className={styles.welcomeIcon} />
          <span className={styles.lessonName}>Video de bienvenida</span>
        </Link>
      )}

      <div className={styles.curriculum}>
        {course.modules.map((mod) => (
          <div key={mod.id} className={styles.moduleGroup}>
            <button className={styles.moduleHeader} onClick={() => toggleModule(mod.id)}>
              {expandedModules.includes(mod.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <span className={styles.moduleTitle}>{mod.title}</span>
              <span className={styles.moduleLessons}>{mod.lessons.length}</span>
            </button>

            {expandedModules.includes(mod.id) && (
              <div className={styles.lessonList}>
                {mod.lessons.map((les) => {
                  const isActive = les.id === lessonId;
                  const isDone = les.isCompleted;
                  return (
                    <Link
                      key={les.id}
                      href={`/aprender/${course.id}/${les.id}`}
                      className={`${styles.lessonItem} ${isActive ? styles.lessonActive : ''} ${isDone ? styles.lessonDone : ''}`}
                    >
                      {isDone ? (
                        <CheckCircle size={14} className={styles.doneIcon} />
                      ) : (
                        <div className={styles.bullet} />
                      )}
                      <span className={styles.lessonName}>{les.title}</span>
                      <span className={styles.lessonDuration}>{les.duration}min</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
