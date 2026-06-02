'use client'

import { FileText, MessageCircle, FileBox, Edit3 } from 'lucide-react';
import styles from './PlayerTabs.module.css';

export type TabKey = 'description' | 'comments' | 'resources' | 'notes';

interface PlayerTabsProps {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'description', label: 'Descripción', icon: <FileText size={16} /> },
  { key: 'comments', label: 'Comentarios', icon: <MessageCircle size={16} /> },
  { key: 'resources', label: 'Recursos', icon: <FileBox size={16} /> },
  { key: 'notes', label: 'Notas', icon: <Edit3 size={16} /> },
];

export function PlayerTabs({ active, onChange }: PlayerTabsProps) {
  return (
    <div className={styles.tabs}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`${styles.tab} ${active === tab.key ? styles.active : ''}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
