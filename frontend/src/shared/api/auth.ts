import { API_URL } from "../lib/constants";
import { validateOrThrow } from "../lib/validation";
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema, verifyEmailSchema } from "../validations";
import { AuthResponse, LoginPayload, RegisterPayload } from "../types";
import { UserDTO } from "./users";

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  validateOrThrow(loginSchema, payload);
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
  validateOrThrow(registerSchema, { ...payload, confirmPassword: payload.password });
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

/**
 * Obtiene el perfil del usuario autenticado.
 * No requiere permisos especiales — solo estar autenticado.
 */
export async function getMyProfile(): Promise<UserDTO> {
  const res = await fetch(`${API_URL}/auth/me`, {
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error al cargar perfil' }));
    throw new Error(error.message || 'Error al cargar perfil');
  }

  return res.json();
}

export async function verifyEmail(identifier: string, code: string): Promise<{ message: string }> {
  validateOrThrow(verifyEmailSchema, { identifier, code });
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
  validateOrThrow(forgotPasswordSchema, { email });
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
  validateOrThrow(forgotPasswordSchema, { email });
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
  validateOrThrow(resetPasswordSchema, { email, code, newPassword, confirmPassword: newPassword });
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
