'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, ChevronLeft, ChevronRight, LogOut, Settings, X } from 'lucide-react';
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowConfirm(false);
    setUserMenuOpen(false);
    router.push('/');
  };

  const settingsHref =
    user?.role === 'admin'
      ? '/admin/configuracion'
      : user?.role === 'instructor'
        ? '/instructor/configuracion'
        : '/configuracion';

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || '?';
  const hasAvatar = !!user?.image;

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

      {/* User Section — avatar, nombre, email + dropdown */}
      {user && (
        <div className={styles.userSection}>
          <button
            className={`${styles.userTrigger} ${collapsed ? styles.userTriggerCollapsed : ''}`}
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            title={collapsed ? user.name : undefined}
          >
            <div className={styles.userAvatar}>
              {hasAvatar ? (
                <img src={user.image!} alt={user.name} className={styles.avatarImg} />
              ) : (
                <span className={styles.avatarLetter}>{userInitial}</span>
              )}
            </div>
            {!collapsed && (
              <div className={styles.userDetails}>
                <span className={styles.userName}>{user.name}</span>
                <span className={styles.userEmail}>{user.email}</span>
              </div>
            )}
            {!collapsed && (
              <ChevronDown
                size={16}
                className={`${styles.userChevron} ${userMenuOpen ? styles.userChevronOpen : ''}`}
              />
            )}
          </button>

          {/* Dropdown */}
          {userMenuOpen && (
            <>
              <div className={styles.userOverlay} onClick={() => setUserMenuOpen(false)} />
              <div className={`${styles.userDropdown} ${collapsed ? styles.userDropdownCollapsed : ''}`}>
                {collapsed && (
                  <div className={styles.dropdownUserInfo}>
                    <span className={styles.dropdownUserName}>{user.name}</span>
                    <span className={styles.dropdownUserEmail}>{user.email}</span>
                  </div>
                )}
                <button
                  className={styles.dropdownItem}
                  onClick={() => {
                    setUserMenuOpen(false);
                    router.push(settingsHref);
                  }}
                >
                  <Settings size={16} />
                  <span>Configuración</span>
                </button>
                <button
                  className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                  onClick={() => {
                    setUserMenuOpen(false);
                    setShowConfirm(true);
                  }}
                >
                  <LogOut size={16} />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}

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
