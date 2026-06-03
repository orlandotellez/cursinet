'use client';

import { BarChart3, TrendingUp, DollarSign, Users, BookOpen } from 'lucide-react';
import { adminRevenue, categories } from '@/src/features/courses/data';
import styles from './page.module.css';

const maxRevenue = Math.max(...adminRevenue.map(r => r.revenue));
const totalRevenue = adminRevenue.reduce((sum, r) => sum + r.revenue, 0);
const mrr = adminRevenue[adminRevenue.length - 1].revenue;
const arr = mrr * 12;
const growth = 12.1;

const userStats = [
  { label: 'Estudiantes', value: '12,000', icon: <Users size={18} />, color: '#2563EB' },
  { label: 'Instructores', value: '45', icon: <Users size={18} />, color: '#7C3AED' },
  { label: 'Administradores', value: '8', icon: <Users size={18} />, color: '#DC2626' },
];

const totalCoursesByCategory = categories.map((cat) => ({
  name: cat.name,
  count: cat.coursesCount,
}));

const maxCatCount = Math.max(...totalCoursesByCategory.map(c => c.count));

export default function AdminAnaliticas() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Analíticas</h1>
      <p className={styles.subtitle}>Métricas detalladas de la plataforma.</p>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'color-mix(in srgb, #DC2626 12%, transparent)', color: '#DC2626' }}>
            <DollarSign size={20} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>${mrr.toLocaleString()}</span>
            <span className={styles.statLabel}>MRR (Ingreso mensual)</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'color-mix(in srgb, #7C3AED 12%, transparent)', color: '#7C3AED' }}>
            <TrendingUp size={20} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>${arr.toLocaleString()}</span>
            <span className={styles.statLabel}>ARR (Ingreso anual)</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'color-mix(in srgb, var(--success) 12%, transparent)', color: 'var(--success)' }}>
            <BarChart3 size={20} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{growth}%</span>
            <span className={styles.statLabel}>Crecimiento interanual</span>
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Revenue Chart */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Ingresos Mensuales</h2>
          <div className={styles.chart}>
            {adminRevenue.map((point) => (
              <div key={point.month} className={styles.barCol}>
                <span className={styles.barValue}>${(point.revenue / 1000).toFixed(0)}k</span>
                <div
                  className={styles.bar}
                  style={{ height: `${(point.revenue / maxRevenue) * 100}%` }}
                />
                <span className={styles.barLabel}>{point.month}</span>
              </div>
            ))}
          </div>
          <div className={styles.totalRow}>
            <span>Total anual</span>
            <strong>${totalRevenue.toLocaleString()}</strong>
          </div>
        </div>

        {/* User Stats */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Usuarios por Rol</h2>
          <div className={styles.userList}>
            {userStats.map((stat) => (
              <div key={stat.label} className={styles.userRow}>
                <div className={styles.userRowInfo}>
                  <span className={styles.userRowIcon} style={{ color: stat.color }}>{stat.icon}</span>
                  <span className={styles.userRowLabel}>{stat.label}</span>
                </div>
                <span className={styles.userRowValue}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Courses by Category */}
        <div className={`${styles.card} ${styles.cardFull}`}>
          <h2 className={styles.cardTitle}>Cursos por Categoría</h2>
          <div className={styles.catChart}>
            {totalCoursesByCategory.map((cat) => (
              <div key={cat.name} className={styles.catRow}>
                <span className={styles.catLabel}>{cat.name}</span>
                <div className={styles.catBarWrap}>
                  <div
                    className={styles.catBar}
                    style={{ width: `${(cat.count / maxCatCount) * 100}%` }}
                  />
                </div>
                <span className={styles.catCount}>{cat.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
