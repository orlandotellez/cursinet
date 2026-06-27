import Link from "next/link";
import styles from "./Hero.module.css"
import { ArrowRight } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Aprende tecnología construyendo{' '}
            <span className={styles.heroHighlight}>sistemas reales.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Cursos de backend, frontend, arquitectura y cloud. Domina la
            tecnología construyendo proyectos que importan, no siguiendo
            tutoriales vacíos.
          </p>
          <div className={styles.heroCta}>
            <Link href="/cursos" className={styles.heroBtnPrimary}>
              Explorar cursos
              <ArrowRight size={18} />
            </Link>
            <Link href="#pricing" className={styles.heroBtnGhost}>
              Ver demo gratis &rarr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

