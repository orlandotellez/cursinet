'use client';

import { useState, useEffect } from 'react';
import { X, Save, Loader2, AlertCircle } from 'lucide-react';
import styles from '../page.module.css';

const LESSON_TYPES = [
  { value: 'Video', label: 'Video' },
  { value: 'Text', label: 'Texto' },
  { value: 'Code', label: 'Código' },
  { value: 'Quiz', label: 'Quiz' },
  { value: 'Resource', label: 'Recurso' },
] as const;

export interface LessonFormData {
  title: string;
  type: 'Video' | 'Text' | 'Code' | 'Quiz' | 'Resource';
  isPreview: boolean;
  videoUrl: string;
  videoDurationSeconds: string;
  contentMarkdown: string;
}

interface LessonFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  initialData?: Partial<LessonFormData>;
  onSave: (data: LessonFormData) => Promise<void>;
}

const emptyForm: LessonFormData = {
  title: '',
  type: 'Video',
  isPreview: false,
  videoUrl: '',
  videoDurationSeconds: '0',
  contentMarkdown: '',
};

export function LessonFormModal({
  isOpen,
  onClose,
  mode,
  initialData,
  onSave,
}: LessonFormModalProps) {
  const [form, setForm] = useState<LessonFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setForm({ ...emptyForm, ...initialData });
      setError(null);
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('El título es obligatorio');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  const isVideo = form.type === 'Video';
  const isText = form.type === 'Text';

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.modal} ${styles.modalWide}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            {mode === 'create' ? 'Nueva Lección' : 'Editar Lección'}
          </h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form className={styles.modalForm} onSubmit={handleSubmit}>
          {error && (
            <div className={styles.feedbackError}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label}>Título de la lección</label>
            <input
              className={styles.input}
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Ej: Introducción a los tipos genéricos"
              required
              disabled={saving}
              autoFocus
            />
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>Tipo</label>
              <select
                className={styles.select}
                name="type"
                value={form.type}
                onChange={handleChange}
                disabled={saving}
              >
                {LESSON_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.checkField}>
              <label className={styles.checkLabel}>
                <input
                  type="checkbox"
                  name="isPreview"
                  checked={form.isPreview}
                  onChange={handleChange}
                  disabled={saving}
                  className={styles.checkbox}
                />
                <span>Vista previa gratuita</span>
              </label>
            </div>
          </div>

          {isVideo && (
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>URL del video (YouTube)</label>
                <input
                  className={styles.input}
                  name="videoUrl"
                  value={form.videoUrl}
                  onChange={handleChange}
                  placeholder="https://www.youtube.com/watch?v=..."
                  disabled={saving}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Duración (segundos)</label>
                <input
                  className={styles.input}
                  name="videoDurationSeconds"
                  type="number"
                  min="0"
                  value={form.videoDurationSeconds}
                  onChange={handleChange}
                  placeholder="300"
                  disabled={saving}
                />
              </div>
            </div>
          )}

          {isText && (
            <div className={styles.field}>
              <label className={styles.label}>Contenido (Markdown)</label>
              <textarea
                className={styles.textarea}
                name="contentMarkdown"
                value={form.contentMarkdown}
                onChange={handleChange}
                placeholder="Escribí el contenido de la lección en formato Markdown..."
                rows={10}
                disabled={saving}
              />
            </div>
          )}

          {!isVideo && !isText && (
            <div className={styles.field}>
              <p className={styles.fieldHint}>
                Las lecciones de tipo {form.type} se mostrarán como "Próximamente"
                en el visor de estudiantes. Podrás agregar contenido más adelante.
              </p>
            </div>
          )}

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </button>
            <button type="submit" className={styles.submitBtn} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 size={16} className={styles.spinner} />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={16} />
                  {mode === 'create' ? 'Crear Lección' : 'Guardar Cambios'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
