import { create } from "zustand";
import { Timestamp } from "firebase/firestore";
import questionnaireData from "@/assets/questionnaire.json";
import {
  loadLatestQuestionnaireSession,
  createNewQuestionnaireSession,
  updateQuestionnaireSession,
  updateUserLastLogin,
  type QuestionnaireSession,
} from "@/services/firebase";
import { useUserStore } from "./userStore";
import { debounce } from "@/lib/utils";
import type {
  Section,
  Answers,
  Errors,
  QuestionnaireData,
} from "@/types/questionnaire";
import { calculateOutcomes } from "@/services/outcomes";

// --- Constants ---

const DEBOUNCE_DELAY = 1500;
const SESSION_EXPIRY_HOURS = 24;

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

// --- Helpers ---

const getActiveAccessCode = (): string | null => {
  const patientId = useQuestionnaireStore.getState().patientId;
  if (patientId) {
    return patientId;
  }
  return useUserStore.getState().user?.accessCode || null;
};

const shouldStartNewSession = (latestSession: QuestionnaireSession | null): boolean => {
  if (!latestSession || !latestSession.createdAt) return true;

  const now = new Date();
  const createdAt = (latestSession.createdAt as Timestamp).toDate();
  const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

  return hoursDiff >= SESSION_EXPIRY_HOURS;
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
  DEBOUNCE_DELAY
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

    // Update last login
    updateUserLastLogin(accessCode);

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

    if (shouldStartNewSession(latestSession)) {
      await startNewSession();
    } else if (latestSession) {
      // Continue existing session
      set({
        answers: latestSession.answers || {},
        currentSectionIndex: latestSession.currentSectionIndex || 0,
        currentQuestionIndex: latestSession.currentQuestionIndex || 0,
        sessionId: latestSession.id,
        isLoading: false,
      });
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
      const clinicalOutcomes = calculateOutcomes(answers);
      await updateQuestionnaireSession(accessCode, sessionId, {
        answers,
        currentSectionIndex,
        currentQuestionIndex,
        updatedAt: Timestamp.now(),
        completedAt: Timestamp.now(),
        clinicalOutcomes,
      });
    }
  },

  reset: () => set({ ...initialState }),
}));