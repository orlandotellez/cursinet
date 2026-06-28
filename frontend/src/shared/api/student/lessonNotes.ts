import { api } from '../lib/client';
import type { NoteDTO } from '../types';

export async function getNote(lessonId: string): Promise<NoteDTO | null> {
  return api.get<NoteDTO | null>(`/lessons/${lessonId}/notes`);
}

export async function saveNote(lessonId: string, content: string): Promise<NoteDTO> {
  return api.put<NoteDTO>(`/lessons/${lessonId}/notes`, { content });
}
