import { API_URL } from "../lib/constants";
import { AuthResponse, LoginPayload, RegisterPayload } from "../types";

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error al iniciar sesión' }));
    throw new Error(error.message || 'Error al iniciar sesión');
  }

  return res.json();
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error al registrarse' }));
    throw new Error(error.message || 'Error al registrarse');
  }

  return res.json();
}

/**
 * Renueva el access token usando el refreshToken (httpOnly cookie).
 * El backend setea las nuevas cookies automáticamente — el cliente
 * no recibe ni necesita manejar los tokens.
 *
 * Usado por `authedFetch` cuando una request autenticada devuelve 401.
 */
export async function refresh(): Promise<void> {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error al refrescar sesión' }));
    throw new Error(error.message || 'Error al refrescar sesión');
  }
}

export async function logout(): Promise<void> {
  const res = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error al cerrar sesión' }));
    throw new Error(error.message || 'Error al cerrar sesión');
  }
}

export async function verifyEmail(identifier: string, code: string): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ identifier, code }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error al verificar email' }));
    throw new Error(error.message || 'Error al verificar email');
  }

  return res.json();
}

export async function resendVerification(email: string): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/auth/resend-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error al reenviar código' }));
    throw new Error(error.message || 'Error al reenviar código');
  }

  return res.json();
}

export async function forgotPassword(email: string): Promise<{ message: string; expiresAt: string }> {
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error al solicitar restablecimiento' }));
    throw new Error(error.message || 'Error al solicitar restablecimiento');
  }

  return res.json();
}

export async function resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, code, newPassword }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error al restablecer contraseña' }));
    throw new Error(error.message || 'Error al restablecer contraseña');
  }

  return res.json();
}
