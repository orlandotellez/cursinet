'use client';

import { useState } from 'react';
import { Edit, Trash2, Search } from 'lucide-react';
import { allCourseCards } from '@/src/features/courses/data';
import CourseFormModal from '@/src/features/courses/components/CourseFormModal';
import type { CourseCardData, CourseStatus } from '@/src/shared/types';
import type { CourseFormData } from '@/src/features/courses/components/CourseFormModal';
import styles from './page.module.css';

const statusConfig: Record<CourseStatus, { label: string; className: string }> = {
  published: { label: 'Publicado', className: 'statusPublished' },
  draft: { label: 'Borrador', className: 'statusDraft' },
  pending: { label: 'Pendiente', className: 'statusPending' },
  rejected: { label: 'Rechazado', className: 'statusRejected' },
};

function courseToFormData(course: CourseCardData): CourseFormData {
  return {
    title: course.title,
    slug: course.slug,
    shortDescription: course.shortDescription,
    category: course.category.name,
    level: course.level,
    price: String(course.price),
    tags: '',
  };
}

export default function InstructorCursos() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<CourseStatus | 'all'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingFormData, setEditingFormData] = useState<CourseFormData | undefined>();

  const filtered = allCourseCards.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || c.status === filter;
    return matchesSearch && matchesFilter;
  });

  function handleOpenCreate() {
    setModalMode('create');
    setEditingFormData(undefined);
    setModalOpen(true);
  }

  function handleOpenEdit(course: CourseCardData) {
    setModalMode('edit');
    setEditingFormData(courseToFormData(course));
    setModalOpen(true);
  }

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
            {(['all', 'published', 'draft', 'pending'] as const).map((t) => (
              <button
                key={t}
                className={`${styles.tab} ${filter === t ? styles.tabActive : ''}`}
                onClick={() => setFilter(t)}
              >
                {t === 'all' ? 'Todos' : statusConfig[t].label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Curso</th>
                <th>Estado</th>
                <th>Estudiantes</th>
                <th>Rating</th>
                <th>Precio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((course) => (
                <tr key={course.id}>
                  <td className={styles.titleCell}>
                    <span className={styles.titleText}>{course.title}</span>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[statusConfig[course.status || 'draft'].className]}`}>
                      {statusConfig[course.status || 'draft'].label}
                    </span>
                  </td>
                  <td className={styles.numCell}>{course.studentsCount.toLocaleString()}</td>
                  <td className={styles.numCell}>{course.rating}</td>
                  <td className={styles.numCell}>${course.price.toFixed(2)}</td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        onClick={() => handleOpenEdit(course)}
                        className={styles.actionBtn}
                        title="Editar"
                      >
                        <Edit size={15} />
                      </button>
                      <button className={`${styles.actionBtn} ${styles.actionDelete}`} title="Eliminar">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.mobileList}>
            {filtered.map((course) => (
              <div key={course.id} className={styles.mobileCard}>
                <div className={styles.mobileCardHeader}>
                  <span className={styles.mobileTitle}>{course.title}</span>
                  <span className={`${styles.statusBadge} ${styles[statusConfig[course.status || 'draft'].className]}`}>
                    {statusConfig[course.status || 'draft'].label}
                  </span>
                </div>
                <div className={styles.mobileCardBody}>
                  <span>Estudiantes: {course.studentsCount.toLocaleString()}</span>
                  <span>Rating: {course.rating}</span>
                  <span>${course.price.toFixed(2)}</span>
                </div>
                <div className={styles.mobileCardActions}>
                  <button onClick={() => handleOpenEdit(course)} className={styles.actionBtn}>
                    <Edit size={15} /> Editar
                  </button>
                  <button className={`${styles.actionBtn} ${styles.actionDelete}`}>
                    <Trash2 size={15} /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CourseFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        initialData={editingFormData}
      />
    </>
  );
}
