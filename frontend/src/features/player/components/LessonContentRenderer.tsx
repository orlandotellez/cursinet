'use client'

import type { CurriculumLesson } from '@/src/shared/api/curriculum';
import { getLessonContent } from '@/src/shared/mock/lesson-content';
import { VideoContent } from './VideoContent';
import { TextContent } from './TextContent';
import { CodeContent } from './CodeContent';
import { QuizContent } from './QuizContent';
import { ResourceContent } from './ResourceContent';

interface LessonContentRendererProps {
  lesson: CurriculumLesson;
}

/**
 * Renderiza el contenido de una lección según su tipo.
 * Precedencia de datos:
 * 1. Backend (`lesson.videoUrl`, `lesson.contentMarkdown`) — fuente principal
 * 2. Hardcodeado en `getLessonContent(lesson.id)` — fallback para demos
 * 3. Empty state con mensaje específico
 */
export function LessonContentRenderer({ lesson }: LessonContentRendererProps) {
  const fallback = getLessonContent(lesson.id);

  switch (lesson.type) {
    case 'Video': {
      const videoUrl = lesson.videoUrl ?? fallback?.videoUrl;
      return (
        <VideoContent
          videoUrl={videoUrl}
          title={lesson.title}
          emptyMessage="No hay URL de video configurada."
        />
      );
    }

    case 'Text': {
      const body = lesson.contentMarkdown ?? fallback?.body;
      return (
        <TextContent
          body={body ?? ''}
          emptyMessage="No hay contenido disponible."
        />
      );
    }

    case 'Code': {
      const code = lesson.contentMarkdown ?? fallback?.code ?? '';
      const language = fallback?.codeLanguage;
      return (
        <CodeContent
          code={code}
          language={language}
          emptyMessage="No hay código disponible."
        />
      );
    }

    case 'Quiz': {
      const quiz = fallback?.quiz;
      if (!quiz) {
        return (
          <TextContent
            body="Las preguntas del quiz estarán disponibles pronto."
            emptyMessage="No hay quiz disponible."
          />
        );
      }
      return <QuizContent quiz={quiz} />;
    }

    case 'Resource':
      return <ResourceContent />;

    default:
      return (
        <TextContent
          body=""
          emptyMessage="Tipo de lección no soportado."
        />
      );
  }
}
