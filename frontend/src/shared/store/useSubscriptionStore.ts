'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as subscriptionsApi from '../api/billing';
import { useToastStore } from './useToastStore';
import type { SubscriptionPlan } from '../types';

interface SubscriptionState {
  subscription: {
    plan: string;
    status: string;
    currentPeriodStart?: string;
    currentPeriodEnd?: string;
    cancelAtPeriodEnd?: boolean;
  } | null;
  loading: boolean;
  error: string | null;

  fetchSubscription: () => Promise<void>;
  setFreePlan: () => void;
  upgradeToPro: () => void;
  cancelMySubscription: () => Promise<void>;
  reactivateMySubscription: () => Promise<void>;
  isOnPlan: (plan: SubscriptionPlan) => boolean;
}

function mapSubscription(data: { plan: string; status: string; currentPeriodStart?: string | null; currentPeriodEnd?: string | null; cancelAtPeriodEnd?: boolean }): SubscriptionState['subscription'] {
  return {
    plan: data.plan,
    status: data.status,
    currentPeriodStart: data.currentPeriodStart ?? undefined,
    currentPeriodEnd: data.currentPeriodEnd ?? undefined,
    cancelAtPeriodEnd: data.cancelAtPeriodEnd,
  };
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      subscription: null,
      loading: false,
      error: null,

      fetchSubscription: async () => {
        set({ loading: true, error: null });
        try {
          const data = await subscriptionsApi.getMySubscription();
          set({ subscription: mapSubscription(data), loading: false });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Error al cargar suscripción';
          set({ loading: false, error: message });
          useToastStore.getState().error(message);
        }
      },

      setFreePlan: () => {
        set({
          subscription: { plan: 'free', status: 'active' },
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

      cancelMySubscription: async () => {
        set({ error: null });
        try {
          const data = await subscriptionsApi.cancelSubscription();
          set({ subscription: mapSubscription(data) });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Error al cancelar suscripción';
          set({ error: message });
          useToastStore.getState().error(message);
          throw err;
        }
      },

      reactivateMySubscription: async () => {
        set({ error: null });
        try {
          const data = await subscriptionsApi.reactivateSubscription();
          set({ subscription: mapSubscription(data) });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Error al reactivar suscripción';
          set({ error: message });
          useToastStore.getState().error(message);
          throw err;
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
