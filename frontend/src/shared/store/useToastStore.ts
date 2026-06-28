'use client';

import { create } from 'zustand';
import type { ToastType } from '../components/Toast';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

let nextId = 0;

interface ToastState {
  toasts: ToastItem[];
  toast: (type: ToastType, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],

  toast: (type, message) => {
    const id = String(++nextId);
    set((state) => ({ toasts: [...state.toasts, { id, type, message }] }));
  },

  success: (message) => {
    useToastStore.getState().toast('success', message);
  },

  error: (message) => {
    useToastStore.getState().toast('error', message);
  },

  warning: (message) => {
    useToastStore.getState().toast('warning', message);
  },

  dismiss: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));
