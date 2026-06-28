'use client';

import { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Plus, RotateCw, Ghost, AlertCircle } from 'lucide-react';
import { Spinner } from '@/src/shared/components/Spinner';
import { useUserCrud, type RoleFilter } from '@/src/features/admin/hooks/useUserCrud';
import { createUser, updateUser, type CreateUserPayload, type UpdateUserPayload } from '@/src/shared/api/auth';
import { ConfirmDialog } from '@/src/shared/components/ConfirmDialog';
import UserDetailModal from './UserDetailModal';
import UserFormModal from './UserFormModal';
import styles from './page.module.css';
import type { UserDTO } from '@/src/shared/api/auth';

const roleTabs: { key: RoleFilter; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'Admin', label: 'Administradores' },
  { key: 'Instructor', label: 'Instructores' },
  { key: 'Student', label: 'Estudiantes' },
  { key: 'Moderator', label: 'Moderadores' },
  { key: 'deleted', label: 'Eliminados' },
];

const roleLabels: Record<string, string> = {
  Admin: 'Admin',
  Instructor: 'Instructor',
  Student: 'Estudiante',
  Moderator: 'Moderador',
};

function statusInfo(user: UserDTO): { label: string; className: string } {
  if (user.deletedAt) return { label: 'Eliminado', className: 'statusSuspended' };
  if (user.isActive) return { label: 'Activo', className: 'statusActive' };
  return { label: 'Inactivo', className: 'statusSuspended' };
}

export default function AdminUsuarios() {
  const crud = useUserCrud();
  const [detailUser, setDetailUser] = useState<UserDTO | null>(null);
  const [editUser, setEditUser] = useState<UserDTO | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    crud.fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave(payload: CreateUserPayload | UpdateUserPayload) {
    if (editUser) {
      await updateUser(editUser.id, payload as UpdateUserPayload);
      setEditUser(null);
    } else {
      await createUser(payload as CreateUserPayload);
      setShowCreate(false);
    }
    await crud.fetchData();
  }

  function openDetail(user: UserDTO) { setDetailUser(user); }
  function openEdit(user: UserDTO) { setEditUser(user); setDetailUser(null); }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Usuarios</h1>
          <p className={styles.subtitle}>Gestioná todos los usuarios de la plataforma.</p>
        </div>
        <button className={styles.primaryBtn} onClick={() => setShowCreate(true)}>
          <Plus size={16} /> Crear usuario
        </button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Buscar por nombre o email..."
            value={crud.search}
            onChange={(e) => crud.setSearch(e.target.value)}
          />
        </div>
        <div className={styles.tabs}>
          {roleTabs.map((tab) => (
            <button
              key={tab.key}
              className={`${styles.tab} ${crud.roleFilter === tab.key ? styles.tabActive : ''}`}
              onClick={() => crud.setRoleFilter(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {crud.loading && (
        <div className={styles.loadingState}>
          <Spinner size="lg" className={styles.spinner} />
          <span>Cargando usuarios...</span>
        </div>
      )}

      {!crud.loading && crud.error && (
        <div className={styles.errorState}>
          <AlertCircle size={32} />
          <span>{crud.error}</span>
          <button className={styles.retryBtn} onClick={crud.fetchData}>Reintentar</button>
        </div>
      )}

      {!crud.loading && !crud.error && crud.users.length === 0 && (
        <div className={styles.emptyState}>
          <Ghost size={40} />
          <span>No se encontraron usuarios</span>
        </div>
      )}

      {!crud.loading && !crud.error && crud.users.length > 0 && (
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Verificado</th>
                <th>Registro</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {crud.users.map((user) => (
                <tr key={user.id} onClick={() => openDetail(user)}>
                  <td>
                    <div className={styles.userInfo}>
                      <div className={styles.avatar}>{user.name.charAt(0)}</div>
                      <span className={styles.userName}>{user.name}</span>
                    </div>
                  </td>
                  <td className={styles.emailCell}>{user.email}</td>
                  <td>
                    <span className={`${styles.roleBadge} ${styles[`role${user.role}`] || styles.roleStudent}`}>
                      {roleLabels[user.role] || user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[statusInfo(user).className]}`}>
                      {statusInfo(user).label}
                    </span>
                  </td>
                  <td>
                    <span className={user.emailVerified ? styles.verifiedYes : styles.verifiedNo}>
                      {user.emailVerified ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td className={styles.dateCell}>{new Date(user.createdAt).toLocaleDateString('es-ES')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
                      {!user.deletedAt && (
                        <button className={styles.actionBtn} title="Editar" onClick={() => openEdit(user)}><Edit size={15} /></button>
                      )}
                      {!user.deletedAt && (
                        <button className={`${styles.actionBtn} ${styles.actionDelete}`} title="Eliminar" onClick={() => crud.confirmDelete(user.id, user.name)}><Trash2 size={15} /></button>
                      )}
                      {user.deletedAt && (
                        <button className={styles.actionBtn} title="Restaurar" disabled={crud.restoringId === user.id} onClick={async () => { await crud.handleRestore(user.id); }}>
                          <RotateCw size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.mobileList}>
            {crud.users.map((user) => (
              <div key={user.id} className={styles.mobileItem} onClick={() => openDetail(user)}>
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
                  <span className={`${styles.roleBadge} ${styles[`role${user.role}`] || styles.roleStudent}`}>{roleLabels[user.role] || user.role}</span>
                  <span className={`${styles.statusBadge} ${styles[statusInfo(user).className]}`}>{statusInfo(user).label}</span>
                  <span className={styles.dateCell}>{new Date(user.createdAt).toLocaleDateString('es-ES')}</span>
                </div>
                <div className={styles.mobileItemActions} onClick={(e) => e.stopPropagation()}>
                  {!user.deletedAt && <button className={styles.actionBtn} onClick={() => openEdit(user)}><Edit size={14} /></button>}
                  {!user.deletedAt && <button className={`${styles.actionBtn} ${styles.actionDelete}`} onClick={() => crud.confirmDelete(user.id, user.name)}><Trash2 size={14} /></button>}
                  {user.deletedAt && <button className={styles.actionBtn} disabled={crud.restoringId === user.id} onClick={async () => await crud.handleRestore(user.id)}><RotateCw size={14} /></button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <UserDetailModal
        user={detailUser}
        onClose={() => setDetailUser(null)}
        onEdit={(user) => openEdit(user)}
        onDelete={(user) => { setDetailUser(null); crud.confirmDelete(user.id, user.name); }}
        onRestore={crud.handleRestore}
      />

      {(showCreate || editUser) && (
        <UserFormModal user={editUser} onClose={() => { setShowCreate(false); setEditUser(null); }} onSave={handleSave} />
      )}

      <ConfirmDialog
        open={!!crud.deleteTarget}
        title="Eliminar usuario"
        message={crud.deleteTarget ? `¿Estás seguro de eliminar a "${crud.deleteTarget.title}"? El usuario quedará desactivado y podrás restaurarlo después.` : ''}
        confirmLabel="Eliminar"
        onConfirm={crud.handleDelete}
        onCancel={crud.cancelDelete}
      />
    </div>
  );
}
