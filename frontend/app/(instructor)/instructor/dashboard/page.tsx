'use client';

import { useState } from 'react';
import { ArrowUp, ArrowDown, Users, DollarSign, BookOpen, Star } from 'lucide-react';
import type { InstructorKpi } from '@/src/shared/types';
import { instructorKpis, instructorRevenue } from '@/src/features/courses/data';
import styles from './page.module.css';

const iconMap: Record<string, React.ReactNode> = {
  Users: <Users size={20} />,
  DollarSign: <DollarSign size={20} />,
  BookOpen: <BookOpen size={20} />,
  Star: <Star size={20} />,
};

const recentActivity = [
  { action: 'Nuevo estudiante inscrito', course: 'Arquitectura Hexagonal en TypeScript', time: 'Hace 15 min' },
  { action: 'Curso publicado', course: 'Backend en Go: APIs y Microservicios', time: 'Hace 2 hs' },
  { action: 'Reseña recibida', course: 'React 19 desde Cero', time: 'Hace 4 hs' },
  { action: 'Certificado emitido', course: 'Kubernetes Práctico', time: 'Hace 1 día' },
  { action: 'Estudiante completó el curso', course: 'Diseño de Sistemas', time: 'Hace 2 días' },
];

const maxRevenue = Math.max(...instructorRevenue.map(r => r.revenue));

export default function InstructorDashboard() {
  const [kpis] = useState<InstructorKpi[]>(instructorKpis);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Dashboard</h1>
      <p className={styles.subtitle}>Bienvenido de vuelta, Martín. Este es tu resumen.</p>

      <div className={styles.kpiGrid}>
        {kpis.map((kpi) => (
          <div key={kpi.label} className={styles.kpiCard}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiIcon}>{iconMap[kpi.icon]}</span>
              <span className={`${styles.kpiChange} ${kpi.change >= 0 ? styles.changePositive : styles.changeNegative}`}>
                {kpi.change >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                {Math.abs(kpi.change)}%
              </span>
            </div>
            <span className={styles.kpiValue}>{kpi.value}</span>
            <span className={styles.kpiLabel}>{kpi.label}</span>
          </div>
        ))}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Ingresos Anuales</h2>
        <div className={styles.chartCard}>
          <div className={styles.chart}>
            {instructorRevenue.map((point) => (
              <div key={point.month} className={styles.barCol}>
                <span className={styles.barValue}>${(point.revenue / 1000).toFixed(1)}k</span>
                <div
                  className={styles.bar}
                  style={{ height: `${(point.revenue / maxRevenue) * 100}%` }}
                />
                <span className={styles.barLabel}>{point.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

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
