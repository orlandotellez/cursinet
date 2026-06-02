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
} from 'lucide-react';
import styles from './layout.module.css';
import { Sidebar } from '@/src/shared/components/Sidebar';
import { useSideBarStore } from '@/src/shared/store/useSidebarStore';
import { useAuthStore } from '@/src/shared/store/useAuthStore';
import { Loader2 } from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Mis Cursos', href: '/mis-cursos', icon: BookOpen },
  { label: 'Certificados', href: '/certificados', icon: Award },
  { label: 'Favoritos', href: '/favoritos', icon: Heart },
  { label: 'Notificaciones', href: '/notificaciones', icon: Bell },
  { label: 'Configuración', href: '/configuracion', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { collapsed } = useSideBarStore();
  const { isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setIsLoading(false);
  }, [router, isAuthenticated]);

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
