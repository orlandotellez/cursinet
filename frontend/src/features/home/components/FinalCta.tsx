'use client';

import { ArrowRight } from "lucide-react";
import styles from "./FinalCta.module.css"
import Link from "next/link";
import { useAuthStore } from "@/src/shared/store/useAuthStore";

export const FinalCta = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <section className={styles.ctaSection}>
      <div className={styles.ctaInner}>
        <h2 className={styles.ctaTitle}>
          Listo para construir <span className={styles.heroHighlight}>en serio</span>?
        </h2>
        <p className={styles.ctaText}>
          Únete a miles de ingenieros que ya están aprendiendo con proyectos
          reales.
        </p>
        <Link
          href={isAuthenticated ? '/cursos' : '/register'}
          className={styles.ctaBtn}
        >
          {isAuthenticated ? 'Explorar cursos' : 'Crear cuenta gratis'}
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}

