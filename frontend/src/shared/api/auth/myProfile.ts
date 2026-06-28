import { api } from '../lib/client';
import type { UserDTO, UpdateMyProfilePayload, ChangePasswordPayload } from '../types';

export async function updateMyProfile(payload: UpdateMyProfilePayload): Promise<UserDTO> {
  return api.put<UserDTO>('/auth/me', payload);
}

export async function changePassword(payload: ChangePasswordPayload): Promise<{ message: string; user: UserDTO }> {
  return api.post<{ message: string; user: UserDTO }>('/auth/change-password', payload);
}
