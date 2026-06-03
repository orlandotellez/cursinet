'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/src/shared/store/useAuthStore';
import styles from './page.module.css';
import { UserRole } from '@/src/shared/types';

// Redirige según el rol del usuario
function redirectByRole(role: UserRole | undefined, navigate: (url: string) => void) {
  switch (role) {
    case 'admin':
      navigate('/admin/dashboard');
      break;
    case 'instructor':
      navigate('/instructor/dashboard');
      break;
    default:
      navigate('/dashboard');
  }
}
import { ErrorBanner } from '@/src/shared/components/ErrorBanner';

// ─── Demo credentials ─────────────────────────────────────────────

interface DemoCredential {
  role: string;
  label: string;
  email: string;
  password: string;
}

const DEMO_CREDENTIALS: DemoCredential[] = [
  { role: 'Estudiante', label: 'student', email: 'sofia@email.com', password: '123456' },
  { role: 'Instructor', label: 'instructor', email: 'martin@cursinet.com', password: '123456' },
  { role: 'Admin', label: 'admin', email: 'admin@cursinet.com', password: '123456' },
];

// ─── Page ─────────────────────────────────────────────────────────

export default function IniciarSesionPage() {
  const router = useRouter();
  const { isAuthenticated, login, isLoading, error, clearError, tryDemoCredentials } = useAuthStore();

  // Si ya tiene sesión, redirigir según rol
  useEffect(() => {
    if (isAuthenticated) {
      const role = useAuthStore.getState().user?.role;
      redirectByRole(role, router.replace);
    }
  }, [isAuthenticated, router]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function validate() {
    const next: typeof errors = {};
    if (!email.trim()) next.email = 'El correo es obligatorio';
    if (!password) next.password = 'La contraseña es obligatoria';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    clearError();

    try {
      // Intentar login vía API real
      await login({ email: email.trim(), password });

      // Si llegamos acá, el login fue exitoso
      redirectAfterLogin();
    } catch {
      // Si falla la API, ofrecer demo mode como fallback
      // tryDemoCredentials buscará en la lista de usuarios demo offline
      const matched = tryDemoCredentials(email.trim(), password);
      if (matched) {
        redirectAfterLogin();
      }
      // Si no matcheó ningún demo user, el error ya está en el store
    }
  }

  function redirectAfterLogin() {
    const role = useAuthStore.getState().user?.role;
    redirectByRole(role, router.replace);
  }

  /** Loguea directo con demo mode sin llamar a la API */
  function handleDemoLogin(cred: DemoCredential) {
    clearError();
    useAuthStore.getState().demoLogin(cred.label as UserRole);
    const role = useAuthStore.getState().user?.role;
    redirectByRole(role, router.replace);
  }

  /** Rellena los campos con la credencial demo */
  function fillDemoCredentials(cred: DemoCredential) {
    clearError();
    setEmail(cred.email);
    setPassword(cred.password);
    setErrors({});
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
              <Loader2 size={18} className={styles.spinner} />
              Iniciando sesión…
            </span>
          ) : (
            'Iniciar sesión'
          )}
        </button>
      </form>

      {/* ── Demo Credentials ── */}
      <div className={styles.demoBox}>
        <span className={styles.demoLabel}>
          🧪 Credenciales demo
          <span className={styles.demoHint}> — hacé clic para acceder al instante</span>
        </span>
        {DEMO_CREDENTIALS.map((cred) => (
          <div key={cred.label} className={styles.demoRow}>
            <span className={styles.demoRole}>{cred.role}:</span>
            <button
              type="button"
              className={styles.demoCta}
              onClick={() => handleDemoLogin(cred)}
              title="Ingresar como demo"
            >
              <code className={styles.demoCode}>
                {cred.email} / {cred.password}
              </code>
              <span className={styles.demoArrow}>→</span>
            </button>
          </div>
        ))}
        <p className={styles.demoNote}>
          ¿Tenés el backend corriendo? Usá el formulario de arriba con{' '}
          <button
            type="button"
            className={styles.demoLink}
            onClick={() => fillDemoCredentials(DEMO_CREDENTIALS[1])}
          >
            instructor@cursinet.com
          </button>
          {' / '}
          <strong>password123</strong> (seed por defecto).
        </p>
      </div>

      <p className={styles.footer}>
        ¿No tenés cuenta?
        <Link href="/register" className={styles.footerLink}>
          Registrarse
        </Link>
      </p>
    </div>
  );
}
