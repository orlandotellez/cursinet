import Link from 'next/link';
import { CourseThumbnail } from './CourseThumbnail';
import { CourseLevelBadge } from './CourseLevelBadge';
import { CourseStats } from './CourseStats';
import styles from './CourseCard.module.css';
import { CourseCardData } from '@/src/shared/types';

interface CourseCardProps {
  course: CourseCardData
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <article className={styles.card}>
      <Link href={`/cursos/${course.slug}`} className={styles.link}>
        <CourseThumbnail title={course.title} badge={course.badge} />

        <div className={styles.content}>
          <div className={styles.meta}>
            <span className={styles.category}>{course.category.name}</span>
            <CourseLevelBadge level={course.level} />
          </div>

          <h3 className={styles.title}>{course.title}</h3>
          <p className={styles.description}>{course.shortDescription}</p>

          <div className={styles.instructor}>
            <div className={styles.instructorAvatar}>
              {course.instructor.name.charAt(0)}
            </div>
            <span className={styles.instructorName}>
              {course.instructor.name}
            </span>
          </div>

          <CourseStats
            duration={course.duration}
            lessonsCount={course.lessonsCount}
            rating={course.rating}
            studentsCount={course.studentsCount}
          />

          <div className={styles.footer}>
            <span className={styles.price}>
              {course.price === 0
                ? 'Gratis'
                : `$${course.price.toFixed(2)}`}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
