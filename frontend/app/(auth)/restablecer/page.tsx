'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { ErrorBanner } from '@/src/shared/components/ErrorBanner';
import { validateShape } from '@/src/shared/lib/validation';
import { resetPasswordSchema } from '@/src/shared/validations';
import * as authApi from '@/src/shared/api/auth';
import styles from './page.module.css';

export default function RestablecerPage() {
  return (
    <Suspense fallback={<div className={styles.card}><p className={styles.subtitle}>Cargando...</p></div>}>
      <RestablecerForm />
    </Suspense>
  );
}

function RestablecerForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const emailParam = searchParams.get('email') || '';
  const codeParam = searchParams.get('code') || '';

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState(codeParam);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Si viene de un link con parámetros, pre-llenar
  useEffect(() => {
    if (emailParam) setEmail(emailParam);
    if (codeParam) setCode(codeParam);
  }, [emailParam, codeParam]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validation = validateShape(resetPasswordSchema, {
      email,
      code,
      newPassword: password,
      confirmPassword,
    });
    if (!validation.success) {
      const firstError = Object.values(validation.fieldErrors)[0] ?? 'Error de validación';
      setError(firstError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authApi.resetPassword(email.trim(), code.trim(), password);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al restablecer contraseña');
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className={styles.card}>
        <h1 className={styles.title}>Contraseña restablecida</h1>

        <div className={styles.successBox}>
          <div className={styles.successIcon}>✅</div>
          <p className={styles.successTitle}>Todo listo</p>
          <p className={styles.successText}>
            Tu contraseña se restableció correctamente. Ya podés iniciar sesión
            con tu nueva contraseña.
          </p>
        </div>

        <div className={styles.footer}>
          <Link href="/login" className={styles.footerLink}>
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>Restablecer contraseña</h1>
      <p className={styles.subtitle}>
        Ingresá el código que recibiste y tu nueva contraseña
      </p>

      {error && <ErrorBanner error={error} clearError={() => setError(null)} />}

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">
            Correo electrónico
          </label>
          <input
            id="email"
            className={styles.input}
            type="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null); }}
            autoComplete="email"
            disabled={isLoading || !!emailParam}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="code">
            Código de verificación
          </label>
          <input
            id="code"
            className={styles.input}
            type="text"
            placeholder="000000"
            value={code}
            onChange={(e) => { setCode(e.target.value); setError(null); }}
            disabled={isLoading || !!codeParam}
            maxLength={6}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">
            Nueva contraseña
          </label>
          <input
            id="password"
            className={styles.input}
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(null); }}
            autoComplete="new-password"
            disabled={isLoading}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="confirmPassword">
            Confirmar nueva contraseña
          </label>
          <input
            id="confirmPassword"
            className={styles.input}
            type="password"
            placeholder="Repetí la contraseña"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
            autoComplete="new-password"
            disabled={isLoading}
          />
        </div>

        <button className={styles.submitBtn} type="submit" disabled={isLoading}>
          {isLoading ? (
            <span className={styles.btnLoading}>
              <Loader2 size={18} className={styles.spinner} />
              Restableciendo…
            </span>
          ) : (
            'Restablecer contraseña'
          )}
        </button>
      </form>

      <div className={styles.footer}>
        <Link href="/login" className={styles.footerLink}>
          Volver a iniciar sesión
        </Link>
      </div>
    </div>
  );
}
