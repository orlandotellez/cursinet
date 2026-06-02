'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, LogOut, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSideBarStore } from '@/src/shared/store/useSidebarStore';
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
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.name || user.email || 'Usuario');
      } catch {
        // ignore
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    router.push('/login');
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
      {userName && !collapsed && (
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>
            <User size={18} />
            <span className={styles.userEmail}>{userName}</span>
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
          onClick={handleLogout}
          className={`${styles.navItem} ${styles.logoutButton} ${collapsed ? styles.isCollapsedIcon : ''}`}
          title="Cerrar sesión"
        >
          <LogOut />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}
