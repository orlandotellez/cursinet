'use client'

import { Send } from 'lucide-react';
import { mockComments } from '@/src/features/player/data/mock-comments';
import styles from './CommentsTab.module.css';

interface CommentsTabProps {
  commentText: string;
  setCommentText: (v: string) => void;
  handleSendComment: (e: React.FormEvent) => void;
}

export function CommentsTab({ commentText, setCommentText, handleSendComment }: CommentsTabProps) {
  return (
    <div>
      <form className={styles.form} onSubmit={handleSendComment}>
        <input
          className={styles.input}
          placeholder="Escribe un comentario..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <button type="submit" className={styles.sendBtn} disabled={!commentText.trim()}>
          <Send size={16} />
        </button>
      </form>

      <div className={styles.list}>
        {mockComments.map((c) => (
          <div key={c.id} className={styles.card}>
            <div className={styles.avatar}>{c.userName.charAt(0)}</div>
            <div className={styles.body}>
              <div className={styles.header}>
                <span className={styles.author}>{c.userName}</span>
                <span className={styles.time}>
                  {new Date(c.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                </span>
              </div>
              <p className={styles.text}>{c.comment}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
