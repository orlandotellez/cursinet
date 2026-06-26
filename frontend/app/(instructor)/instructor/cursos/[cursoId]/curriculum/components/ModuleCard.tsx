'use client';

import { useState } from 'react';
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  BookOpen,
} from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ModuleResponse } from '@/src/shared/api/modules';
import type { LessonSummary } from '@/src/shared/api/modules';
import { LessonCard } from './LessonCard';
import styles from '../page.module.css';

interface ModuleCardProps {
  module: ModuleResponse;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
  onAddLesson: () => void;
  onEditLesson: (lesson: LessonSummary) => void;
  onTogglePublishLesson: (lesson: LessonSummary) => void;
  onDeleteLesson: (lesson: LessonSummary) => void;
}

export function ModuleCard({
  module,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onTogglePublish,
  onAddLesson,
  onEditLesson,
  onTogglePublishLesson,
  onDeleteLesson,
}: ModuleCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.moduleCard} ${isDragging ? styles.moduleCardDragging : ''} ${isExpanded ? styles.moduleCardExpanded : ''}`}
    >
      <div className={styles.moduleHeader}>
        <button
          className={styles.dragHandle}
          {...attributes}
          {...listeners}
          title="Arrastrar para reordenar"
        >
          <GripVertical size={16} />
        </button>

        <button className={styles.moduleToggle} onClick={onToggle}>
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        <div className={styles.moduleInfo}>
          <div className={styles.moduleTitleRow}>
            <BookOpen size={16} className={styles.moduleIcon} />
            <span className={styles.moduleTitle}>{module.title}</span>
            {!module.isPublished && (
              <span className={styles.draftBadge}>Borrador</span>
            )}
          </div>
          <span className={styles.moduleMeta}>
            {module.lessons?.length ?? 0} lecciones
            {module.description ? ` · ${module.description}` : ''}
          </span>
        </div>

        <div className={styles.moduleActions}>
          <button
            className={styles.iconBtn}
            onClick={onTogglePublish}
            title={module.isPublished ? 'Despublicar módulo' : 'Publicar módulo'}
          >
            {module.isPublished ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
          <button
            className={styles.iconBtn}
            onClick={onAddLesson}
            title="Agregar lección"
          >
            <Plus size={15} />
          </button>
          <button
            className={styles.iconBtn}
            onClick={onEdit}
            title="Editar módulo"
          >
            <Edit size={15} />
          </button>
          <button
            className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
            onClick={onDelete}
            title="Eliminar módulo"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className={styles.lessonsList}>
          {(module.lessons && module.lessons.length > 0) ? (
            module.lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                onEdit={() => onEditLesson(lesson)}
                onTogglePublish={() => onTogglePublishLesson(lesson)}
                onDelete={() => onDeleteLesson(lesson)}
              />
            ))
          ) : (
            <div className={styles.emptyLessons}>
              <p>No hay lecciones en este módulo.</p>
              <button className={styles.addLessonBtn} onClick={onAddLesson}>
                <Plus size={14} /> Agregar lección
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
