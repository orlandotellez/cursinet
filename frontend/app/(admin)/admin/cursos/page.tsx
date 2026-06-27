'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Eye, Edit, Trash2, Ghost, AlertCircle, Plus, Send, EyeOff, BookOpen } from 'lucide-react';
import { Spinner } from '@/src/shared/components/Spinner';
import { useCourseCrud, type StatusFilter } from '@/src/features/admin/hooks/useCourseCrud';
import { ConfirmDialog } from '@/src/shared/components/ConfirmDialog';
import CourseFormModal from '@/src/features/courses/components/CourseFormModal';
import { courseToFormData } from '@/src/features/courses/utils/courseToFormData';
import CourseDetailModal from './CourseDetailModal';
import styles from './page.module.css';
import type { CourseDTO } from '@/src/shared/api/courses';
import type { CourseFormData } from '@/src/features/courses/components/CourseFormModal';

function statusInfo(course: CourseDTO): { label: string; className: string } {
  if (course.deletedAt) return { label: 'Eliminado', className: 'statusRejected' };
  if (course.isPublished) return { label: 'Publicado', className: 'statusPublished' };
  return { label: 'Borrador', className: 'statusDraft' };
}

const statusTabs: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'published', label: 'Publicados' },
  { key: 'draft', label: 'Borradores' },
  { key: 'deleted', label: 'Eliminados' },
];

export default function AdminCursos() {
  const crud = useCourseCrud();
  const [detailCourse, setDetailCourse] = useState<CourseDTO | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formModalMode, setFormModalMode] = useState<'create' | 'edit'>('create');
  const [editingCourseId, setEditingCourseId] = useState<string | undefined>();
  const [editingFormData, setEditingFormData] = useState<CourseFormData | undefined>();

  useEffect(() => {
    crud.fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Extract unique instructors
  const instructors = useMemo(() => {
    const map = new Map<string, string>();
    crud.courses.forEach((c) => {
      if (!map.has(c.instructorId)) map.set(c.instructorId, c.instructorName);
    });
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [crud.courses]);

  const filtered = useMemo(() => {
    return crud.courses.filter((course) => {
      if (crud.search && !course.title.toLowerCase().includes(crud.search.toLowerCase())) return false;
      if (crud.categoryFilter !== 'all' && course.categoryId !== crud.categoryFilter) return false;
      if (crud.instructorFilter !== 'all' && course.instructorId !== crud.instructorFilter) return false;
      if (crud.statusFilter === 'published' && (!course.isPublished || course.deletedAt)) return false;
      if (crud.statusFilter === 'draft' && (course.isPublished || course.deletedAt)) return false;
      if (crud.statusFilter === 'deleted' && !course.deletedAt) return false;
      if (crud.statusFilter === 'all' && course.deletedAt) return false;
      return true;
    });
  }, [crud.courses, crud.search, crud.categoryFilter, crud.instructorFilter, crud.statusFilter]);

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

  function handleFormSaved(updated: CourseDTO) {
    setFormModalOpen(false);
    crud.fetchData();
  }

  // ─── Render ──

  if (crud.loading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Cursos</h1>
          <p className={styles.subtitle}>Cargando cursos...</p>
        </div>
        <div className={styles.loadingState}>
          <Spinner size="lg" className={styles.spinner} />
          <p>Cargando cursos...</p>
        </div>
      </div>
    );
  }

  if (crud.error) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Cursos</h1>
          <p className={styles.subtitle}>Error al cargar los cursos.</p>
        </div>
        <div className={styles.errorState}>
          <AlertCircle size={32} />
          <p>{crud.error}</p>
          <button className={styles.retryBtn} onClick={crud.fetchData}>Reintentar</button>
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

      {/* Filters */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Buscar por título..."
            value={crud.search}
            onChange={(e) => crud.setSearch(e.target.value)}
          />
        </div>
        <select className={styles.filterSelect} value={crud.categoryFilter} onChange={(e) => crud.setCategoryFilter(e.target.value)}>
          <option value="all">Todas las categorías</option>
          {crud.categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <select className={styles.filterSelect} value={crud.instructorFilter} onChange={(e) => crud.setInstructorFilter(e.target.value)}>
          <option value="all">Todos los instructores</option>
          {instructors.map((inst) => (
            <option key={inst.id} value={inst.id}>{inst.name}</option>
          ))}
        </select>
      </div>

      {/* Status tabs */}
      <div className={styles.tabBar}>
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.filterTab} ${crud.statusFilter === tab.key ? styles.filterTabActive : ''}`}
            onClick={() => crud.setStatusFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
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
                    <tr key={course.id} className={`${styles.cursorRow} ${course.deletedAt ? styles.rowDeleted : ''}`} onClick={() => setDetailCourse(course)}>
                      <td className={styles.titleCell}><span className={styles.titleText}>{course.title}</span></td>
                      <td className={styles.catCell}>{course.categoryName}</td>
                      <td className={styles.instructorCell}>{course.instructorName}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles[status.className]}`}>
                          {status.label}{course.deletedAt && course.deletedByName && <> por {course.deletedByName}</>}
                        </span>
                      </td>
                      <td className={styles.numCell}>{course.isFree ? 'Gratis' : `$${course.price.toFixed(2)}`}</td>
                      <td className={styles.numCell}>{course.studentsCount.toLocaleString()}</td>
                      <td>
                        <div className={styles.actions}>
                          <button className={styles.actionBtn} title="Ver detalles" onClick={(e) => { e.stopPropagation(); setDetailCourse(course); }}><Eye size={15} /></button>
                          {!course.deletedAt && (
                            <>
                              <a className={styles.actionBtn} title="Currículum" href={`/instructor/cursos/${course.id}/curriculum`} onClick={(e) => e.stopPropagation()}><BookOpen size={15} /></a>
                              <button className={styles.actionBtn} title="Editar" onClick={(e) => { e.stopPropagation(); openEdit(course); }}><Edit size={15} /></button>
                              {!course.isPublished && (
                                <button className={styles.actionBtn} title="Publicar" disabled={crud.publishingId === course.id} onClick={async (e) => { e.stopPropagation(); await crud.handlePublish(course.id); }}><Send size={15} /></button>
                              )}
                              {course.isPublished && (
                                <button className={styles.actionBtn} title="Despublicar" disabled={crud.publishingId === course.id} onClick={async (e) => { e.stopPropagation(); await crud.handleUnpublish(course.id); }}><EyeOff size={15} /></button>
                              )}
                              <button className={`${styles.actionBtn} ${styles.actionDelete}`} title="Eliminar" onClick={(e) => { e.stopPropagation(); crud.confirmDelete(course.id, course.title); }}><Trash2 size={15} /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {/* Mobile list */}
            <div className={styles.mobileList}>
              {filtered.map((course) => {
                const status = statusInfo(course);
                return (
                  <div key={course.id} className={`${styles.mobileItem} ${course.deletedAt ? styles.rowDeleted : ''}`} onClick={() => setDetailCourse(course)}>
                    <div className={styles.mobileItemHeader}>
                      <span className={styles.mobileTitle}>{course.title}</span>
                      <span className={`${styles.statusBadge} ${styles[status.className]}`}>{status.label}</span>
                    </div>
                    <div className={styles.mobileItemBody}>
                      <span>{course.categoryName}</span>
                      <span>{course.instructorName}</span>
                      <span>{course.isFree ? 'Gratis' : `$${course.price.toFixed(2)}`}</span>
                      <span>{course.studentsCount.toLocaleString()} estudiantes</span>
                    </div>
                    <div className={styles.mobileItemActions}>
                      <button className={styles.actionBtn} onClick={(e) => { e.stopPropagation(); setDetailCourse(course); }}><Eye size={14} /> Ver</button>
                      {!course.deletedAt && (
                        <>
                          <a className={styles.actionBtn} href={`/instructor/cursos/${course.id}/curriculum`} onClick={(e) => e.stopPropagation()}><BookOpen size={14} /> Currículum</a>
                          <button className={styles.actionBtn} onClick={(e) => { e.stopPropagation(); openEdit(course); }}><Edit size={14} /> Editar</button>
                          {!course.isPublished && <button className={styles.actionBtn} disabled={crud.publishingId === course.id} onClick={async (e) => { e.stopPropagation(); await crud.handlePublish(course.id); }}><Send size={14} /> Publicar</button>}
                          {course.isPublished && <button className={styles.actionBtn} disabled={crud.publishingId === course.id} onClick={async (e) => { e.stopPropagation(); await crud.handleUnpublish(course.id); }}><EyeOff size={14} /> Despublicar</button>}
                          <button className={`${styles.actionBtn} ${styles.actionDelete}`} onClick={(e) => { e.stopPropagation(); crud.confirmDelete(course.id, course.title); }}><Trash2 size={14} /> Eliminar</button>
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
        open={!!crud.deleteTarget}
        title="Eliminar curso"
        message={crud.deleteTarget ? `¿Estás seguro de que querés eliminar "${crud.deleteTarget.title}"? Esta acción no se puede deshacer.` : ''}
        confirmLabel={crud.deletingId === crud.deleteTarget?.id ? 'Eliminando...' : 'Eliminar'}
        loading={crud.deletingId === crud.deleteTarget?.id}
        onConfirm={crud.handleConfirmDelete}
        onCancel={crud.cancelDelete}
      />

      <CourseDetailModal
        course={detailCourse}
        onClose={() => setDetailCourse(null)}
        onEdit={openEdit}
        onPublish={crud.handlePublish}
        onUnpublish={crud.handleUnpublish}
        onDelete={(course) => { setDetailCourse(null); crud.confirmDelete(course.id, course.title); }}
        publishingId={crud.publishingId}
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
