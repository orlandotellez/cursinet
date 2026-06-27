import Link from "next/link";
import styles from "./CategoriesGrid.module.css"
import { ArrowRight } from "lucide-react";
import { Category } from "@/src/shared/types";

interface CategoriesGridProps {
  categories: Category[]
}

export const CategoriesGrid = ({ categories }: CategoriesGridProps) => {
  return (
    <section className={styles.sectionAlt}>
      <div className={styles.sectionInner}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Explora por categoría</h2>
          <p className={styles.sectionSubtitle}>
            Encuentra el camino que se alinee con tus objetivos
          </p>
        </div>
        <div className={styles.categoriesGrid}>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/cursos?categoria=${encodeURIComponent(cat.name)}`}
              className={styles.categoryCard}
            >
              <span className={styles.categoryIcon}>{cat.name.charAt(0)}</span>
              <div className={styles.categoryInfo}>
                <h3 className={styles.categoryName}>{cat.name}</h3>
                <span className={styles.categoryCount}>
                  {cat.coursesCount} cursos
                </span>
              </div>
              <ArrowRight size={16} className={styles.categoryArrow} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

