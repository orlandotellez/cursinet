import { API_URL } from "../lib/constants";
import { authedFetch } from "../lib/api";
import type { Certificate } from "../types";
import { handleJsonResponse } from "./helpers";

export async function getMyCertificates(): Promise<Certificate[]> {
  const res = await authedFetch(`${API_URL}/certificates`);
  return handleJsonResponse<Certificate[]>(res);
}

export async function issueCertificate(courseId: string): Promise<Certificate> {
  const res = await authedFetch(`${API_URL}/certificates/${courseId}`, {
    method: 'POST',
  });
  return handleJsonResponse<Certificate>(res);
}
