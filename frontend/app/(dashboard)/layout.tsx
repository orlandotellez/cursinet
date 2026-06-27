'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Award,
  Heart,
  Bell,
  Settings,
  Compass,
  Crown,
  Loader2,
} from 'lucide-react';
import styles from './layout.module.css';
import { Sidebar } from '@/src/shared/components/Sidebar';
import { useSideBarStore } from '@/src/shared/store/useSidebarStore';
import { useAuthStore } from '@/src/shared/store/useAuthStore';
import { redirectByRole } from '@/src/shared/lib/authUtils';

const sidebarItems = [
  { label: 'Explorar Cursos', href: '/cursos', icon: Compass },
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Mis Cursos', href: '/mis-cursos', icon: BookOpen },
  { label: 'Certificados', href: '/certificados', icon: Award },
  { label: 'Favoritos', href: '/favoritos', icon: Heart },
  { label: 'Notificaciones', href: '/notificaciones', icon: Bell },
  { label: 'Suscripción', href: '/suscripcion', icon: Crown },
  { label: 'Configuración', href: '/configuracion', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { collapsed } = useSideBarStore();
  const { isAuthenticated, user } = useAuthStore();
  // Loading local: arranca en true, se apaga cuando el guard de auth termina
  const [isLoading, setIsLoading] = useState(true);
  // Guard: esperar a que Zustand hidrate desde localStorage
  // (necesario porque persist es async durante SSR/static generation)
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const persist = useAuthStore.persist;
    if (!persist) {
      // persist no disponible (SSR/static) → asumir hidratado, el store arranca limpio
      setHydrated(true);
      return;
    }
    const unsub = persist.onFinishHydration(() => setHydrated(true));
    // Si ya hidrató antes de suscribirnos, forzar el estado
    if (persist.hasHydrated()) {
      setHydrated(true);
    }
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

    // Si es admin o instructor, redirigir a su dashboard correspondiente
    if (user.role === 'admin' || user.role === 'instructor') {
      redirectByRole(user.role, router.replace);
      return;
    }

    setIsLoading(false);
  }, [hydrated, isAuthenticated, user, router]);

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
      <Sidebar title="Menú" items={sidebarItems} />
      <main className={styles.content}>{children}</main>
    </div>
  );
}
