'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, BookOpen, Loader2 } from 'lucide-react';
import { Sidebar } from '@/src/shared/components/Sidebar';
import { useSideBarStore } from '@/src/shared/store/useSidebarStore';
import { useAuthStore } from '@/src/shared/store/useAuthStore';
import styles from './layout.module.css';

const instructorSidebarItems = [
  { label: 'Dashboard', href: '/instructor/dashboard', icon: LayoutDashboard },
  { label: 'Mis Cursos', href: '/instructor/cursos', icon: BookOpen },
];

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { collapsed } = useSideBarStore();
  const { user, isAuthenticated } = useAuthStore();
  // Loading local: arranca en true, se apaga cuando el guard de auth termina
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

    if (user.role !== 'instructor') {
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
      <Sidebar title="Panel Instructor" items={instructorSidebarItems} />
      <main className={styles.content}>{children}</main>
    </div>
  );
}
