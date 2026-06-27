'use client';

import { useState, useCallback } from 'react';
import { createLesson, updateLesson, deleteLesson } from '@/src/shared/api/lessons';
import type { ModuleResponse, LessonSummary } from '@/src/shared/api/modules';

export interface LessonFormData {
  title: string;
  type: 'Video' | 'Text' | 'Code' | 'Quiz' | 'Resource';
  isPreview: boolean;
  videoUrl: string;
  videoDurationSeconds: string;
  contentMarkdown: string;
}

export function useLessonCrud(cursoId: string) {
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [lessonModalMode, setLessonModalMode] = useState<'create' | 'edit'>('create');
  const [editingLesson, setEditingLesson] = useState<LessonSummary | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);

  function handleOpenCreateLesson(moduleId: string) {
    setLessonModalMode('create');
    setEditingLesson(null);
    setActiveModuleId(moduleId);
    setLessonModalOpen(true);
  }

  function handleOpenEditLesson(moduleId: string, lesson: LessonSummary) {
    setLessonModalMode('edit');
    setEditingLesson(lesson);
    setActiveModuleId(moduleId);
    setLessonModalOpen(true);
  }

  function getLessonInitialData(): Partial<LessonFormData> | undefined {
    if (!editingLesson) return undefined;
    return {
      title: editingLesson.title,
      type: editingLesson.type,
      isPreview: editingLesson.isPreview,
      videoUrl: '',
      videoDurationSeconds: String(editingLesson.videoDurationSeconds ?? '0'),
      contentMarkdown: '',
    };
  }

  const handleSaveLesson = useCallback(
    async (data: LessonFormData, setModules: React.Dispatch<React.SetStateAction<ModuleResponse[]>>) => {
      if (!activeModuleId) return;
      const modId = activeModuleId;

      if (lessonModalMode === 'create') {
        const created = await createLesson(modId, {
          title: data.title,
          type: data.type,
          isPreview: data.isPreview,
          videoUrl: data.videoUrl || null,
          videoDurationSeconds: data.type === 'Video' ? parseInt(data.videoDurationSeconds, 10) || null : null,
          contentMarkdown: data.type === 'Text' ? data.contentMarkdown || null : null,
        });
        setModules((prev) =>
          prev.map((m) =>
            m.id === modId
              ? { ...m, lessons: [...(m.lessons ?? []), created] as LessonSummary[] }
              : m,
          ),
        );
      } else if (editingLesson) {
        const updated = await updateLesson(modId, editingLesson.id, {
          title: data.title,
          type: data.type,
          isPreview: data.isPreview,
          videoUrl: data.videoUrl || null,
          videoDurationSeconds: data.type === 'Video' ? parseInt(data.videoDurationSeconds, 10) || null : null,
          contentMarkdown: data.type === 'Text' ? data.contentMarkdown || null : null,
        });
        setModules((prev) =>
          prev.map((m) =>
            m.id === modId
              ? {
                  ...m,
                  lessons: (m.lessons ?? []).map((l) =>
                    l.id === updated.id ? ({ ...updated } as LessonSummary) : l,
                  ),
                }
              : m,
          ),
        );
      }
    },
    [activeModuleId, lessonModalMode, editingLesson],
  );

  async function handleDeleteLesson(
    modId: string,
    lesson: LessonSummary,
    setModules: React.Dispatch<React.SetStateAction<ModuleResponse[]>>,
  ) {
    if (!window.confirm(`¿Estás seguro de eliminar "${lesson.title}"?`)) return;
    try {
      await deleteLesson(modId, lesson.id);
      setModules((prev) =>
        prev.map((m) =>
          m.id === modId
            ? { ...m, lessons: (m.lessons ?? []).filter((l) => l.id !== lesson.id) }
            : m,
        ),
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar lección');
    }
  }

  async function handleTogglePublishLesson(
    modId: string,
    lesson: LessonSummary,
    setModules: React.Dispatch<React.SetStateAction<ModuleResponse[]>>,
  ) {
    try {
      const updated = await updateLesson(modId, lesson.id, { isPublished: !lesson.isPublished });
      setModules((prev) =>
        prev.map((m) =>
          m.id === modId
            ? {
                ...m,
                lessons: (m.lessons ?? []).map((l) =>
                  l.id === updated.id ? { ...l, isPublished: updated.isPublished } : l,
                ),
              }
            : m,
        ),
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al cambiar estado de la lección');
    }
  }

  return {
    // State
    lessonModalOpen, setLessonModalOpen,
    lessonModalMode,
    editingLesson,
    activeModuleId,

    // Actions
    handleOpenCreateLesson,
    handleOpenEditLesson,
    getLessonInitialData,
    handleSaveLesson,
    handleDeleteLesson,
    handleTogglePublishLesson,
  };
}
