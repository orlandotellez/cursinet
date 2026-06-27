import { API_URL } from '../lib/constants';
import { authedFetch } from '../lib/api';
import { handleJsonResponse } from './helpers';

// ─── Types ────────────────────────────────────────────────────────────────

export interface NoteDTO {
  id: string;
  lessonId: string;
  content: string;
  videoTimestampSeconds: number | null;
  updatedAt: string;
}

// ─── API functions ────────────────────────────────────────────────────────

export async function getNote(lessonId: string): Promise<NoteDTO | null> {
  const res = await authedFetch(`${API_URL}/lessons/${lessonId}/notes`);
  return handleJsonResponse<NoteDTO | null>(res);
}

export async function saveNote(lessonId: string, content: string): Promise<NoteDTO> {
  const res = await authedFetch(`${API_URL}/lessons/${lessonId}/notes`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  return handleJsonResponse<NoteDTO>(res);
}
