'use client'

import {
  LayoutDashboard,
  BookOpen,
  Award,
  Heart,
  Bell,
  Settings,
  Compass,
  Crown,
} from 'lucide-react';
import styles from './layout.module.css';
import { Sidebar } from '@/src/shared/components/Sidebar';
import { AuthLoadingScreen } from '@/src/shared/components/AuthLoadingScreen';
import { useSideBarStore } from '@/src/shared/store/useSidebarStore';
import { useAuthGuard } from '@/src/shared/hooks/useAuthGuard';

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
  const { isLoading } = useAuthGuard({ requireAuth: true, allowedRoles: ['student'] });
  const { collapsed } = useSideBarStore();

  if (isLoading) {
    return <AuthLoadingScreen />;
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
