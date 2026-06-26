'use client'

import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { FilterTabs } from '@/src/features/courses/mycourses/FilterTabs';
import { EnrolledCard } from '@/src/features/courses/mycourses/EnrolledCard';
import { useEnrollmentStore } from '@/src/shared/store/useEnrollmentStore';
import { useBookmarkStore } from '@/src/shared/store/useBookmarkStore';
import styles from './page.module.css';

type Filter = 'all' | 'in-progress' | 'completed';

export default function MisCursosPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const { enrollments, loadMyEnrollments, isLoading } = useEnrollmentStore();
  const loadBookmarks = useBookmarkStore((s) => s.loadBookmarks);

  useEffect(() => {
    loadMyEnrollments();
    loadBookmarks();
  }, [loadMyEnrollments, loadBookmarks]);

  const filtered = enrollments.filter((e) => {
    if (filter === 'in-progress') return e.progress > 0 && e.progress < 100;
    if (filter === 'completed') return e.progress === 100;
    return true;
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Mis Cursos</h1>
        <span className={styles.count}>{enrollments.length} cursos</span>
      </div>

      <FilterTabs active={filter} onChange={setFilter} />

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <BookOpen size={48} />
          <p>No hay cursos en esta categoría</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((enr) => (
            <EnrolledCard key={enr.id} enrollment={enr} />
          ))}
        </div>
      )}
    </div>
  );
}
