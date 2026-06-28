'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Spinner } from '@/src/shared/components/Spinner';
import { ErrorBanner } from '@/src/shared/components/ErrorBanner';
import { validateShape } from '@/src/shared/lib/validation';
import { forgotPasswordSchema } from '@/src/shared/validations';
import { useAsyncAction } from '@/src/shared/hooks/useAsyncAction';
import * as authApi from '@/src/shared/api/auth';
import styles from './page.module.css';

export default function OlvidoContrasenaPage() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState<{ message: string } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { isLoading, error, execute, clearError } = useAsyncAction();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validation = validateShape(forgotPasswordSchema, { email });
    if (!validation.success) {
      setValidationError(validation.fieldErrors.email ?? 'Error de validación');
      return;
    }
    setValidationError(null);

    setSuccess(null);
    const result = await execute(() => authApi.forgotPassword(email.trim()));
    if (result) {
      setSuccess({ message: result.message });
    }
  }

  if (success) {
    return (
      <div className={styles.card}>
        <h1 className={styles.title}>Correo enviado</h1>

        <div className={styles.successBox}>
          <div className={styles.successIcon}>📧</div>
          <p className={styles.successTitle}>Revisá tu bandeja de entrada</p>
          <p className={styles.successText}>
            Si existe una cuenta con <strong>{email}</strong>, vas a recibir un
            código de 6 dígitos para restablecer tu contraseña. El código expira
            en 15 minutos.
          </p>
          <p className={styles.successText}>
            ¿No lo recibiste? Revisá la carpeta de spam o intentá de nuevo.
            También podés ver la consola del backend para encontrar el código en
            modo desarrollo.
          </p>
        </div>

        <div className={styles.footer}>
          <Link href="/login" className={styles.footerLink}>
            Volver a iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>Olvidaste tu contraseña</h1>
      <p className={styles.subtitle}>
        Ingresá tu correo y te enviaremos un código para restablecerla
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

        <button className={styles.submitBtn} type="submit" disabled={isLoading}>
          {isLoading ? (
            <span className={styles.btnLoading}>
              <Spinner size="sm" className={styles.spinner} />
              Enviando…
            </span>
          ) : (
            'Enviar código'
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
