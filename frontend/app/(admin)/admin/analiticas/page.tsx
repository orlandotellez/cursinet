'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ArrowUp,
  ArrowDown,
  Users,
  DollarSign,
  BookOpen,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { LineChart } from '@/src/shared/components/LineChart';
import { getAnalytics, getDashboard } from '@/src/shared/api/admin';
import type { AnalyticsData, DashboardData } from '@/src/shared/api/admin';
import styles from './page.module.css';

type TimeRange = '7d' | '30d' | '12s' | '1a';

const rangeOptions: { key: TimeRange; label: string }[] = [
  { key: '7d', label: '7 días' },
  { key: '30d', label: '30 días' },
  { key: '12s', label: '12 semanas' },
  { key: '1a', label: '1 año' },
];

const rangeLabel: Record<TimeRange, string> = {
  '7d': 'Últimos 7 días',
  '30d': 'Últimos 30 días',
  '12s': 'Últimas 12 semanas',
  '1a': 'Último año',
};

const rangeTotalLabel: Record<TimeRange, string> = {
  '7d': 'Total 7 días',
  '30d': 'Total 30 días',
  '12s': 'Total 12 semanas',
  '1a': 'Total anual',
};

const iconMap: Record<string, React.ReactNode> = {
  Users: <Users size={20} />,
  DollarSign: <DollarSign size={20} />,
  BookOpen: <BookOpen size={20} />,
  TrendingUp: <TrendingUp size={20} />,
};

/* ───────────────────────────────────────────
   Componente principal
   ─────────────────────────────────────────── */

export default function AdminAnaliticas() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<TimeRange>('1a');
  const [studentCategoryId, setStudentCategoryId] = useState<string>('');
  const [revenueCategoryId, setRevenueCategoryId] = useState<string>('');

  const fetchData = useCallback(async (r: TimeRange, catId?: string, revCatId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsResult, dashResult] = await Promise.all([
        getAnalytics(r, catId, revCatId),
        getDashboard(r),
      ]);
      setData(analyticsResult);
      setDashboardData(dashResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(range, studentCategoryId || undefined, revenueCategoryId || undefined);
  }, [range, studentCategoryId, revenueCategoryId, fetchData]);

  /* ─── Loading ─── */
  if (loading && !data) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Analíticas</h1>
        <p className={styles.subtitle}>Cargando datos...</p>
      </div>
    );
  }

  /* ─── Error ─── */
  if (error) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Analíticas</h1>
        <p className={styles.subtitle} style={{ color: 'var(--error)' }}>
          {error}
        </p>
      </div>
    );
  }

  if (!data) return null;

  const {
    mrr,
    arr,
    growth,
    monthlyRevenue,
    monthlyStudents,
    usersByRole,
    coursesByCategory,
  } = data;

  const totalRevenue = monthlyRevenue.reduce((sum, r) => sum + r.revenue, 0);
  const totalStudents = monthlyStudents.reduce((sum, s) => sum + s.count, 0);

  const categoriesWithCourses = coursesByCategory.filter((c) => c.count > 0);

  const maxCatCount =
    coursesByCategory.length > 0
      ? Math.max(...coursesByCategory.map((c) => c.count))
      : 0;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Analíticas</h1>
      <p className={styles.subtitle}>Métricas detalladas de la plataforma.</p>
      {/* Dashboard KPIs */}
      {dashboardData && dashboardData.kpis.length > 0 && (
        <div className={styles.kpiGrid}>
          {dashboardData.kpis.map((kpi) => (
            <div key={kpi.label} className={styles.kpiCard}>
              <div className={styles.kpiHeader}>
                <span className={styles.kpiIcon}>{iconMap[kpi.icon] || <BarChart3 size={20} />}</span>
                <span
                  className={`${styles.kpiChange} ${kpi.change >= 0 ? styles.changePositive : styles.changeNegative}`}
                >
                  {kpi.change >= 0 ? (
                    <ArrowUp size={14} />
                  ) : (
                    <ArrowDown size={14} />
                  )}
                  {Math.abs(kpi.change)}%
                </span>
              </div>
              <span className={styles.kpiValue}>{kpi.value}</span>
              <span className={styles.kpiLabel}>{kpi.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{
              background: 'color-mix(in srgb, #7C3AED 12%, transparent)',
              color: '#7C3AED',
            }}
          >
            <TrendingUp size={20} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>
              ${arr.toLocaleString('es', { minimumFractionDigits: 2 })}
            </span>
            <span className={styles.statLabel}>ARR (Ingreso anual)</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div
            className={styles.statIcon}
            style={{
              background: 'color-mix(in srgb, var(--success) 12%, transparent)',
              color: 'var(--success)',
            }}
          >
            <BarChart3 size={20} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{growth}%</span>
            <span className={styles.statLabel}>Crecimiento interanual</span>
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Revenue Chart with range selector */}
        <div className={styles.card}>
          <div className={styles.chartHeader}>
            <h2 className={styles.cardTitle}>Ingresos</h2>
            <div className={styles.chartHeaderRight}>
              <select
                className={styles.categorySelect}
                value={revenueCategoryId}
                onChange={(e) => setRevenueCategoryId(e.target.value)}
              >
                <option value="">Todas las categorías</option>
                {categoriesWithCourses.map((cat) => (
                  <option key={cat.categoryId} value={cat.categoryId}>
                    {cat.categoryName}
                  </option>
                ))}
              </select>
              <div className={styles.rangeTabs}>
                {rangeOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setRange(opt.key)}
                    className={`${styles.rangeTab} ${range === opt.key ? styles.rangeTabActive : ''}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <p className={styles.rangeInfo}>{rangeLabel[range]}</p>
          <div className={styles.chartBody}>
            <LineChart
              data={monthlyRevenue.map((m) => ({ label: m.month, value: m.revenue }))}
              color="#2563EB"
              formatValue={(v) => v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v.toFixed(0)}`}
            />
          </div>
          <div className={styles.totalRow}>
            <span>{rangeTotalLabel[range]}</span>
            <strong>${totalRevenue.toLocaleString('es', { minimumFractionDigits: 2 })}</strong>
          </div>
        </div>

        {/* Students Chart */}
        <div className={styles.card}>
          <div className={styles.chartHeader}>
            <h2 className={styles.cardTitle}>Estudiantes</h2>
            <div className={styles.chartHeaderRight}>
              <select
                className={styles.categorySelect}
                value={studentCategoryId}
                onChange={(e) => setStudentCategoryId(e.target.value)}
              >
                <option value="">Todas las categorías</option>
                {categoriesWithCourses.map((cat) => (
                  <option key={cat.categoryId} value={cat.categoryId}>
                    {cat.categoryName}
                  </option>
                ))}
              </select>
              <div className={styles.rangeTabs}>
                {rangeOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setRange(opt.key)}
                    className={`${styles.rangeTab} ${range === opt.key ? styles.rangeTabActive : ''}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <p className={styles.rangeInfo}>{rangeLabel[range]}</p>
          <div className={styles.chartBody}>
            <LineChart
              data={monthlyStudents.map((m) => ({ label: m.month, value: m.count }))}
              color="#16A34A"
              formatValue={(v) => v.toLocaleString()}
            />
          </div>
          <div className={styles.totalRow}>
            <span>{rangeTotalLabel[range]}</span>
            <strong>{totalStudents.toLocaleString()} estudiantes</strong>
          </div>
        </div>

        {/* Users by Role */}
        {usersByRole.length > 0 && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Usuarios por Rol</h2>
            <div className={styles.userList}>
              {usersByRole.map((stat) => (
                <div key={stat.role} className={styles.userRow}>
                  <div className={styles.userRowInfo}>
                    <span
                      className={styles.userRowIcon}
                      style={{
                        color:
                          stat.role === 'Student'
                            ? '#2563EB'
                            : stat.role === 'Instructor'
                              ? '#7C3AED'
                              : stat.role === 'Admin'
                                ? '#DC2626'
                                : '#6B7280',
                      }}
                    >
                      <Users size={18} />
                    </span>
                    <span className={styles.userRowLabel}>
                      {stat.role === 'Student'
                        ? 'Estudiantes'
                        : stat.role === 'Instructor'
                          ? 'Instructores'
                          : stat.role === 'Admin'
                            ? 'Administradores'
                            : stat.role}
                    </span>
                  </div>
                  <span className={styles.userRowValue}>
                    {stat.count.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Courses by Category */}
        {coursesByCategory.length > 0 && (
          <div className={`${styles.card} ${styles.cardFull}`}>
            <h2 className={styles.cardTitle}>Cursos por Categoría</h2>
            <div className={styles.catChart}>
              {coursesByCategory.map((cat) => (
                <div key={cat.categoryName} className={styles.catRow}>
                  <span className={styles.catLabel}>{cat.categoryName}</span>
                  <div className={styles.catBarWrap}>
                    <div
                      className={styles.catBar}
                      style={{
                        width: `${(cat.count / maxCatCount) * 100}%`,
                      }}
                    />
                  </div>
                  <span className={styles.catCount}>{cat.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
