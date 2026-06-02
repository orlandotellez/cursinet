'use client'

import Link from 'next/link';
import { BarChart3 } from 'lucide-react';
import styles from './DashboardHeader.module.css';

interface DashboardHeaderProps {
  name: string;
}

export function DashboardHeader({ name }: DashboardHeaderProps) {
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
