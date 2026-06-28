'use client';

import { X, Edit, Send, EyeOff, Trash2 } from 'lucide-react';
import type { CourseDTO } from '@/src/shared/api/courses';
import styles from './page.module.css';

interface Props {
  course: CourseDTO | null;
  onClose: () => void;
  onEdit?: (course: CourseDTO) => void;
  onPublish?: (id: string) => void;
  onUnpublish?: (id: string) => void;
  onDelete?: (course: CourseDTO) => void;
  publishingId?: string | null;
}

function formatDate(d: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function mapLevel(level: string): string {
  const map: Record<string, string> = {
    Beginner: 'Principiante',
    Intermediate: 'Intermedio',
    Advanced: 'Avanzado',
    Expert: 'Experto',
  };
  return map[level] || level;
}

export default function CourseDetailModal({ course, onClose, onEdit, onPublish, onUnpublish, onDelete, publishingId }: Props) {
  if (!course) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.detailModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.detailHeader}>
          <h2 className={styles.detailTitle}>{course.title}</h2>
          <div className={styles.detailHeaderActions}>
            {!course.deletedAt && onEdit && (
              <button className={styles.detailActionBtn} title="Editar curso" onClick={() => onEdit(course)}>
                <Edit size={16} />
              </button>
            )}
            {!course.deletedAt && !course.isPublished && onPublish && (
              <button
                className={styles.detailActionBtn}
                title="Publicar curso"
                disabled={publishingId === course.id}
                onClick={() => onPublish(course.id)}
              >
                <Send size={16} />
              </button>
            )}
            {!course.deletedAt && course.isPublished && onUnpublish && (
              <button
                className={styles.detailActionBtn}
                title="Despublicar curso"
                disabled={publishingId === course.id}
                onClick={() => onUnpublish(course.id)}
              >
                <EyeOff size={16} />
              </button>
            )}
            {!course.deletedAt && onDelete && (
              <button className={`${styles.detailActionBtn} ${styles.actionDelete}`} title="Eliminar curso" onClick={() => onDelete(course)}>
                <Trash2 size={16} />
              </button>
            )}
            <button className={styles.detailClose} onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className={styles.detailBody}>
          <div className={styles.detailGrid}>
            <div className={styles.detailField}>
              <label>ID</label>
              <span className={styles.mono}>{course.id}</span>
            </div>
            <div className={styles.detailField}>
              <label>Slug</label>
              <span className={styles.mono}>{course.slug}</span>
            </div>
            <div className={styles.detailField}>
              <label>Estado</label>
              <span className={`${styles.statusBadge} ${styles[course.deletedAt ? 'statusRejected' : course.isPublished ? 'statusPublished' : 'statusDraft']}`}>
                {course.deletedAt ? 'Eliminado' : course.isPublished ? 'Publicado' : 'Borrador'}
              </span>
            </div>
            <div className={styles.detailField}>
              <label>Nivel</label>
              <span>{mapLevel(course.level)}</span>
            </div>
            <div className={styles.detailField}>
              <label>Precio</label>
              <span>{course.isFree ? 'Gratis' : `$${course.price.toFixed(2)}`}</span>
            </div>
            <div className={styles.detailField}>
              <label>Duración</label>
              <span>{course.durationMinutes} min</span>
            </div>
            <div className={styles.detailField}>
              <label>Instructor</label>
              <span>{course.instructorName}</span>
            </div>
            <div className={styles.detailField}>
              <label>Categoría</label>
              <span>{course.categoryName}</span>
            </div>
            <div className={styles.detailField}>
              <label>Estudiantes</label>
              <span>{course.studentsCount.toLocaleString()}</span>
            </div>
            <div className={styles.detailField}>
              <label>Rating</label>
              <span>{course.averageRating.toFixed(1)} ⭐ ({course.reviewsCount} reseñas)</span>
            </div>
            <div className={styles.detailField}>
              <label>Idioma</label>
              <span>{course.language === 'es' ? 'Español' : course.language}</span>
            </div>
            <div className={styles.detailField}>
              <label>Destacado</label>
              <span>{course.isFeatured ? 'Sí' : 'No'}</span>
            </div>
            <div className={styles.detailField}>
              <label>Publicado</label>
              <span>{course.isPublished ? formatDate(course.publishedAt) : 'No publicado'}</span>
            </div>
            <div className={styles.detailField}>
              <label>Creado</label>
              <span>{formatDate(course.createdAt)}</span>
            </div>
            <div className={styles.detailField}>
              <label>Actualizado</label>
              <span>{formatDate(course.updatedAt)}</span>
            </div>
            {course.deletedAt && (
              <>
                <div className={styles.detailField}>
                  <label>Eliminado</label>
                  <span className={styles.deletedText}>{formatDate(course.deletedAt)}</span>
                </div>
                <div className={styles.detailField}>
                  <label>Eliminado por</label>
                  <span className={styles.deletedText}>{course.deletedByName || '—'}</span>
                </div>
              </>
            )}
          </div>

          {course.shortDescription && (
            <div className={styles.detailSection}>
              <h3>Descripción breve</h3>
              <p>{course.shortDescription}</p>
            </div>
          )}

          {course.description && (
            <div className={styles.detailSection}>
              <h3>Descripción completa</h3>
              <p>{course.description}</p>
            </div>
          )}

          {course.requirements && course.requirements.length > 0 && (
            <div className={styles.detailSection}>
              <h3>Requisitos</h3>
              <ul>
                {course.requirements.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}

          {course.learningObjectives && course.learningObjectives.length > 0 && (
            <div className={styles.detailSection}>
              <h3>Objetivos de aprendizaje</h3>
              <ul>
                {course.learningObjectives.map((o, i) => <li key={i}>{o}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
