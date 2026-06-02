'use client'

import { Award, BookOpen, Clock, Flame } from 'lucide-react';
import styles from './StatsCards.module.css';

interface StudentStats {
  completed: number;
  lessonsDone: number;
  totalHours: number;
  streak: number;
}

interface StatsCardsProps {
  stats: StudentStats;
}

const icons = [Award, BookOpen, Clock, Flame];

const labels = [
  'Cursos\ncompletados',
  'Lecciones\ncompletadas',
  'Horas\ntotales',
  'Días\nseguidos',
];

export function StatsCards({ stats }: StatsCardsProps) {
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
