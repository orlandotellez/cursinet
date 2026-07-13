import type { Certificate } from '@/src/shared/types';

export const certificates: Certificate[] = [
  { id: 'cert-1', courseId: 'course-3', studentName: 'Juan Pérez', courseName: 'Kubernetes Práctico: De Docker a Producción', issuedAt: '2026-03-15', instructorName: 'Carlos Ruiz', certificateNumber: 'CERT-a1b2c3d4e5f6' },
  { id: 'cert-2', courseId: 'course-5', studentName: 'Juan Pérez', courseName: 'Next.js 16: App Router en Producción', issuedAt: '2026-02-20', instructorName: 'Laura García', certificateNumber: 'CERT-f6e5d4c3b2a1' },
];
