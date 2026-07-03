'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Spinner } from '@/src/shared/components/Spinner';
import { ErrorBanner } from '@/src/shared/components/ErrorBanner';
import { validateShape } from '@/src/shared/lib/validation';
import { verifyEmailSchema, resendVerificationSchema } from '@/src/shared/validations';
import { useAsyncAction } from '@/src/shared/hooks/useAsyncAction';
import { useAuthStore } from '@/src/shared/store/useAuthStore';
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

  const { isLoading, error, execute, clearError } = useAsyncAction();
  const resend = useAsyncAction();
  const [email, setEmail] = useState(identifierParam);
  const [code, setCode] = useState(codeParam);
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Auto-verify if params are present
  useEffect(() => {
    if (identifierParam) setEmail(identifierParam);
    if (codeParam) setCode(codeParam);
  }, [identifierParam, codeParam]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validation = validateShape(verifyEmailSchema, { identifier: email, code });
    if (!validation.success) {
      setValidationError(Object.values(validation.fieldErrors)[0] ?? 'Completá todos los campos');
      return;
    }
    setValidationError(null);

    const result = await execute(() => authApi.verifyEmail(email.trim(), code.trim()));
    if (result !== null) {
      // Actualizar el store local para que el banner desaparezca
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        useAuthStore.getState().setUser({ ...currentUser, emailVerified: true });
      }
      setSuccess(true);
    }
  }

  async function handleResend() {
    const validation = validateShape(resendVerificationSchema, { email });
    if (!validation.success) {
      return;
    }
    await resend.execute(() => authApi.resendVerification(email.trim()));
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
          <Link href="/dashboard" className={styles.footerLink}>
            Ir al Dashboard
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

      {(error || validationError) && <ErrorBanner error={error ?? validationError ?? ''} clearError={() => { clearError(); setValidationError(null); }} />}

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
            onChange={(e) => { setEmail(e.target.value); clearError(); }}
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
            onChange={(e) => { setCode(e.target.value); clearError(); }}
            maxLength={6}
            disabled={isLoading}
          />
        </div>

        <button className={styles.submitBtn} type="submit" disabled={isLoading}>
          {isLoading ? (
            <span className={styles.btnLoading}>
              <Spinner size="sm" className={styles.spinner} />
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
          disabled={resend.isLoading}
        >
          {resend.isLoading ? 'Reenviando…' : 'Reenviar código'}
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
