import type { Review } from '@/src/shared/types';

export const mockReviews: Review[] = [
  { id: 'rev-1', courseId: 'course-1', userId: 'u-1', userName: 'Sofia Martínez', userAvatar: null, rating: 5, comment: 'Excelente curso. La explicación de arquitectura hexagonal es clara y los ejemplos son muy prácticos.', createdAt: '2026-04-10' },
  { id: 'rev-2', courseId: 'course-1', userId: 'u-2', userName: 'Diego Ramírez', userAvatar: null, rating: 4, comment: 'Muy buen contenido. Me hubiera gustado más ejercicios prácticos pero en general es excelente.', createdAt: '2026-03-22' },
  { id: 'rev-3', courseId: 'course-1', userId: 'u-3', userName: 'Valentina Torres', userAvatar: null, rating: 5, comment: 'El mejor curso de React que he tomado. Los Server Components quedaron clarísimos.', createdAt: '2026-05-01' },
  { id: 'rev-4', courseId: 'course-2', userId: 'u-8', userName: 'Camila Herrera', userAvatar: null, rating: 5, comment: 'Increíble la profundidad con la que se cubre Kubernetes. Lo recomiendo 100%.', createdAt: '2026-04-28' },
];
