'use client';

import { useState, useEffect, useCallback } from 'react';
import { Star, Trash2, Pencil, X, Check } from 'lucide-react';
import { Spinner } from '@/src/shared/components/Spinner';
import { useAuthStore } from '@/src/shared/store/useAuthStore';
import { ErrorBanner } from '@/src/shared/components/ErrorBanner';
import * as reviewsApi from '@/src/shared/api/student';
import type { Review } from '@/src/shared/types';
import styles from './ReviewSection.module.css';

interface ReviewSectionProps {
  courseId: string;
  enrolled: boolean;
}

export function ReviewSection({ courseId, enrolled }: ReviewSectionProps) {
  const user = useAuthStore((s) => s.user);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reviewsApi.getCourseReviews(courseId);
      setReviews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar reseñas');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const existingReview = reviews.find((r) => r.userId === user?.id);

  async function handleSubmit() {
    if (formRating < 1 || formRating > 5) return;
    setSubmitting(true);
    setError(null);

    try {
      if (editingId) {
        await reviewsApi.updateReview(courseId, editingId, {
          rating: formRating,
          comment: formComment || undefined,
        });
      } else {
        await reviewsApi.createReview(courseId, {
          rating: formRating,
          comment: formComment || undefined,
        });
      }
      setShowForm(false);
      setEditingId(null);
      await fetchReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar reseña');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(reviewId: string) {
    if (!confirm('¿Eliminar tu reseña? Esta acción no se puede deshacer.')) return;
    setError(null);
    try {
      await reviewsApi.deleteReview(courseId, reviewId);
      await fetchReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar reseña');
    }
  }

  function startEdit(review: Review) {
    setEditingId(review.id);
    setFormRating(review.rating);
    setFormComment(review.comment || '');
    setShowForm(true);
  }

  function startCreate() {
    setEditingId(null);
    setFormRating(5);
    setFormComment('');
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setFormRating(5);
    setFormComment('');
  }

  function StarSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    return (
      <div className={styles.starSelector}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={star <= value ? styles.starFilled : styles.starEmpty}
            onClick={() => onChange(star)}
            disabled={submitting}
            aria-label={`${star} estrella${star > 1 ? 's' : ''}`}
          >
            <Star size={22} />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div>
      {error && <ErrorBanner error={error} clearError={() => setError(null)} />}

      {loading ? (
        <div className={styles.loadingWrap}>
          <Spinner size="md" className={styles.spinnerIcon} />
        </div>
      ) : reviews.length === 0 && !showForm ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
          Este curso todavía no tiene reseñas.
        </p>
      ) : (
        <div className={styles.reviewsGrid}>
          {reviews.map((r) => (
            <div key={r.id} className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                <div className={styles.reviewAvatar}>
                  {r.userName.charAt(0).toUpperCase()}
                </div>
                <div className={styles.reviewMeta}>
                  <span className={styles.reviewName}>{r.userName}</span>
                  <div className={styles.reviewStars}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        size={13}
                        className={i < r.rating ? styles.starFilled : styles.starEmpty}
                      />
                    ))}
                  </div>
                </div>
                {user && r.userId === user.id && (
                  <div className={styles.reviewActions}>
                    <button
                      className={styles.actionBtn}
                      onClick={() => startEdit(r)}
                      title="Editar reseña"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      className={styles.actionBtn}
                      onClick={() => handleDelete(r.id)}
                      title="Eliminar reseña"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
              {r.comment && <p className={styles.reviewComment}>{r.comment}</p>}
              <span className={styles.reviewDate}>
                {new Date(r.createdAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Review form (create / edit) ── */}
      {showForm && (
        <form
          className={styles.reviewForm}
          onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
        >
          <h3 className={styles.formTitle}>
            {editingId ? 'Editar reseña' : 'Dejar una reseña'}
          </h3>

          <StarSelector value={formRating} onChange={setFormRating} />

          <textarea
            className={styles.formTextarea}
            placeholder="Contá tu experiencia con este curso (opcional)"
            value={formComment}
            onChange={(e) => setFormComment(e.target.value)}
            rows={3}
            disabled={submitting}
          />

          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={submitting}
            >
              {submitting ? (
                <span className={styles.btnLoading}>
                  <Spinner size="sm" className={styles.spinner} />
                  Guardando…
                </span>
              ) : editingId ? (
                'Actualizar reseña'
              ) : (
                'Publicar reseña'
              )}
            </button>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={cancelForm}
              disabled={submitting}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* ── Create review CTA (only for enrolled users without a review) ── */}
      {enrolled && !existingReview && !showForm && (
        <button className={styles.createCta} onClick={startCreate}>
          Escribir una reseña
        </button>
      )}
    </div>
  );
}
