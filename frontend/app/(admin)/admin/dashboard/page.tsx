'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ArrowUp,
  ArrowDown,
  Users,
  DollarSign,
  BookOpen,
  TrendingUp,
} from 'lucide-react';
import { LineChart } from '@/src/shared/components/LineChart';
import { getDashboard } from '@/src/shared/api/analytics';
import type { DashboardData } from '@/src/shared/api/analytics';
import styles from './page.module.css';

/* ───────────────────────────────────────────
   Íconos para los KPI
   ─────────────────────────────────────────── */

const iconMap: Record<string, React.ReactNode> = {
  Users: <Users size={20} />,
  DollarSign: <DollarSign size={20} />,
  BookOpen: <BookOpen size={20} />,
  TrendingUp: <TrendingUp size={20} />,
};

/* ───────────────────────────────────────────
   Opciones de rango
   ─────────────────────────────────────────── */

const timeRangeOptions = [
  { key: '7d', label: '7 días' },
  { key: '30d', label: '30 días' },
  { key: '12s', label: '12 semanas' },
  { key: '1a', label: '1 año' },
] as const;

type TimeRange = (typeof timeRangeOptions)[number]['key'];

/* ───────────────────────────────────────────
   Helpers
   ─────────────────────────────────────────── */

const formatCurrency = (v: number) =>
  v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`;

/* ───────────────────────────────────────────
   Componente principal
   ─────────────────────────────────────────── */

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<TimeRange>('30d');

  const fetchData = useCallback(async (r: TimeRange) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getDashboard(r);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(range);
  }, [range, fetchData]);

  /* ─── Estados ─── */

  if (loading && !data) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle} style={{ color: 'var(--error)' }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { kpis, revenueChart, studentsChart, recentUsers } = data;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>
            Panel de control general de la plataforma.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        {kpis.map((kpi) => (
          <div key={kpi.label} className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiIcon}>{iconMap[kpi.icon]}</span>
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

      {/* Charts lado a lado */}
      <div className={styles.chartsRow}>
        {/* Chart 1 — Ingresos */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h2 className={styles.chartTitle}>Ingresos</h2>
            <div className={styles.rangeTabs}>
              {timeRangeOptions.map((opt) => (
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
          <div className={styles.chartBody}>
            <LineChart
              data={revenueChart}
              color="#2563EB"
              formatValue={formatCurrency}
            />
          </div>
        </div>

        {/* Chart 2 — Nuevos Estudiantes */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h2 className={styles.chartTitle}>Nuevos Estudiantes</h2>
            <div className={styles.rangeTabs}>
              {timeRangeOptions.map((opt) => (
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
          <div className={styles.chartBody}>
            <LineChart
              data={studentsChart}
              color="#8B5CF6"
              formatValue={(v) => `${v}`}
            />
          </div>
        </div>
      </div>

      {/* Usuarios Recientes */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Usuarios Recientes</h2>
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Registro</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((user) => (
                <tr key={user.id}>
                  <td className={styles.userCell}>
                    <div className={styles.userInfo}>
                      <div className={styles.avatar}>
                        {user.name.charAt(0)}
                      </div>
                      <span>{user.name}</span>
                    </div>
                  </td>
                  <td className={styles.emailCell}>{user.email}</td>
                  <td>
                    <span
                      className={`${styles.roleBadge} ${styles[`role${user.role.charAt(0).toUpperCase() + user.role.slice(1)}`]}`}
                    >
                      {user.role === 'Student'
                        ? 'Estudiante'
                        : user.role === 'Instructor'
                          ? 'Instructor'
                          : user.role === 'Admin'
                            ? 'Admin'
                            : user.role}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`${styles.statusDot} ${user.isActive ? styles.statusActive : styles.statusSuspended}`}
                    />
                    {user.isActive ? 'Activo' : 'Suspendido'}
                  </td>
                  <td className={styles.dateCell}>
                    {new Date(user.createdAt).toLocaleDateString('es', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.mobileList}>
            {recentUsers.map((user) => (
              <div key={user.id} className={styles.mobileItem}>
                <div className={styles.mobileItemHeader}>
                  <div className={styles.userInfo}>
                    <div className={styles.avatar}>{user.name.charAt(0)}</div>
                    <div>
                      <div className={styles.mobileName}>{user.name}</div>
                      <div className={styles.mobileEmail}>{user.email}</div>
                    </div>
                  </div>
                </div>
                <div className={styles.mobileItemBody}>
                  <span
                    className={`${styles.roleBadge} ${styles[`role${user.role.charAt(0).toUpperCase() + user.role.slice(1)}`]}`}
                  >
                    {user.role === 'Student'
                      ? 'Estudiante'
                      : user.role === 'Instructor'
                        ? 'Instructor'
                        : user.role === 'Admin'
                          ? 'Admin'
                          : user.role}
                  </span>
                  <span>
                    {user.isActive ? 'Activo' : 'Suspendido'}
                  </span>
                  <span className={styles.dateCell}>
                    {new Date(user.createdAt).toLocaleDateString('es', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
