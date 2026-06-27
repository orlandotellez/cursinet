import type { Stat } from '@/src/shared/types';

export const stats: Stat[] = [
  { value: '12K+', label: 'Estudiantes activos' },
  { value: '320+', label: 'Cursos' },
  { value: '4.9 ★', label: 'Rating promedio' },
  { value: '95%', label: 'Tasa de completitud' },
];

export const studentStats = {
  completed: 4,
  lessonsDone: 178,
  totalHours: 64,
  streak: 12,
  currentStreak: 5,
};
