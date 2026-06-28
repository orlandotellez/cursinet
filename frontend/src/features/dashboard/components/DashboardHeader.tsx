'use client'

import Link from 'next/link';
import { BarChart3 } from 'lucide-react';
import { SkeletonBase } from '@/src/shared/skeleton';
import styles from './DashboardHeader.module.css';

interface DashboardHeaderProps {
  name: string;
  loading?: boolean;
}

export function DashboardHeader({ name, loading }: DashboardHeaderProps) {
  if (loading) {
    return (
      <header className={styles.header}>
        <div>
          <SkeletonBase width={260} height={28} style={{ marginBottom: 8 }} />
          <SkeletonBase width={200} height={14} />
        </div>
        <SkeletonBase width={140} height={40} borderRadius={8} />
      </header>
    );
  }

  return (
    <header className={styles.header}>
      <div>
        <h1 className={styles.greeting}>Buenos días, {name}</h1>
        <p className={styles.subtitle}>Aquí está tu resumen de aprendizaje</p>
      </div>
      <Link href="/mis-cursos" className={styles.viewAllBtn}>
        <BarChart3 size={16} />
        Ver todos los cursos
      </Link>
    </header>
  );
}
