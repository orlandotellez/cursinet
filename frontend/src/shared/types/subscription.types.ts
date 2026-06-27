export type SubscriptionPlan = 'free' | 'pro';
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due';

export interface Subscription {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
}
