'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Spinner } from '@/src/shared/components/Spinner';
import type { UserDTO, CreateUserPayload, UpdateUserPayload } from '@/src/shared/api/users';
import styles from './page.module.css';

interface Props {
  user?: UserDTO | null;         // null → create mode
  onClose: () => void;
  onSave: (payload: CreateUserPayload | UpdateUserPayload) => Promise<void>;
}

export interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: string;
  phone: string;
  bio: string;
  userName: string;
  websiteUrl: string;
  githubUrl: string;
  linkedinUrl: string;
}

const roles = [
  { value: 'Student', label: 'Estudiante' },
  { value: 'Instructor', label: 'Instructor' },
  { value: 'Admin', label: 'Administrador' },
  { value: 'Moderator', label: 'Moderador' },
];

export default function UserFormModal({ user, onClose, onSave }: Props) {
  const isEdit = !!user;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(user?.role ?? 'Student');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [userName, setUserName] = useState(user?.userName ?? '');
  const [websiteUrl, setWebsiteUrl] = useState(user?.websiteUrl ?? '');
  const [githubUrl, setGithubUrl] = useState(user?.githubUrl ?? '');
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedinUrl ?? '');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) { setError('El nombre es obligatorio'); return; }
    if (!email.trim()) { setError('El email es obligatorio'); return; }
    if (!isEdit && !password) { setError('La contraseña es obligatoria'); return; }

    setSaving(true);
    try {
      if (isEdit) {
        const payload: UpdateUserPayload = {
          name: name.trim() || undefined,
          email: email.trim() || undefined,
          role: role || undefined,
          phone: phone || null,
          bio: bio || null,
          userName: userName || null,
          websiteUrl: websiteUrl || null,
          githubUrl: githubUrl || null,
          linkedinUrl: linkedinUrl || null,
        };
        await onSave(payload);
      } else {
        const payload: CreateUserPayload = {
          name: name.trim(),
          email: email.trim(),
          password: password,
          role: role,
          phone: phone || undefined,
        };
        await onSave(payload);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.formModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.formHeader}>
          <h2 className={styles.formTitle}>{isEdit ? 'Editar usuario' : 'Crear usuario'}</h2>
          <button className={styles.detailClose} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.formBody}>
          {error && <div className={styles.formError}>{error}</div>}

          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label htmlFor="name">Nombre *</label>
              <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre completo" />
            </div>

            <div className={styles.formField}>
              <label htmlFor="email">Email *</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" />
            </div>

            <div className={styles.formField}>
              <label htmlFor="password">{isEdit ? 'Contraseña (dejar vacío para mantener)' : 'Contraseña *'}</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>

            <div className={styles.formField}>
              <label htmlFor="role">Rol</label>
              <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div className={styles.formField}>
              <label htmlFor="phone">Teléfono</label>
              <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+54 11 1234-5678" />
            </div>

            <div className={styles.formField}>
              <label htmlFor="username">Username</label>
              <input id="username" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="usuario" />
            </div>

            <div className={styles.formFieldFull}>
              <label htmlFor="bio">Bio</label>
              <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Breve descripción del usuario" rows={3} />
            </div>

            <div className={styles.formField}>
              <label htmlFor="website">Sitio web</label>
              <input id="website" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://..." />
            </div>

            <div className={styles.formField}>
              <label htmlFor="github">GitHub</label>
              <input id="github" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/..." />
            </div>

            <div className={styles.formField}>
              <label htmlFor="linkedin">LinkedIn</label>
              <input id="linkedin" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/..." />
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.formCancel} onClick={onClose}>Cancelar</button>
            <button type="submit" className={styles.formSubmit} disabled={saving}>
              {saving ? <Spinner size="sm" className={styles.spinner} /> : null}
              {isEdit ? 'Guardar cambios' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
