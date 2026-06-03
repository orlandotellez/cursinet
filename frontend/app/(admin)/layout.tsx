'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Users, BookOpen, BarChart3 } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { Sidebar } from '@/src/shared/components/Sidebar';
import { useSideBarStore } from '@/src/shared/store/useSidebarStore';
import { useAuthStore } from '@/src/shared/store/useAuthStore';
import styles from './layout.module.css';

const adminSidebarItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Usuarios', href: '/admin/usuarios', icon: Users },
  { label: 'Cursos', href: '/admin/cursos', icon: BookOpen },
  { label: 'Analíticas', href: '/admin/analiticas', icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { collapsed } = useSideBarStore();
  const { user, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (user?.role !== 'admin') {
      router.replace('/dashboard');
      return;
    }

    setIsLoading(false);
  }, [router, isAuthenticated, user]);

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: 'var(--bg-base)',
        }}
      >
        <Loader2
          style={{
            width: 24,
            height: 24,
            animation: 'spin 1s linear infinite',
            color: 'var(--text-muted)',
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`${styles.container} ${collapsed ? styles.collapsed : styles.expanded}`}
    >
      <Sidebar title="Panel Admin" items={adminSidebarItems} />
      <main className={styles.content}>{children}</main>
    </div>
  );
}
