'use client';

import { useState } from 'react';
import {
  createModule,
  updateModule,
  deleteModule,
  reorderModules,
  type ModuleResponse,
} from '@/src/shared/api/courses';
import type { LessonSummary } from '@/src/shared/api/courses';
import { useToastStore } from '@/src/shared/store/useToastStore';

export function useModuleCrud(cursoId: string, fetchData: () => Promise<void>) {
  const [modules, setModules] = useState<ModuleResponse[]>([]);
  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [moduleModalMode, setModuleModalMode] = useState<'create' | 'edit'>('create');
  const [editingModule, setEditingModule] = useState<ModuleResponse | null>(null);

  function handleOpenCreateModule() {
    setModuleModalMode('create');
    setEditingModule(null);
    setModuleModalOpen(true);
  }

  function handleOpenEditModule(mod: ModuleResponse) {
    setModuleModalMode('edit');
    setEditingModule(mod);
    setModuleModalOpen(true);
  }

  function getModuleInitialData(): { title: string; description: string } | undefined {
    if (!editingModule) return undefined;
    return {
      title: editingModule.title,
      description: editingModule.description ?? '',
    };
  }

  async function handleSaveModule(data: { title: string; description?: string }) {
    if (moduleModalMode === 'create') {
      const created = await createModule(cursoId, {
        title: data.title,
        description: data.description || null,
      });
      setModules((prev) => [...prev, created]);
    } else if (editingModule) {
      const updated = await updateModule(cursoId, editingModule.id, {
        title: data.title,
        description: data.description || null,
      });
      setModules((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    }
  }

  async function handleDeleteModule(mod: ModuleResponse) {
    if (!window.confirm(`¿Estás seguro de eliminar "${mod.title}" y todas sus lecciones?`)) return;
    try {
      await deleteModule(cursoId, mod.id);
      setModules((prev) => prev.filter((m) => m.id !== mod.id));
    } catch (err) {
      useToastStore.getState().error(err instanceof Error ? err.message : 'Error al eliminar módulo');
    }
  }

  async function handleTogglePublishModule(mod: ModuleResponse) {
    try {
      const updated = await updateModule(cursoId, mod.id, { isPublished: !mod.isPublished });
      setModules((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    } catch (err) {
      useToastStore.getState().error(err instanceof Error ? err.message : 'Error al cambiar estado del módulo');
    }
  }

  async function handleDragEnd(
    activeId: string,
    overId: string | null,
    rollback: () => void,
  ) {
    if (!overId || activeId === overId) return;

    const oldIndex = modules.findIndex((m) => m.id === activeId);
    const newIndex = modules.findIndex((m) => m.id === overId);
    if (oldIndex === -1 || newIndex === -1) return;

    setModules((prev) => {
      const reordered = [...prev];
      const [moved] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, moved);

      // Fire API optimistically
      reorderModules(cursoId, {
        items: reordered.map((m, i) => ({ id: m.id, sortOrder: i })),
      }).catch(() => rollback());

      return reordered;
    });
  }

  return {
    // State
    modules, setModules,
    moduleModalOpen, setModuleModalOpen,
    moduleModalMode,
    editingModule,

    // Actions
    handleOpenCreateModule,
    handleOpenEditModule,
    getModuleInitialData,
    handleSaveModule,
    handleDeleteModule,
    handleTogglePublishModule,
    handleDragEnd,
  };
}
