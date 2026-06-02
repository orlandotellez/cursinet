'use client'

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { LessonContent } from '@/src/features/courses/data/lesson-content';
import styles from './QuizContent.module.css';

interface QuizContentProps {
  quiz: NonNullable<LessonContent['quiz']>;
}

export function QuizContent({ quiz }: QuizContentProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);

  if (quiz.questions.length === 0) {
    return (
      <section className={styles.contentBlock}>
        <p className={styles.emptyState}>No hay preguntas disponibles</p>
      </section>
    );
  }

  const total = quiz.questions.length;
  const question = quiz.questions[currentQ];
  const isLast = currentQ === total - 1;

  const selectOption = (index: number) => {
    if (submitted) return;
    const newAnswers = [...answers];
    newAnswers[currentQ] = index;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (isLast) {
      setSubmitted(true);
    } else {
      setCurrentQ(currentQ + 1);
    }
  };

  const correctCount = submitted
    ? quiz.questions.filter((q, i) => answers[i] === q.correctIndex).length
    : 0;

  const handleRetry = () => {
    setCurrentQ(0);
    setAnswers([]);
    setSubmitted(false);
  };

  if (submitted) {
    const percentage = Math.round((correctCount / total) * 100);
    const passed = percentage >= 70;
    return (
      <section className={styles.contentBlock}>
        <div className={`${styles.result} ${passed ? styles.pass : styles.fail}`}>
          <div className={styles.scoreCircle}>
            <span className={styles.scoreValue}>{percentage}%</span>
            <span className={styles.scoreLabel}>{passed ? 'Aprobado' : 'No aprobado'}</span>
          </div>
          <p className={styles.resultText}>
            Respondiste correctamente <strong>{correctCount} de {total}</strong> preguntas.
          </p>
          <button className={styles.retryBtn} onClick={handleRetry}>
            Reintentar quiz
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.contentBlock}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.progress}>
            Pregunta {currentQ + 1} de {total}
          </span>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${((currentQ + 1) / total) * 100}%` }} />
          </div>
        </div>

        <h3 className={styles.question}>{question.text}</h3>

        <div className={styles.options}>
          {question.options.map((opt, i) => {
            const isSelected = answers[currentQ] === i;
            return (
              <button
                key={i}
                className={`${styles.option} ${isSelected ? styles.optionSelected : ''}`}
                onClick={() => selectOption(i)}
              >
                <span className={styles.optionLetter}>{String.fromCharCode(65 + i)}</span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>

        <button
          className={styles.nextBtn}
          onClick={handleNext}
          disabled={answers[currentQ] === undefined}
        >
          {isLast ? 'Ver resultados' : 'Siguiente pregunta'}
          <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}
