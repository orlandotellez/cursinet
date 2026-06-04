import type { UserRole } from '../types';

export function resolveDashboardUrl(role: UserRole | undefined): string {
  const normalized = role?.toLowerCase();
  switch (normalized) {
    case 'admin':
      return '/admin/dashboard';
    case 'instructor':
      return '/instructor/dashboard';
    default:
      return '/dashboard';
  }
}

export function redirectByRole(
  role: UserRole | undefined,
  navigate: (url: string) => void,
) {
  navigate(resolveDashboardUrl(role));
}

export function clearAllStorage() {
  // 1. localStorage — todas las keys
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key) localStorage.removeItem(key);
  }

  // 2. sessionStorage
  try { sessionStorage.clear(); } catch { /* noop */ }

  // 3. Cookies — barrer todas las del dominio actual
  document.cookie.split(';').forEach((cookie) => {
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
    if (name) {
      ['/', '', '/admin', '/instructor', '/dashboard'].forEach((path) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${window.location.hostname}`;
      });
    }
  });
}
