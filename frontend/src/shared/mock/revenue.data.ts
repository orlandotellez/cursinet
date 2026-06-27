import type { RevenuePoint, InstructorKpi, AdminKpi } from '@/src/shared/types';

export const instructorKpis: InstructorKpi[] = [
  { label: 'Estudiantes', value: '23,100', change: 12.5, icon: 'Users' },
  { label: 'Ingresos', value: '$124,500', change: 8.3, icon: 'DollarSign' },
  { label: 'Cursos', value: '12', change: 25, icon: 'BookOpen' },
  { label: 'Rating', value: '4.8', change: 0.2, icon: 'Star' },
];

export const instructorRevenue: RevenuePoint[] = [
  { month: 'Jun', revenue: 8200, students: 340 },
  { month: 'Jul', revenue: 9100, students: 380 },
  { month: 'Ago', revenue: 8700, students: 360 },
  { month: 'Sep', revenue: 10200, students: 420 },
  { month: 'Oct', revenue: 11500, students: 470 },
  { month: 'Nov', revenue: 10800, students: 450 },
  { month: 'Dic', revenue: 14200, students: 580 },
  { month: 'Ene', revenue: 12500, students: 510 },
  { month: 'Feb', revenue: 11800, students: 490 },
  { month: 'Mar', revenue: 13500, students: 540 },
  { month: 'Abr', revenue: 12800, students: 520 },
  { month: 'May', revenue: 14100, students: 560 },
];

export const adminKpis: AdminKpi[] = [
  { label: 'Usuarios totales', value: '18,432', change: 15.3, icon: 'Users' },
  { label: 'MRR', value: '$89,420', change: 12.1, icon: 'DollarSign' },
  { label: 'Cursos activos', value: '324', change: 8.7, icon: 'BookOpen' },
  { label: 'Ventas del mes', value: '2,847', change: 22.4, icon: 'TrendingUp' },
];

export const adminRevenue: RevenuePoint[] = instructorRevenue.map((r) => ({
  ...r,
  revenue: r.revenue * 8,
  students: r.students * 6,
}));
