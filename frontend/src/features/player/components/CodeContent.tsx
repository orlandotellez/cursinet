'use client'

import { Code2 } from 'lucide-react';
import { CopyIcon } from './CopyIcon';
import styles from './CodeContent.module.css';

interface CodeContentProps {
  code: string;
  language?: string;
}

export function CodeContent({ code, language }: CodeContentProps) {
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
          <button className={styles.btn}>
            <CopyIcon size={14} />
            Copiar código
          </button>
        </div>
      </div>
    </section>
  );
}
