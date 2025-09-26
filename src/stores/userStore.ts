
import { create } from 'zustand';

interface UserState {
  user: any;
  setUser: (user: any) => void;
  clearUser: () => void;
}

export const useStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
