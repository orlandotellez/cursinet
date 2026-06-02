'use client'

import { Monitor } from 'lucide-react';
import styles from './ResourceContent.module.css';

export function ResourceContent() {
  return (
    <section className={styles.wrapper}>
      <div className={styles.preview}>
        <Monitor size={48} className={styles.icon} />
        <p className={styles.text}>
          Hacé clic en la pestaña Recursos para ver los archivos descargables
        </p>
      </div>
    </section>
  );
}
