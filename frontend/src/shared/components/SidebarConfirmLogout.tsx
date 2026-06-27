'use client';

import { X } from 'lucide-react';
import styles from './SidebarConfirmLogout.module.css';

interface SidebarConfirmLogoutProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SidebarConfirmLogout({ open, onConfirm, onCancel }: SidebarConfirmLogoutProps) {
  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>Cerrar sesión</h3>
          <button
            className={styles.close}
            onClick={onCancel}
            aria-label="Cancelar"
          >
            <X size={18} />
          </button>
        </div>
        <p className={styles.body}>
          ¿Estás seguro de que querés cerrar sesión?
        </p>
        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onCancel}>
            Cancelar
          </button>
          <button className={styles.accept} onClick={onConfirm}>
            Sí, cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
