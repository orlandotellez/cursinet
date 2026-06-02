'use client'

import { Clock } from 'lucide-react';
import styles from './NotesTab.module.css';

interface NotesTabProps {
  notes: string;
  setNotes: (v: string) => void;
}

export function NotesTab({ notes, setNotes }: NotesTabProps) {
  const addTimestamp = () => {
    const mins = Math.floor(Math.random() * 30);
    const secs = Math.floor(Math.random() * 60);
    const ts = `[${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}] `;
    setNotes(notes + ts);
  };

  return (
    <div>
      <button className={styles.timestampBtn} onClick={addTimestamp}>
        <Clock size={14} /> Agregar timestamp
      </button>
      <textarea
        className={styles.textarea}
        placeholder="Escribe tus notas aquí..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={12}
      />
    </div>
  );
}
