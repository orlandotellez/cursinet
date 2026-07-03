import Link from "next/link";
import styles from "./Hero.module.css"
import { ArrowRight } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Aprende. Crea. Avanza.</h1>
          <p className={styles.heroSubtitle}>Cursos online diseñados para que desarrolles habilidades reales mediante proyectos prácticos.</p>
          <div className={styles.heroCta}>
            <Link href="/cursos" className={styles.heroBtnPrimary}>
              Explorar cursos
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

