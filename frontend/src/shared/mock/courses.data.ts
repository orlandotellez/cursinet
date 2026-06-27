import type { Course, CourseModule } from '@/src/shared/types';
import { instructors } from './instructors.data';
import { categories } from './categories.data';

export const allModules: CourseModule[] = [
  {
    id: 'mod-1',
    title: 'Fundamentos',
    lessons: [
      { id: 'les-1', title: 'Introducción al curso', type: 'video' as const, duration: 15 },
      { id: 'les-2', title: 'Configuración del entorno', type: 'video' as const, duration: 20 },
      { id: 'les-3', title: 'Primeros pasos', type: 'text' as const, duration: 10 },
      { id: 'les-4', title: 'Conceptos clave', type: 'video' as const, duration: 25 },
    ],
  },
  {
    id: 'mod-2',
    title: 'Conceptos Intermedios',
    lessons: [
      { id: 'les-5', title: 'Patrones comunes', type: 'video' as const, duration: 30 },
      { id: 'les-6', title: 'Ejercicio práctico', type: 'code' as const, duration: 20 },
      { id: 'les-7', title: 'Quiz de conocimiento', type: 'quiz' as const, duration: 15 },
      { id: 'les-8', title: 'Caso de uso real', type: 'video' as const, duration: 35 },
    ],
  },
  {
    id: 'mod-3',
    title: 'Avanzado',
    lessons: [
      { id: 'les-9', title: 'Optimización avanzada', type: 'video' as const, duration: 40 },
      { id: 'les-10', title: 'Proyecto final', type: 'code' as const, duration: 60 },
      { id: 'les-11', title: 'Conclusiones', type: 'text' as const, duration: 5 },
    ],
  },
];

export const courses: Course[] = [
  {
    id: 'course-1', slug: 'arquitectura-hexagonal',
    title: 'Arquitectura Hexagonal en TypeScript',
    shortDescription: 'Aprende a diseñar sistemas mantenibles con puertos y adaptadores.',
    description: 'En este curso aprenderás los fundamentos de la Arquitectura Hexagonal (Puertos y Adaptadores) aplicada a TypeScript. Desde los conceptos básicos hasta implementaciones complejas con ejemplos del mundo real.\n\nDominarás la separación de concerns, el diseño orientado al dominio, y cómo mantener tu código libre de dependencias de infraestructura.',
    thumbnail: '', instructor: instructors[0], category: categories[2],
    level: 'advanced', duration: 32, lessonsCount: 64, price: 49.99,
    rating: 4.9, reviewsCount: 324, studentsCount: 4520,
    publishedAt: '2025-03-15', tags: ['typescript', 'ddd', 'arquitectura', 'clean-code'],
    modules: allModules, status: 'published',
  },
  {
    id: 'course-2', slug: 'react-desde-cero',
    title: 'React 19 desde Cero: La Guía Definitiva',
    shortDescription: 'Domina React 19, Server Components, Hooks y el ecosistema moderno.',
    description: 'El curso más completo para aprender React desde cero. Cubre desde los fundamentos hasta las features más avanzadas de React 19 incluyendo Server Components, Actions y el nuevo compilador.',
    thumbnail: '', instructor: instructors[1], category: categories[1],
    level: 'beginner', duration: 48, lessonsCount: 96, price: 39.99,
    rating: 4.8, reviewsCount: 567, studentsCount: 12300,
    publishedAt: '2025-01-10', tags: ['react', 'frontend', 'javascript', 'hooks'],
    modules: allModules, status: 'published',
  },
  {
    id: 'course-3', slug: 'kubernetes-practico',
    title: 'Kubernetes Práctico: De Docker a Producción',
    shortDescription: 'Despliega aplicaciones escalables en Kubernetes.',
    description: 'Aprende Kubernetes desde la práctica. Despliegues, servicios, ingress, helm, service mesh y más. Todo con ejemplos listos para producción.',
    thumbnail: '', instructor: instructors[2], category: categories[3],
    level: 'intermediate', duration: 28, lessonsCount: 56, price: 44.99,
    rating: 4.7, reviewsCount: 198, studentsCount: 3450,
    publishedAt: '2025-06-01', tags: ['kubernetes', 'docker', 'devops', 'cloud'],
    modules: allModules, status: 'published',
  },
  {
    id: 'course-4', slug: 'machine-learning-practico',
    title: 'Machine Learning Práctico con Python',
    shortDescription: 'De los fundamentos al deployment. Regresión, clasificación, NLP.',
    description: 'Curso intensivo de Machine Learning con Python. Desde la limpieza de datos hasta el deployment de modelos en producción con ejercicios del mundo real.',
    thumbnail: '', instructor: instructors[3], category: categories[4],
    level: 'intermediate', duration: 40, lessonsCount: 80, price: 54.99,
    rating: 4.9, reviewsCount: 412, studentsCount: 8900,
    publishedAt: '2025-04-20', tags: ['python', 'machine-learning', 'data-science'],
    modules: allModules, status: 'published',
  },
  {
    id: 'course-5', slug: 'nextjs-16',
    title: 'Next.js 16: App Router en Producción',
    shortDescription: 'Server Components, caching, ISR, middleware y más.',
    description: 'Aprende Next.js 16 a profundidad. Server Components, caching strategies, ISR, middleware, autenticación, y todo lo que necesitas para llevar tus apps a producción.',
    thumbnail: '', instructor: instructors[1], category: categories[1],
    level: 'advanced', duration: 36, lessonsCount: 72, price: 44.99,
    rating: 4.8, reviewsCount: 289, studentsCount: 6700,
    publishedAt: '2025-07-01', tags: ['nextjs', 'react', 'fullstack', 'ssr'],
    modules: allModules, status: 'published',
  },
  {
    id: 'course-6', slug: 'diseno-sistemas',
    title: 'Diseño de Sistemas: La Guía del Arquitecto',
    shortDescription: 'Escalabilidad, patrones, microservicios y decisiones técnicas.',
    description: 'Todo lo que necesitas saber para diseñar sistemas escalables. Patrones de arquitectura, microservicios, bases de datos distribuidas, caching, y mucho más.',
    thumbnail: '', instructor: instructors[0], category: categories[2],
    level: 'advanced', duration: 44, lessonsCount: 88, price: 59.99,
    rating: 4.9, reviewsCount: 198, studentsCount: 3800,
    publishedAt: '2025-05-10', tags: ['system-design', 'arquitectura', 'microservicios'],
    modules: allModules, status: 'published',
  },
  {
    id: 'course-7', slug: 'go-backend',
    title: 'Backend en Go: APIs y Microservicios',
    shortDescription: 'Construye APIs robustas con Go desde cero hasta producción.',
    description: 'Aprende Go construyendo APIs REST y microservicios. Testing, concurrencia, bases de datos, y deployment.',
    thumbnail: '', instructor: instructors[0], category: categories[0],
    level: 'intermediate', duration: 30, lessonsCount: 60, price: 44.99,
    rating: 4.8, reviewsCount: 156, studentsCount: 2800,
    publishedAt: '2025-08-15', tags: ['go', 'backend', 'api', 'microservicios'],
    modules: allModules, status: 'published',
  },
  {
    id: 'course-8', slug: 'testing-avanzado',
    title: 'Testing Avanzado: De Unit a E2E',
    shortDescription: 'Estrategias de testing para aplicaciones modernas.',
    description: 'Domina las estrategias de testing: unit, integration, e2e. Testing de componentes, APIs, bases de datos y más.',
    thumbnail: '', instructor: instructors[1], category: categories[6],
    level: 'intermediate', duration: 24, lessonsCount: 48, price: 34.99,
    rating: 4.7, reviewsCount: 134, studentsCount: 2100,
    publishedAt: '2025-09-01', tags: ['testing', 'tdd', 'jest', 'playwright'],
    modules: allModules, status: 'pending',
  },
];

export function getCourseBySlug(slug: string): Course | undefined {
  return courses.find((c) => c.slug === slug);
}
