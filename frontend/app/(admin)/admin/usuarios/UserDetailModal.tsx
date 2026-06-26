'use client';

import { X, Edit, Trash2, RotateCw } from 'lucide-react';
import type { UserDTO } from '@/src/shared/api/users';
import styles from './page.module.css';

interface Props {
  user: UserDTO | null;
  onClose: () => void;
  onEdit?: (user: UserDTO) => void;
  onDelete?: (user: UserDTO) => void;
  onRestore?: (id: string) => void;
}

function formatDate(d: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const roleLabels: Record<string, string> = {
  Admin: 'Administrador',
  Instructor: 'Instructor',
  Student: 'Estudiante',
  Moderator: 'Moderador',
};

const roleClasses: Record<string, string> = {
  Admin: 'roleAdmin',
  Instructor: 'roleInstructor',
  Student: 'roleStudent',
  Moderator: 'roleStudent',
};

export default function UserDetailModal({ user, onClose, onEdit, onDelete, onRestore }: Props) {
  if (!user) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.detailModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.detailHeader}>
          <h2 className={styles.detailTitle}>{user.name}</h2>
          <div className={styles.detailHeaderActions}>
            {!user.deletedAt && onEdit && (
              <button className={styles.detailActionBtn} title="Editar usuario" onClick={() => onEdit(user)}>
                <Edit size={16} />
              </button>
            )}
            {!user.deletedAt && onDelete && (
              <button className={`${styles.detailActionBtn} ${styles.actionDelete}`} title="Eliminar usuario" onClick={() => onDelete(user)}>
                <Trash2 size={16} />
              </button>
            )}
            {user.deletedAt && onRestore && (
              <button className={styles.detailActionBtn} title="Restaurar usuario" onClick={() => onRestore(user.id)}>
                <RotateCw size={16} />
              </button>
            )}
            <button className={styles.detailClose} onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className={styles.detailBody}>
          <div className={styles.detailGrid}>
            <div className={styles.detailField}>
              <label>ID</label>
              <span className={styles.mono}>{user.id}</span>
            </div>
            <div className={styles.detailField}>
              <label>Email</label>
              <span>{user.email}</span>
            </div>
            <div className={styles.detailField}>
              <label>Rol</label>
              <span>
                <span className={`${styles.roleBadge} ${styles[roleClasses[user.role] || 'roleStudent']}`}>
                  {roleLabels[user.role] || user.role}
                </span>
              </span>
            </div>
            <div className={styles.detailField}>
              <label>Estado</label>
              <span className={`${styles.statusBadge} ${user.deletedAt ? styles.statusSuspended : user.isActive ? styles.statusActive : styles.statusSuspended}`}>
                {user.deletedAt ? 'Eliminado' : user.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <div className={styles.detailField}>
              <label>Email verificado</label>
              <span>{user.emailVerified ? 'Sí' : 'No'}</span>
            </div>
            <div className={styles.detailField}>
              <label>Username</label>
              <span>{user.userName || '—'}</span>
            </div>
            <div className={styles.detailField}>
              <label>Teléfono</label>
              <span>{user.phone || '—'}</span>
            </div>
            <div className={styles.detailField}>
              <label>Última vez</label>
              <span>{user.lastSeenAt ? formatDate(user.lastSeenAt) : '—'}</span>
            </div>
            <div className={styles.detailField}>
              <label>Registrado</label>
              <span>{formatDate(user.createdAt)}</span>
            </div>
            {user.deletedAt && (
              <>
                <div className={styles.detailField}>
                  <label>Eliminado</label>
                  <span className={styles.deletedText}>{formatDate(user.deletedAt)}</span>
                </div>
                <div className={styles.detailField}>
                  <label>Eliminado por</label>
                  <span className={styles.deletedText}>{user.deletedByName || '—'}</span>
                </div>
              </>
            )}
          </div>

          {(user.bio || user.websiteUrl || user.githubUrl || user.linkedinUrl) && (
            <div className={styles.detailSection}>
              <h3>Información adicional</h3>
              {user.bio && (
                <div className={styles.detailField} style={{ marginBottom: 12 }}>
                  <label>Bio</label>
                  <span>{user.bio}</span>
                </div>
              )}
              {user.websiteUrl && (
                <div className={styles.detailField} style={{ marginBottom: 8 }}>
                  <label>Web</label>
                  <span>{user.websiteUrl}</span>
                </div>
              )}
              {user.githubUrl && (
                <div className={styles.detailField} style={{ marginBottom: 8 }}>
                  <label>GitHub</label>
                  <span>{user.githubUrl}</span>
                </div>
              )}
              {user.linkedinUrl && (
                <div className={styles.detailField} style={{ marginBottom: 8 }}>
                  <label>LinkedIn</label>
                  <span>{user.linkedinUrl}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
