'use client'

import { User } from 'lucide-react';
import styles from './FormSection.module.css';

interface ProfileData {
  name: string;
  email: string;
  bio: string;
}

interface ProfileSectionProps {
  profile: ProfileData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function ProfileSection({ profile, onChange }: ProfileSectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <User size={18} />
        <h2 className={styles.title}>Perfil</h2>
      </div>
      <div className={styles.fields}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="name">Nombre</label>
          <input
            id="name"
            name="name"
            type="text"
            className={styles.input}
            value={profile.name}
            onChange={onChange}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            name="email"
            type="email"
            className={styles.input}
            value={profile.email}
            onChange={onChange}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="bio">Biografía</label>
          <textarea
            id="bio"
            name="bio"
            className={styles.textarea}
            rows={3}
            value={profile.bio}
            onChange={onChange}
          />
        </div>
      </div>
    </section>
  );
}
