'use client'

import type { Lesson } from '@/src/shared/types';
import { getLessonContent } from '@/src/features/courses/data/lesson-content';
import { VideoContent } from './VideoContent';
import { TextContent } from './TextContent';
import { CodeContent } from './CodeContent';
import { QuizContent } from './QuizContent';
import { ResourceContent } from './ResourceContent';

interface LessonContentRendererProps {
  lesson: Lesson;
}

export function LessonContentRenderer({ lesson }: LessonContentRendererProps) {
  const content = getLessonContent(lesson.id);

  switch (lesson.type) {
    case 'video':
      return (
        <VideoContent
          videoUrl={content?.videoUrl}
          title={lesson.title}
        />
      );
    case 'text':
      return <TextContent body={content?.body || 'Contenido no disponible'} />;
    case 'code':
      return <CodeContent code={content?.code || '// Código no disponible'} language={content?.codeLanguage} />;
    case 'quiz':
      return content?.quiz ? <QuizContent quiz={content.quiz} /> : <TextContent body="Contenido del quiz no disponible" />;
    case 'resource':
      return <ResourceContent />;
    default:
      return <VideoContent />;
  }
}
