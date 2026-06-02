'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as authApi from '../api/auth';
import { LoginPayload, RegisterPayload, User, UserRole } from '../types';
import { DEMO_USERS } from '../lib/mockData';

// Store
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isDemoMode: boolean;

  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  demoLogin: (role: UserRole) => void;
  logout: () => Promise<void>;
  clearError: () => void;
  tryDemoCredentials: (email: string, password: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isDemoMode: false,

      login: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authApi.login(payload);
          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            isDemoMode: false,
            error: null,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      register: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authApi.register(payload);
          set({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            isDemoMode: false,
            error: null,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Error al registrarse';
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      demoLogin: (role) => {
        const demoUser = DEMO_USERS[role];
        if (!demoUser) return;

        const { password: _p, ...user } = demoUser;
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          isDemoMode: true,
        });
      },

      tryDemoCredentials: (email, password) => {
        const match = Object.values(DEMO_USERS).find(
          (u) => u.email === email && u.password === password,
        );
        if (match) {
          get().demoLogin(match.role);
          return true;
        }
        return false;
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // Si falla el backend igual limpiamos estado local
        }
        set({ user: null, isAuthenticated: false, isDemoMode: false, error: null });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'cursinet-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isDemoMode: state.isDemoMode,
      }),
    },
  ),
);
