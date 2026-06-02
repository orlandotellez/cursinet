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
