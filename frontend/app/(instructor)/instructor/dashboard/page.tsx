'use client';

import { useState, useMemo } from 'react';
import {
  ArrowUp,
  ArrowDown,
  Users,
  DollarSign,
  BookOpen,
  Star,
} from 'lucide-react';
import { LineChart } from '@/src/shared/components/LineChart';
import type { InstructorKpi } from '@/src/shared/types';
import { instructorKpis, instructorRevenue } from '@/src/features/courses/data';
import styles from './page.module.css';

/* ───────────────────────────────────────────
   Generación de datos mock por rango
   ─────────────────────────────────────────── */

type TimeRange = '7d' | '30d' | '12s' | '1a';

function generateDaily(days: number, base: number, variance: number) {
  const data: { label: string; value: number }[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString('es', { weekday: 'short', day: 'numeric' });
    const seed = d.getTime();
    const r = ((seed * 9301 + 49297) % 233280) / 233280;
    const value = Math.round(base + (r - 0.5) * variance);
    data.push({ label, value });
  }
  return data;
}

function generateWeekly(weeks: number, base: number, variance: number) {
  const data: { label: string; value: number }[] = [];
  const now = new Date();
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const label = `Sem ${i + 1}`;
    const seed = d.getTime();
    const r = ((seed * 9301 + 49297) % 233280) / 233280;
    const value = Math.round(base + (r - 0.5) * variance);
    data.push({ label, value });
  }
  return data;
}

const iconMap: Record<string, React.ReactNode> = {
  Users: <Users size={20} />,
  DollarSign: <DollarSign size={20} />,
  BookOpen: <BookOpen size={20} />,
  Star: <Star size={20} />,
};

const timeRangeOptions: { key: TimeRange; label: string }[] = [
  { key: '7d', label: '7 días' },
  { key: '30d', label: '30 días' },
  { key: '12s', label: '12 semanas' },
  { key: '1a', label: '1 año' },
];

const recentActivity = [
  { action: 'Nuevo estudiante inscrito', course: 'Arquitectura Hexagonal en TypeScript', time: 'Hace 15 min' },
  { action: 'Curso publicado', course: 'Backend en Go: APIs y Microservicios', time: 'Hace 2 hs' },
  { action: 'Reseña recibida', course: 'React 19 desde Cero', time: 'Hace 4 hs' },
  { action: 'Certificado emitido', course: 'Kubernetes Práctico', time: 'Hace 1 día' },
  { action: 'Estudiante completó el curso', course: 'Diseño de Sistemas', time: 'Hace 2 días' },
];

export default function InstructorDashboard() {
  const [kpis] = useState<InstructorKpi[]>(instructorKpis);
  const [range, setRange] = useState<TimeRange>('1a');

  const revenueChartData = useMemo(() => {
    switch (range) {
      case '7d':
        return generateDaily(7, 1500, 1000);
      case '30d':
        return generateDaily(30, 1500, 1000);
      case '12s':
        return generateWeekly(12, 10000, 6000);
      case '1a':
        return instructorRevenue.map((r) => ({ label: r.month, value: r.revenue }));
    }
  }, [range]);

  const studentsChartData = useMemo(() => {
    switch (range) {
      case '7d':
        return generateDaily(7, 50, 30);
      case '30d':
        return generateDaily(30, 50, 30);
      case '12s':
        return generateWeekly(12, 350, 200);
      case '1a':
        return instructorRevenue.map((r) => ({ label: r.month, value: r.students }));
    }
  }, [range]);

  const formatCurrency = (v: number) =>
    v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>
            Bienvenido de vuelta, Martín. Este es tu resumen.
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
              data={revenueChartData}
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
              data={studentsChartData}
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
                  <td className={styles.courseCell}>{act.course}</td>
                  <td className={styles.timeCell}>{act.time}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.mobileList}>
            {recentActivity.map((act, i) => (
              <div key={i} className={styles.mobileItem}>
                <div className={styles.mobileItemHeader}>
                  <span className={styles.mobileAction}>{act.action}</span>
                  <span className={styles.mobileTime}>{act.time}</span>
                </div>
                <span className={styles.mobileCourse}>{act.course}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
