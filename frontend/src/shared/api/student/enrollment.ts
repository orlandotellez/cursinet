import { api } from '../lib/client';
import { validateOrThrow } from '@/src/shared/lib/validation';
import { createPaymentSchema } from '@/src/shared/validations';
import type { EnrollmentResponse, EnrollmentStatusResponse } from '../types';

export async function enrollFree(courseId: string): Promise<EnrollmentResponse> {
  validateOrThrow(createPaymentSchema, { courseId });
  return api.post<EnrollmentResponse>('/enrollments', { courseId });
}

export async function getMyEnrollments(): Promise<EnrollmentResponse[]> {
  return api.get<EnrollmentResponse[]>('/enrollments/mine');
}

export async function getEnrollmentStatus(
  courseId: string,
): Promise<EnrollmentStatusResponse> {
  return api.get<EnrollmentStatusResponse>(`/enrollments/${courseId}/status`);
}
