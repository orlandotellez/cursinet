'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/src/shared/store/useAuthStore';
import { getMyCertificates } from '@/src/shared/api/certificates';
import { enrollments, studentStats } from '@/src/features/courses/data';
import { DashboardHeader } from '@/src/features/dashboard/components/DashboardHeader';
import { ContinueLearning } from '@/src/features/dashboard/components/ContinueLearning';
import { StatsCards } from '@/src/features/dashboard/components/StatsCards';
import { RecentCertificates } from '@/src/features/dashboard/components/RecentCertificates';
import type { Certificate } from '@/src/shared/types';
import styles from './page.module.css';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const name = user?.name ?? 'Estudiante';
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  useEffect(() => {
    getMyCertificates()
      .then(setCertificates)
      .catch(() => {});
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
