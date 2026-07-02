import { api } from '../lib/client';

export interface ChartPointDto {
  label: string;
  value: number;
}

export interface InstructorKpiDto {
  label: string;
  value: string;
  changePercent: number;
  trend: 'up' | 'down';
}

export interface RecentActivityDto {
  action: string;
  courseName: string;
  studentName: string;
  timestamp: string;
}

export interface InstructorDashboardRaw {
  kpis: InstructorKpiDto[];
  revenuePoints: ChartPointDto[];
  studentPoints: ChartPointDto[];
  recentActivity: RecentActivityDto[];
}

export interface InstructorDashboardData {
  kpis: { label: string; value: string; change: number; icon: string }[];
  revenueChart: ChartPointDto[];
  studentsChart: ChartPointDto[];
  recentActivity: RecentActivityDto[];
}

const kpiIcon = (label: string): string => {
  if (label.includes('Estudiante')) return 'Users';
  if (label.includes('Ingreso')) return 'DollarSign';
  if (label.includes('Curso')) return 'BookOpen';
  if (label.includes('Rating')) return 'Star';
  return 'BarChart3';
};

const toDashboardData = (raw: InstructorDashboardRaw): InstructorDashboardData => ({
  kpis: raw.kpis.map((k) => ({
    label: k.label,
    value: k.value,
    change: k.changePercent,
    icon: kpiIcon(k.label),
  })),
  revenueChart: raw.revenuePoints,
  studentsChart: raw.studentPoints,
  recentActivity: raw.recentActivity,
});

export async function getInstructorDashboard(range = '30d'): Promise<InstructorDashboardData> {
  const raw = await api.get<InstructorDashboardRaw>(`/instructor/dashboard?range=${range}`);
  return toDashboardData(raw);
}
