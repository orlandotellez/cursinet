'use client';

import { useState, useCallback, useRef } from 'react';
import { getUsers, deleteUser, restoreUser, type UserDTO } from '@/src/shared/api/auth';
import { useToastStore } from '@/src/shared/store/useToastStore';

export type RoleFilter = 'all' | 'Admin' | 'Instructor' | 'Student' | 'Moderator' | 'deleted';

export interface DeleteTarget {
  id: string;
  title: string;
}

export function useUserCrud() {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
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

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      await fetchData();
    } catch (err) {
      useToastStore.getState().error(err instanceof Error ? err.message : 'Error al eliminar');
    }
  }

  async function handleRestore(id: string) {
    setRestoringId(id);
    try {
      await restoreUser(id);
      await fetchData();
    } catch (err) {
      useToastStore.getState().error(err instanceof Error ? err.message : 'Error al restaurar');
    } finally {
      setRestoringId(null);
    }
  }

  function confirmDelete(id: string, title: string) {
    deleteIdRef.current = id;
    setDeleteTarget({ id, title });
  }

  function cancelDelete() {
    setDeleteTarget(null);
  }

  return {
    // State
    users,
    loading,
    error,
    search, setSearch,
    roleFilter, setRoleFilter,
    deleteTarget,
    restoringId,

    // Actions
    fetchData,
    handleDelete,
    handleRestore,
    confirmDelete,
    cancelDelete,
  };
}
