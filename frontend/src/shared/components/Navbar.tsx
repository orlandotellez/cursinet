'use client';

import { useState, useEffect } from 'react';
import { Menu, X, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/src/shared/store/useAuthStore';
import styles from './Navbar.module.css';

const NAV_ITEMS = [
  { label: 'Inicio', href: '/' },
  { label: 'Cursos', href: '/cursos' },
  { label: 'Instructores', href: '/instructores' },
  { label: 'Precios', href: '#pricing' },
];

const DASHBOARD_CONFIG: Record<string, { label: string; href: string }> = {
  student: { label: 'Ir al panel educativo', href: '/dashboard' },
  instructor: { label: 'Ir al panel de instructor', href: '/instructor/dashboard' },
  admin: { label: 'Ir al panel de administración', href: '/admin/dashboard' },
};

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  const dashboardConfig = DASHBOARD_CONFIG[user?.role ?? 'student'] ?? DASHBOARD_CONFIG.student;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}
    >
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>N</span>
          <span className={styles.logoText}>CURSINET</span>
        </Link>

        <ul className={styles.desktopNav}>
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              <Link href={item.href} className={styles.navLink}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className={styles.actions}>
          {isAuthenticated ? (
            <Link href={dashboardConfig.href} className={styles.dashboardBtn}>
              <GraduationCap size={18} />
              {dashboardConfig.label}
            </Link>
          ) : (
            <>
              <Link href="/login" className={styles.loginBtn}>
                Iniciar sesión
              </Link>
              <Link href="/register" className={styles.signupBtn}>
                Registrarse
              </Link>
            </>
          )}
          <button
            className={styles.menuBtn}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          <ul className={styles.mobileNav}>
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={styles.mobileNavLink}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className={styles.mobileActions}>
            {isAuthenticated ? (
              <Link
                href={dashboardConfig.href}
                className={styles.mobileDashboardBtn}
                onClick={() => setMenuOpen(false)}
              >
                <GraduationCap size={18} />
                {dashboardConfig.label}
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className={styles.mobileLoginBtn}
                  onClick={() => setMenuOpen(false)}
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className={styles.mobileSignupBtn}
                  onClick={() => setMenuOpen(false)}
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
