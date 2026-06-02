'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, LogOut, User, X } from 'lucide-react';
import { useState } from 'react';
import { useSideBarStore } from '@/src/shared/store/useSidebarStore';
import { useAuthStore } from '@/src/shared/store/useAuthStore';
import styles from './Sidebar.module.css';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number }>;
}

interface SidebarProps {
  title: string;
  items: SidebarItem[];
}

export function Sidebar({ title, items }: SidebarProps) {
  const { collapsed, setCollapsed } = useSideBarStore();
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowConfirm(false);
    router.push('/');
  };

  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.collapsed : styles.expanded}`}
    >
      {/* Logo */}
      <div className={styles.logoContainer}>
        <div className={styles.logoIcon}>
          <span className={styles.logoLetter}>N</span>
        </div>
        {!collapsed && (
          <div className={styles.logoText}>
            <h1>CURSINET</h1>
            <p>{title}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`${styles.navItem} ${isActive ? styles.active : ''} ${collapsed ? styles.isCollapsedIcon : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User Info */}
      {user && (
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>
            {
              collapsed ? (

                <User size={18} />
              ) : (
                <>
                  <User size={18} />
                  <span className={styles.userEmail}>{user.name || user.email}</span>

                </>
              )
            }
          </div>
        </div>
      )}

      {/* Collapse Button */}
      <div className={styles.collapseContainer}>
        <button onClick={setCollapsed} className={styles.collapseButton}>
          {collapsed ? (
            <ChevronRight size={20} />
          ) : (
            <>
              <ChevronLeft size={20} />
              <span className={styles.collapseText}>Colapsar</span>
            </>
          )}
        </button>
      </div>

      {/* Logout */}
      <div className={styles.logoutContainer}>
        <button
          onClick={() => setShowConfirm(true)}
          className={`${styles.navItem} ${styles.logoutButton} ${collapsed ? styles.isCollapsedIcon : ''}`}
          title="Cerrar sesión"
        >
          <LogOut size={20} />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>

      {/* ── Confirmación de cierre de sesión ── */}
      {showConfirm && (
        <div className={styles.overlay} onClick={() => setShowConfirm(false)}>
          <div
            className={styles.confirmModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.confirmHeader}>
              <h3 className={styles.confirmTitle}>Cerrar sesión</h3>
              <button
                className={styles.confirmClose}
                onClick={() => setShowConfirm(false)}
                aria-label="Cancelar"
              >
                <X size={18} />
              </button>
            </div>
            <p className={styles.confirmBody}>
              ¿Estás seguro de que querés cerrar sesión?
            </p>
            <div className={styles.confirmActions}>
              <button
                className={styles.confirmCancel}
                onClick={() => setShowConfirm(false)}
              >
                Cancelar
              </button>
              <button
                className={styles.confirmAccept}
                onClick={handleLogout}
              >
                Sí, cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
