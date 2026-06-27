import type { Review } from '@/src/shared/types';

export const mockComments: Review[] = [
  { id: 'c-1', courseId: 'course-1', userId: 'u-2', userName: 'Diego Ramírez', userAvatar: null, rating: 0, comment: 'Excelente explicación, muy clara. Me gustó cómo desglosaste el concepto.', createdAt: '2026-05-19T14:30:00Z' },
  { id: 'c-2', courseId: 'course-1', userId: 'u-8', userName: 'Camila Herrera', userAvatar: null, rating: 0, comment: '¿Hay algún recurso adicional para practicar esto?', createdAt: '2026-05-18T10:15:00Z' },
  { id: 'c-3', courseId: 'course-1', userId: 'u-2', userName: 'Diego Ramírez', userAvatar: null, rating: 0, comment: 'La parte de los ejemplos prácticos me ayudó mucho a entender.', createdAt: '2026-05-17T09:00:00Z' },
];
