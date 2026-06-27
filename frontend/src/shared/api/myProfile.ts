import { API_URL } from '../lib/constants';
import { authedFetch } from '../lib/api';
import { handleJsonResponse } from './helpers';
import type { UserDTO } from './users';

export interface UpdateMyProfilePayload {
  name?: string;
  bio?: string | null;
  phone?: string | null;
  userName?: string | null;
  websiteUrl?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  image?: string | null;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export async function updateMyProfile(payload: UpdateMyProfilePayload): Promise<UserDTO> {
  const res = await authedFetch(`${API_URL}/auth/me`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleJsonResponse<UserDTO>(res);
}

export async function changePassword(payload: ChangePasswordPayload): Promise<{ message: string; user: UserDTO }> {
  const res = await authedFetch(`${API_URL}/auth/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleJsonResponse<{ message: string; user: UserDTO }>(res);
}
