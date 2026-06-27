'use client'

import { useState, useEffect } from 'react';
import { Save, User, Lock, Bell, Globe, Phone, AtSign, CheckCircle, AlertTriangle, Code2, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { Spinner } from '@/src/shared/components/Spinner';
import { useAuthStore } from '@/src/shared/store/useAuthStore';
import { getMyProfile } from '@/src/shared/api/auth';
import { updateMyProfile, changePassword } from '@/src/shared/api/myProfile';
import {
  getNotificationPreferences,
  saveNotificationPreferences,
} from '@/src/shared/api/notificationPreferences';
import { ConfiguracionSkeleton } from './loading';
import styles from './page.module.css';

interface NotificationSettings {
  courseUpdates: boolean;
  newContent: boolean;
  comments: boolean;
  marketing: boolean;
}

export default function ConfiguracionPage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const isDemoMode = useAuthStore((s) => s.isDemoMode);

  // ─── Profile state ───
  const [profile, setProfile] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    bio: user?.bio ?? '',
    userName: user?.userName ?? '',
    phone: user?.phone ?? '',
    websiteUrl: user?.websiteUrl ?? '',
    githubUrl: user?.githubUrl ?? '',
    linkedinUrl: user?.linkedinUrl ?? '',
  });

  // ─── Password state ───
  const [password, setPassword] = useState({
    current: '',
    newPass: '',
    confirm: '',
  });
  const [showPasswords, setShowPasswords] = useState(false);

  // ─── Notifications state ───
  const [notifications, setNotifications] = useState<NotificationSettings>({
    courseUpdates: true,
    newContent: true,
    comments: false,
    marketing: false,
  });
  const [notifLoaded, setNotifLoaded] = useState(false);
  const [emailVerified, setEmailVerified] = useState(user?.emailVerified ?? false);

  // ─── UI state ───
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [notifSaved, setNotifSaved] = useState(false);

  // Load profile + notification preferences
  useEffect(() => {
    const userId = user?.id;
    if (!userId || isDemoMode) {
      setIsLoading(false);
      return;
    }

    let mounted = true;

    async function loadData() {
      try {
        const [userData, notifPrefs] = await Promise.all([
          getMyProfile(),
          getNotificationPreferences().catch(() => null),
        ]);

        if (!mounted) return;

        setProfile({
          name: userData.name ?? '',
          email: userData.email ?? '',
          bio: userData.bio ?? '',
          userName: userData.userName ?? '',
          phone: userData.phone ?? '',
          websiteUrl: userData.websiteUrl ?? '',
          githubUrl: userData.githubUrl ?? '',
          linkedinUrl: userData.linkedinUrl ?? '',
        });
        setEmailVerified(userData.emailVerified);

        if (notifPrefs) {
          setNotifications({
            courseUpdates: notifPrefs.courseUpdates,
            newContent: notifPrefs.newContent,
            comments: notifPrefs.comments,
            marketing: notifPrefs.marketing,
          });
          setNotifLoaded(true);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadData();
    return () => { mounted = false; };
  }, [user?.id, isDemoMode]);

  // ─── Handlers ───

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPassword((prev) => ({ ...prev, [name]: value }));
  };

  const toggleNotification = (key: keyof NotificationSettings) => {
    setNotifications((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      // Auto-save notification preference changes
      if (!isDemoMode && user?.id) {
        saveNotificationPreferences(updated).then((result) => {
          setNotifSaved(true);
          setTimeout(() => setNotifSaved(false), 2000);
        }).catch((err) => {
          console.error('Error saving notification preferences:', err);
          // Revert on error
          setNotifications(prev);
        });
      }
      return updated;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPasswordError(null);

    if (!user?.id || isDemoMode) return;

    setIsSaving(true);

    try {
      // Save profile
      const updatedUser = await updateMyProfile({
        name: profile.name || undefined,
        bio: profile.bio || null,
        userName: profile.userName || null,
        phone: profile.phone || null,
        websiteUrl: profile.websiteUrl || null,
        githubUrl: profile.githubUrl || null,
        linkedinUrl: profile.linkedinUrl || null,
      });

      // Update auth store with new profile data
      setUser({
        ...user,
        name: updatedUser.name,
        bio: updatedUser.bio,
        userName: updatedUser.userName,
        phone: updatedUser.phone,
        websiteUrl: updatedUser.websiteUrl,
        githubUrl: updatedUser.githubUrl,
        linkedinUrl: updatedUser.linkedinUrl,
      });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);

      // Save password if fields are filled
      if (password.current && password.newPass) {
        if (password.newPass !== password.confirm) {
          setPasswordError('Las contraseñas nuevas no coinciden');
          setIsSaving(false);
          return;
        }
        if (password.newPass.length < 8) {
          setPasswordError('La contraseña debe tener al menos 8 caracteres');
          setIsSaving(false);
          return;
        }
        try {
          await changePassword({
            currentPassword: password.current,
            newPassword: password.newPass,
          });
          setPasswordSaved(true);
          setPassword({ current: '', newPass: '', confirm: '' });
          setTimeout(() => setPasswordSaved(false), 2000);
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Error al cambiar contraseña';
          setPasswordError(msg);
        }
      }

      // Save notification preferences if not auto-saved
      if (notifLoaded) {
        try {
          await saveNotificationPreferences(notifications);
        } catch (err) {
          console.error('Error saving notification prefs:', err);
        }
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar cambios';
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <ConfiguracionSkeleton />;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Configuración</h1>

      {error && <div className={styles.error}>{error}</div>}

      {/* Email verification badge */}
      {!emailVerified && !isDemoMode && (
        <div className={styles.warning}>
          <AlertTriangle size={16} />
          <span>Tu correo electrónico no está verificado. Revisa tu bandeja de entrada.</span>
        </div>
      )}

      <form onSubmit={handleSave} className={styles.form}>
        {/* ─── Profile Section ─── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <User size={18} />
            <h2 className={styles.sectionTitle}>Perfil</h2>
          </div>
          <div className={styles.fields}>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="name">Nombre</label>
                <input id="name" name="name" type="text" className={styles.input} value={profile.name} onChange={handleProfileChange} />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="userName">
                  <AtSign size={12} /> Usuario
                </label>
                <input id="userName" name="userName" type="text" className={styles.input} value={profile.userName} onChange={handleProfileChange} placeholder="@usuario" />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">Correo electrónico</label>
              <div className={styles.inputWithBadge}>
                <input id="email" name="email" type="email" className={styles.input} value={profile.email} disabled />
                {emailVerified && (
                  <span className={styles.verifiedBadge}>
                    <CheckCircle size={14} /> Verificado
                  </span>
                )}
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="phone"><Phone size={12} /> Teléfono</label>
              <input id="phone" name="phone" type="tel" className={styles.input} value={profile.phone} onChange={handleProfileChange} placeholder="+1 234 567 890" />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="bio">Biografía</label>
              <textarea id="bio" name="bio" className={styles.textarea} rows={3} value={profile.bio} onChange={handleProfileChange} placeholder="Cuéntanos sobre ti..." />
            </div>
          </div>
        </section>

        {/* ─── Social Links Section ─── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Globe size={18} />
            <h2 className={styles.sectionTitle}>Redes</h2>
          </div>
          <div className={styles.fields}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="websiteUrl"><Globe size={12} /> Sitio web</label>
              <input id="websiteUrl" name="websiteUrl" type="url" className={styles.input} value={profile.websiteUrl} onChange={handleProfileChange} placeholder="https://tusitio.com" />
            </div>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="githubUrl"><Code2 size={12} /> GitHub</label>
                <input id="githubUrl" name="githubUrl" type="url" className={styles.input} value={profile.githubUrl} onChange={handleProfileChange} placeholder="https://github.com/usuario" />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="linkedinUrl"><ExternalLink size={12} /> LinkedIn</label>
                <input id="linkedinUrl" name="linkedinUrl" type="url" className={styles.input} value={profile.linkedinUrl} onChange={handleProfileChange} placeholder="https://linkedin.com/in/usuario" />
              </div>
            </div>
          </div>
        </section>

        {/* ─── Password Section ─── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Lock size={18} />
            <h2 className={styles.sectionTitle}>Contraseña</h2>
          </div>
          {passwordError && <div className={styles.error}>{passwordError}</div>}
          {passwordSaved && <div className={styles.success}>Contraseña actualizada correctamente ✓</div>}
          <div className={styles.fields}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="current">Contraseña actual</label>
              <div className={styles.inputWrap}>
                <input
                  id="current" name="current"
                  type={showPasswords ? 'text' : 'password'}
                  className={styles.input}
                  value={password.current}
                  onChange={handlePasswordChange}
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPasswords(!showPasswords)} aria-label={showPasswords ? 'Ocultar' : 'Mostrar'}>
                  {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="newPass">Nueva contraseña</label>
                <input id="newPass" name="newPass" type={showPasswords ? 'text' : 'password'} className={styles.input} value={password.newPass} onChange={handlePasswordChange} />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="confirm">Confirmar contraseña</label>
                <input id="confirm" name="confirm" type={showPasswords ? 'text' : 'password'} className={styles.input} value={password.confirm} onChange={handlePasswordChange} />
              </div>
            </div>
          </div>
        </section>

        {/* ─── Notification Preferences ─── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Bell size={18} />
            <h2 className={styles.sectionTitle}>Notificaciones</h2>
            {notifSaved && <span className={styles.savedHint}>Guardado</span>}
          </div>
          <div className={styles.toggles}>
            {([
              { key: 'courseUpdates' as const, label: 'Actualizaciones de cursos' },
              { key: 'newContent' as const, label: 'Nuevo contenido disponible' },
              { key: 'comments' as const, label: 'Comentarios y respuestas' },
              { key: 'marketing' as const, label: 'Ofertas y marketing' },
            ]).map(({ key, label }) => (
              <label key={key} className={styles.toggleRow}>
                <span className={styles.toggleLabel}>{label}</span>
                <div className={styles.toggleTrack}>
                  <input
                    type="checkbox"
                    checked={notifications[key]}
                    onChange={() => toggleNotification(key)}
                    className={styles.toggleInput}
                  />
                  <div className={`${styles.toggleSlider} ${notifications[key] ? styles.toggleOn : ''}`} />
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* ─── Save Button ─── */}
        <button type="submit" className={styles.saveBtn} disabled={isSaving || isDemoMode}>
          {isSaving ? (
            <Spinner size="sm" className={styles.spinner} />
          ) : (
            <Save size={16} />
          )}
          {isSaving ? 'Guardando...' : profileSaved ? 'Perfil guardado ✓' : passwordSaved ? 'Contraseña actualizada ✓' : saved ? 'Guardado ✓' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  );
}
