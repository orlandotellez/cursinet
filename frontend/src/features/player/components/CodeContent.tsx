'use client'

import { Code2 } from 'lucide-react';
import { CopyIcon } from './CopyIcon';
import styles from './CodeContent.module.css';

interface CodeContentProps {
  code: string;
  language?: string;
  emptyMessage?: string;
}

export function CodeContent({ code, language, emptyMessage }: CodeContentProps) {
  if (!code || !code.trim()) {
    return (
      <section className={styles.wrapper}>
        <div className={styles.emptyState}>
          {emptyMessage ?? 'No hay código disponible.'}
        </div>
      </section>
    );
  }

  const handleCopy = () => {
    void navigator.clipboard.writeText(code);
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Code2 size={16} />
          <span>{language || 'Código'}</span>
        </div>
        <pre className={styles.block}>
          <code>{code}</code>
        </pre>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.btn}
            onClick={handleCopy}
            aria-label="Copiar código al portapapeles"
          >
            <CopyIcon size={14} />
            Copiar código
          </button>
        </div>
      </div>
    </section>
  );
}
