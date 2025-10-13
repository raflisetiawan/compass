
import { create } from 'zustand';
import { signOut } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { useQuestionnaireStore } from './questionnaireStore';

export type User = {
  uid: string;
  role: 'staff' | 'patient';
  accessCode: string;
};

type State = {
  user: User | null;
};

type Actions = {
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
};

export const useUserStore = create<State & Actions>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out from Firebase', error);
    }
    localStorage.removeItem('userToken');
    localStorage.removeItem('sessionStartTime');
    useQuestionnaireStore.getState().reset();
    set({ user: null });
  },
}));
