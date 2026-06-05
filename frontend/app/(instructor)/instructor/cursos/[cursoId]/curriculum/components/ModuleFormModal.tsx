'use client';

import { useState, useEffect } from 'react';
import { X, Save, Loader2, AlertCircle } from 'lucide-react';
import styles from '../page.module.css';

export interface ModuleFormData {
  title: string;
  description: string;
}

interface ModuleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  initialData?: ModuleFormData;
  onSave: (data: ModuleFormData) => Promise<void>;
}

export function ModuleFormModal({
  isOpen,
  onClose,
  mode,
  initialData,
  onSave,
}: ModuleFormModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title ?? '');
      setDescription(initialData?.description ?? '');
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('El título es obligatorio');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({ title: title.trim(), description: description.trim() });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            {mode === 'create' ? 'Nuevo Módulo' : 'Editar Módulo'}
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
            <label className={styles.label}>Título del módulo</label>
            <input
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Introducción a TypeScript"
              required
              disabled={saving}
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Descripción (opcional)</label>
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descripción del contenido del módulo"
              rows={3}
              disabled={saving}
            />
          </div>

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
                  {mode === 'create' ? 'Crear Módulo' : 'Guardar Cambios'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
