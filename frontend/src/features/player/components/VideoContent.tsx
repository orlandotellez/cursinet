'use client'

import { VideoPlayer } from '@/src/shared/components/VideoPlayer';
import styles from './VideoContent.module.css';

interface VideoContentProps {
  videoUrl?: string;
  title?: string;
}

export function VideoContent({ videoUrl, title }: VideoContentProps) {
  if (!videoUrl || videoUrl === '#') return null;

  return (
    <section className={styles.wrapper}>
      <div className={styles.container}>
        <VideoPlayer videoUrl={videoUrl} title={title} />
      </div>
    </section>
  );
}
