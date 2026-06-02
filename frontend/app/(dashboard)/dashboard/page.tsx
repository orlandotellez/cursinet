'use client'

import { useState, useEffect } from 'react';
import { enrollments, certificates, studentStats } from '@/src/features/courses/data';
import { DashboardHeader } from '@/src/features/dashboard/components/DashboardHeader';
import { ContinueLearning } from '@/src/features/dashboard/components/ContinueLearning';
import { StatsCards } from '@/src/features/dashboard/components/StatsCards';
import { RecentCertificates } from '@/src/features/dashboard/components/RecentCertificates';
import styles from './page.module.css';

export default function DashboardPage() {
  const [name, setName] = useState('Estudiante');

  useEffect(() => {
    const stored = localStorage.getItem('userName');
    if (stored) setName(stored);
  }, []);

  return (
    <div className={styles.page}>
      <DashboardHeader name={name} />
      <ContinueLearning enrollments={enrollments} />
      <StatsCards stats={studentStats} />
      <RecentCertificates certificates={certificates} />
    </div>
  );
}
