'use client'

import { Lock, Eye, EyeOff } from 'lucide-react';
import styles from './FormSection.module.css';

interface PasswordData {
  current: string;
  newPass: string;
  confirm: string;
}

interface PasswordSectionProps {
  password: PasswordData;
  showPasswords: boolean;
  onToggleShow: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function PasswordSection({ password, showPasswords, onToggleShow, onChange }: PasswordSectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <Lock size={18} />
        <h2 className={styles.title}>Contraseña</h2>
      </div>
      <div className={styles.fields}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="current">Contraseña actual</label>
          <div className={styles.inputWrap}>
            <input
              id="current"
              name="current"
              type={showPasswords ? 'text' : 'password'}
              className={styles.input}
              value={password.current}
              onChange={onChange}
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={onToggleShow}
              aria-label={showPasswords ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}
            >
              {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="newPass">Nueva contraseña</label>
          <input
            id="newPass"
            name="newPass"
            type={showPasswords ? 'text' : 'password'}
            className={styles.input}
            value={password.newPass}
            onChange={onChange}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="confirm">Confirmar contraseña</label>
          <input
            id="confirm"
            name="confirm"
            type={showPasswords ? 'text' : 'password'}
            className={styles.input}
            value={password.confirm}
            onChange={onChange}
          />
        </div>
      </div>
    </section>
  );
}
