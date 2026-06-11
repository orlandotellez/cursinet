'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { ErrorBanner } from '@/src/shared/components/ErrorBanner';
import { validateShape } from '@/src/shared/lib/validation';
import { verifyEmailSchema, resendVerificationSchema } from '@/src/shared/validations';
import * as authApi from '@/src/shared/api/auth';
import styles from './page.module.css';

export default function VerificarEmailPage() {
  return (
    <Suspense fallback={<div className={styles.card}><p className={styles.subtitle}>Cargando...</p></div>}>
      <VerificarEmailForm />
    </Suspense>
  );
}

function VerificarEmailForm() {
  const searchParams = useSearchParams();

  const identifierParam = searchParams.get('identifier') || '';
  const codeParam = searchParams.get('code') || '';

  const [email, setEmail] = useState(identifierParam);
  const [code, setCode] = useState(codeParam);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Auto-verify if params are present
  useEffect(() => {
    if (identifierParam) setEmail(identifierParam);
    if (codeParam) setCode(codeParam);
  }, [identifierParam, codeParam]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validation = validateShape(verifyEmailSchema, { identifier: email, code });
    if (!validation.success) {
      const firstError = Object.values(validation.fieldErrors)[0] ?? 'Completá todos los campos';
      setError(firstError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authApi.verifyEmail(email.trim(), code.trim());
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al verificar email');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    const validation = validateShape(resendVerificationSchema, { email });
    if (!validation.success) {
      setError(validation.fieldErrors.email ?? 'Ingresá tu correo primero');
      return;
    }

    setIsResending(true);
    setError(null);

    try {
      await authApi.resendVerification(email.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al reenviar código');
    } finally {
      setIsResending(false);
    }
  }

  if (success) {
    return (
      <div className={styles.card}>
        <h1 className={styles.title}>Email verificado</h1>

        <div className={styles.successBox}>
          <div className={styles.successIcon}>✅</div>
          <p className={styles.successTitle}>Verificación exitosa</p>
          <p className={styles.successText}>
            Tu correo electrónico fue verificado correctamente. Ya podés acceder
            a todas las funcionalidades de la plataforma.
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
      <h1 className={styles.title}>Verificar email</h1>
      <p className={styles.subtitle}>
        Ingresá el código de 6 dígitos que enviamos a tu correo
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
            disabled={isLoading}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="code">
            Código de verificación
          </label>
          <input
            id="code"
            className={`${styles.input} ${styles.codeInput}`}
            type="text"
            placeholder="000000"
            value={code}
            onChange={(e) => { setCode(e.target.value); setError(null); }}
            maxLength={6}
            disabled={isLoading}
          />
        </div>

        <button className={styles.submitBtn} type="submit" disabled={isLoading}>
          {isLoading ? (
            <span className={styles.btnLoading}>
              <Loader2 size={18} className={styles.spinner} />
              Verificando…
            </span>
          ) : (
            'Verificar email'
          )}
        </button>
      </form>

      <div className={styles.footer}>
        <button
          className={styles.resendBtn}
          onClick={handleResend}
          disabled={isResending}
        >
          {isResending ? 'Reenviando…' : 'Reenviar código'}
        </button>
      </div>

      <div className={styles.footer}>
        <Link href="/login" className={styles.footerLink}>
          Volver a iniciar sesión
        </Link>
      </div>
    </div>
  );
}
