import { api } from '../lib/client';
import type { CommentDTO, CreateCommentPayload, UpdateCommentPayload } from '../types';

export async function getComments(lessonId: string): Promise<CommentDTO[]> {
  return api.get<CommentDTO[]>(`/lessons/${lessonId}/comments`);
}

export async function createComment(
  lessonId: string,
  payload: CreateCommentPayload,
): Promise<CommentDTO> {
  return api.post<CommentDTO>(`/lessons/${lessonId}/comments`, payload);
}

export async function updateComment(
  lessonId: string,
  commentId: string,
  payload: UpdateCommentPayload,
): Promise<CommentDTO> {
  return api.put<CommentDTO>(`/lessons/${lessonId}/comments/${commentId}`, payload);
}

export async function deleteComment(
  lessonId: string,
  commentId: string,
): Promise<void> {
  return api.delete<void>(`/lessons/${lessonId}/comments/${commentId}`);
}
