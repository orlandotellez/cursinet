'use client';

import { useState, useMemo } from 'react';
import { Search, Eye, Trash2 } from 'lucide-react';
import { allCourseCards } from '@/src/features/courses/data';
import type { CourseStatus } from '@/src/shared/types';
import styles from './page.module.css';

const statusTabs: { key: 'all' | CourseStatus; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'published', label: 'Publicados' },
  { key: 'pending', label: 'Pendientes' },
  { key: 'rejected', label: 'Rechazados' },
];

const statusConfig: Record<CourseStatus, { label: string; className: string }> = {
  published: { label: 'Publicado', className: 'statusPublished' },
  draft: { label: 'Borrador', className: 'statusDraft' },
  pending: { label: 'Pendiente', className: 'statusPending' },
  rejected: { label: 'Rechazado', className: 'statusRejected' },
};

export default function AdminCursos() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | CourseStatus>('all');

  const filtered = useMemo(() => {
    return allCourseCards.filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Cursos</h1>
        <p className={styles.subtitle}>Gestioná todos los cursos de la plataforma.</p>
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
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              className={`${styles.tab} ${statusFilter === tab.key ? styles.tabActive : ''}`}
              onClick={() => setStatusFilter(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.tableCard}>
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
            {filtered.map((course) => (
              <tr key={course.id}>
                <td className={styles.titleCell}>
                  <span className={styles.titleText}>{course.title}</span>
                </td>
                <td className={styles.catCell}>{course.category.name}</td>
                <td className={styles.instructorCell}>{course.instructor.name}</td>
                <td>
                  <span className={`${styles.statusBadge} ${styles[statusConfig[course.status || 'draft'].className]}`}>
                    {statusConfig[course.status || 'draft'].label}
                  </span>
                </td>
                <td className={styles.numCell}>${course.price.toFixed(2)}</td>
                <td className={styles.numCell}>{course.studentsCount.toLocaleString()}</td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.actionBtn} title="Ver">
                      <Eye size={15} />
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
            <div key={course.id} className={styles.mobileItem}>
              <div className={styles.mobileItemHeader}>
                <span className={styles.mobileTitle}>{course.title}</span>
                <span className={`${styles.statusBadge} ${styles[statusConfig[course.status || 'draft'].className]}`}>
                  {statusConfig[course.status || 'draft'].label}
                </span>
              </div>
              <div className={styles.mobileItemBody}>
                <span>{course.category.name}</span>
                <span>{course.instructor.name}</span>
                <span>${course.price.toFixed(2)}</span>
                <span>{course.studentsCount.toLocaleString()} estudiantes</span>
              </div>
              <div className={styles.mobileItemActions}>
                <button className={styles.actionBtn}><Eye size={14} /> Ver</button>
                <button className={`${styles.actionBtn} ${styles.actionDelete}`}><Trash2 size={14} /> Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
