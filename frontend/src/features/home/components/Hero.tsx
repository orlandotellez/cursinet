import Link from "next/link";
import styles from "./Hero.module.css"
import { ArrowRight } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <h1 className={styles.heroTitle}>Cursinet</h1>
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
    </section>
  );
}
