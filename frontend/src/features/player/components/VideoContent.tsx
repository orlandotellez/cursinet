'use client'

import { Play } from 'lucide-react';
import styles from './VideoContent.module.css';

export function VideoContent() {
  return (
    <section className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.placeholder}>
          <div className={styles.overlay}>
            <Play size={48} className={styles.icon} />
          </div>
          <span className={styles.hint}>Reproducir video</span>
        </div>
      </div>
    </section>
  );
}
