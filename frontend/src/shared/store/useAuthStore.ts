'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as authApi from '../api/auth';
import { LoginPayload, RegisterPayload, User, UserRole } from '../types';
import { DEMO_USERS } from '../lib/mockData';
import { clearAllStorage } from '../lib/authUtils';
import { useToastStore } from './useToastStore';

function normalizeRole(role: string): UserRole {
  return role.toLowerCase() as UserRole;
}

function normalizeUser(user: User): User {
  return { ...user, role: normalizeRole(user.role) };
}

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
  setUser: (user: User) => void;
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
            user: normalizeUser(data.user),
            isAuthenticated: true,
            isLoading: false,
            isDemoMode: false,
            error: null,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
          set({ isLoading: false, error: message });
          useToastStore.getState().error(message);
          throw err;
        }
      },

      register: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authApi.register(payload);
          set({
            user: normalizeUser(data.user),
            isAuthenticated: true,
            isLoading: false,
            isDemoMode: false,
            error: null,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Error al registrarse';
          set({ isLoading: false, error: message });
          useToastStore.getState().error(message);
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
        // Intentar logout en backend (limpia httpOnly cookies)
        try {
          await authApi.logout();
        } catch {
          // Si falla el backend, igual limpiamos todo local
        }

        // Reset estado
        set({ user: null, isAuthenticated: false, isDemoMode: false, error: null });

        // Nuke total — localStorage, sessionStorage, cookies
        if (typeof window !== 'undefined') {
          clearAllStorage();
        }
      },

      setUser: (user) => set({ user }),

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
