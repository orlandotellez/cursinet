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
  categoryId: string;
  categoryName: string;
  courseCount: number;
}

export interface AnalyticsRaw {
  mrr: number;
  arr: number;
  growthPercent: number;
  revenuePoints: ChartPointDto[];
  studentPoints?: ChartPointDto[];
  usersByRole: UsersByRoleDto;
  coursesByCategory: CategoryCourseCountDto[];
}

export interface DashboardKpi {
  label: string;
  value: string;
  change: number;
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
  monthlyStudents: { month: string; count: number }[];
  usersByRole: { role: string; count: number }[];
  coursesByCategory: { categoryId: string; categoryName: string; count: number }[];
}

export interface NotificationPreferenceDTO {
  id: string;
  courseUpdates: boolean;
  newContent: boolean;
  comments: boolean;
  marketing: boolean;
  updatedAt: string;
}

export interface UpdateNotificationPreferencePayload {
  courseUpdates?: boolean;
  newContent?: boolean;
  comments?: boolean;
  marketing?: boolean;
}
