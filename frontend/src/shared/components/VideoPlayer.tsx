'use client'

import { useEffect, useRef } from 'react';

import 'plyr/dist/plyr.css';
import { extractVideoId } from '../utils/video';
import { PLYR_DEFAULT_OPTIONS } from '../lib/constants';

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  options?: Partial<Plyr.Options>;
}

export function VideoPlayer({ videoUrl, title, options }: VideoPlayerProps) {
  const provider = 'youtube';
  const videoId = extractVideoId(videoUrl);

  const embedRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Plyr | null>(null);

  useEffect(() => {
    if (!embedRef.current) return;

    let destroyed = false;

    async function init() {
      const PlyrModule = await import('plyr');
      const PlyrConstructor = PlyrModule.default;

      if (destroyed || !embedRef.current) return;

      playerRef.current = new PlyrConstructor(embedRef.current, {
        ...PLYR_DEFAULT_OPTIONS,
        ...options,
      });
    }

    init();

    return () => {
      destroyed = true;
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoUrl, videoId, options]);

  return (
    <div
      ref={embedRef}
      data-plyr-provider={provider}
      data-plyr-embed-id={videoId}
      title={title}
    />
  );
}
