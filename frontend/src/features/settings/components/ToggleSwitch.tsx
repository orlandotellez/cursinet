'use client'

import styles from './ToggleSwitch.module.css';

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

export function ToggleSwitch({ label, checked, onChange }: ToggleSwitchProps) {
  return (
    <label className={styles.row}>
      <span className={styles.label}>{label}</span>
      <div className={styles.track}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className={styles.input}
        />
        <div className={`${styles.slider} ${checked ? styles.on : ''}`} />
      </div>
    </label>
  );
}
