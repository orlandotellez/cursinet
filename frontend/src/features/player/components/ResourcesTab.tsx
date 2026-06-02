'use client'

import { FileBox, Download } from 'lucide-react';
import { mockResources } from '@/src/features/player/data/mock-resources';
import styles from './ResourcesTab.module.css';

export function ResourcesTab() {
  return (
    <div className={styles.list}>
      {mockResources.map((r) => (
        <div key={r.id} className={styles.card}>
          <div className={styles.info}>
            <FileBox size={18} className={styles.icon} />
            <div>
              <p className={styles.name}>{r.name}</p>
              <span className={styles.size}>{r.size}</span>
            </div>
          </div>
          <button className={styles.downloadBtn}>
            <Download size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
