'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Subscription, SubscriptionPlan } from '../types';

interface SubscriptionState {
  subscription: Subscription | null;

  setFreePlan: () => void;
  upgradeToPro: () => void;
  cancelSubscription: () => void;
  isOnPlan: (plan: SubscriptionPlan) => boolean;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      subscription: null,

      setFreePlan: () => {
        set({
          subscription: {
            plan: 'free',
            status: 'active',
          },
        });
      },

      upgradeToPro: () => {
        set({
          subscription: {
            plan: 'pro',
            status: 'active',
            currentPeriodStart: new Date().toISOString(),
            currentPeriodEnd: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000,
            ).toISOString(),
          },
        });
      },

      cancelSubscription: () => {
        const current = get().subscription;
        if (current) {
          set({
            subscription: { ...current, status: 'cancelled' },
          });
        }
      },

      isOnPlan: (plan) => {
        return get().subscription?.plan === plan;
      },
    }),
    {
      name: 'cursinet-subscription',
      partialize: (state) => ({
        subscription: state.subscription,
      }),
    },
  ),
);
