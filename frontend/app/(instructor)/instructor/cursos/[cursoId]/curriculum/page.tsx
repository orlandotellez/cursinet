'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Plus,
  ArrowLeft,
  Loader2,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { getCourseById, type CourseDTO } from '@/src/shared/api/courses';
import {
  getModules,
  createModule,
  updateModule,
  deleteModule,
  reorderModules,
  type ModuleResponse,
  type LessonSummary,
} from '@/src/shared/api/modules';
import {
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
} from '@/src/shared/api/lessons';
import { ModuleCard } from './components/ModuleCard';
import { ModuleFormModal, type ModuleFormData } from './components/ModuleFormModal';
import { LessonFormModal, type LessonFormData } from './components/LessonFormModal';
import styles from './page.module.css';

export default function CurriculumEditorPage() {
  const params = useParams();
  const router = useRouter();
  const cursoId = params.cursoId as string;

  const [course, setCourse] = useState<CourseDTO | null>(null);
  const [modules, setModules] = useState<ModuleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Module modal state
  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [moduleModalMode, setModuleModalMode] = useState<'create' | 'edit'>('create');
  const [editingModule, setEditingModule] = useState<ModuleResponse | null>(null);

  // Lesson modal state
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [lessonModalMode, setLessonModalMode] = useState<'create' | 'edit'>('create');
  const [editingLesson, setEditingLesson] = useState<LessonSummary | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  // ─── Data fetching ──────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [courseData, modulesData] = await Promise.all([
        getCourseById(cursoId),
        getModules(cursoId),
      ]);
      setCourse(courseData);
      setModules(modulesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [cursoId]);

  useEffect(() => {
    if (cursoId) fetchData();
  }, [cursoId, fetchData]);

  // ─── Module CRUD ────────────────────────────────────────────────────────

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

  async function handleSaveModule(data: ModuleFormData) {
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
    setDeletingId(mod.id);
    try {
      await deleteModule(cursoId, mod.id);
      setModules((prev) => prev.filter((m) => m.id !== mod.id));
      if (expandedId === mod.id) setExpandedId(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar módulo');
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = modules.findIndex((m) => m.id === active.id);
    const newIndex = modules.findIndex((m) => m.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...modules];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    // Optimistic update
    setModules(reordered);

    // Send to API
    try {
      await reorderModules(cursoId, {
        items: reordered.map((m, i) => ({ id: m.id, sortOrder: i })),
      });
    } catch (err) {
      // Rollback on error
      fetchData();
    }
  }

  // ─── Lesson CRUD ────────────────────────────────────────────────────────

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

  function getLessonFormData(lesson: LessonSummary | null): Partial<LessonFormData> | undefined {
    if (!lesson) return undefined;
    return {
      title: lesson.title,
      type: lesson.type,
      isPreview: lesson.isPreview,
      videoUrl: '',
      videoDurationSeconds: String(lesson.videoDurationSeconds ?? '0'),
      contentMarkdown: '',
    };
  }

  async function handleSaveLesson(data: LessonFormData) {
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
                  l.id === updated.id ? ({ ...updated }) : l,
                ),
              }
            : m,
        ),
      );
    }
  }

  async function handleDeleteLesson(modId: string, lesson: LessonSummary) {
    if (!window.confirm(`¿Estás seguro de eliminar "${lesson.title}"?`)) return;
    setDeletingId(lesson.id);
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
    } finally {
      setDeletingId(null);
    }
  }

  // ─── Publish / Unpublish toggles ──────────────────────────────────────

  async function handleTogglePublishModule(mod: ModuleResponse) {
    try {
      const updated = await updateModule(cursoId, mod.id, { isPublished: !mod.isPublished });
      setModules((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al cambiar estado del módulo');
    }
  }

  async function handleTogglePublishLesson(modId: string, lesson: LessonSummary) {
    try {
      const updated = await updateLesson(modId, lesson.id, { isPublished: !lesson.isPublished });
      setModules((prev) =>
        prev.map((m) =>
          m.id === modId
            ? { ...m, lessons: (m.lessons ?? []).map((l) => (l.id === updated.id ? { ...l, isPublished: updated.isPublished } : l)) }
            : m,
        ),
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al cambiar estado de la lección');
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.centerState}>
          <Loader2 size={32} className={styles.spinner} />
          <p>Cargando editor de currículum...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <AlertCircle size={24} />
          <p>{error}</p>
          <button onClick={fetchData} className={styles.retryBtn}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <AlertCircle size={24} />
          <p>Curso no encontrado</p>
          <button onClick={() => router.push('/instructor/cursos')} className={styles.retryBtn}>
            Volver a mis cursos
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.page}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <button
              className={styles.backBtn}
              onClick={() => router.push('/instructor/cursos')}
            >
              <ArrowLeft size={16} />
              Mis Cursos
            </button>
            <div>
              <h1 className={styles.title}>{course.title}</h1>
              <p className={styles.subtitle}>Editor de currículum</p>
            </div>
          </div>
          <button onClick={handleOpenCreateModule} className={styles.createBtn}>
            <Plus size={16} /> Añadir Módulo
          </button>
        </div>

        {/* Modules list */}
        {modules.length === 0 ? (
          <div className={styles.emptyState}>
            <BookOpen size={48} className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>No hay módulos todavía</h3>
            <p className={styles.emptyText}>
              Creá tu primer módulo para empezar a estructurar el contenido del curso.
            </p>
            <button onClick={handleOpenCreateModule} className={styles.createBtn}>
              <Plus size={16} /> Crear Primer Módulo
            </button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={modules.map((m) => m.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className={styles.modulesList}>
                {modules.map((mod) => (
                  <ModuleCard
                    key={mod.id}
                    module={mod}
                    isExpanded={expandedId === mod.id}
                    onToggle={() =>
                      setExpandedId(expandedId === mod.id ? null : mod.id)
                    }
                    onEdit={() => handleOpenEditModule(mod)}
                    onDelete={() => handleDeleteModule(mod)}
                    onTogglePublish={() => handleTogglePublishModule(mod)}
                    onAddLesson={() => handleOpenCreateLesson(mod.id)}
                    onEditLesson={(lesson) =>
                      handleOpenEditLesson(mod.id, lesson)
                    }
                    onTogglePublishLesson={(lesson) =>
                      handleTogglePublishLesson(mod.id, lesson)
                    }
                    onDeleteLesson={(lesson) =>
                      handleDeleteLesson(mod.id, lesson)
                    }
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Module Form Modal */}
      <ModuleFormModal
        isOpen={moduleModalOpen}
        onClose={() => setModuleModalOpen(false)}
        mode={moduleModalMode}
        initialData={
          editingModule
            ? { title: editingModule.title, description: editingModule.description ?? '' }
            : undefined
        }
        onSave={handleSaveModule}
      />

      {/* Lesson Form Modal */}
      <LessonFormModal
        isOpen={lessonModalOpen}
        onClose={() => setLessonModalOpen(false)}
        mode={lessonModalMode}
        initialData={getLessonFormData(editingLesson)}
        onSave={handleSaveLesson}
      />
    </>
  );
}
