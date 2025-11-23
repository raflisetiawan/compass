import { create } from "zustand";
import { Timestamp } from "firebase/firestore";
import questionnaireData from "@/assets/questionnaire.json";
import {
  loadLatestQuestionnaireSession,
  createNewQuestionnaireSession,
  updateQuestionnaireSession,
  type QuestionnaireSession,
} from "@/services/firebase";
import { useUserStore } from "./userStore";
import { debounce } from "@/lib/utils";

// --- Type Definitions ---

export interface Question {
  id: string;
  text: string;
  type: "radio" | "select" | "number";
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
  patientId: string | null; // For clinican to manage patient sessions
  sessionId: string | null; // ID of the active session document in Firestore
};

const initialState: State = {
  sections: (questionnaireData as QuestionnaireData).questionnaire,
  answers: {},
  errors: {},
  currentSectionIndex: 0,
  currentQuestionIndex: 0,
  isLoading: true,
  patientId: null,
  sessionId: null,
};

type Actions = {
  setAnswer: (questionId: string, value: string | number) => void;
  setErrors: (errors: Errors) => void;
  setCurrentSectionIndex: (index: number) => void;
  goToSection: (index: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  loadInitialData: () => Promise<void>;
  setPatientId: (patientId: string) => void;
  saveFinalAnswers: () => Promise<void>;
  reset: () => void;
};

// --- Helper to get active user access code ---

const getActiveAccessCode = (): string | null => {
  const patientId = useQuestionnaireStore.getState().patientId;
  if (patientId) {
    return patientId;
  }
  return useUserStore.getState().user?.accessCode || null;
};

// --- Debounced Save Function ---

const debouncedUpdateSession = debounce(
  (
    accessCode: string,
    sessionId: string,
    session: Partial<QuestionnaireSession>
  ) => {
    if (!accessCode || !sessionId) return;
    updateQuestionnaireSession(accessCode, sessionId, session);
  },
  1500
);

export const useQuestionnaireStore = create<State & Actions>((set, get) => ({
  ...initialState,

  // Actions
  setAnswer: (questionId, value) => {
    const { answers, errors, sessionId } = get();
    const newAnswers = { ...answers, [questionId]: value };

    const newErrors = { ...errors };
    if (newErrors[questionId]) {
      delete newErrors[questionId];
    }

    set({ answers: newAnswers, errors: newErrors });

    const accessCode = getActiveAccessCode();
    if (accessCode && sessionId) {
      const { answers, currentSectionIndex, currentQuestionIndex } = get();
      debouncedUpdateSession(accessCode, sessionId, {
        answers,
        currentSectionIndex,
        currentQuestionIndex,
        updatedAt: Timestamp.now(),
      });
    }
  },

  setErrors: (errors) => set({ errors }),

  setCurrentSectionIndex: (index) =>
    set({ currentSectionIndex: index, currentQuestionIndex: 0 }),

  goToSection: (index) =>
    set({ currentSectionIndex: index, currentQuestionIndex: 0 }),

  nextQuestion: () => {
    const { sections, currentSectionIndex, currentQuestionIndex } = get();
    const currentSection = sections[currentSectionIndex];
    const isLastQuestion =
      currentQuestionIndex === currentSection.questions.length - 1;
    const isLastSection = currentSectionIndex === sections.length - 1;

    if (isLastQuestion && !isLastSection) {
      set({
        currentSectionIndex: currentSectionIndex + 1,
        currentQuestionIndex: 0,
      });
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
    const accessCode = getActiveAccessCode();

    if (!accessCode) {
      set({ ...initialState, isLoading: false });
      return;
    }

    const latestSession = await loadLatestQuestionnaireSession(accessCode);

    const startNewSession = async () => {
      const now = Timestamp.now();
      const newSessionData = {
        answers: {},
        currentSectionIndex: 0,
        currentQuestionIndex: 0,
        createdAt: now,
        updatedAt: now,
        userAgent: navigator.userAgent,
      };
      const newSessionId = await createNewQuestionnaireSession(
        accessCode,
        newSessionData
      );
      const currentPatientId = get().patientId;
      set({
        ...initialState,
        patientId: currentPatientId,
        sessionId: newSessionId,
        isLoading: false,
      });
    };

    if (latestSession && latestSession.updatedAt) {
      const now = new Date();
      const updatedAt = (latestSession.updatedAt as Timestamp).toDate();
      const hoursDiff = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60);

      if (hoursDiff < 24) {
        // Continue existing session
        set({
          answers: latestSession.answers || {},
          currentSectionIndex: latestSession.currentSectionIndex || 0,
          currentQuestionIndex: latestSession.currentQuestionIndex || 0,
          sessionId: latestSession.id,
          isLoading: false,
        });
      } else {
        // Session expired, start a new one
        await startNewSession();
      }
    } else {
      // No previous session found, start a new one
      await startNewSession();
    }
  },

  setPatientId: (patientId) => {
    set({ ...initialState, patientId, sessionId: null });
    get().loadInitialData();
  },

  saveFinalAnswers: async () => {
    const accessCode = getActiveAccessCode();
    const { sessionId, answers, currentSectionIndex, currentQuestionIndex } =
      get();

    if (accessCode && sessionId) {
      await updateQuestionnaireSession(accessCode, sessionId, {
        answers,
        currentSectionIndex,
        currentQuestionIndex,
        updatedAt: Timestamp.now(),
        completedAt: Timestamp.now(),
      });
    }
  },

  reset: () => set({ ...initialState }),
}));