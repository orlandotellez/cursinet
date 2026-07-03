'use client';

import { LayoutDashboard, Users, BookOpen, BarChart3, Compass } from 'lucide-react';
import { Sidebar } from '@/src/shared/components/Sidebar';
import { AuthLoadingScreen } from '@/src/shared/components/AuthLoadingScreen';
import { useSidebarStore } from '@/src/shared/store/useSidebarStore';
import { useAuthGuard } from '@/src/shared/hooks/useAuthGuard';
import { VerificationBanner } from '@/src/shared/components/VerificationBanner';
import styles from './layout.module.css';

const adminSidebarItems = [
  { label: 'Explorar Cursos', href: '/cursos', icon: Compass },
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Usuarios', href: '/admin/usuarios', icon: Users },
  { label: 'Cursos', href: '/admin/cursos', icon: BookOpen },
  { label: 'Analíticas', href: '/admin/analiticas', icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuthGuard({ requireAuth: true, allowedRoles: ['admin'] });
  const { collapsed } = useSidebarStore();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  return (
    <div
      className={`${styles.container} ${collapsed ? styles.collapsed : styles.expanded}`}
    >
      <Sidebar title="Panel Admin" items={adminSidebarItems} />
      <main className={styles.content}>
        <VerificationBanner />
        {children}
      </main>
    </div>
  );
}
