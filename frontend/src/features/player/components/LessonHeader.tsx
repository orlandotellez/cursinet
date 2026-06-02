'use client'

import { Play, FileText, Code2, FileQuestion, Monitor } from 'lucide-react';
import type { Lesson } from '@/src/shared/types';
import styles from './LessonHeader.module.css';

interface LessonHeaderProps {
  lesson: Lesson;
}

const typeIcons: Record<Lesson['type'], React.ReactNode> = {
  video: <Play size={16} />,
  text: <FileText size={16} />,
  code: <Code2 size={16} />,
  quiz: <FileQuestion size={16} />,
  resource: <Monitor size={16} />,
};

const typeLabels: Record<Lesson['type'], string> = {
  video: 'Video',
  text: 'Texto',
  code: 'Código',
  quiz: 'Quiz',
  resource: 'Recurso',
};

function formatDuration(minutes: number) {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m ? `${h}h ${m}min` : `${h}h`;
  }
  return `${minutes}min`;
}

export function LessonHeader({ lesson }: LessonHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.typeBadge}>
        {typeIcons[lesson.type]}
        <span>{typeLabels[lesson.type]}</span>
      </div>
      <h1 className={styles.title}>{lesson.title}</h1>
      <span className={styles.duration}>{formatDuration(lesson.duration)}</span>
    </div>
  );
}
