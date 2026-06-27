import type { Notification } from '@/src/shared/types';

export const mockNotifications: Notification[] = [
  { id: 'not-1', type: 'success', title: 'Curso completado', message: 'Felicitaciones! Completaste "Kubernetes Práctico"', read: false, createdAt: '2026-05-20T10:30:00Z', link: '/certificados' },
  { id: 'not-2', type: 'info', title: 'Nuevo curso disponible', message: '"Backend en Go" ya está disponible para ti', read: false, createdAt: '2026-05-19T08:15:00Z', link: '/cursos/go-backend' },
  { id: 'not-3', type: 'warning', title: 'Recordatorio', message: 'Tu suscripción Pro se renueva en 7 días', read: true, createdAt: '2026-05-15T14:00:00Z', link: '/configuracion' },
  { id: 'not-4', type: 'info', title: 'Nuevo comentario', message: 'Martín López respondió tu pregunta en "Arquitectura Hexagonal"', read: true, createdAt: '2026-05-14T09:45:00Z', link: '/aprender/course-1/les-5' },
  { id: 'not-5', type: 'success', title: 'Certificado disponible', message: 'Tu certificado de "Next.js 16" ya está listo para descargar', read: true, createdAt: '2026-05-10T11:20:00Z', link: '/certificados' },
];
