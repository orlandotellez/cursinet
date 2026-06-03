import Link from "next/link";
import styles from "./Hero.module.css"
import { ArrowRight, Server, Monitor, Layers, Cloud, BarChart3, Smartphone, CheckCircle, Shield } from "lucide-react";
import { categories } from "@/src/features/courses/data";

const iconMap: Record<string, React.ReactNode> = {
  Server: <Server size={16} />,
  Monitor: <Monitor size={16} />,
  Layers: <Layers size={16} />,
  Cloud: <Cloud size={16} />,
  BarChart3: <BarChart3 size={16} />,
  Smartphone: <Smartphone size={16} />,
  CheckCircle: <CheckCircle size={16} />,
  Shield: <Shield size={16} />,
};

export const HeroSection = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>
            Plataforma de aprendizaje técnico
          </span>
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
          <div className={styles.heroSocial}>
            <div className={styles.heroAvatars}>
              {['M', 'L', 'C', 'A', '+'].map((initial, i) => (
                <div
                  key={i}
                  className={styles.heroAvatar}
                  style={{ zIndex: 5 - i }}
                >
                  {initial}
                </div>
              ))}
            </div>
            <p className={styles.heroSocialText}>
              <strong>Más de 12,000</strong> estudiantes activos
            </p>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.catCard}>
            <span className={styles.catBadge}>Áreas</span>
            <h3 className={styles.catTitle}>Explora por categoría</h3>
            <div className={styles.catGrid}>
              {categories.map((cat) => (
                <Link key={cat.id} href={`/cursos?categoria=${cat.slug}`} className={styles.catItem}>
                  <span className={styles.catIcon}>
                    {iconMap[cat.icon]}
                  </span>
                  <div className={styles.catInfo}>
                    <span className={styles.catName}>{cat.name}</span>
                    <span className={styles.catCount}>{cat.coursesCount} cursos</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

