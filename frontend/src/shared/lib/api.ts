import { refresh as refreshTokens } from '../api/auth';
import { useAuthStore } from '../store/useAuthStore';
import { clearAllStorage } from './authUtils';

let refreshInFlight: Promise<void> | null = null;

function extractUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}

function isAuthEndpoint(url: string): boolean {
  return url.includes('/auth/refresh') || url.includes('/auth/login');
}

function handleRefreshFailure(): never {
  if (typeof window === 'undefined') {
    throw new Error('Refresh failed');
  }

  useAuthStore.getState().logout().catch(() => { });

  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isDemoMode: false,
    error: null,
  });
  clearAllStorage();

  window.location.href = '/login';

  throw new Error('Session expired');
}

async function performRefresh(): Promise<void> {
  if (!refreshInFlight) {
    refreshInFlight = refreshTokens()
      .catch(() => {
        handleRefreshFailure();
      })
      .finally(() => {
        setTimeout(() => {
          refreshInFlight = null;
        }, 0);
      });
  }
  return refreshInFlight;
}

export async function authedFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const first = await fetch(input, { ...init, credentials: 'include' });

  if (first.status !== 401) {
    return first;
  }

  const url = extractUrl(input);
  if (isAuthEndpoint(url)) {
    return first;
  }

  try {
    await performRefresh();
  } catch {
    return first;
  }

  return fetch(input, { ...init, credentials: 'include' });
}
