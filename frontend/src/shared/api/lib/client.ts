import { API_URL } from '@/src/shared/lib/constants';
import { authedFetch } from '@/src/shared/lib/api';
import { handleJsonResponse } from './helpers';

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const url = `${API_URL}${path}`;
  const init: RequestInit = {
    method,
    credentials: 'include' as RequestCredentials,
  };
  if (body !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(body);
  }
  const res = await authedFetch(url, init);
  if (res.status === 204) return undefined as T;
  return handleJsonResponse<T>(res);
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};
