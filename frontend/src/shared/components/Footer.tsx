'use client';

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
                <Link href="/contacto">Contacto</Link>
              </li>
            </ul>
          </div>

          <div className={styles.bottom}>
            <p className={styles.copyright}>
              &copy; {new Date().getFullYear()} CURSINET. Todos los derechos
              reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
