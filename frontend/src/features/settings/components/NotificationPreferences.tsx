'use client'

import { Bell } from 'lucide-react';
import { ToggleSwitch } from './ToggleSwitch';
import styles from './FormSection.module.css';

interface NotificationSettings {
  courseUpdates: boolean;
  newContent: boolean;
  comments: boolean;
  marketing: boolean;
}

interface NotificationPreferencesProps {
  notifications: NotificationSettings;
  onToggle: (key: keyof NotificationSettings) => void;
}

export function NotificationPreferences({ notifications, onToggle }: NotificationPreferencesProps) {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <Bell size={18} />
        <h2 className={styles.title}>Notificaciones</h2>
      </div>
      <div className={styles.toggles}>
        <ToggleSwitch
          label="Actualizaciones de cursos"
          checked={notifications.courseUpdates}
          onChange={() => onToggle('courseUpdates')}
        />
        <ToggleSwitch
          label="Nuevo contenido disponible"
          checked={notifications.newContent}
          onChange={() => onToggle('newContent')}
        />
        <ToggleSwitch
          label="Comentarios y respuestas"
          checked={notifications.comments}
          onChange={() => onToggle('comments')}
        />
        <ToggleSwitch
          label="Ofertas y marketing"
          checked={notifications.marketing}
          onChange={() => onToggle('marketing')}
        />
      </div>
    </section>
  );
}
