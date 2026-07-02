'use client';

import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          {/* Brand */}
          <div className={styles.brand}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>N</span>
              <span className={styles.logoText}>CURSINET</span>
            </div>
            <p className={styles.description}>
              Plataforma de aprendizaje técnico para ingenieros. Construye
              sistemas reales, domina la tecnología.
            </p>
            <div className={styles.social}>
              <a
                href="https://github.com/orlandotellez/cursinet"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="GitHub"
              >
                <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Twitter"
              >
                <ExternalLink size={20} />
              </a>
            </div>
          </div>

          {/* Nav */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Plataforma</h3>
            <ul className={styles.columnLinks}>
              <li>
                <Link href="/cursos">Explorar cursos</Link>
              </li>
              <li>
                <Link href="/categorias">Categorías</Link>
              </li>
              <li>
                <Link href="/instructores">Instructores</Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Compañía</h3>
            <ul className={styles.columnLinks}>
              <li>
                <Link href="/sobre-nosotros">Sobre nosotros</Link>
              </li>
              <li>
                <Link href="/blog">Blog</Link>
              </li>
              <li>
                <Link href="/carreras">Carreras</Link>
              </li>
              <li>
                <Link href="/contacto">Contacto</Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className={styles.newsletter}>
            <h3 className={styles.columnTitle}>Newsletter</h3>
            <p className={styles.newsletterText}>
              Recibe contenido técnico semanal directo a tu bandeja de entrada.
            </p>
            <form className={styles.newsletterForm} onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="tu@email.com"
                className={styles.newsletterInput}
                aria-label="Correo electrónico"
              />
              <button type="submit" className={styles.newsletterBtn}>
                Suscribirse
              </button>
            </form>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            &copy; {new Date().getFullYear()} CURSINET. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
