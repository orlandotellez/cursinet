'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Search, Edit, Trash2, Plus, RotateCw, Ghost, AlertCircle, Loader } from 'lucide-react';
import { getUsers, deleteUser, restoreUser, createUser, updateUser, type UserDTO, type CreateUserPayload, type UpdateUserPayload } from '@/src/shared/api/users';
import { ConfirmDialog } from '@/src/shared/components/ConfirmDialog';
import UserDetailModal from './UserDetailModal';
import UserFormModal from './UserFormModal';
import styles from './page.module.css';

interface DeleteTarget {
  id: string;
  title: string;
}

type RoleFilter = 'all' | 'Admin' | 'Instructor' | 'Student' | 'Moderator' | 'deleted';

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
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [detailUser, setDetailUser] = useState<UserDTO | null>(null);
  const [editUser, setEditUser] = useState<UserDTO | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  // Para no perder el id al cerrar confirm dialog
  const deleteIdRef = useRef<string>('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const includeDeleted = roleFilter === 'deleted';
      const data = await getUsers({
        search: search || undefined,
        role: roleFilter !== 'all' && roleFilter !== 'deleted' ? roleFilter : undefined,
        includeDeleted,
      });

      // Si estamos en el tab "Eliminados", filtramos solo los que tienen deletedAt
      if (roleFilter === 'deleted') {
        setUsers(data.filter((u) => u.deletedAt));
      } else {
        setUsers(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Actions ──

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      setDetailUser(null);
      await fetchData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar';
      alert(msg);
    }
  }

  async function handleRestore(id: string) {
    setRestoringId(id);
    try {
      await restoreUser(id);
      setDetailUser(null);
      await fetchData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al restaurar';
      alert(msg);
    } finally {
      setRestoringId(null);
    }
  }

  async function handleSave(payload: CreateUserPayload | UpdateUserPayload) {
    if (editUser) {
      await updateUser(editUser.id, payload as UpdateUserPayload);
      setEditUser(null);
    } else {
      await createUser(payload as CreateUserPayload);
      setShowCreate(false);
    }
    await fetchData();
  }

  function openDetail(user: UserDTO) {
    setDetailUser(user);
  }

  function openEdit(user: UserDTO) {
    setEditUser(user);
    setDetailUser(null);
  }

  // ── Render ──

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

      {/* ── Loading ── */}
      {loading && (
        <div className={styles.loadingState}>
          <Loader size={32} className={styles.spinner} />
          <span>Cargando usuarios...</span>
        </div>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <div className={styles.errorState}>
          <AlertCircle size={32} />
          <span>{error}</span>
          <button className={styles.retryBtn} onClick={fetchData}>Reintentar</button>
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && !error && users.length === 0 && (
        <div className={styles.emptyState}>
          <Ghost size={40} />
          <span>No se encontraron usuarios</span>
        </div>
      )}

      {/* ── Table ── */}
      {!loading && !error && users.length > 0 && (
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
              {users.map((user) => (
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
                  <td className={styles.dateCell}>
                    {new Date(user.createdAt).toLocaleDateString('es-ES')}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
                      {!user.deletedAt && (
                        <button
                          className={styles.actionBtn}
                          title="Editar"
                          onClick={() => openEdit(user)}
                        >
                          <Edit size={15} />
                        </button>
                      )}
                      {!user.deletedAt && (
                        <button
                          className={`${styles.actionBtn} ${styles.actionDelete}`}
                          title="Eliminar"
                          onClick={() => {
                            deleteIdRef.current = user.id;
                            setDeleteTarget({ id: user.id, title: user.name });
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                      {user.deletedAt && (
                        <button
                          className={styles.actionBtn}
                          title="Restaurar"
                          disabled={restoringId === user.id}
                          onClick={async () => {
                            await handleRestore(user.id);
                          }}
                        >
                          <RotateCw size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ── Mobile list ── */}
          <div className={styles.mobileList}>
            {users.map((user) => (
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
                  <span className={`${styles.roleBadge} ${styles[`role${user.role}`] || styles.roleStudent}`}>
                    {roleLabels[user.role] || user.role}
                  </span>
                  <span className={`${styles.statusBadge} ${styles[statusInfo(user).className]}`}>
                    {statusInfo(user).label}
                  </span>
                  <span className={styles.dateCell}>
                    {new Date(user.createdAt).toLocaleDateString('es-ES')}
                  </span>
                </div>
                <div className={styles.mobileItemActions} onClick={(e) => e.stopPropagation()}>
                  {!user.deletedAt && (
                    <button
                      className={styles.actionBtn}
                      title="Editar"
                      onClick={() => openEdit(user)}
                    >
                      <Edit size={14} />
                    </button>
                  )}
                  {!user.deletedAt && (
                    <button
                      className={`${styles.actionBtn} ${styles.actionDelete}`}
                      title="Eliminar"
                      onClick={() => {
                        deleteIdRef.current = user.id;
                        setDeleteTarget({ id: user.id, title: user.name });
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  {user.deletedAt && (
                    <button
                      className={styles.actionBtn}
                      title="Restaurar"
                      disabled={restoringId === user.id}
                      onClick={async () => await handleRestore(user.id)}
                    >
                      <RotateCw size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Detail Modal ── */}
      <UserDetailModal
        user={detailUser}
        onClose={() => setDetailUser(null)}
        onEdit={(user) => openEdit(user)}
        onDelete={(user) => {
          setDetailUser(null);
          deleteIdRef.current = user.id;
          setDeleteTarget({ id: user.id, title: user.name });
        }}
        onRestore={handleRestore}
      />

      {/* ── Create / Edit Modal ── */}
      {(showCreate || editUser) && (
        <UserFormModal
          user={editUser}
          onClose={() => { setShowCreate(false); setEditUser(null); }}
          onSave={handleSave}
        />
      )}

      {/* ── Confirm Delete ── */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar usuario"
        message={
          deleteTarget
            ? `¿Estás seguro de eliminar a "${deleteTarget.title}"? El usuario quedará desactivado y podrás restaurarlo después.`
            : ''
        }
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
