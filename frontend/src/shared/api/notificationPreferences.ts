import { API_URL } from '../lib/constants';
import { authedFetch } from '../lib/api';
import { handleJsonResponse } from './helpers';

export interface NotificationPreferenceDTO {
  id: string;
  courseUpdates: boolean;
  newContent: boolean;
  comments: boolean;
  marketing: boolean;
  updatedAt: string;
}

export interface UpdateNotificationPreferencePayload {
  courseUpdates?: boolean;
  newContent?: boolean;
  comments?: boolean;
  marketing?: boolean;
}

export async function getNotificationPreferences(): Promise<NotificationPreferenceDTO> {
  const res = await authedFetch(`${API_URL}/notification-preferences`);
  return handleJsonResponse<NotificationPreferenceDTO>(res);
}

export async function saveNotificationPreferences(
  payload: UpdateNotificationPreferencePayload,
): Promise<NotificationPreferenceDTO> {
  const res = await authedFetch(`${API_URL}/notification-preferences`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleJsonResponse<NotificationPreferenceDTO>(res);
}
