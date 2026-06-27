'use client'

import { useState } from 'react';
import { Send, Trash2, Pencil, X, Check } from 'lucide-react';
import type { CommentDTO } from '@/src/shared/api/comments';
import styles from './CommentsTab.module.css';

interface CommentsTabProps {
  comments: CommentDTO[];
  commentText: string;
  setCommentText: (v: string) => void;
  handleSendComment: (e: React.FormEvent) => void;
  isSending: boolean;
  currentUserId?: string;
  onDeleteComment?: (commentId: string) => void;
  onEditComment?: (commentId: string, newBody: string) => Promise<void>;
}

export function CommentsTab({
  comments,
  commentText,
  setCommentText,
  handleSendComment,
  isSending,
  currentUserId,
  onDeleteComment,
  onEditComment,
}: CommentsTabProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  function startEdit(c: CommentDTO) {
    setEditingId(c.id);
    setEditText(c.body);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditText('');
  }

  async function confirmEdit(c: CommentDTO) {
    if (!editText.trim() || !onEditComment) return;
    await onEditComment(c.id, editText.trim());
    setEditingId(null);
    setEditText('');
  }

  function renderComment(c: CommentDTO) {
    const isOwner = currentUserId && c.userId === currentUserId;
    const isEditing = editingId === c.id;

    return (
      <div key={c.id} className={styles.card}>
        <div className={styles.avatar}>
          {c.userName.charAt(0).toUpperCase()}
        </div>
        <div className={styles.body}>
          <div className={styles.header}>
            <span className={styles.author}>{c.userName}</span>
            <span className={styles.time}>
              {new Date(c.createdAt).toLocaleDateString('es-ES', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
              {c.isEdited && <span className={styles.edited}> · editado</span>}
            </span>
          </div>

          {isEditing ? (
            <div className={styles.editForm}>
              <textarea
                className={styles.editTextarea}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                autoFocus
                rows={3}
              />
              <div className={styles.editActions}>
                <button className={styles.cancelBtn} onClick={cancelEdit}>
                  <X size={14} /> Cancelar
                </button>
                <button
                  className={styles.saveBtn}
                  onClick={() => confirmEdit(c)}
                  disabled={!editText.trim()}
                >
                  <Check size={14} /> Guardar
                </button>
              </div>
            </div>
          ) : (
            <p className={styles.text}>{c.body}</p>
          )}

          {isOwner && !isEditing && (
            <div className={styles.actions}>
              {onEditComment && (
                <button
                  className={styles.actionBtn}
                  onClick={() => startEdit(c)}
                  title="Editar comentario"
                >
                  <Pencil size={12} />
                </button>
              )}
              {onDeleteComment && (
                <button
                  className={styles.actionBtn}
                  onClick={() => onDeleteComment(c.id)}
                  title="Eliminar comentario"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          )}

          {/* Replies */}
          {c.replies && c.replies.length > 0 && (
            <div className={styles.replies}>
              {c.replies.map((reply) => (
                <div key={reply.id} className={styles.replyCard}>
                  <div className={styles.replyAvatar}>
                    {reply.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.replyBody}>
                    <div className={styles.header}>
                      <span className={styles.author}>{reply.userName}</span>
                      <span className={styles.time}>
                        {new Date(reply.createdAt).toLocaleDateString('es-ES', {
                          day: 'numeric', month: 'short',
                        })}
                        {reply.isEdited && <span className={styles.edited}> · editado</span>}
                      </span>
                    </div>
                    <p className={styles.text}>{reply.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <form className={styles.form} onSubmit={handleSendComment}>
        <input
          className={styles.input}
          placeholder="Escribe un comentario..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          disabled={isSending}
        />
        <button
          type="submit"
          className={styles.sendBtn}
          disabled={!commentText.trim() || isSending}
        >
          {isSending ? (
            <span className={styles.sending}>...</span>
          ) : (
            <Send size={16} />
          )}
        </button>
      </form>

      <div className={styles.list}>
        {comments.length === 0 ? (
          <p className={styles.empty}>
            No hay comentarios todavía. ¡Sé el primero en comentar!
          </p>
        ) : (
          comments.map(renderComment)
        )}
      </div>
    </div>
  );
}
