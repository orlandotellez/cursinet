import { api } from '../lib/client';
import type { Certificate } from '@/src/shared/types';

export async function getMyCertificates(): Promise<Certificate[]> {
  return api.get<Certificate[]>('/certificates');
}

export async function issueCertificate(courseId: string): Promise<Certificate> {
  return api.post<Certificate>(`/certificates/${courseId}`);
}
