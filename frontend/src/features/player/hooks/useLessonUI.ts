'use client';

import { useState, useEffect, useCallback } from 'react';
import type { TabKey } from '@/src/features/player/components/PlayerTabs';
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  type CommentDTO,
} from '@/src/shared/api/student';
import { getNote, saveNote } from '@/src/shared/api/student';
import { useAuthStore } from '@/src/shared/store/useAuthStore';
import { useToastStore } from '@/src/shared/store/useToastStore';

export interface LessonUIResult {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  expandedModules: string[];
  toggleModule: (id: string) => void;
  commentText: string;
  setCommentText: (text: string) => void;
  notes: string;
  setNotes: (text: string) => void;
  handleSendComment: (e: React.FormEvent) => void;
  comments: CommentDTO[];
  commentsLoading: boolean;
  isSendingComment: boolean;
  currentUserId: string;
  onDeleteComment: (commentId: string) => Promise<void>;
  onEditComment: (commentId: string, newBody: string) => Promise<void>;
  handleSaveNotes: () => Promise<void>;
  isSavingNotes: boolean;
  lastSaved: string | null;
}

export function useLessonUI(lessonId?: string, defaultExpanded?: string[]): LessonUIResult {
  const [activeTab, setActiveTab] = useState<TabKey>('description');
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  // Auto-expand módulos cuando cambian los defaults (ej: al navegar a otra lección)
  useEffect(() => {
    if (defaultExpanded && defaultExpanded.length > 0) {
      setExpandedModules((prev) => {
        const missing = defaultExpanded.filter((id) => !prev.includes(id));
        return missing.length > 0 ? [...prev, ...missing] : prev;
      });
    }
  }, [defaultExpanded]);
  const [commentText, setCommentText] = useState('');
  const [notes, setNotes] = useState('');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [commentsFetched, setCommentsFetched] = useState(false);
  const [notesFetched, setNotesFetched] = useState(false);
  const [comments, setComments] = useState<CommentDTO[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [isSendingComment, setIsSendingComment] = useState(false);
  const currentUser = useAuthStore((s) => s.user);
  const currentUserId = currentUser?.id ?? '';

  // Fetch comments when tab switches to 'comments'
  useEffect(() => {
    if (activeTab === 'comments' && lessonId && !commentsFetched) {
      setCommentsLoading(true);
      getComments(lessonId)
        .then((data) => {
          setComments(data);
          setCommentsFetched(true);
        })
        .catch(() => {})
        .finally(() => setCommentsLoading(false));
    }
  }, [activeTab, lessonId, commentsFetched]);

  // Reset when lessonId changes
  useEffect(() => {
    setCommentsFetched(false);
    setNotesFetched(false);
    setComments([]);
    setNotes('');
    setLastSaved(null);
  }, [lessonId]);

  // Fetch notes when tab switches to 'notes'
  useEffect(() => {
    if (activeTab === 'notes' && lessonId && !notesFetched) {
      getNote(lessonId).then((note) => {
        if (note) {
          setNotes(note.content);
          setLastSaved(new Date(note.updatedAt).toLocaleString('es-ES'));
        }
        setNotesFetched(true);
      }).catch(() => {
        setNotesFetched(true);
      });
    }
  }, [activeTab, lessonId, notesFetched]);

  const toggleModule = useCallback((id: string) => {
    setExpandedModules((prev) =>
      prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id],
    );
  }, []);

  const handleSendComment = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!commentText.trim() || !lessonId) return;

      setIsSendingComment(true);
      try {
        const newComment = await createComment(lessonId, {
          body: commentText.trim(),
        });
        setComments((prev) => [newComment, ...prev]);
        setCommentText('');
      } catch {
        useToastStore.getState().error('Error al enviar comentario');
      } finally {
        setIsSendingComment(false);
      }
    },
    [commentText, lessonId],
  );

  const onDeleteComment = useCallback(
    async (commentId: string) => {
      if (!lessonId) return;
      try {
        await deleteComment(lessonId, commentId);
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      } catch {
        useToastStore.getState().error('Error al eliminar comentario');
      }
    },
    [lessonId],
  );

  const onEditComment = useCallback(
    async (commentId: string, newBody: string) => {
      if (!lessonId) return;
      try {
        await updateComment(lessonId, commentId, { body: newBody });
        // Solo actualizamos los campos locales para no pisar replies
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId ? { ...c, body: newBody, isEdited: true } : c,
          ),
        );
      } catch {
        useToastStore.getState().error('Error al editar comentario');
      }
    },
    [lessonId],
  );

  const handleSaveNotes = useCallback(async () => {
    if (!lessonId) return;
    setIsSavingNotes(true);
    try {
      const note = await saveNote(lessonId, notes);
      setLastSaved(new Date(note.updatedAt).toLocaleString('es-ES'));
    } catch {
      useToastStore.getState().error('Error al guardar notas');
    } finally {
      setIsSavingNotes(false);
    }
  }, [lessonId, notes]);

  return {
    activeTab,
    setActiveTab,
    expandedModules,
    toggleModule,
    commentText,
    setCommentText,
    notes,
    setNotes,
    handleSendComment,
    comments,
    commentsLoading,
    isSendingComment,
    currentUserId,
    onDeleteComment,
    onEditComment,
    handleSaveNotes,
    isSavingNotes,
    lastSaved,
  };
}
