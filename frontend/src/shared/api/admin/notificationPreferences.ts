import { api } from '../lib/client';
import type { NotificationPreferenceDTO, UpdateNotificationPreferencePayload } from '../types';

export async function getNotificationPreferences(): Promise<NotificationPreferenceDTO> {
  return api.get<NotificationPreferenceDTO>('/notification-preferences');
}

export async function saveNotificationPreferences(
  payload: UpdateNotificationPreferencePayload,
): Promise<NotificationPreferenceDTO> {
  return api.put<NotificationPreferenceDTO>('/notification-preferences', payload);
}
