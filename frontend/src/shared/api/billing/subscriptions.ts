import { api } from '../lib/client';
import type { SubscriptionDTO } from '../types';

export async function getMySubscription(): Promise<SubscriptionDTO> {
  return api.get<SubscriptionDTO>('/subscriptions/mine');
}

export async function cancelSubscription(): Promise<SubscriptionDTO> {
  return api.post<SubscriptionDTO>('/subscriptions/cancel');
}

export async function reactivateSubscription(): Promise<SubscriptionDTO> {
  return api.post<SubscriptionDTO>('/subscriptions/reactivate');
}
