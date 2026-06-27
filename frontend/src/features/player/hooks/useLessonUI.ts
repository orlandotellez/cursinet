'use client';

import { useState, useCallback } from 'react';
import type { TabKey } from '@/src/features/player/components/PlayerTabs';

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
}

export function useLessonUI(): LessonUIResult {
  const [activeTab, setActiveTab] = useState<TabKey>('description');
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [commentText, setCommentText] = useState('');
  const [notes, setNotes] = useState('');

  const toggleModule = useCallback((id: string) => {
    setExpandedModules((prev) =>
      prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id],
    );
  }, []);

  const handleSendComment = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (commentText.trim()) setCommentText('');
    },
    [commentText],
  );

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
  };
}
