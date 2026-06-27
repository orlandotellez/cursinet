import { API_URL } from '../lib/constants';
import { authedFetch } from '../lib/api';
import { handleJsonResponse } from './helpers';

// ─── Types ────────────────────────────────────────────────────────────────

export interface CommentDTO {
  id: string;
  lessonId: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  parentId: string | null;
  body: string;
  likesCount: number;
  isEdited: boolean;
  createdAt: string;
  replies: CommentDTO[] | null;
}

export interface CreateCommentPayload {
  body: string;
  parentId?: string | null;
}

export interface UpdateCommentPayload {
  body: string;
}

// ─── API functions ────────────────────────────────────────────────────────

export async function getComments(lessonId: string): Promise<CommentDTO[]> {
  const res = await authedFetch(`${API_URL}/lessons/${lessonId}/comments`);
  return handleJsonResponse<CommentDTO[]>(res);
}

export async function createComment(
  lessonId: string,
  payload: CreateCommentPayload,
): Promise<CommentDTO> {
  const res = await authedFetch(`${API_URL}/lessons/${lessonId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleJsonResponse<CommentDTO>(res);
}

export async function updateComment(
  lessonId: string,
  commentId: string,
  payload: UpdateCommentPayload,
): Promise<CommentDTO> {
  const res = await authedFetch(`${API_URL}/lessons/${lessonId}/comments/${commentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleJsonResponse<CommentDTO>(res);
}

export async function deleteComment(
  lessonId: string,
  commentId: string,
): Promise<void> {
  const res = await authedFetch(`${API_URL}/lessons/${lessonId}/comments/${commentId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || 'Error al eliminar comentario');
  }
}
