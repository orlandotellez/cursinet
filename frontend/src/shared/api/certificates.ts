import { API_URL } from "../lib/constants";
import type { Certificate } from "../types";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: 'Error del servidor' }));
    throw new Error(body.message || body.title || 'Error del servidor');
  }
  return res.json();
}

export async function getMyCertificates(): Promise<Certificate[]> {
  const res = await fetch(`${API_URL}/certificates`, {
    credentials: 'include',
  });
  return handleResponse<Certificate[]>(res);
}

export async function issueCertificate(courseId: string): Promise<Certificate> {
  const res = await fetch(`${API_URL}/certificates/${courseId}`, {
    method: 'POST',
    credentials: 'include',
  });
  return handleResponse<Certificate>(res);
}
