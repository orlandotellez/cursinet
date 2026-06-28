'use client'

import { Award, BookOpen, Clock, Flame } from 'lucide-react';
import { SkeletonBase } from '@/src/shared/skeleton';
import styles from './StatsCards.module.css';

interface StudentStats {
  completed: number;
  lessonsDone: number;
  totalHours: number;
  streak: number;
}

interface StatsCardsProps {
  stats: StudentStats;
  loading?: boolean;
}

const icons = [Award, BookOpen, Clock, Flame];

const labels = [
  'Cursos\ncompletados',
  'Lecciones\ncompletadas',
  'Horas\ntotales',
  'Días\nseguidos',
];

export function StatsCards({ stats, loading }: StatsCardsProps) {
  if (loading) {
    return (
      <section className={styles.section}>
        <SkeletonBase width={140} height={18} style={{ marginBottom: 16 }} />
        <div className={styles.grid}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.card}>
              <SkeletonBase width={40} height={40} borderRadius={8} style={{ marginBottom: 8 }} />
              <SkeletonBase width={48} height={28} />
              <SkeletonBase width={80} height={16} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  const values = [stats.completed, stats.lessonsDone, `${stats.totalHours}h`, stats.streak];

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Tu progreso</h2>
      <div className={styles.grid}>
        {values.map((value, i) => {
          const Icon = icons[i];
          return (
            <div key={labels[i]} className={styles.card}>
              <div className={styles.iconWrapper}>
                <Icon size={20} />
              </div>
              <div className={styles.value}>{value}</div>
              <div className={styles.label}>{labels[i]}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
