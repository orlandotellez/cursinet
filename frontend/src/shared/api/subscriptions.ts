import { API_URL } from '../lib/constants';
import { authedFetch } from '../lib/api';
import { handleJsonResponse } from './helpers';

export interface SubscriptionDTO {
  plan: string;
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export async function getMySubscription(): Promise<SubscriptionDTO> {
  const res = await authedFetch(`${API_URL}/subscriptions/mine`);
  return handleJsonResponse<SubscriptionDTO>(res);
}

export async function cancelSubscription(): Promise<SubscriptionDTO> {
  const res = await authedFetch(`${API_URL}/subscriptions/cancel`, {
    method: 'POST',
  });
  return handleJsonResponse<SubscriptionDTO>(res);
}

export async function reactivateSubscription(): Promise<SubscriptionDTO> {
  const res = await authedFetch(`${API_URL}/subscriptions/reactivate`, {
    method: 'POST',
  });
  return handleJsonResponse<SubscriptionDTO>(res);
}
