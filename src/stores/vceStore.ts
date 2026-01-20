import { create } from 'zustand';
import { Timestamp } from 'firebase/firestore';
import { updateQuestionnaireSession } from '@/services/firebase';
import { useQuestionnaireStore } from './questionnaireStore';
import { useUserStore } from './userStore';

type ImportanceLevel = 'less' | 'somewhat' | 'very' | null;

type SideEffectsImportance = {
  urinaryLeakage: ImportanceLevel;
  urinaryFrequency: ImportanceLevel;
  bowelMovements: ImportanceLevel;
  reducedEnergy: ImportanceLevel;
  erectileProblems: ImportanceLevel;
};

type LogisticsImportance = {
  dailyHospitalTravel: ImportanceLevel;
  distantHospitalTravel: ImportanceLevel;
  timeAwayFromActivities: ImportanceLevel;
};

type TreatmentPhilosophy = 'active' | 'monitoring' | null;

export interface VceAnswers {
  treatmentPhilosophy: TreatmentPhilosophy;
  sideEffectsImportance: SideEffectsImportance;
  logisticsImportance: LogisticsImportance;
}

type State = {
  treatmentPhilosophy: TreatmentPhilosophy;
  sideEffectsImportance: SideEffectsImportance;
  logisticsImportance: LogisticsImportance;
  isSaving: boolean;
};

type Actions = {
  setTreatmentPhilosophy: (value: TreatmentPhilosophy) => void;
  setSideEffectImportance: (key: keyof SideEffectsImportance, value: ImportanceLevel) => void;
  setLogisticsImportance: (key: keyof LogisticsImportance, value: ImportanceLevel) => void;
  saveVceAnswers: () => Promise<void>;
  reset: () => void;
};

const initialState: State = {
  treatmentPhilosophy: null,
  sideEffectsImportance: {
    urinaryLeakage: null,
    urinaryFrequency: null,
    bowelMovements: null,
    reducedEnergy: null,
    erectileProblems: null,
  },
  logisticsImportance: {
    dailyHospitalTravel: null,
    distantHospitalTravel: null,
    timeAwayFromActivities: null,
  },
  isSaving: false,
};

// Helper to get the active access code
const getActiveAccessCode = (): string | null => {
  const patientId = useQuestionnaireStore.getState().patientId;
  if (patientId) {
    return patientId;
  }
  return useUserStore.getState().user?.accessCode || null;
};

const useVceStore = create<State & Actions>((set, get) => ({
  ...initialState,

  setTreatmentPhilosophy: (value) => set({ treatmentPhilosophy: value }),

  setSideEffectImportance: (key, value) =>
    set((state) => ({
      sideEffectsImportance: {
        ...state.sideEffectsImportance,
        [key]: value,
      },
    })),

  setLogisticsImportance: (key, value) =>
    set((state) => ({
      logisticsImportance: {
        ...state.logisticsImportance,
        [key]: value,
      },
    })),

  saveVceAnswers: async () => {
    const accessCode = getActiveAccessCode();
    let sessionId = useQuestionnaireStore.getState().sessionId;

    if (!accessCode) {
      console.error('Cannot save VCE answers: missing accessCode');
      return;
    }

    set({ isSaving: true });

    try {
      // If no session exists, trigger session creation via questionnaire store
      if (!sessionId) {
        console.log('No session found, creating new session for VCE answers...');
        await useQuestionnaireStore.getState().loadInitialData();
        sessionId = useQuestionnaireStore.getState().sessionId;
        
        if (!sessionId) {
          console.error('Failed to create session for VCE answers');
          return;
        }
      }

      const { treatmentPhilosophy, sideEffectsImportance, logisticsImportance } = get();

      const vceAnswers: VceAnswers = {
        treatmentPhilosophy,
        sideEffectsImportance,
        logisticsImportance,
      };

      await updateQuestionnaireSession(accessCode, sessionId, {
        vceAnswers,
        updatedAt: Timestamp.now(),
      });

      console.log('VCE answers saved successfully');
    } catch (error) {
      console.error('Error saving VCE answers:', error);
    } finally {
      set({ isSaving: false });
    }
  },

  reset: () => set(initialState),
}));

export { useVceStore };
export type { ImportanceLevel, SideEffectsImportance, LogisticsImportance, TreatmentPhilosophy };
