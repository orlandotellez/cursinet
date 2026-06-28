'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { Spinner } from '@/src/shared/components/Spinner';
import { useToastStore } from '@/src/shared/store/useToastStore';
import { getCategories, type CategoryDTO } from '@/src/shared/api/courses';
import { validateShape } from '@/src/shared/lib/validation';
import { createCourseSchema } from '@/src/shared/validations';
import { createCourse, updateCourse, type CourseDTO } from '@/src/shared/api/courses';
import styles from './CourseFormModal.module.css';

const LEVELS = [
  { value: 'Beginner', label: 'Principiante' },
  { value: 'Intermediate', label: 'Intermedio' },
  { value: 'Advanced', label: 'Avanzado' },
  { value: 'Expert', label: 'Experto' },
];

export interface CourseFormData {
  title: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  level: string;
  price: string;
  previewVideoUrl: string;
  durationMinutes: string;
  requirements: string;
  learningObjectives: string;
  isFree: boolean;
}

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  initialData?: Partial<CourseFormData>;
  courseId?: string; // Para edición
  onSaved?: (course: CourseDTO) => void;
}

const emptyForm: CourseFormData = {
  title: '',
  shortDescription: '',
  description: '',
  categoryId: '',
  level: 'Beginner',
  price: '0',
  previewVideoUrl: '',
  durationMinutes: '0',
  requirements: '',
  learningObjectives: '',
  isFree: false,
};

export default function CourseFormModal({
  isOpen,
  onClose,
  mode,
  initialData,
  courseId,
  onSaved,
}: CourseFormModalProps) {
  const [form, setForm] = useState<CourseFormData>(emptyForm);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Cargar categorías al abrir
  useEffect(() => {
    if (isOpen) {
      setLoadingCategories(true);
      setError(null);
      setSuccess(null);
      getCategories()
        .then((cats) => {
          setCategories(cats.filter((c) => c.isActive));
          setLoadingCategories(false);
        })
        .catch(() => {
          useToastStore.getState().error('No se pudieron cargar las categorías');
          setError('No se pudieron cargar las categorías');
          setLoadingCategories(false);
        });
    }
  }, [isOpen]);

  // Inicializar formulario
  useEffect(() => {
    if (isOpen) {
      setForm(initialData ? { ...emptyForm, ...initialData } : emptyForm);
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, initialData]);

  // Cerrar con Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const numericPrice = parseFloat(form.price);
    const duration = parseInt(form.durationMinutes, 10);

    const requirements = form.requirements
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const learningObjectives = form.learningObjectives
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    // Validar contra schema compartido
    const payload = {
      title: form.title,
      categoryId: form.categoryId,
      level: form.level,
      shortDescription: form.shortDescription || null,
      description: form.description || null,
      previewVideoUrl: form.previewVideoUrl || null,
      durationMinutes: duration,
      price: form.isFree ? 0 : numericPrice,
      isFree: form.isFree,
      requirements: requirements.length > 0 ? requirements : undefined,
      learningObjectives: learningObjectives.length > 0 ? learningObjectives : undefined,
    };

    const validation = validateShape(createCourseSchema, payload);
    if (!validation.success) {
      const firstError = Object.values(validation.fieldErrors)[0];
      setError(firstError);
      return;
    }

    setLoading(true);

    try {
      if (mode === 'create') {
        const created = await createCourse(payload);
        setSuccess(`Curso "${created.title}" creado exitosamente 🎉`);
        if (onSaved) onSaved(created);
        setTimeout(() => onClose(), 1500);
      } else if (mode === 'edit' && courseId) {
        const updated = await updateCourse(courseId, {
          title: form.title !== '' ? form.title : null,
          categoryId: form.categoryId !== '' ? form.categoryId : null,
          level: form.level,
          shortDescription: form.shortDescription || null,
          description: form.description || null,
          previewVideoUrl: form.previewVideoUrl || null,
          durationMinutes: duration,
          price: numericPrice,
          isFree: form.isFree,
          requirements: requirements.length > 0 ? requirements : null,
          learningObjectives: learningObjectives.length > 0 ? learningObjectives : null,
        });
        setSuccess(`Curso "${updated.title}" actualizado exitosamente 🎉`);
        if (onSaved) onSaved(updated);
        setTimeout(() => onClose(), 1500);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar el curso';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {mode === 'create' ? 'Crear Nuevo Curso' : 'Editar Curso'}
          </h2>
          <button className={styles.closeBtn} onClick={onClose} title="Cerrar">
            <X size={18} />
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {/* ── Feedback messages ── */}
          {error && (
            <div className={styles.feedbackError}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className={styles.feedbackSuccess}>
              <CheckCircle size={16} />
              <span>{success}</span>
            </div>
          )}

          {/* ── Información básica ── */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Información básica</h3>

            <div className={styles.field}>
              <label className={styles.label}>Título del curso</label>
              <input
                className={styles.input}
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Ej: Arquitectura Hexagonal en TypeScript"
                required
                disabled={loading}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Descripción corta</label>
              <textarea
                className={styles.textarea}
                name="shortDescription"
                value={form.shortDescription}
                onChange={handleChange}
                placeholder="Breve descripción del curso (máx 200 caracteres)"
                rows={2}
                disabled={loading}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Descripción completa</label>
              <textarea
                className={styles.textarea}
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Descripción detallada del curso. Incluí qué se va a aprender, requisitos, etc."
                rows={5}
                disabled={loading}
              />
            </div>
          </div>

          {/* ── Video ── */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Video</h3>

            <div className={styles.field}>
              <label className={styles.label}>Link de YouTube</label>
              <input
                className={styles.input}
                name="previewVideoUrl"
                value={form.previewVideoUrl}
                onChange={handleChange}
                placeholder="https://www.youtube.com/watch?v=..."
                disabled={loading}
              />
              <span className={styles.fieldHint}>
                Pegá el link de YouTube del video de presentación del curso
              </span>
            </div>
          </div>

          {/* ── Clasificación ── */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Clasificación</h3>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Categoría</label>
                <select
                  className={styles.select}
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  required
                  disabled={loading || loadingCategories}
                >
                  <option value="">
                    {loadingCategories ? 'Cargando categorías...' : 'Seleccionar categoría'}
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Nivel</label>
                <select
                  className={styles.select}
                  name="level"
                  value={form.level}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  {LEVELS.map((lvl) => (
                    <option key={lvl.value} value={lvl.value}>
                      {lvl.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Duración (minutos)</label>
                <input
                  className={styles.input}
                  name="durationMinutes"
                  type="number"
                  min="0"
                  value={form.durationMinutes}
                  onChange={handleChange}
                  placeholder="480"
                  disabled={loading}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Precio ($)</label>
                <input
                  className={styles.input}
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="49.99"
                  disabled={loading || form.isFree}
                  required={!form.isFree}
                />
              </div>
            </div>

            <div className={styles.checkField}>
              <label className={styles.checkLabel}>
                <input
                  type="checkbox"
                  name="isFree"
                  checked={form.isFree}
                  onChange={handleChange}
                  disabled={loading}
                  className={styles.checkbox}
                />
                <span>Curso gratuito</span>
              </label>
            </div>
          </div>

          {/* ── Contenido ── */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Contenido del curso</h3>

            <div className={styles.field}>
              <label className={styles.label}>Requisitos (uno por línea)</label>
              <textarea
                className={styles.textarea}
                name="requirements"
                value={form.requirements}
                onChange={handleChange}
                placeholder="Conocimientos básicos de TypeScript&#10;Node.js instalado&#10;Familiaridad con React"
                rows={3}
                disabled={loading}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Objetivos de aprendizaje (uno por línea)</label>
              <textarea
                className={styles.textarea}
                name="learningObjectives"
                value={form.learningObjectives}
                onChange={handleChange}
                placeholder="Dominar tipos genéricos&#10;Implementar patrones de diseño&#10;Escribir código type-safe"
                rows={3}
                disabled={loading}
              />
            </div>
          </div>

          {/* ── Actions ── */}
          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading || loadingCategories}>
              {loading ? (
                <>
                  <Spinner size="sm" className={styles.spinner} />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={16} />
                  {mode === 'create' ? 'Crear Curso' : 'Guardar Cambios'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
