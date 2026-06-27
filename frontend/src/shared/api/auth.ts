import { API_URL } from '../lib/constants';
import { handleJsonResponse } from './helpers';
import { validateOrThrow } from '../lib/validation';
import {
  loginSchema,
  registerSchema,
  verifyEmailSchema,
} from '../validations';
import { AuthResponse, LoginPayload, RegisterPayload } from '../types';
import { UserDTO } from './users';

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  return handleJsonResponse<T>(res);
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
  });
  return handleJsonResponse<T>(res);
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  validateOrThrow(loginSchema, payload);
  return postJson<AuthResponse>('/auth/login', payload);
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  validateOrThrow(registerSchema, { ...payload, confirmPassword: payload.password });
  return postJson<AuthResponse>('/auth/register', payload);
}

export async function refresh(): Promise<void> {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });
  return handleJsonResponse<void>(res);
}

export async function logout(): Promise<void> {
  const res = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  return handleJsonResponse<void>(res);
}

export async function getMyProfile(): Promise<UserDTO> {
  return getJson<UserDTO>('/auth/me');
}

export async function verifyEmail(
  identifier: string,
  code: string,
): Promise<{ message: string }> {
  validateOrThrow(verifyEmailSchema, { identifier, code });
  return postJson<{ message: string }>('/auth/verify-email', { identifier, code });
}

export async function resendVerification(
  email: string,
): Promise<{ message: string }> {
  return postJson<{ message: string }>('/auth/resend-verification', { email });
}

export async function forgotPassword(
  email: string,
): Promise<{ message: string; expiresAt: string }> {
  return postJson<{ message: string; expiresAt: string }>(
    '/auth/forgot-password',
    { email },
  );
}

export async function resetPassword(
  email: string,
  code: string,
  newPassword: string,
): Promise<{ message: string }> {
  return postJson<{ message: string }>('/auth/reset-password', {
    email,
    code,
    newPassword,
  });
}
