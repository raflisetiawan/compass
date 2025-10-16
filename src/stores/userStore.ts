
import { create } from 'zustand';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import { auth, getUserDocByAccessCode } from '@/services/firebase';
import { useQuestionnaireStore } from './questionnaireStore';
import { type User } from '@/types';

type State = {
  user: User | null;
  isLoading: boolean;
};

type Actions = {
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
};

const useUserStore = create<State & Actions>((set) => {
  onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      const accessCode = localStorage.getItem('compassAccessCode');
      if (accessCode) {
        const userDoc = await getUserDocByAccessCode(accessCode);
        if (userDoc) {
          const user: User = {
            uid: firebaseUser.uid,
            role: userDoc.role || 'patient',
            accessCode: accessCode,
          };
          set({ user, isLoading: false });
        } else {
          // Access code in local storage is invalid
          set({ user: null, isLoading: false });
        }
      } else {
        // No access code found, cannot restore session
        set({ user: null, isLoading: false });
      }
    } else {
      // No firebase user, clear session
      set({ user: null, isLoading: false });
    }
  });

  return {
    user: null,
    isLoading: true,
    setUser: (user) => set({ user }),
    logout: async () => {
      try {
        await signOut(auth);
      } catch (error) {
        console.error('Error signing out from Firebase', error);
      }
      localStorage.removeItem('userToken');
      localStorage.removeItem('sessionStartTime');
      localStorage.removeItem('compassAccessCode');
      set({ user: null });
      useQuestionnaireStore.getState().reset();
    },
  };
});

export { useUserStore };
