'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronDown, LogOut, Settings } from 'lucide-react';
import styles from './UserDropdown.module.css';

interface UserDto {
  name: string;
  email: string;
  image?: string | null;
  role?: string;
}

interface UserDropdownProps {
  user: UserDto;
  collapsed: boolean;
  onLogoutRequested: () => void;
}

export function UserDropdown({ user, collapsed, onLogoutRequested }: UserDropdownProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const userInitial = user.name?.charAt(0)?.toUpperCase() || '?';
  const hasAvatar = !!user?.image;

  const settingsHref =
    user.role === 'admin'
      ? '/admin/configuracion'
      : user.role === 'instructor'
        ? '/instructor/configuracion'
        : '/configuracion';

  const handleSettings = () => {
    setOpen(false);
    router.push(settingsHref);
  };

  const handleLogoutClick = () => {
    setOpen(false);
    onLogoutRequested();
  };

  return (
    <div className={styles.section}>
      <button
        className={`${styles.trigger} ${collapsed ? styles.triggerCollapsed : ''}`}
        onClick={() => setOpen(!open)}
        title={collapsed ? user.name : undefined}
      >
        <div className={styles.avatar}>
          {hasAvatar ? (
            <Image
              src={user.image!}
              alt={user.name}
              width={36}
              height={36}
              className={styles.avatarImg}
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <span className={styles.avatarLetter}>{userInitial}</span>
          )}
        </div>
        {!collapsed && (
          <div className={styles.details}>
            <span className={styles.name}>{user.name}</span>
            <span className={styles.email}>{user.email}</span>
          </div>
        )}
        {!collapsed && (
          <ChevronDown
            size={16}
            className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
          />
        )}
      </button>

      {open && (
        <>
          <div className={styles.overlay} onClick={() => setOpen(false)} />
          <div className={`${styles.dropdown} ${collapsed ? styles.dropdownCollapsed : ''}`}>
            {collapsed && (
              <div className={styles.dropdownUserInfo}>
                <span className={styles.dropdownUserName}>{user.name}</span>
                <span className={styles.dropdownUserEmail}>{user.email}</span>
              </div>
            )}
            <button className={styles.dropdownItem} onClick={handleSettings}>
              <Settings size={16} />
              <span>Configuración</span>
            </button>
            <button
              className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
              onClick={handleLogoutClick}
            >
              <LogOut size={16} />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
