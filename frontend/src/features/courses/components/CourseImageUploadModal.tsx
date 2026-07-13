'use client';

import { useState, useRef } from 'react';
import { X, Upload, ImageIcon, AlertCircle } from 'lucide-react';
import { uploadCourseImage, updateCourse, type CourseDTO } from '@/src/shared/api/courses';
import { useToastStore } from '@/src/shared/store/useToastStore';
import styles from './CourseImageUploadModal.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  course: CourseDTO;
  onSaved?: (course: CourseDTO) => void;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export default function CourseImageUploadModal({ isOpen, onClose, course, onSaved }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Formato no soportado. Usá JPG, PNG, GIF o WebP.');
      return;
    }

    if (file.size > MAX_SIZE) {
      setError('La imagen supera los 10 MB.');
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  }

  function handleRemoveSelection() {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleUpload() {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      const { url } = await uploadCourseImage(selectedFile);
      const updated = await updateCourse(course.id, { thumbnailUrl: url });
      useToastStore.getState().success('Imagen actualizada correctamente');
      onSaved?.(updated);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al subir la imagen';
      setError(msg);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Imagen del curso</h2>
          <button className={styles.closeBtn} onClick={onClose} title="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className={styles.body}>
          {/* Current image */}
          <div className={styles.section}>
            <label className={styles.sectionLabel}>Imagen actual</label>
            <div className={styles.currentImageWrapper}>
              {course.thumbnailUrl ? (
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className={styles.currentImage}
                />
              ) : (
                <div className={styles.placeholder}>
                  <ImageIcon size={32} />
                  <span>Sin imagen</span>
                </div>
              )}
            </div>
          </div>

          {/* New image selector */}
          <div className={styles.section}>
            <label className={styles.sectionLabel}>Nueva imagen</label>

            {!preview ? (
              <label className={styles.dropZone}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleFileSelect}
                  className={styles.fileInput}
                />
                <Upload size={24} />
                <span className={styles.dropText}>
                  Hacé clic para seleccionar una imagen
                </span>
                <span className={styles.dropHint}>
                  JPG, PNG, GIF o WebP — Máx 10 MB
                </span>
              </label>
            ) : (
              <div className={styles.previewWrapper}>
                <img src={preview} alt="Preview" className={styles.preview} />
                <button
                  className={styles.removeBtn}
                  onClick={handleRemoveSelection}
                  disabled={uploading}
                >
                  <X size={16} /> Eliminar selección
                </button>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className={styles.feedbackError}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={uploading}>
            Cancelar
          </button>
          <button
            className={styles.submitBtn}
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? (
              <>
                <span className={styles.spinner} />
                Subiendo...
              </>
            ) : (
              <>
                <Upload size={16} />
                Subir imagen
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
