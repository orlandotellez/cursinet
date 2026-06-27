'use client'

import { Film } from 'lucide-react';
import { VideoPlayer } from '@/src/shared/components/VideoPlayer';
import styles from './VideoContent.module.css';

interface VideoContentProps {
  videoUrl?: string | null;
  title?: string;
  emptyMessage?: string;
}

export function VideoContent({ videoUrl, title, emptyMessage }: VideoContentProps) {
  if (!videoUrl || videoUrl === '#') {
    return (
      <section className={styles.wrapper}>
        <div className={styles.emptyState}>
          <Film size={36} className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>{emptyMessage ?? 'Material en preparación'}</p>
          <p className={styles.emptyDesc}>
            El video de esta lección aún no está disponible. Pronto vas a poder acceder a todo el contenido.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.wrapper}>
      <div className={styles.container}>
        <VideoPlayer videoUrl={videoUrl} title={title} />
      </div>
    </section>
  );
}
