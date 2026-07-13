'use client';

import { create } from 'zustand';

interface SideBarState {
  collapsed: boolean;
  mobileOpen: boolean;
  setCollapsed: () => void;
  toggleMobile: () => void;
  closeMobile: () => void;
}

export const useSidebarStore = create<SideBarState>((set) => ({
  collapsed: false,
  mobileOpen: false,
  setCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),
  toggleMobile: () => set((state) => ({ mobileOpen: !state.mobileOpen })),
  closeMobile: () => set({ mobileOpen: false }),
}));
