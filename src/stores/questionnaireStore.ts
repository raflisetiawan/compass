
import { create } from 'zustand';
import questionnaireData from '@/assets/questionnaire.json';
import {
  saveQuestionnaireSession,
  loadQuestionnaireSession,
  type QuestionnaireSession,
} from '@/services/firebase';
import { useUserStore } from './userStore';
import { debounce } from '@/lib/utils';

// --- Type Definitions ---
export interface Question {
  id: string;
  text: string;
  type: 'radio' | 'select' | 'number';
  options?: (string | { label: string; value: string | number })[];
  placeholder?: string;
  unit?: string;
  validation?: { min?: number; max?: number; required?: boolean };
  required?: boolean;
}

export interface Section {
  section: string;
  questions: Question[];
}

interface QuestionnaireData {
  questionnaire: Section[];
}

export type Answers = {
  [questionId: string]: string | number;
};

export type Errors = {
  [questionId: string]: string | undefined;
};

// --- Store Definition ---
type State = {
  sections: Section[];
  answers: Answers;
  errors: Errors;
  currentSectionIndex: number;
  currentQuestionIndex: number;
  isLoading: boolean;
  patientId: string | null; // For staff to manage patient sessions
};

const initialState: State = {
  sections: (questionnaireData as QuestionnaireData).questionnaire,
  answers: {},
  errors: {},
  currentSectionIndex: 0,
  currentQuestionIndex: 0,
  isLoading: true,
  patientId: null,
};

type Actions = {
  setAnswer: (questionId: string, value: string | number) => void;
  setErrors: (errors: Errors) => void;
  setCurrentSectionIndex: (index: number) => void;
  goToSection: (index: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  loadInitialData: () => Promise<void>;
  setPatientId: (patientId: string) => void; // New action
  saveFinalAnswers: () => Promise<void>;
  reset: () => void;
};

// --- Helper to get active session key (patient's access code or self) ---
const getActiveSessionKey = (state: State & Actions): string | null => {
  if (state.patientId) {
    return state.patientId;
  }
  return useUserStore.getState().user?.accessCode || null;
};

// --- Debounced Save Function ---
const debouncedSaveSession = debounce((sessionKey: string, session: Partial<QuestionnaireSession>) => {
  saveQuestionnaireSession(sessionKey, session);
}, 1500);

export const useQuestionnaireStore = create<State & Actions>((set, get) => ({
  ...initialState,

  // Actions
  setAnswer: (questionId, value) => {
    const { answers, errors } = get();
    const newAnswers = { ...answers, [questionId]: value };

    const newErrors = { ...errors };
    if (newErrors[questionId]) {
      delete newErrors[questionId];
    }

    set({ answers: newAnswers, errors: newErrors });

    const activeSessionKey = getActiveSessionKey(get());
    if (activeSessionKey) {
      const { answers, currentSectionIndex, currentQuestionIndex } = get();
      debouncedSaveSession(activeSessionKey, {
        answers,
        currentSectionIndex,
        currentQuestionIndex,
      });
    }
  },

  setErrors: (errors) => set({ errors }),

  setCurrentSectionIndex: (index) => set({ currentSectionIndex: index, currentQuestionIndex: 0 }),

  goToSection: (index) => set({ currentSectionIndex: index, currentQuestionIndex: 0 }),

  nextQuestion: () => {
    const { sections, currentSectionIndex, currentQuestionIndex } = get();
    const currentSection = sections[currentSectionIndex];
    const isLastQuestion = currentQuestionIndex === currentSection.questions.length - 1;
    const isLastSection = currentSectionIndex === sections.length - 1;

    if (isLastQuestion && !isLastSection) {
      set({ currentSectionIndex: currentSectionIndex + 1, currentQuestionIndex: 0 });
    } else if (!isLastQuestion) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    }
  },

  prevQuestion: () => {
    const { sections, currentSectionIndex, currentQuestionIndex } = get();
    const isFirstQuestion = currentQuestionIndex === 0;
    const isFirstSection = currentSectionIndex === 0;

    if (isFirstQuestion && !isFirstSection) {
      const prevSection = sections[currentSectionIndex - 1];
      set({
        currentSectionIndex: currentSectionIndex - 1,
        currentQuestionIndex: prevSection.questions.length - 1,
      });
    } else if (!isFirstQuestion) {
      set({ currentQuestionIndex: currentQuestionIndex - 1 });
    }
  },

  loadInitialData: async () => {
    set({ isLoading: true });
    const activeSessionKey = getActiveSessionKey(get());
    if (activeSessionKey) {
      const savedSession = await loadQuestionnaireSession(activeSessionKey);
      if (savedSession) {
        set({
          answers: savedSession.answers || {},
          currentSectionIndex: savedSession.currentSectionIndex || 0,
          currentQuestionIndex: savedSession.currentQuestionIndex || 0,
        });
      }
    } else {
      // If no user, reset to initial state but stop loading
      set({ ...initialState, isLoading: false });
    }
    set({ isLoading: false });
  },

  setPatientId: (patientId) => set({ patientId, answers: {}, currentSectionIndex: 0, currentQuestionIndex: 0 }),

  saveFinalAnswers: async () => {
    const activeSessionKey = getActiveSessionKey(get());
    if (activeSessionKey) {
      const { answers, currentSectionIndex, currentQuestionIndex } = get();
       await saveQuestionnaireSession(activeSessionKey, {
        answers,
        currentSectionIndex,
        currentQuestionIndex,
      });
    }
  },

  reset: () => set({ ...initialState, answers: {}, patientId: null }),
}));