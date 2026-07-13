import { api } from '../lib/client';
import { API_URL } from '@/src/shared/lib/constants';
import { authedFetch } from '@/src/shared/lib/api';
import type { Certificate } from '@/src/shared/types';

export async function getMyCertificates(): Promise<Certificate[]> {
  return api.get<Certificate[]>('/certificates');
}

export async function issueCertificate(courseId: string): Promise<Certificate> {
  return api.post<Certificate>(`/certificates/${courseId}`);
}

export async function downloadCertificate(certificateId: string): Promise<void> {
  const url = `${API_URL}/certificates/${certificateId}/download`;
  const res = await authedFetch(url);

  if (!res.ok) {
    throw new Error('Error al descargar el certificado');
  }

  const blob = await res.blob();
  const filename = `certificado-${certificateId}.pdf`;

  // Crear un enlace temporal y hacer click para descargar
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}
