'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { ErrorBanner } from '@/src/shared/components/ErrorBanner';
import * as authApi from '@/src/shared/api/auth';
import styles from './page.module.css';

export default function OlvidoContrasenaPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ message: string; code?: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError('El correo es obligatorio');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await authApi.forgotPassword(email.trim());
      setSuccess({ message: result.message });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al solicitar restablecimiento');
    } finally {
      setIsLoading(false);
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

        <button className={styles.submitBtn} type="submit" disabled={isLoading}>
          {isLoading ? (
            <span className={styles.btnLoading}>
              <Loader2 size={18} className={styles.spinner} />
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
