import { api } from '../lib/client';
import { validateOrThrow } from '@/src/shared/lib/validation';
import {
  loginSchema,
  registerSchema,
  verifyEmailSchema,
} from '@/src/shared/validations';
import type { AuthResponse, LoginPayload, RegisterPayload } from '@/src/shared/types';
import type { UserDTO } from '../types';

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  validateOrThrow(loginSchema, payload);
  return api.post<AuthResponse>('/auth/login', payload);
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  validateOrThrow(registerSchema, { ...payload, confirmPassword: payload.password });
  return api.post<AuthResponse>('/auth/register', payload);
}

export async function logout(): Promise<void> {
  return api.post<void>('/auth/logout');
}

export async function getMyProfile(): Promise<UserDTO> {
  return api.get<UserDTO>('/auth/me');
}

export async function verifyEmail(
  identifier: string,
  code: string,
): Promise<{ message: string }> {
  validateOrThrow(verifyEmailSchema, { identifier, code });
  return api.post<{ message: string }>('/auth/verify-email', { identifier, code });
}

export async function resendVerification(
  email: string,
): Promise<{ message: string }> {
  return api.post<{ message: string }>('/auth/resend-verification', { email });
}

export async function forgotPassword(
  email: string,
): Promise<{ message: string; expiresAt: string }> {
  return api.post<{ message: string; expiresAt: string }>(
    '/auth/forgot-password',
    { email },
  );
}

export async function resetPassword(
  email: string,
  code: string,
  newPassword: string,
): Promise<{ message: string }> {
  return api.post<{ message: string }>('/auth/reset-password', {
    email,
    code,
    newPassword,
  });
}
