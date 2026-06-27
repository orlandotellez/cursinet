import type { ActivityDay } from '@/src/shared/types';

export const activityData: ActivityDay[] = Array.from({ length: 365 }, (_, i) => {
  const d = new Date(2025, 5, 1);
  d.setDate(d.getDate() + i);
  const dateStr = d.toISOString().split('T')[0];
  const count = Math.random() > 0.6 ? Math.floor(Math.random() * 8) : 0;
  return { date: dateStr, count };
});
