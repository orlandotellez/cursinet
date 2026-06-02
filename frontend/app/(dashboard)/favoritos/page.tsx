'use client'

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { featuredCourses } from '@/src/features/courses/data';
import type { CourseCardData } from '@/src/shared/types';
import { FavoriteCard } from '@/src/features/courses/favorites/FavoriteCard';
import styles from './page.module.css';

export default function FavoritosPage() {
  const [favorites, setFavorites] = useState<CourseCardData[]>(featuredCourses);

  const removeFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((c) => c.id !== id));
  };

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
              onRemove={removeFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
