'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Save } from 'lucide-react';
import { categories } from '@/src/features/courses/data';
import type { Level } from '@/src/shared/types';
import styles from './CourseFormModal.module.css';

export interface CourseFormData {
  title: string;
  slug: string;
  shortDescription: string;
  category: string;
  level: Level;
  price: string;
  tags: string;
}

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  initialData?: Partial<CourseFormData>;
}

const emptyForm: CourseFormData = {
  title: '',
  slug: '',
  shortDescription: '',
  category: '',
  level: 'beginner',
  price: '',
  tags: '',
};

export default function CourseFormModal({
  isOpen,
  onClose,
  mode,
  initialData,
}: CourseFormModalProps) {
  const [form, setForm] = useState<CourseFormData>(emptyForm);

  useEffect(() => {
    if (isOpen) {
      setForm(initialData ? { ...emptyForm, ...initialData } : emptyForm);
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
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = mode === 'create'
      ? 'Curso creado exitosamente (simulado)'
      : 'Curso actualizado exitosamente (simulado)';
    alert(msg);
    onClose();
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
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Slug</label>
              <input
                className={styles.input}
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="Ej: arquitectura-hexagonal-typescript"
                required
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
                rows={3}
                required
              />
            </div>
          </div>

          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Clasificación</h3>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Categoría</label>
                <select
                  className={styles.select}
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
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
                >
                  <option value="beginner">Principiante</option>
                  <option value="intermediate">Intermedio</option>
                  <option value="advanced">Avanzado</option>
                </select>
              </div>
            </div>

            <div className={styles.row}>
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
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Tags</label>
                <input
                  className={styles.input}
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                  placeholder="typescript, ddd, arquitectura"
                />
              </div>
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={styles.submitBtn}>
              <Save size={16} />
              {mode === 'create' ? 'Crear Curso' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
