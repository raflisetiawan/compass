
import { create } from 'zustand';
import { type User } from 'firebase/auth';

type State = {
  user: User | null;
};

type Actions = {
  setUser: (user: User | null) => void;
  clearUser: () => void;
};

export const useUserStore = create<State & Actions>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => {
    localStorage.removeItem('userToken');
    set({ user: null });
  },
}));
