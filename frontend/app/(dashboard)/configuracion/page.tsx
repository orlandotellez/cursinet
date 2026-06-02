'use client'

import { useState } from 'react';
import { Save } from 'lucide-react';
import { ProfileSection } from '@/src/features/settings/components/ProfileSection';
import { PasswordSection } from '@/src/features/settings/components/PasswordSection';
import { NotificationPreferences } from '@/src/features/settings/components/NotificationPreferences';
import styles from './page.module.css';

export default function ConfiguracionPage() {
  const [profile, setProfile] = useState({
    name: 'Sofia Martínez',
    email: 'sofia@email.com',
    bio: 'Full-stack developer en formación',
  });

  const [password, setPassword] = useState({
    current: '',
    newPass: '',
    confirm: '',
  });

  const [showPasswords, setShowPasswords] = useState(false);

  const [notifications, setNotifications] = useState({
    courseUpdates: true,
    newContent: true,
    comments: false,
    marketing: false,
  });

  const [saved, setSaved] = useState(false);

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPassword((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Configuración</h1>

      <form onSubmit={handleSave} className={styles.form}>
        <ProfileSection profile={profile} onChange={handleProfileChange} />
        <PasswordSection
          password={password}
          showPasswords={showPasswords}
          onToggleShow={() => setShowPasswords(!showPasswords)}
          onChange={handlePasswordChange}
        />
        <NotificationPreferences
          notifications={notifications}
          onToggle={toggleNotification}
        />

        <button type="submit" className={styles.saveBtn}>
          <Save size={16} />
          {saved ? 'Guardado' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  );
}
