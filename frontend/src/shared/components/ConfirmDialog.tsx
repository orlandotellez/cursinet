'use client';

import { X } from 'lucide-react';
import styles from './ConfirmDialog.module.css';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={loading ? undefined : onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <button className={styles.closeBtn} onClick={loading ? undefined : onCancel} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>
        <p className={styles.body}>{message}</p>
        <div className={styles.actions}>
          <button
            className={styles.cancelBtn}
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            className={`${styles.confirmBtn} ${variant === 'danger' ? styles.confirmDanger : styles.confirmWarning}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Eliminando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
