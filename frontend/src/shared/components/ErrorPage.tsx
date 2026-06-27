'use client';

import { useEffect } from 'react';
import styles from './ErrorPage.module.css';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
}

export function ErrorPage({ error, reset, title = 'Algo salió mal' }: ErrorPageProps) {
  useEffect(() => {
    console.error('ErrorPage caught:', error);
  }, [error]);

  return (
    <div className={styles.container}>
      <div className={styles.icon}>!</div>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.message}>
        {error.message || 'Ocurrió un error inesperado. Intentalo de nuevo.'}
      </p>
      <button onClick={reset} className={styles.retryButton}>
        Intentar de nuevo
      </button>
    </div>
  );
}
