import { api } from '../lib/client';
import type { UserDTO, UserRoleDTO, CreateUserPayload, UpdateUserPayload } from '../types';

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
  return api.get<UserDTO[]>(`/users${q ? `?${q}` : ''}`);
}

export async function getUserById(id: string): Promise<UserDTO> {
  return api.get<UserDTO>(`/users/${id}`);
}

export async function createUser(payload: CreateUserPayload): Promise<UserDTO> {
  return api.post<UserDTO>('/users', payload);
}

export async function updateUser(
  id: string,
  payload: UpdateUserPayload,
): Promise<UserDTO> {
  return api.put<UserDTO>(`/users/${id}`, payload);
}

export async function deleteUser(id: string): Promise<void> {
  return api.delete<void>(`/users/${id}`);
}

export async function restoreUser(id: string): Promise<UserDTO> {
  return api.post<UserDTO>(`/users/${id}/restore`);
}
