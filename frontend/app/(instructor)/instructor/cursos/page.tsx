'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Edit, Trash2, Search, AlertCircle, BookOpen, Send } from 'lucide-react';
import { Spinner } from '@/src/shared/components/Spinner';
import Link from 'next/link';
import { getCourses, deleteCourse, publishCourse, type CourseDTO } from '@/src/shared/api/courses';
import { useAuthStore } from '@/src/shared/store/useAuthStore';
import CourseFormModal from '@/src/features/courses/components/CourseFormModal';
import { courseToFormData } from '@/src/features/courses/utils/courseToFormData';
import type { CourseFormData } from '@/src/features/courses/components/CourseFormModal';
import { ConfirmDialog } from '@/src/shared/components/ConfirmDialog';
import styles from './page.module.css';

const STATUS_LABELS: Record<string, string> = {
  published: 'Publicado',
  draft: 'Borrador',
};

export default function InstructorCursos() {
  const userId = useAuthStore((s) => s.user?.id);
  const [courses, setCourses] = useState<CourseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingCourseId, setEditingCourseId] = useState<string | undefined>();
  const [editingFormData, setEditingFormData] = useState<CourseFormData | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const deleteIdRef = useRef<string | null>(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCourses({ isPublished: undefined, instructorId: userId });
      setCourses(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar cursos';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) fetchCourses();
  }, [fetchCourses]);

  const filtered = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const cStatus = c.isPublished ? 'published' : 'draft';
    const matchesFilter = filter === 'all' || cStatus === filter;
    return matchesSearch && matchesFilter;
  });

  function handleOpenCreate() {
    setModalMode('create');
    setEditingCourseId(undefined);
    setEditingFormData(undefined);
    setModalOpen(true);
  }

  function handleOpenEdit(course: CourseDTO) {
    setModalMode('edit');
    setEditingCourseId(course.id);
    setEditingFormData(courseToFormData(course));
    setModalOpen(true);
  }

  function handleDeleteClick(id: string, title: string) {
    console.log('[Instructor] Delete btn clicked, setting ref:', id);
    deleteIdRef.current = id;
    setDeleteTarget({ id, title });
  }

  async function handleConfirmDelete() {
    console.log('[Instructor] handleConfirmDelete called, ref:', deleteIdRef.current, 'deleteTarget:', deleteTarget);
    const id = deleteIdRef.current;
    if (!id) {
      console.log('[Instructor] NO ID in ref, returning');
      return;
    }
    console.log('[Instructor] Deleting course:', id);
    setDeletingId(id);
    try {
      await deleteCourse(id);
      console.log('[Instructor] API delete success for:', id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
      setDeleteTarget(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar';
      console.log('[Instructor] Delete FAILED:', msg);
      alert(msg);
    } finally {
      setDeletingId(null);
    }
  }

  async function handlePublish(id: string) {
    setPublishingId(id);
    try {
      const updated = await publishCourse(id);
      setCourses((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al publicar el curso';
      alert(msg);
    } finally {
      setPublishingId(null);
    }
  }

  function handleSaved(updated: CourseDTO) {
    if (modalMode === 'create') {
      setCourses((prev) => [updated, ...prev]);
    } else {
      setCourses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    }
  }

  function getStatus(course: CourseDTO): { label: string; className: string } {
    if (course.isPublished) return { label: 'Publicado', className: 'statusPublished' };
    return { label: 'Borrador', className: 'statusDraft' };
  }

  const levelLabel: Record<string, string> = {
    Begginer: 'Principiante',
    Intermediate: 'Intermedio',
    Advanced: 'Avanzado',
    Expert: 'Experto',
  };

  return (
    <>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Mis Cursos</h1>
            <p className={styles.subtitle}>Gestioná tus cursos publicados y borradores.</p>
          </div>
          <button onClick={handleOpenCreate} className={styles.createBtn}>
            + Nuevo Curso
          </button>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Buscar cursos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.tabs}>
            {['all', 'published', 'draft'].map((t) => (
              <button
                key={t}
                className={`${styles.tab} ${filter === t ? styles.tabActive : ''}`}
                onClick={() => setFilter(t)}
              >
                {t === 'all' ? 'Todos' : STATUS_LABELS[t] || t}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className={styles.centerState}>
            <Spinner size="lg" className={styles.spinner} />
            <p>Cargando cursos...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className={styles.errorState}>
            <AlertCircle size={24} />
            <p>{error}</p>
            <button onClick={fetchCourses} className={styles.retryBtn}>
              Reintentar
            </button>
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <div className={styles.tableCard}>
            {filtered.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No hay cursos que coincidan con los filtros.</p>
                <button onClick={handleOpenCreate} className={styles.createBtn}>
                  + Crear primer curso
                </button>
              </div>
            ) : (
              <>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Curso</th>
                      <th>Estado</th>
                      <th>Nivel</th>
                      <th>Estudiantes</th>
                      <th>Rating</th>
                      <th>Precio</th>
                      <th>Acciones</th>
                      <th>Currículum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((course) => {
                      const status = getStatus(course);
                      return (
                        <tr key={course.id}>
                          <td className={styles.titleCell}>
                            <span className={styles.titleText}>{course.title}</span>
                            {course.previewVideoUrl && (
                              <span className={styles.videoBadge}>🎬 Video</span>
                            )}
                          </td>
                          <td>
                            <span className={`${styles.statusBadge} ${styles[status.className]}`}>
                              {status.label}
                            </span>
                          </td>
                          <td className={styles.numCell}>
                            {levelLabel[course.level] || course.level}
                          </td>
                          <td className={styles.numCell}>{course.studentsCount}</td>
                          <td className={styles.numCell}>
                            {course.reviewsCount > 0
                              ? course.averageRating.toFixed(1)
                              : '—'}
                          </td>
                          <td className={styles.numCell}>
                            {course.isFree ? 'Gratis' : `$${course.price.toFixed(2)}`}
                          </td>
                          <td>
                            <div className={styles.actions}>
                              {!course.isPublished && (
                                <button
                                  onClick={() => handlePublish(course.id)}
                                  className={`${styles.actionBtn} ${styles.actionPublish}`}
                                  title="Publicar"
                                  disabled={publishingId === course.id}
                                >
                                  {publishingId === course.id ? (
                                    <Spinner size="sm" className={styles.spinner} />
                                  ) : (
                                    <Send size={15} />
                                  )}
                                </button>
                              )}
                              <button
                                onClick={() => handleOpenEdit(course)}
                                className={styles.actionBtn}
                                title="Editar"
                                disabled={deletingId === course.id || publishingId === course.id}
                              >
                                <Edit size={15} />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(course.id, course.title)}
                                className={`${styles.actionBtn} ${styles.actionDelete}`}
                                title="Eliminar"
                                disabled={deletingId === course.id || publishingId === course.id}
                              >
                                {deletingId === course.id ? (
                          <Spinner size="sm" className={styles.spinner} />
                                ) : (
                                  <Trash2 size={15} />
                                )}
                              </button>
                            </div>
                          </td>
                          <td>
                            <Link
                              href={`/instructor/cursos/${course.id}/curriculum`}
                              className={styles.curriculumLink}
                              title="Editar currículum"
                            >
                              <BookOpen size={15} />
                              <span>Currículum</span>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className={styles.mobileList}>
                  {filtered.map((course) => {
                    const status = getStatus(course);
                    return (
                      <div key={course.id} className={styles.mobileCard}>
                        <div className={styles.mobileCardHeader}>
                          <span className={styles.mobileTitle}>
                            {course.title}
                            {course.previewVideoUrl && (
                              <span className={styles.videoBadge}>🎬</span>
                            )}
                          </span>
                          <span className={`${styles.statusBadge} ${styles[status.className]}`}>
                            {status.label}
                          </span>
                        </div>
                        <div className={styles.mobileCardBody}>
                          <span>{levelLabel[course.level] || course.level}</span>
                          <span>Estudiantes: {course.studentsCount}</span>
                          <span>
                            {course.isFree ? 'Gratis' : `$${course.price.toFixed(2)}`}
                          </span>
                        </div>
                        <div className={styles.mobileCardActions}>
                          {!course.isPublished && (
                            <button
                              onClick={() => handlePublish(course.id)}
                              className={`${styles.actionBtn} ${styles.actionPublish}`}
                              disabled={publishingId === course.id}
                            >
                              {publishingId === course.id ? (
                                <Spinner size="sm" className={styles.spinner} />
                              ) : (
                                <Send size={15} />
                              )}{' '}
                              Publicar
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEdit(course)}
                            className={styles.actionBtn}
                            disabled={deletingId === course.id || publishingId === course.id}
                          >
                            <Edit size={15} /> Editar
                          </button>
                          <button
                            onClick={() => handleDeleteClick(course.id, course.title)}
                            className={`${styles.actionBtn} ${styles.actionDelete}`}
                            disabled={deletingId === course.id || publishingId === course.id}
                          >
                            {deletingId === course.id ? (
                              <Spinner size="sm" className={styles.spinner} />
                            ) : (
                              <Trash2 size={15} />
                            )}{' '}
                            Eliminar
                          </button>
                          <Link
                            href={`/instructor/cursos/${course.id}/curriculum`}
                            className={styles.actionBtn}
                          >
                            <BookOpen size={15} /> Currículum
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar curso"
        message={deleteTarget ? `¿Estás seguro de que querés eliminar "${deleteTarget.title}"? Esta acción no se puede deshacer.` : ''}
        confirmLabel={deletingId === deleteTarget?.id ? 'Eliminando...' : 'Eliminar'}
        loading={deletingId === deleteTarget?.id}
        onConfirm={handleConfirmDelete}
        onCancel={() => { setDeleteTarget(null); setDeletingId(null); }}
      />

      <CourseFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        initialData={editingFormData}
        courseId={editingCourseId}
        onSaved={handleSaved}
      />
    </>
  );
}
