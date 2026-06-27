'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Spinner } from '@/src/shared/components/Spinner';
import { useAuthStore } from '@/src/shared/store/useAuthStore';
import { redirectByRole } from '@/src/shared/lib/authUtils';
import { useAuthGuard } from '@/src/shared/hooks/useAuthGuard';
import { validateShape } from '@/src/shared/lib/validation';
import { loginSchema } from '@/src/shared/validations';
import styles from './page.module.css';
import { ErrorBanner } from '@/src/shared/components/ErrorBanner';
import { useSubscriptionStore } from '@/src/shared/store/useSubscriptionStore';

export default function IniciarSesionPage() {
  const router = useRouter();
  const { isLoading: guardLoading } = useAuthGuard({ requireAuth: false });
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  if (guardLoading) return null;

  function validate() {
    const result = validateShape(loginSchema, { email, password });
    setErrors(result.fieldErrors);
    return result.success;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    clearError();

    try {
      await login({ email: email.trim(), password });
      redirectAfterLogin();
    } catch {
      // error ya está en el store
    }
  }

  function redirectAfterLogin() {
    const role = useAuthStore.getState().user?.role;
    const sub = useSubscriptionStore.getState().subscription;
    if (!sub) useSubscriptionStore.getState().setFreePlan();
    redirectByRole(role, router.replace);
  }

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>Iniciar sesión</h1>
      <p className={styles.subtitle}>Ingresá tus credenciales para continuar</p>

      {/* ── Error banner ── */}
      {error && <ErrorBanner error={error} clearError={clearError} />}

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">
            Correo electrónico
          </label>
          <input
            id="email"
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
            type="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            disabled={isLoading}
          />
          {errors.email && (
            <span className={styles.errorText}>{errors.email}</span>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            disabled={isLoading}
          />
          {errors.password && (
            <span className={styles.errorText}>{errors.password}</span>
          )}
        </div>

        <div className={styles.actions}>
          <Link href="/olvido-contrasena" className={styles.forgotLink}>
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <button className={styles.submitBtn} type="submit" disabled={isLoading}>
          {isLoading ? (
            <span className={styles.btnLoading}>
              <Spinner size="sm" className={styles.spinner} />
              Iniciando sesión…
            </span>
          ) : (
            'Iniciar sesión'
          )}
        </button>
      </form>

      <p className={styles.footer}>
        ¿No tenés cuenta?
        <Link href="/register" className={styles.footerLink}>
          Registrarse
        </Link>
      </p>
    </div>
  );
}
