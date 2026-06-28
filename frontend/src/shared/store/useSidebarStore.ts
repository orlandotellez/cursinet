'use client';

import { create } from 'zustand';

interface SideBarState {
  collapsed: boolean;
  setCollapsed: () => void;
}

export const useSidebarStore = create<SideBarState>((set) => ({
  collapsed: false,
  setCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),
}));
