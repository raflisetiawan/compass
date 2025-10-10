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

// --- Debounced Save Function ---
const debouncedSaveSession = debounce((userId: string, session: QuestionnaireSession) => {
  saveQuestionnaireSession(userId, session);
}, 1500);

// --- Store Definition ---
type State = {
  sections: Section[];
  answers: Answers;
  errors: Errors;
  currentSectionIndex: number;
  currentQuestionIndex: number;
  isLoading: boolean;
};

const initialState: State = {
  sections: (questionnaireData as QuestionnaireData).questionnaire,
  answers: {},
  errors: {},
  currentSectionIndex: 0,
  currentQuestionIndex: 0,
  isLoading: true,
};

type Actions = {
  setAnswer: (questionId: string, value: string | number) => void;
  setErrors: (errors: Errors) => void;
  setCurrentSectionIndex: (index: number) => void;
  goToSection: (index: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  loadInitialData: () => Promise<void>;
  reset: () => void;
};

export const useQuestionnaireStore = create<State & Actions>((set, get) => ({
  ...initialState,

  // Actions
  setAnswer: (questionId, value) => {
    const { answers, errors } = get();
    const newAnswers = { ...answers, [questionId]: value };

    // Clear error for this question when user provides an answer
    const newErrors = { ...errors };
    if (newErrors[questionId]) {
      delete newErrors[questionId];
    }

    set({ answers: newAnswers, errors: newErrors });

    const userId = useUserStore.getState().user?.uid;
    if (userId) {
      const { answers, currentSectionIndex, currentQuestionIndex } = get();
      debouncedSaveSession(userId, {
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
    const userId = useUserStore.getState().user?.uid;
    if (userId) {
      const savedSession = await loadQuestionnaireSession(userId);
      if (savedSession) {
        set({
          answers: savedSession.answers || {},
          currentSectionIndex: savedSession.currentSectionIndex || 0,
          currentQuestionIndex: savedSession.currentQuestionIndex || 0,
        });
      }
    }
    set({ isLoading: false });
  },

  reset: () => set(initialState),
}));