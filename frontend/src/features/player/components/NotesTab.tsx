'use client'

import { Clock, Save } from 'lucide-react';
import styles from './NotesTab.module.css';

interface NotesTabProps {
  notes: string;
  setNotes: (v: string) => void;
  onSaveNotes?: () => Promise<void>;
  isSaving?: boolean;
  lastSaved?: string | null;
}

export function NotesTab({ notes, setNotes, onSaveNotes, isSaving, lastSaved }: NotesTabProps) {
  const addTimestamp = () => {
    const mins = Math.floor(Math.random() * 30);
    const secs = Math.floor(Math.random() * 60);
    const ts = `[${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}] `;
    setNotes(notes + ts);
  };

  return (
    <div>
      <div className={styles.toolbar}>
        <button className={styles.timestampBtn} onClick={addTimestamp}>
          <Clock size={14} /> Agregar timestamp
        </button>
        {onSaveNotes && (
          <button
            className={styles.saveBtn}
            onClick={onSaveNotes}
            disabled={isSaving}
          >
            <Save size={14} />
            {isSaving ? 'Guardando...' : 'Guardar nota'}
          </button>
        )}
      </div>
      {lastSaved && (
        <span className={styles.savedAt}>Guardado: {lastSaved}</span>
      )}
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
