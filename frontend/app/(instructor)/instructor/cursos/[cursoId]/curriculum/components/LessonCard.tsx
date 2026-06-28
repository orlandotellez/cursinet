'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Play,
  FileText,
  Code2,
  FileQuestion,
  FileType,
  Edit,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { LessonSummary } from '@/src/shared/api/courses';
import styles from '../page.module.css';

interface LessonCardProps {
  lesson: LessonSummary;
  onEdit: () => void;
  onTogglePublish: () => void;
  onDelete: () => void;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  Video: <Play size={14} />,
  Text: <FileText size={14} />,
  Code: <Code2 size={14} />,
  Quiz: <FileQuestion size={14} />,
  Resource: <FileType size={14} />,
};

const TYPE_LABELS: Record<string, string> = {
  Video: 'Video',
  Text: 'Texto',
  Code: 'Código',
  Quiz: 'Quiz',
  Resource: 'Recurso',
};

function formatDuration(seconds: number | null): string {
  if (!seconds) return '';
  const mins = Math.floor(seconds / 60);
  if (mins >= 60) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m ? `${h}h ${m}min` : `${h}h`;
  }
  return `${mins}min`;
}

export function LessonCard({ lesson, onEdit, onTogglePublish, onDelete }: LessonCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.lessonCard} ${isDragging ? styles.lessonCardDragging : ''} ${!lesson.isPublished ? styles.lessonCardUnpublished : ''}`}
    >
      <button
        className={styles.dragHandle}
        {...attributes}
        {...listeners}
        title="Arrastrar para reordenar"
      >
        <GripVertical size={14} />
      </button>

      <div className={styles.lessonTypeIcon}>
        {TYPE_ICONS[lesson.type] || <FileType size={14} />}
      </div>

      <div className={styles.lessonInfo}>
        <span className={styles.lessonTitle}>{lesson.title}</span>
        <span className={styles.lessonTypeLabel}>{TYPE_LABELS[lesson.type] || lesson.type}</span>
        {lesson.isPreview && (
          <span className={styles.previewBadge}>
            <Eye size={12} /> Vista previa
          </span>
        )}
        {formatDuration(lesson.videoDurationSeconds) && (
          <span className={styles.lessonDuration}>
            {formatDuration(lesson.videoDurationSeconds)}
          </span>
        )}
      </div>

      <div className={styles.lessonActions}>
        <button
          className={styles.iconBtn}
          onClick={onTogglePublish}
          title={lesson.isPublished ? 'Despublicar lección' : 'Publicar lección'}
        >
          {lesson.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
        <button
          className={styles.iconBtn}
          onClick={onEdit}
          title="Editar lección"
        >
          <Edit size={14} />
        </button>
        <button
          className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
          onClick={onDelete}
          title="Eliminar lección"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
