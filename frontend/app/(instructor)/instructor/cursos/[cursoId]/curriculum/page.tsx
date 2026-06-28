'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, ArrowLeft, AlertCircle, BookOpen } from 'lucide-react';
import { Spinner } from '@/src/shared/components/Spinner';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { getCourseById, type CourseDTO } from '@/src/shared/api/courses';
import { getModules, type ModuleResponse } from '@/src/shared/api/courses';
import { useModuleCrud } from '@/src/features/instructor/hooks/useModuleCrud';
import { useLessonCrud, type LessonFormData } from '@/src/features/instructor/hooks/useLessonCrud';
import { ModuleCard } from './components/ModuleCard';
import { ModuleFormModal, type ModuleFormData } from './components/ModuleFormModal';
import { LessonFormModal } from './components/LessonFormModal';
import styles from './page.module.css';

export default function CurriculumEditorPage() {
  const params = useParams();
  const router = useRouter();
  const cursoId = params.cursoId as string;

  const [course, setCourse] = useState<CourseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [courseData, modulesData] = await Promise.all([
        getCourseById(cursoId),
        getModules(cursoId),
      ]);
      setCourse(courseData);
      moduleCrud.setModules(modulesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [cursoId]);

  const moduleCrud = useModuleCrud(cursoId, fetchData);
  const lessonCrud = useLessonCrud(cursoId);

  useEffect(() => {
    if (cursoId) fetchData();
  }, [cursoId, fetchData]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    moduleCrud.handleDragEnd(active.id as string, over?.id as string | null, fetchData);
  }

  async function handleSaveLesson(data: LessonFormData) {
    await lessonCrud.handleSaveLesson(data, moduleCrud.setModules);
    lessonCrud.setLessonModalOpen(false);
  }

  async function handleDeleteLesson(modId: string, lesson: { id: string; title: string }) {
    await lessonCrud.handleDeleteLesson(modId, lesson as any, moduleCrud.setModules);
  }

  // ─── Render ──

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.centerState}>
          <Spinner size="lg" className={styles.spinner} />
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
          <button onClick={fetchData} className={styles.retryBtn}>Reintentar</button>
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
          <button onClick={() => router.push('/instructor/cursos')} className={styles.retryBtn}>Volver a mis cursos</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <button className={styles.backBtn} onClick={() => router.push('/instructor/cursos')}>
              <ArrowLeft size={16} /> Mis Cursos
            </button>
            <div>
              <h1 className={styles.title}>{course.title}</h1>
              <p className={styles.subtitle}>Editor de currículum</p>
            </div>
          </div>
          <button onClick={moduleCrud.handleOpenCreateModule} className={styles.createBtn}>
            <Plus size={16} /> Añadir Módulo
          </button>
        </div>

        {moduleCrud.modules.length === 0 ? (
          <div className={styles.emptyState}>
            <BookOpen size={48} className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>No hay módulos todavía</h3>
            <p className={styles.emptyText}>Creá tu primer módulo para empezar a estructurar el contenido del curso.</p>
            <button onClick={moduleCrud.handleOpenCreateModule} className={styles.createBtn}>
              <Plus size={16} /> Crear Primer Módulo
            </button>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={moduleCrud.modules.map((m) => m.id)} strategy={verticalListSortingStrategy}>
              <div className={styles.modulesList}>
                {moduleCrud.modules.map((mod) => (
                  <ModuleCard
                    key={mod.id}
                    module={mod}
                    isExpanded={expandedId === mod.id}
                    onToggle={() => setExpandedId(expandedId === mod.id ? null : mod.id)}
                    onEdit={() => moduleCrud.handleOpenEditModule(mod)}
                    onDelete={async () => {
                      await moduleCrud.handleDeleteModule(mod);
                    }}
                    onTogglePublish={() => moduleCrud.handleTogglePublishModule(mod)}
                    onAddLesson={() => lessonCrud.handleOpenCreateLesson(mod.id)}
                    onEditLesson={(lesson) => lessonCrud.handleOpenEditLesson(mod.id, lesson)}
                    onTogglePublishLesson={(lesson) => lessonCrud.handleTogglePublishLesson(mod.id, lesson, moduleCrud.setModules)}
                    onDeleteLesson={(lesson) => handleDeleteLesson(mod.id, lesson)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <ModuleFormModal
        isOpen={moduleCrud.moduleModalOpen}
        onClose={() => moduleCrud.setModuleModalOpen(false)}
        mode={moduleCrud.moduleModalMode}
        initialData={moduleCrud.getModuleInitialData()}
        onSave={moduleCrud.handleSaveModule}
      />

      <LessonFormModal
        isOpen={lessonCrud.lessonModalOpen}
        onClose={() => lessonCrud.setLessonModalOpen(false)}
        mode={lessonCrud.lessonModalMode}
        initialData={lessonCrud.getLessonInitialData()}
        onSave={handleSaveLesson}
      />
    </>
  );
}
