'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Users, BookOpen, BarChart3, Loader2 } from 'lucide-react';
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
  // Guard: esperar a que Zustand hidrate desde localStorage
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const persist = useAuthStore.persist;
    if (!persist) { setHydrated(true); return; }
    const unsub = persist.onFinishHydration(() => setHydrated(true));
    if (persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);

  useEffect(() => {
    // Esperar a que Zustand hidrate desde localStorage
    if (!hydrated) return;

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    // Si todavía no tenemos user pero estamos autenticados, esperar
    // (puede ser un estado de transición durante la hidratación de persist)
    if (!user) return;

    if (user.role !== 'admin') {
      router.replace('/dashboard');
      return;
    }

    setIsLoading(false);
  }, [hydrated, router, isAuthenticated, user]);

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
