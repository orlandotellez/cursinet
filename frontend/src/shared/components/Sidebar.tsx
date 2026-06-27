'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSideBarStore } from '@/src/shared/store/useSidebarStore';
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
  const { collapsed, setCollapsed } = useSideBarStore();
  const { user, logout } = useAuthStore();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowConfirm(false);
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
      <SidebarNav items={items} collapsed={collapsed} />

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
  );
}
