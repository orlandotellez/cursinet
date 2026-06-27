'use client';

import { Spinner } from './Spinner';
import styles from './AuthLoadingScreen.module.css';

export function AuthLoadingScreen() {
  return (
    <div className={styles.container}>
      <Spinner size="md" />
    </div>
  );
}
