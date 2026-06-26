'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Search, Eye, Edit, Trash2, Ghost, AlertCircle, RotateCw, Plus, Send, EyeOff, BookOpen } from 'lucide-react';
import { getCourses, deleteCourse, publishCourse, unpublishCourse, type CourseDTO } from '@/src/shared/api/courses';
import { getCategories, type CategoryDTO } from '@/src/shared/api/categories';
import { ConfirmDialog } from '@/src/shared/components/ConfirmDialog';
import CourseFormModal, { type CourseFormData } from '@/src/features/courses/components/CourseFormModal';
import CourseDetailModal from './CourseDetailModal';
import styles from './page.module.css';

interface DeleteTarget {
  id: string;
  title: string;
}

type StatusFilter = 'all' | 'published' | 'draft' | 'deleted';

function statusInfo(course: CourseDTO): { label: string; className: string } {
  if (course.deletedAt) return { label: 'Eliminado', className: 'statusRejected' };
  if (course.isPublished) return { label: 'Publicado', className: 'statusPublished' };
  return { label: 'Borrador', className: 'statusDraft' };
}

function courseToFormData(course: CourseDTO): CourseFormData {
  return {
    title: course.title,
    shortDescription: course.shortDescription ?? '',
    description: course.description ?? '',
    categoryId: course.categoryId,
    level: course.level,
    price: String(course.price),
    previewVideoUrl: course.previewVideoUrl ?? '',
    durationMinutes: String(course.durationMinutes),
    requirements: (course.requirements ?? []).join('\n'),
    learningObjectives: (course.learningObjectives ?? []).join('\n'),
    isFree: course.isFree,
  };
}

export default function AdminCursos() {
  const [courses, setCourses] = useState<CourseDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [instructorFilter, setInstructorFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [detailCourse, setDetailCourse] = useState<CourseDTO | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formModalMode, setFormModalMode] = useState<'create' | 'edit'>('create');
  const [editingCourseId, setEditingCourseId] = useState<string | undefined>();
  const [editingFormData, setEditingFormData] = useState<CourseFormData | undefined>();
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const deleteIdRef = useRef<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [coursesData, categoriesData] = await Promise.all([
        getCourses({ includeDeleted: true }),
        getCategories(),
      ]);
      setCourses(coursesData);
      setCategories(categoriesData);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar datos';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Extract unique instructors from course data
  const instructors = useMemo(() => {
    const map = new Map<string, string>();
    courses.forEach((c) => {
      if (!map.has(c.instructorId)) {
        map.set(c.instructorId, c.instructorName);
      }
    });
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [courses]);

  const filtered = useMemo(() => {
    return courses.filter((course) => {
      // Search filter
      if (search && !course.title.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      // Category filter
      if (categoryFilter !== 'all' && course.categoryId !== categoryFilter) {
        return false;
      }
      // Instructor filter
      if (instructorFilter !== 'all' && course.instructorId !== instructorFilter) {
        return false;
      }
      // Status filter
      if (statusFilter === 'published' && (!course.isPublished || course.deletedAt)) {
        return false;
      }
      if (statusFilter === 'draft' && (course.isPublished || course.deletedAt)) {
        return false;
      }
      if (statusFilter === 'deleted' && !course.deletedAt) {
        return false;
      }
      // 'all' shows active courses only (published + draft)
      if (statusFilter === 'all' && course.deletedAt) {
        return false;
      }
      return true;
    });
  }, [search, categoryFilter, instructorFilter, statusFilter, courses]);

  async function handleConfirmDelete() {
    const id = deleteIdRef.current;
    if (!id) return;

    console.log('[Admin] Deleting course:', id);
    setDeletingId(id);
    try {
      await deleteCourse(id);
      console.log('[Admin] Delete success:', id);
      await fetchData();
      setDeleteTarget(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar';
      console.log('[Admin] Delete FAILED:', msg);
      alert(msg);
    } finally {
      setDeletingId(null);
    }
  }

  const statusTabs: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'published', label: 'Publicados' },
    { key: 'draft', label: 'Borradores' },
    { key: 'deleted', label: 'Eliminados' },
  ];

  function openCreate() {
    setFormModalMode('create');
    setEditingCourseId(undefined);
    setEditingFormData(undefined);
    setFormModalOpen(true);
  }

  function openEdit(course: CourseDTO) {
    setFormModalMode('edit');
    setEditingCourseId(course.id);
    setEditingFormData(courseToFormData(course));
    setFormModalOpen(true);
  }

  function openDetail(course: CourseDTO) {
    setDetailCourse(course);
  }

  function handleFormSaved(updated: CourseDTO) {
    setFormModalOpen(false);
    fetchData();
  }

  async function handlePublish(id: string) {
    setPublishingId(id);
    try {
      await publishCourse(id);
      await fetchData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al publicar';
      alert(msg);
    } finally {
      setPublishingId(null);
    }
  }

  async function handleUnpublish(id: string) {
    setPublishingId(id);
    try {
      await unpublishCourse(id);
      await fetchData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al despublicar';
      alert(msg);
    } finally {
      setPublishingId(null);
    }
  }

  // ─── Render ──────────────────────────────────────────────

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Cursos</h1>
          <p className={styles.subtitle}>Cargando cursos...</p>
        </div>
        <div className={styles.loadingState}>
          <RotateCw size={32} className={styles.spinner} />
          <p>Cargando cursos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Cursos</h1>
          <p className={styles.subtitle}>Error al cargar los cursos.</p>
        </div>
        <div className={styles.errorState}>
          <AlertCircle size={32} />
          <p>{error}</p>
          <button className={styles.retryBtn} onClick={fetchData}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Cursos</h1>
          <p className={styles.subtitle}>Gestioná todos los cursos de la plataforma.</p>
        </div>
        <button className={styles.createBtn} onClick={openCreate}>
          <Plus size={16} /> Crear curso
        </button>
      </div>

      {/* ── Filters row ── */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Buscar por título..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className={styles.filterSelect}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">Todas las categorías</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          className={styles.filterSelect}
          value={instructorFilter}
          onChange={(e) => setInstructorFilter(e.target.value)}
        >
          <option value="all">Todos los instructores</option>
          {instructors.map((inst) => (
            <option key={inst.id} value={inst.id}>
              {inst.name}
            </option>
          ))}
        </select>
      </div>

      {/* ── Status tabs ── */}
      <div className={styles.tabBar}>
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.filterTab} ${statusFilter === tab.key ? styles.filterTabActive : ''}`}
            onClick={() => setStatusFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Table ── */}
      <div className={styles.tableCard}>
        {filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <Ghost size={32} />
            <p>No se encontraron cursos con esos filtros.</p>
          </div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Curso</th>
                  <th>Categoría</th>
                  <th>Instructor</th>
                  <th>Estado</th>
                  <th>Precio</th>
                  <th>Estudiantes</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((course) => {
                  const status = statusInfo(course);
                  return (
                    <tr
                      key={course.id}
                      className={`${styles.cursorRow} ${course.deletedAt ? styles.rowDeleted : ''}`}
                      onClick={() => openDetail(course)}
                    >
                      <td className={styles.titleCell}>
                        <span className={styles.titleText}>{course.title}</span>
                      </td>
                      <td className={styles.catCell}>{course.categoryName}</td>
                      <td className={styles.instructorCell}>{course.instructorName}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles[status.className]}`}>
                          {status.label}
                          {course.deletedAt && course.deletedByName && (
                            <> por {course.deletedByName}</>
                          )}
                        </span>
                      </td>
                      <td className={styles.numCell}>
                        {course.isFree ? 'Gratis' : `$${course.price.toFixed(2)}`}
                      </td>
                      <td className={styles.numCell}>{course.studentsCount.toLocaleString()}</td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            className={styles.actionBtn}
                            title="Ver detalles"
                            onClick={(e) => { e.stopPropagation(); openDetail(course); }}
                          >
                            <Eye size={15} />
                          </button>
                          {!course.deletedAt && (
                            <>
                              <a
                                className={styles.actionBtn}
                                title="Currículum"
                                href={`/instructor/cursos/${course.id}/curriculum`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <BookOpen size={15} />
                              </a>
                              <button
                                className={styles.actionBtn}
                                title="Editar"
                                onClick={(e) => { e.stopPropagation(); openEdit(course); }}
                              >
                                <Edit size={15} />
                              </button>
                              {!course.isPublished && (
                                <button
                                  className={styles.actionBtn}
                                  title="Publicar"
                                  disabled={publishingId === course.id}
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    await handlePublish(course.id);
                                  }}
                                >
                                  <Send size={15} />
                                </button>
                              )}
                              {course.isPublished && (
                                <button
                                  className={styles.actionBtn}
                                  title="Despublicar"
                                  disabled={publishingId === course.id}
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    await handleUnpublish(course.id);
                                  }}
                                >
                                  <EyeOff size={15} />
                                </button>
                              )}
                              <button
                                className={`${styles.actionBtn} ${styles.actionDelete}`}
                                title="Eliminar"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteIdRef.current = course.id;
                                  setDeleteTarget({ id: course.id, title: course.title });
                                }}
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* ── Mobile list ── */}
            <div className={styles.mobileList}>
              {filtered.map((course) => {
                const status = statusInfo(course);
                return (
                  <div
                    key={course.id}
                    className={`${styles.mobileItem} ${course.deletedAt ? styles.rowDeleted : ''}`}
                    onClick={() => openDetail(course)}
                  >
                    <div className={styles.mobileItemHeader}>
                      <span className={styles.mobileTitle}>{course.title}</span>
                      <span className={`${styles.statusBadge} ${styles[status.className]}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className={styles.mobileItemBody}>
                      <span>{course.categoryName}</span>
                      <span>{course.instructorName}</span>
                      <span>{course.isFree ? 'Gratis' : `$${course.price.toFixed(2)}`}</span>
                      <span>{course.studentsCount.toLocaleString()} estudiantes</span>
                    </div>
                    <div className={styles.mobileItemActions}>
                      <button
                        className={styles.actionBtn}
                        onClick={(e) => { e.stopPropagation(); openDetail(course); }}
                      >
                        <Eye size={14} /> Ver
                      </button>
                      {!course.deletedAt && (
                        <>
                          <a
                            className={styles.actionBtn}
                            href={`/instructor/cursos/${course.id}/curriculum`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <BookOpen size={14} /> Currículum
                          </a>
                          <button
                            className={styles.actionBtn}
                            onClick={(e) => { e.stopPropagation(); openEdit(course); }}
                          >
                            <Edit size={14} /> Editar
                          </button>
                          {!course.isPublished && (
                            <button
                              className={styles.actionBtn}
                              disabled={publishingId === course.id}
                              onClick={async (e) => {
                                e.stopPropagation();
                                await handlePublish(course.id);
                              }}
                            >
                              <Send size={14} /> Publicar
                            </button>
                          )}
                          {course.isPublished && (
                            <button
                              className={styles.actionBtn}
                              disabled={publishingId === course.id}
                              onClick={async (e) => {
                                e.stopPropagation();
                                await handleUnpublish(course.id);
                              }}
                            >
                              <EyeOff size={14} /> Despublicar
                            </button>
                          )}
                          <button
                            className={`${styles.actionBtn} ${styles.actionDelete}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteIdRef.current = course.id;
                              setDeleteTarget({ id: course.id, title: course.title });
                            }}
                          >
                            <Trash2 size={14} /> Eliminar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
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

      <CourseDetailModal
        course={detailCourse}
        onClose={() => setDetailCourse(null)}
        onEdit={openEdit}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
        onDelete={(course) => {
          setDetailCourse(null);
          deleteIdRef.current = course.id;
          setDeleteTarget({ id: course.id, title: course.title });
        }}
        publishingId={publishingId}
      />

      <CourseFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        mode={formModalMode}
        courseId={editingCourseId}
        initialData={editingFormData}
        onSaved={handleFormSaved}
      />
    </div>
  );
}
