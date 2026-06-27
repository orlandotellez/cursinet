import { Clock, Star, Users, BookOpen } from 'lucide-react';
import styles from './CourseStats.module.css';

interface CourseStatsProps {
  duration: number;
  lessonsCount: number;
  rating: number;
  studentsCount: number;
}

export function CourseStats({ duration, lessonsCount, rating, studentsCount }: CourseStatsProps) {
  return (
    <div className={styles.stats}>
      <div className={styles.stat}>
        <Clock size={12} />
        <span>{duration}h</span>
      </div>
      <div className={styles.stat}>
        <BookOpen size={12} />
        <span>{lessonsCount} lec.</span>
      </div>
      <div className={styles.stat}>
        <Star size={12} />
        <span>{rating}</span>
      </div>
      <div className={styles.stat}>
        <Users size={12} />
        <span>{studentsCount.toLocaleString()}</span>
      </div>
    </div>
  );
}
