'use client'

import ReactMarkdown from 'react-markdown';
import styles from './TextContent.module.css';

interface TextContentProps {
  body: string;
  emptyMessage?: string;
}

export function TextContent({ body, emptyMessage }: TextContentProps) {
  if (!body || !body.trim()) {
    return (
      <section className={styles.contentBlock}>
        <div className={styles.emptyState}>
          {emptyMessage ?? 'No hay contenido disponible.'}
        </div>
      </section>
    );
  }

  return (
    <section className={styles.contentBlock}>
      <div className={styles.markdownBody}>
        <ReactMarkdown>{body}</ReactMarkdown>
      </div>
    </section>
  );
}
