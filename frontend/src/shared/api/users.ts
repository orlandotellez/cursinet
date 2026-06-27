import { API_URL } from '../lib/constants';
import { authedFetch } from '../lib/api';
import { handleJsonResponse, assertOk } from './helpers';

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  phone: string | null;
  image: string | null;
  role: string; // "Admin" | "Instructor" | "Student" | "Moderator"
  userName: string | null;
  bio: string | null;
  websiteUrl: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  isActive: boolean;
  lastSeenAt: string | null;
  createdAt: string;
  deletedAt: string | null;
  deletedByUserId: string | null;
  deletedByName: string | null;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: string;
  phone?: string | null;
  bio?: string | null;
  userName?: string | null;
  websiteUrl?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  isActive?: boolean;
}

export async function getUsers(params?: {
  search?: string;
  role?: string;
  isActive?: boolean;
  includeDeleted?: boolean;
}): Promise<UserDTO[]> {
  const qs = new URLSearchParams();
  if (params?.search) qs.set('search', params.search);
  if (params?.role) qs.set('role', params.role);
  if (params?.isActive !== undefined) qs.set('isActive', String(params.isActive));
  if (params?.includeDeleted) qs.set('includeDeleted', 'true');

  const q = qs.toString();
  const res = await authedFetch(`${API_URL}/users${q ? `?${q}` : ''}`, {
    credentials: 'include',
  });
  return handleJsonResponse<UserDTO[]>(res);
}

export async function getUserById(id: string): Promise<UserDTO> {
  const res = await authedFetch(`${API_URL}/users/${id}`, {
    credentials: 'include',
  });
  return handleJsonResponse<UserDTO>(res);
}

export async function createUser(payload: CreateUserPayload): Promise<UserDTO> {
  const res = await authedFetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return handleJsonResponse<UserDTO>(res);
}

export async function updateUser(
  id: string,
  payload: UpdateUserPayload,
): Promise<UserDTO> {
  const res = await authedFetch(`${API_URL}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return handleJsonResponse<UserDTO>(res);
}

export async function deleteUser(id: string): Promise<void> {
  const res = await authedFetch(`${API_URL}/users/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return assertOk(res, 'Error al eliminar el usuario');
}

export async function restoreUser(id: string): Promise<UserDTO> {
  const res = await authedFetch(`${API_URL}/users/${id}/restore`, {
    method: 'POST',
    credentials: 'include',
  });
  return handleJsonResponse<UserDTO>(res);
}
