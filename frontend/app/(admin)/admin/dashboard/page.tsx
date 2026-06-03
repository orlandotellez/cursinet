'use client';

import { useState } from 'react';
import { ArrowUp, ArrowDown, Users, DollarSign, BookOpen, TrendingUp } from 'lucide-react';
import type { AdminKpi } from '@/src/shared/types';
import { adminKpis, adminRevenue, mockUsers } from '@/src/features/courses/data';
import styles from './page.module.css';

const iconMap: Record<string, React.ReactNode> = {
  Users: <Users size={20} />,
  DollarSign: <DollarSign size={20} />,
  BookOpen: <BookOpen size={20} />,
  TrendingUp: <TrendingUp size={20} />,
};

const maxRevenue = Math.max(...adminRevenue.map(r => r.revenue));

const recentUsers = mockUsers.slice(0, 5);

export default function AdminDashboard() {
  const [kpis] = useState<AdminKpi[]>(adminKpis);

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Dashboard</h1>
      <p className={styles.subtitle}>Panel de control general de la plataforma.</p>

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
        </div>
      </div>

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
                      <div className={styles.avatar}>{user.name.charAt(0)}</div>
                      <span>{user.name}</span>
                    </div>
                  </td>
                  <td className={styles.emailCell}>{user.email}</td>
                  <td>
                    <span className={`${styles.roleBadge} ${styles[`role${user.role.charAt(0).toUpperCase() + user.role.slice(1)}`]}`}>
                      {user.role === 'student' ? 'Estudiante' : user.role === 'instructor' ? 'Instructor' : 'Admin'}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.statusDot} ${user.status === 'active' ? styles.statusActive : styles.statusSuspended}`} />
                    {user.status === 'active' ? 'Activo' : 'Suspendido'}
                  </td>
                  <td className={styles.dateCell}>{user.joinedAt}</td>
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
                  <span className={`${styles.roleBadge} ${styles[`role${user.role.charAt(0).toUpperCase() + user.role.slice(1)}`]}`}>
                    {user.role === 'student' ? 'Estudiante' : user.role === 'instructor' ? 'Instructor' : 'Admin'}
                  </span>
                  <span>{user.status === 'active' ? 'Activo' : 'Suspendido'}</span>
                  <span className={styles.dateCell}>{user.joinedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
