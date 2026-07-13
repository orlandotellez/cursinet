'use client';

import { usePathname, useRouter } from 'next/navigation';
import styles from './SidebarNav.module.css';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number }>;
}

interface SidebarNavProps {
  items: SidebarItem[];
  collapsed: boolean;
  onItemClick?: () => void;
}

export function SidebarNav({ items, collapsed, onItemClick }: SidebarNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className={styles.nav}>
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        const Icon = item.icon;

        return (
          <button
            key={item.href}
            onClick={() => {
              router.push(item.href);
              onItemClick?.();
            }}
            className={`${styles.navItem} ${isActive ? styles.active : ''} ${collapsed ? styles.isCollapsedIcon : ''}`}
            title={collapsed ? item.label : undefined}
          >
            <Icon size={20} />
            {!collapsed && <span>{item.label}</span>}
          </button>
        );
      })}
    </nav>
  );
}
