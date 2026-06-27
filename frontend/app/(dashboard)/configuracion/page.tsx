'use client'

import { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/src/shared/store/useAuthStore';
import { getMyProfile } from '@/src/shared/api/auth';
import { updateUser } from '@/src/shared/api/users';
import { ProfileSection } from '@/src/features/settings/components/ProfileSection';
import { PasswordSection } from '@/src/features/settings/components/PasswordSection';
import { NotificationPreferences } from '@/src/features/settings/components/NotificationPreferences';
import { ConfiguracionSkeleton } from './loading';
import styles from './page.module.css';

export default function ConfiguracionPage() {
  const user = useAuthStore((s) => s.user);
  const isDemoMode = useAuthStore((s) => s.isDemoMode);

  const [profile, setProfile] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    bio: user?.bio ?? '',
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

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar perfil completo desde la API
  useEffect(() => {
    const userId = user?.id;
    if (!userId || isDemoMode) {
      setIsLoading(false);
      return;
    }

    let mounted = true;

    async function loadProfile() {
      try {
        const userData = await getMyProfile();
        if (mounted) {
          setProfile({
            name: userData.name ?? '',
            email: userData.email ?? '',
            bio: userData.bio ?? '',
          });
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        // Si falla la API, nos quedamos con lo que tenemos del auth store
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadProfile();
    return () => {
      mounted = false;
    };
  }, [user?.id, isDemoMode]);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user?.id) {
      setError('Debes iniciar sesión para guardar cambios');
      return;
    }

    setIsSaving(true);

    try {
      await updateUser(user.id, {
        name: profile.name,
        email: profile.email,
        bio: profile.bio || null,
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar cambios';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (isLoading) return <ConfiguracionSkeleton />;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Configuración</h1>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

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

        <button
          type="submit"
          className={styles.saveBtn}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 size={16} className={styles.spinner} />
          ) : (
            <Save size={16} />
          )}
          {isSaving ? 'Guardando...' : saved ? 'Guardado ✓' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  );
}
