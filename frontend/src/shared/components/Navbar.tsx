'use client';

import { useState, useEffect } from 'react';
import { Menu, X, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/src/shared/store/useAuthStore';
import styles from './Navbar.module.css';

const NAV_ITEMS = [
  { label: 'Inicio', href: '/' },
  { label: 'Cursos', href: '/cursos' },
];

const DASHBOARD_CONFIG: Record<string, { label: string; href: string }> = {
  student: { label: 'Ir al panel educativo', href: '/dashboard' },
  instructor: { label: 'Ir al panel de instructor', href: '/instructor/dashboard' },
  admin: { label: 'Ir al panel de administración', href: '/admin/dashboard' },
};

function isActive(href: string, pathname: string): boolean {
  if (href === '/') return pathname === '/';
  if (href.startsWith('/#')) return false; // anchor links
  return pathname.startsWith(href);
}

export function Navbar() {
  const pathname = usePathname();
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
              <Link
                href={item.href}
                className={`${styles.navLink} ${isActive(item.href, pathname) ? styles.navLinkActive : ''}`}
              >
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
          <a
            href="https://github.com/orlandotellez/cursinet"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.githubLink}
            aria-label="GitHub"
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
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
                  className={`${styles.mobileNavLink} ${isActive(item.href, pathname) ? styles.mobileNavLinkActive : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className={styles.mobileActions}>
            <a
              href="https://github.com/orlandotellez/cursinet"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mobileGithubLink}
              onClick={() => setMenuOpen(false)}
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Código fuente
            </a>
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
