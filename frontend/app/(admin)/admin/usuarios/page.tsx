'use client';

import { useState, useMemo } from 'react';
import { Search, MoreVertical } from 'lucide-react';
import { mockUsers } from '@/src/features/courses/data';
import type { UserRole, UserStatus } from '@/src/shared/types';
import styles from './page.module.css';

const roleTabs: { key: 'all' | UserRole; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'student', label: 'Estudiantes' },
  { key: 'instructor', label: 'Instructores' },
  { key: 'admin', label: 'Administradores' },
];

const roleLabels: Record<UserRole, string> = {
  student: 'Estudiante',
  instructor: 'Instructor',
  admin: 'Admin',
  moderator: 'Moderador',
};

export default function AdminUsuarios() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');

  const filtered = useMemo(() => {
    return mockUsers.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [search, roleFilter]);

  const getRoleClass = (role: UserRole) => {
    switch (role) {
      case 'student': return styles.roleStudent;
      case 'instructor': return styles.roleInstructor;
      case 'admin': return styles.roleAdmin;
      case 'moderator': return styles.roleStudent;
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Usuarios</h1>
        <p className={styles.subtitle}>Gestioná todos los usuarios de la plataforma.</p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.tabs}>
          {roleTabs.map((tab) => (
            <button
              key={tab.key}
              className={`${styles.tab} ${roleFilter === tab.key ? styles.tabActive : ''}`}
              onClick={() => setRoleFilter(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Registro</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className={styles.userInfo}>
                    <div className={styles.avatar}>{user.name.charAt(0)}</div>
                    <span className={styles.userName}>{user.name}</span>
                  </div>
                </td>
                <td className={styles.emailCell}>{user.email}</td>
                <td>
                  <span className={`${styles.roleBadge} ${getRoleClass(user.role)}`}>
                    {roleLabels[user.role]}
                  </span>
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${user.status === 'active' ? styles.statusActive : styles.statusSuspended}`}>
                    {user.status === 'active' ? 'Activo' : 'Suspendido'}
                  </span>
                </td>
                <td className={styles.dateCell}>{user.joinedAt}</td>
                <td>
                  <button className={styles.moreBtn} title="Acciones">
                    <MoreVertical size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.mobileList}>
          {filtered.map((user) => (
            <div key={user.id} className={styles.mobileItem}>
              <div className={styles.mobileItemHeader}>
                <div className={styles.userInfo}>
                  <div className={styles.avatar}>{user.name.charAt(0)}</div>
                  <div>
                    <div className={styles.mobileName}>{user.name}</div>
                    <div className={styles.mobileEmail}>{user.email}</div>
                  </div>
                </div>
              </div>
              <div className={styles.mobileItemBody}>
                <span className={`${styles.roleBadge} ${getRoleClass(user.role)}`}>
                  {roleLabels[user.role]}
                </span>
                <span className={`${styles.statusBadge} ${user.status === 'active' ? styles.statusActive : styles.statusSuspended}`}>
                  {user.status === 'active' ? 'Activo' : 'Suspendido'}
                </span>
                <span className={styles.dateCell}>{user.joinedAt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
