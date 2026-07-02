'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ArrowUp,
  ArrowDown,
  Users,
  DollarSign,
  BookOpen,
  Star,
} from 'lucide-react';
import { LineChart } from '@/src/shared/components/LineChart';
import { Spinner } from '@/src/shared/components/Spinner';
import { getInstructorDashboard } from '@/src/shared/api/instructor';
import type { InstructorDashboardData } from '@/src/shared/api/instructor';
import styles from './page.module.css';

/* ───────────────────────────────────────────
   Íconos
   ─────────────────────────────────────────── */

const iconMap: Record<string, React.ReactNode> = {
  Users: <Users size={20} />,
  DollarSign: <DollarSign size={20} />,
  BookOpen: <BookOpen size={20} />,
  Star: <Star size={20} />,
};

const timeRangeOptions = [
  { key: '7d', label: '7 días' },
  { key: '30d', label: '30 días' },
  { key: '12s', label: '12 semanas' },
  { key: '1a', label: '1 año' },
] as const;

type TimeRange = (typeof timeRangeOptions)[number]['key'];

const formatCurrency = (v: number) =>
  v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`;

export default function InstructorDashboard() {
  const [data, setData] = useState<InstructorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<TimeRange>('30d');

  const fetchData = useCallback(async (r: TimeRange) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getInstructorDashboard(r);
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
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <Spinner size="lg" />
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

  const { kpis, revenueChart, studentsChart, recentActivity } = data;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Resumen de tus cursos y estadísticas.</p>
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

        {/* Chart 2 — Estudiantes */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h2 className={styles.chartTitle}>Estudiantes Inscritos</h2>
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

      {/* Actividad Reciente */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Actividad Reciente</h2>
        <div className={styles.tableCard}>
          {recentActivity.length > 0 ? (
            <>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Acción</th>
                    <th>Curso</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((act, i) => (
                    <tr key={i}>
                      <td className={styles.actionCell}>{act.action}</td>
                      <td className={styles.courseCell}>{act.courseName}</td>
                      <td className={styles.timeCell}>{act.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className={styles.mobileList}>
                {recentActivity.map((act, i) => (
                  <div key={i} className={styles.mobileItem}>
                    <div className={styles.mobileItemHeader}>
                      <span className={styles.mobileAction}>{act.action}</span>
                      <span className={styles.mobileTime}>{act.timestamp}</span>
                    </div>
                    <span className={styles.mobileCourse}>{act.courseName}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
              No hay actividad reciente.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
