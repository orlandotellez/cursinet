'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Send, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/src/shared/store/useAuthStore';
import { resendVerification, getMyProfile } from '@/src/shared/api/auth';
import { useToastStore } from '@/src/shared/store/useToastStore';
import styles from './VerificationBanner.module.css';

export function VerificationBanner() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const isDemoMode = useAuthStore((s) => s.isDemoMode);
  const [sending, setSending] = useState(false);

  // Sincronizar estado real desde el backend al montar el banner
  useEffect(() => {
    if (!user || user.emailVerified || isDemoMode) return;

    getMyProfile()
      .then((profile) => {
        if (profile.emailVerified) {
          setUser({ ...user, emailVerified: true });
        }
      })
      .catch(() => {
        // Si falla la petición, no hacemos nada
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // No mostrar si el email ya está verificado o si es demo
  if (!user || user.emailVerified || isDemoMode) {
    return null;
  }

  const handleSendCode = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (sending) return;
    setSending(true);
    try {
      await resendVerification(user.email);
      useToastStore.getState().success('Código enviado a tu correo');
      router.push(`/verificar-email?identifier=${encodeURIComponent(user.email)}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al enviar el código';

      // Si el backend dice que ya está verificado, actualizar el store
      if (msg.toLowerCase().includes('already verified') || msg.toLowerCase().includes('ya verificado')) {
        useAuthStore.getState().setUser({ ...user, emailVerified: true });
        useToastStore.getState().success('Tu email ya está verificado');
        return;
      }

      useToastStore.getState().error(msg);
      setSending(false);
    }
  };

  return (
    <Link href={`/verificar-email?identifier=${encodeURIComponent(user.email)}`} className={styles.banner}>
      <div className={styles.content}>
        <AlertTriangle size={18} className={styles.icon} />
        <div className={styles.textCol}>
          <p className={styles.title}>Verificá tu correo electrónico</p>
          <p className={styles.description}>
            Tu cuenta aún no está verificada. Hacé clic para ingresar el código que te enviamos a <strong>{user.email}</strong>.
          </p>
        </div>
        <div className={styles.actions}>
          <button
            className={styles.primaryBtn}
            onClick={handleSendCode}
            disabled={sending}
          >
            {sending ? (
              <Loader2 size={14} className={styles.spin} />
            ) : (
              <Send size={14} />
            )}
            {sending ? 'Enviando...' : 'Enviar código de verificación'}
          </button>
        </div>
      </div>
    </Link>
  );
}
