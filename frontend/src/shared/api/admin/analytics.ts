import { api } from '../lib/client';
import type { DashboardRaw, DashboardData, AnalyticsRaw, AnalyticsData } from '../types';

function kpiIcon(label: string): string {
  if (label.includes('Usuario')) return 'Users';
  if (label.includes('MRR')) return 'DollarSign';
  if (label.includes('Curso')) return 'BookOpen';
  if (label.includes('Venta')) return 'TrendingUp';
  return 'BarChart3';
}

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
    monthlyRevenue: raw.revenuePoints.map((m) => ({
      month: m.label,
      revenue: m.value,
    })),
    monthlyStudents: (raw.studentPoints ?? []).map((m) => ({
      month: m.label,
      count: m.value,
    })),
    usersByRole: roles,
    coursesByCategory: raw.coursesByCategory.map((c) => ({
      categoryId: c.categoryId,
      categoryName: c.categoryName,
      count: c.courseCount,
    })),
  };
}

export async function getDashboard(range = '30d'): Promise<DashboardData> {
  const raw = await api.get<DashboardRaw>(`/admin/dashboard?range=${range}`);
  return toDashboardData(raw);
}

export async function getAnalytics(range = '1a', categoryId?: string, revenueCategoryId?: string): Promise<AnalyticsData> {
  const params = new URLSearchParams({ range });
  if (categoryId) params.set('categoryId', categoryId);
  if (revenueCategoryId) params.set('revenueCategoryId', revenueCategoryId);
  const raw = await api.get<AnalyticsRaw>(`/admin/analytics?${params}`);
  return toAnalyticsData(raw);
}
