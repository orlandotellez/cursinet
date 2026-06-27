import type { CourseCardData } from '@/src/shared/types';
import { courses } from './courses.data';
import { categories } from './categories.data';

export const featuredCourses: CourseCardData[] = courses
  .filter((c) => c.status === 'published')
  .slice(0, 6)
  .map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    shortDescription: c.shortDescription,
    thumbnail: c.thumbnail,
    instructor: { name: c.instructor.name, avatar: c.instructor.avatar },
    category: { name: c.category.name },
    level: c.level,
    duration: c.duration,
    lessonsCount: c.lessonsCount,
    price: c.price,
    rating: c.rating,
    reviewsCount: c.reviewsCount,
    studentsCount: c.studentsCount,
    badge: c.studentsCount > 5000 ? (c.id === 'course-1' ? 'Más vendido' : undefined) : undefined,
    status: c.status,
  }));

export const allCourseCards: CourseCardData[] = courses.map((c) => ({
  id: c.id,
  slug: c.slug,
  title: c.title,
  shortDescription: c.shortDescription,
  thumbnail: c.thumbnail,
  instructor: { name: c.instructor.name, avatar: c.instructor.avatar },
  category: { name: c.category.name },
  level: c.level,
  duration: c.duration,
  lessonsCount: c.lessonsCount,
  price: c.price,
  rating: c.rating,
  reviewsCount: c.reviewsCount,
  studentsCount: c.studentsCount,
  status: c.status,
}));

export const adminCourseCards: CourseCardData[] = allCourseCards;

export function getCoursesByCategory(slug: string): CourseCardData[] {
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) return [];
  return allCourseCards.filter((c) => c.category.name === cat.name);
}
