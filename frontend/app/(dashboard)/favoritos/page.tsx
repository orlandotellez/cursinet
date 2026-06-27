'use client'

import { useEffect } from 'react';
import { Heart } from 'lucide-react';
import type { CourseCardData } from '@/src/shared/types';
import { FavoriteCard } from '@/src/features/courses/favorites/FavoriteCard';
import { useBookmarkStore } from '@/src/shared/store/useBookmarkStore';
import { FavoritosSkeleton } from './loading';
import styles from './page.module.css';

export default function FavoritosPage() {
  const { bookmarks, isLoading, loadBookmarks, getFavoriteCourses, toggleBookmark } = useBookmarkStore();

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const favorites: CourseCardData[] = getFavoriteCourses();

  const handleRemove = (id: string) => {
    toggleBookmark(id);
  };

  if (isLoading) return <FavoritosSkeleton />;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Favoritos</h1>
        <span className={styles.count}>
          {favorites.length} curso{favorites.length !== 1 ? 's' : ''}
        </span>
      </div>

      {favorites.length === 0 ? (
        <div className={styles.empty}>
          <Heart size={48} />
          <h3 className={styles.emptyTitle}>No tienes favoritos</h3>
          <p className={styles.emptyText}>
            Guarda tus cursos favoritos para acceder rápidamente.
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {favorites.map((course) => (
            <FavoriteCard
              key={course.id}
              course={course}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}
