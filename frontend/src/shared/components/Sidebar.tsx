'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import { useSidebarStore } from '@/src/shared/store/useSidebarStore';
import { useAuthStore } from '@/src/shared/store/useAuthStore';
import { SidebarNav } from './SidebarNav';
import { UserDropdown } from './UserDropdown';
import { SidebarConfirmLogout } from './SidebarConfirmLogout';
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
  const { collapsed, mobileOpen, setCollapsed, toggleMobile, closeMobile } = useSidebarStore();
  const { user, logout } = useAuthStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
      if (!e.matches) closeMobile();
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [closeMobile]);

  const handleLogout = async () => {
    await logout();
    setShowConfirm(false);
  };

  // On mobile → overlay sidebar controlled by mobileOpen
  // On desktop → persistent sidebar controlled by collapsed
  const sidebarClass = `${styles.sidebar} ${collapsed ? styles.collapsed : styles.expanded} ${isMobile ? styles.isMobile : ''} ${isMobile && mobileOpen ? styles.mobileOpen : ''}`;

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className={styles.hamburgerButton}
        onClick={toggleMobile}
        aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={sidebarClass}>
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
        <SidebarNav items={items} collapsed={collapsed} onItemClick={isMobile ? closeMobile : undefined} />

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

        {/* User Section */}
        {user && (
          <UserDropdown
            user={user}
            collapsed={collapsed}
            onLogoutRequested={() => setShowConfirm(true)}
          />
        )}

        {/* Confirm Logout Modal */}
        <SidebarConfirmLogout
          open={showConfirm}
          onConfirm={handleLogout}
          onCancel={() => setShowConfirm(false)}
        />
      </aside>

      {/* Mobile overlay backdrop */}
      {isMobile && mobileOpen && (
        <div className={styles.overlay} onClick={closeMobile} />
      )}
    </>
  );
}
