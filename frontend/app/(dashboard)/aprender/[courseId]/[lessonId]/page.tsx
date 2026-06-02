'use client'

import { useState, use } from 'react';
import Link from 'next/link';
import { courses } from '@/src/features/courses/data';
import { LessonHeader } from '@/src/features/player/components/LessonHeader';
import { LessonContentRenderer } from '@/src/features/player/components/LessonContentRenderer';
import { LessonNavigation } from '@/src/features/player/components/LessonNavigation';
import { PlayerTabs } from '@/src/features/player/components/PlayerTabs';
import type { TabKey } from '@/src/features/player/components/PlayerTabs';
import { DescriptionTab } from '@/src/features/player/components/DescriptionTab';
import { CommentsTab } from '@/src/features/player/components/CommentsTab';
import { ResourcesTab } from '@/src/features/player/components/ResourcesTab';
import { NotesTab } from '@/src/features/player/components/NotesTab';
import { LessonSidebar } from '@/src/features/player/components/LessonSidebar';
import styles from './page.module.css';

export default function LessonPage({ params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  const { courseId, lessonId } = use(params);
  const course = courses.find((c) => c.id === courseId);

  const [activeTab, setActiveTab] = useState<TabKey>('description');
  const [expandedModules, setExpandedModules] = useState<string[]>(course?.modules.map((m) => m.id) ?? []);
  const [commentText, setCommentText] = useState('');
  const [notes, setNotes] = useState('');

  if (!course) {
    return (
      <div className={styles.notFound}>
        <h2>Curso no encontrado</h2>
        <Link href="/mis-cursos" className={styles.backLink}>Volver a mis cursos</Link>
      </div>
    );
  }

  const allLessons = course.modules.flatMap((m) => m.lessons);
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const currentLesson = allLessons[currentIndex];
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const toggleModule = (id: string) => {
    setExpandedModules((prev) =>
      prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]
    );
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) setCommentText('');
  };

  return (
    <div className={styles.page}>
      <div className={styles.mainArea}>
        {currentLesson && <LessonHeader lesson={currentLesson} />}
        {currentLesson && <LessonContentRenderer lesson={currentLesson} />}

        <LessonNavigation
          courseId={courseId}
          prevLesson={prevLesson}
          nextLesson={nextLesson}
        />

        <PlayerTabs active={activeTab} onChange={setActiveTab} />

        <div className={styles.tabContent}>
          {activeTab === 'description' && (
            <DescriptionTab
              course={course}
              courseId={courseId}
              prevLesson={prevLesson}
              nextLesson={nextLesson}
            />
          )}
          {activeTab === 'comments' && (
            <CommentsTab
              commentText={commentText}
              setCommentText={setCommentText}
              handleSendComment={handleSendComment}
            />
          )}
          {activeTab === 'resources' && <ResourcesTab />}
          {activeTab === 'notes' && <NotesTab notes={notes} setNotes={setNotes} />}
        </div>
      </div>

      <aside className={styles.sidebar}>
        <LessonSidebar
          course={course}
          expandedModules={expandedModules}
          toggleModule={toggleModule}
          lessonId={lessonId}
        />
      </aside>
    </div>
  );
}
