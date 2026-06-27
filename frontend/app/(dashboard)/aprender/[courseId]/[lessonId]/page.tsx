'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { useLessonViewer } from '@/src/features/player/hooks/useLessonViewer';
import { LessonHeader } from '@/src/features/player/components/LessonHeader';
import { LessonContentRenderer } from '@/src/features/player/components/LessonContentRenderer';
import { VideoContent } from '@/src/features/player/components/VideoContent';
import { LessonNavigation } from '@/src/features/player/components/LessonNavigation';
import { LessonSidebar } from '@/src/features/player/components/LessonSidebar';
import { PlayerTabs } from '@/src/features/player/components/PlayerTabs';
import { DescriptionTab } from '@/src/features/player/components/DescriptionTab';
import { CommentsTab } from '@/src/features/player/components/CommentsTab';
import { ResourcesTab } from '@/src/features/player/components/ResourcesTab';
import { NotesTab } from '@/src/features/player/components/NotesTab';
import type { Lesson } from '@/src/shared/types';
import styles from './page.module.css';

function LessonSkeleton() {
  return (
    <div className={styles.pageSkeleton}>
      <div className={styles.mainSkeleton}>
        <div className={`${styles.skeleton} ${styles.headerSkeleton}`} />
        <div className={`${styles.skeleton} ${styles.videoSkeleton}`} />
        <div className={styles.navSkeleton}>
          <div className={`${styles.skeleton} ${styles.navBtnSkeleton}`} />
          <div className={`${styles.skeleton} ${styles.navBtnSkeleton}`} />
        </div>
        <div className={styles.tabsSkeleton}>
          <div className={`${styles.skeleton} ${styles.tabSkeleton}`} />
          <div className={`${styles.skeleton} ${styles.tabSkeleton}`} />
          <div className={`${styles.skeleton} ${styles.tabSkeleton}`} />
        </div>
        <div className={`${styles.skeleton} ${styles.tabContentSkeleton}`} />
      </div>
      <div className={styles.sidebarSkeleton}>
        <div className={styles.sidebarHeaderSkeleton}>
          <div className={`${styles.skeleton} ${styles.sidebarTitleSkeleton}`} />
          <div className={`${styles.skeleton} ${styles.sidebarProgressSkeleton}`} />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={styles.moduleSkeleton}>
            <div className={`${styles.skeleton} ${styles.moduleChevronSkeleton}`} />
            <div className={`${styles.skeleton} ${styles.moduleTitleSkeleton}`} />
            <div className={`${styles.skeleton} ${styles.moduleCountSkeleton}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LessonViewerPage() {
  return (
    <Suspense fallback={<LessonSkeleton />}>
      <LessonViewerContent />
    </Suspense>
  );
}

function LessonViewerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showWelcomeVideo = searchParams.get('welcome') === '1';
  const v = useLessonViewer();

  // Fake lesson para que el player de bienvenida se vea como una lección
  const welcomeLesson: Lesson = {
    id: 'welcome',
    title: 'Video de bienvenida',
    type: 'video',
    duration: 0,
  };

  if (v.loading) {
    return <LessonSkeleton />;
  }

  if (v.error) {
    return (
      <div className={styles.page}>
        <div className={styles.centerState}>
          <AlertCircle size={32} />
          <p>{v.error}</p>
          <button onClick={v.retry} className={styles.retryBtn}>Reintentar</button>
        </div>
      </div>
    );
  }

  if (!v.lesson || !v.courseForComponents) {
    return (
      <div className={styles.page}>
        <div className={styles.centerState}>
          <AlertCircle size={32} />
          <p>Lección no encontrada</p>
          <button onClick={() => router.push('/dashboard')} className={styles.retryBtn}>
            Volver al dashboard
          </button>
        </div>
      </div>
    );
  }

  const course = v.courseForComponents;

  return (
    <div className={styles.page}>
      <div className={styles.mainArea}>
        {showWelcomeVideo && course.previewVideoUrl ? (
          <>
            <LessonHeader lesson={welcomeLesson} />
            <VideoContent videoUrl={course.previewVideoUrl} title="Video de bienvenida" />
          </>
        ) : (
          <>
            <LessonHeader lesson={v.lessonForComponents!} />

            <LessonContentRenderer lesson={v.lesson} />

            <div className={styles.navWrapper}>
              <LessonNavigation
                courseId={v.courseId}
                prevLesson={v.prevLesson}
                nextLesson={v.nextLesson}
                completed={v.completed}
                savingProgress={v.savingProgress}
                onNext={v.handleMarkComplete}
              />
            </div>

            <PlayerTabs active={v.activeTab} onChange={v.setActiveTab} />

            <div className={styles.tabContent}>
              {v.activeTab === 'description' && <DescriptionTab course={course} />}
              {v.activeTab === 'comments' && (
                <CommentsTab
                  commentText={v.commentText}
                  setCommentText={v.setCommentText}
                  handleSendComment={v.handleSendComment}
                />
              )}
              {v.activeTab === 'resources' && <ResourcesTab />}
              {v.activeTab === 'notes' && <NotesTab notes={v.notes} setNotes={v.setNotes} />}
            </div>
          </>
        )}
      </div>

      <LessonSidebar
        course={course}
        expandedModules={v.expandedModules}
        toggleModule={v.toggleModule}
        lessonId={v.lessonId}
        isWelcomeActive={showWelcomeVideo}
      />
    </div>
  );
}
