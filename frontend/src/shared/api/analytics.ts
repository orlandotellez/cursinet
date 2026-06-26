import { API_URL } from '../lib/constants';
import { authedFetch } from '../lib/api';

// ─── Raw types matching the actual API response (camelCase) ────────────

export interface KpiDto {
  label: string;
  value: string;
  changePercent: number;
  trend: 'up' | 'down';
}

export interface ChartPointDto {
  label: string;
  value: number;
}

export interface DashboardUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface DashboardRaw {
  kpis: KpiDto[];
  revenuePoints: ChartPointDto[];
  studentPoints: ChartPointDto[];
  recentUsers: DashboardUser[];
}

export interface UsersByRoleDto {
  students: number;
  instructors: number;
  admins: number;
  moderators: number;
  total: number;
}

export interface CategoryCourseCountDto {
  categoryName: string;
  courseCount: number;
}

export interface AnalyticsRaw {
  mrr: number;
  arr: number;
  growthPercent: number;
  revenuePoints: ChartPointDto[];
  usersByRole: UsersByRoleDto;
  coursesByCategory: CategoryCourseCountDto[];
}

// ─── Convenience types for the UI ───────────────────────────────────────

export interface DashboardKpi {
  label: string;
  value: string;
  change: number;
  /** Lucide icon name — derived from label */
  icon: string;
}

export interface ChartPoint {
  label: string;
  value: number;
}

export interface DashboardData {
  kpis: DashboardKpi[];
  revenueChart: ChartPoint[];
  studentsChart: ChartPoint[];
  recentUsers: DashboardUser[];
}

export interface AnalyticsData {
  mrr: number;
  arr: number;
  growth: number;
  monthlyRevenue: { month: string; revenue: number }[];
  /** Flattened as { role, count }[] from the backend object */
  usersByRole: { role: string; count: number }[];
  coursesByCategory: { categoryName: string; count: number }[];
}

// ─── Icon mapper (backend doesn't send icon names) ──────────────────────

function kpiIcon(label: string): string {
  if (label.includes('Usuario')) return 'Users';
  if (label.includes('MRR')) return 'DollarSign';
  if (label.includes('Curso')) return 'BookOpen';
  if (label.includes('Venta')) return 'TrendingUp';
  return 'BarChart3';
}

// ─── Transformers ───────────────────────────────────────────────────────

function toDashboardData(raw: DashboardRaw): DashboardData {
  return {
    kpis: raw.kpis.map((k) => ({
      label: k.label,
      value: k.value,
      change: k.changePercent,
      icon: kpiIcon(k.label),
    })),
    revenueChart: raw.revenuePoints,
    studentsChart: raw.studentPoints,
    recentUsers: raw.recentUsers,
  };
}

function toAnalyticsData(raw: AnalyticsRaw): AnalyticsData {
  const { usersByRole } = raw;

  const roles = [
    { role: 'Student', count: usersByRole.students },
    { role: 'Instructor', count: usersByRole.instructors },
    { role: 'Admin', count: usersByRole.admins },
    { role: 'Moderator', count: usersByRole.moderators },
  ].filter((r) => r.count > 0);

  return {
    mrr: raw.mrr,
    arr: raw.arr,
    growth: raw.growthPercent,
    monthlyRevenue: raw.revenuePoints.map((m) => ({ month: m.label, revenue: m.value })),
    usersByRole: roles,
    coursesByCategory: raw.coursesByCategory.map((c) => ({
      categoryName: c.categoryName,
      count: c.courseCount,
    })),
  };
}

// ─── API functions ─────────────────────────────────────────────────────────

export async function getDashboard(range = '30d'): Promise<DashboardData> {
  const res = await authedFetch(`${API_URL}/admin/dashboard?range=${range}`, {
    credentials: 'include',
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: 'Error al obtener dashboard' }));
    throw new Error(body.detail || body.title || 'Error al obtener dashboard');
  }
  const raw: DashboardRaw = await res.json();
  return toDashboardData(raw);
}

export async function getAnalytics(range = '1a'): Promise<AnalyticsData> {
  const res = await authedFetch(`${API_URL}/admin/analytics?range=${range}`, {
    credentials: 'include',
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: 'Error al obtener analytics' }));
    throw new Error(body.detail || body.title || 'Error al obtener analytics');
  }
  const raw: AnalyticsRaw = await res.json();
  return toAnalyticsData(raw);
}
