'use client';

import { LayoutDashboard, BookOpen, Compass } from 'lucide-react';
import { Sidebar } from '@/src/shared/components/Sidebar';
import { AuthLoadingScreen } from '@/src/shared/components/AuthLoadingScreen';
import { useSidebarStore } from '@/src/shared/store/useSidebarStore';
import { useAuthGuard } from '@/src/shared/hooks/useAuthGuard';
import { VerificationBanner } from '@/src/shared/components/VerificationBanner';
import styles from './layout.module.css';

const instructorSidebarItems = [
  { label: 'Explorar Cursos', href: '/cursos', icon: Compass },
  { label: 'Dashboard', href: '/instructor/dashboard', icon: LayoutDashboard },
  { label: 'Mis Cursos', href: '/instructor/cursos', icon: BookOpen },
];

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuthGuard({ requireAuth: true, allowedRoles: ['instructor', 'admin'] });
  const { collapsed } = useSidebarStore();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  return (
    <div
      className={`${styles.container} ${collapsed ? styles.collapsed : styles.expanded}`}
    >
      <Sidebar title="Panel Instructor" items={instructorSidebarItems} />
      <main className={styles.content}>
        <VerificationBanner />
        {children}
      </main>
    </div>
  );
}
