import { describe, it, expect, vi, beforeEach } from "vitest";
import { Timestamp } from "firebase/firestore";
import { useQuestionnaireStore, OPTIONAL_SECTIONS } from "../questionnaireStore";

// --- Mock Firebase ---
const mockUpdateQuestionnaireSession = vi.fn();
const mockCreateNewQuestionnaireSession = vi.fn().mockResolvedValue("new-session-id");
const mockLoadLatestQuestionnaireSession = vi.fn().mockResolvedValue(null);
const mockUpdateUserLastLogin = vi.fn();

vi.mock("@/services/firebase", () => ({
  updateQuestionnaireSession: (...args: unknown[]) => mockUpdateQuestionnaireSession(...args),
  createNewQuestionnaireSession: (...args: unknown[]) => mockCreateNewQuestionnaireSession(...args),
  loadLatestQuestionnaireSession: (...args: unknown[]) => mockLoadLatestQuestionnaireSession(...args),
  updateUserLastLogin: (...args: unknown[]) => mockUpdateUserLastLogin(...args),
}));

// --- Mock firebase/firestore ---
const mockDeleteFieldSentinel = Symbol("deleteField");
vi.mock("firebase/firestore", () => ({
  Timestamp: {
    now: () => ({ seconds: 1234567890, nanoseconds: 0 }),
  },
  deleteField: () => mockDeleteFieldSentinel,
}));

// --- Mock userStore ---
vi.mock("../userStore", () => ({
  useUserStore: {
    getState: () => ({
      user: { accessCode: "test-access-code", role: "patient", uid: "test-uid" },
    }),
  },
}));

// --- Mock debounce to execute immediately ---
vi.mock("@/lib/utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/utils")>();
  return {
    ...actual,
    debounce: <T extends (...args: unknown[]) => void>(fn: T) => fn,
  };
});

// --- Mock calculateOutcomes ---
vi.mock("@/services/outcomes", () => ({
  calculateOutcomes: vi.fn().mockReturnValue({
    survival: { "Alive (%)": 95, "PCa Death (%)": 3, "Other Death (%)": 2 },
  }),
}));

// --- Helpers ---
const resetStore = () => {
  useQuestionnaireStore.setState({
    sections: useQuestionnaireStore.getState().sections,
    answers: {},
    errors: {},
    currentSectionIndex: 0,
    currentQuestionIndex: 0,
    isLoading: false,
    patientId: null,
    sessionId: "test-session-id",
  });
};

describe("questionnaireStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetStore();
  });

  // ─── setAnswer ─────────────────────────────────────────────────────────────

  describe("setAnswer", () => {
    it("sets an answer in the store state", () => {
      const store = useQuestionnaireStore.getState();
      store.setAnswer("age", 65);

      const updated = useQuestionnaireStore.getState();
      expect(updated.answers["age"]).toBe(65);
    });

    it("triggers a Firebase update with the new answer", () => {
      const store = useQuestionnaireStore.getState();
      store.setAnswer("age", 65);

      expect(mockUpdateQuestionnaireSession).toHaveBeenCalledWith(
        "test-access-code",
        "test-session-id",
        expect.objectContaining({
          answers: expect.objectContaining({ age: 65 }),
        })
      );
    });

    it("clears any existing error for the question", () => {
      useQuestionnaireStore.setState({
        errors: { age: "This field is required." },
      });

      const store = useQuestionnaireStore.getState();
      store.setAnswer("age", 65);

      const updated = useQuestionnaireStore.getState();
      expect(updated.errors["age"]).toBeUndefined();
    });

    it("does not trigger Firebase update when sessionId is null", () => {
      useQuestionnaireStore.setState({ sessionId: null });

      const store = useQuestionnaireStore.getState();
      store.setAnswer("age", 65);

      expect(mockUpdateQuestionnaireSession).not.toHaveBeenCalled();
      // But state should still be updated
      expect(useQuestionnaireStore.getState().answers["age"]).toBe(65);
    });
  });

  // ─── clearAnswer ───────────────────────────────────────────────────────────

  describe("clearAnswer", () => {
    it("removes the answer from the store state", () => {
      useQuestionnaireStore.setState({ answers: { age: 65, psa: 10 } });

      const store = useQuestionnaireStore.getState();
      store.clearAnswer("age");

      const updated = useQuestionnaireStore.getState();
      expect(updated.answers["age"]).toBeUndefined();
      expect(updated.answers["psa"]).toBe(10); // Other answers untouched
    });

    it("sends deleteField() sentinel with dot-notation to Firebase", () => {
      useQuestionnaireStore.setState({ answers: { age: 65. } });

      const store = useQuestionnaireStore.getState();
      store.clearAnswer("age");

      expect(mockUpdateQuestionnaireSession).toHaveBeenCalledWith(
        "test-access-code",
        "test-session-id",
        expect.objectContaining({
          "answers.age": mockDeleteFieldSentinel,
        })
      );
    });

    it("does NOT send the full answers object (avoids merge issue)", () => {
      useQuestionnaireStore.setState({ answers: { age: 65 } });

      const store = useQuestionnaireStore.getState();
      store.clearAnswer("age");

      const callArgs = mockUpdateQuestionnaireSession.mock.calls[0][2];
      // Should not have a top-level 'answers' key
      expect(callArgs).not.toHaveProperty("answers");
      // Should have the dot-notation key
      expect(callArgs).toHaveProperty("answers.age");
    });

    it("clears any existing error for the question", () => {
      useQuestionnaireStore.setState({
        answers: { age: 65 },
        errors: { age: "Value too low" },
      });

      const store = useQuestionnaireStore.getState();
      store.clearAnswer("age");

      expect(useQuestionnaireStore.getState().errors["age"]).toBeUndefined();
    });
  });

  // ─── Navigation ────────────────────────────────────────────────────────────

  describe("nextQuestion", () => {
    it("advances to the next question within the same section", () => {
      const store = useQuestionnaireStore.getState();
      store.nextQuestion();

      const updated = useQuestionnaireStore.getState();
      expect(updated.currentSectionIndex).toBe(0);
      expect(updated.currentQuestionIndex).toBe(1);
    });

    it("advances to the next section when on the last question", () => {
      const sections = useQuestionnaireStore.getState().sections;
      const lastQuestionIndex = sections[0].questions.length - 1;
      useQuestionnaireStore.setState({ currentQuestionIndex: lastQuestionIndex });

      const store = useQuestionnaireStore.getState();
      store.nextQuestion();

      const updated = useQuestionnaireStore.getState();
      expect(updated.currentSectionIndex).toBe(1);
      expect(updated.currentQuestionIndex).toBe(0);
    });

    it("does nothing when on the last question of the last section", () => {
      const sections = useQuestionnaireStore.getState().sections;
      const lastSectionIndex = sections.length - 1;
      const lastQuestionIndex = sections[lastSectionIndex].questions.length - 1;
      useQuestionnaireStore.setState({
        currentSectionIndex: lastSectionIndex,
        currentQuestionIndex: lastQuestionIndex,
      });

      const store = useQuestionnaireStore.getState();
      store.nextQuestion();

      const updated = useQuestionnaireStore.getState();
      expect(updated.currentSectionIndex).toBe(lastSectionIndex);
      expect(updated.currentQuestionIndex).toBe(lastQuestionIndex);
    });
  });

  describe("prevQuestion", () => {
    it("goes back to the previous question within the same section", () => {
      useQuestionnaireStore.setState({ currentQuestionIndex: 2 });

      const store = useQuestionnaireStore.getState();
      store.prevQuestion();

      const updated = useQuestionnaireStore.getState();
      expect(updated.currentSectionIndex).toBe(0);
      expect(updated.currentQuestionIndex).toBe(1);
    });

    it("goes back to the last question of the previous section when on first question", () => {
      useQuestionnaireStore.setState({
        currentSectionIndex: 1,
        currentQuestionIndex: 0,
      });

      const store = useQuestionnaireStore.getState();
      store.prevQuestion();

      const updated = useQuestionnaireStore.getState();
      const expectedLastQuestion =
        useQuestionnaireStore.getState().sections[0].questions.length - 1;
      expect(updated.currentSectionIndex).toBe(0);
      expect(updated.currentQuestionIndex).toBe(expectedLastQuestion);
    });

    it("does nothing on the first question of the first section", () => {
      const store = useQuestionnaireStore.getState();
      store.prevQuestion();

      const updated = useQuestionnaireStore.getState();
      expect(updated.currentSectionIndex).toBe(0);
      expect(updated.currentQuestionIndex).toBe(0);
    });
  });

  // ─── skipSection ───────────────────────────────────────────────────────────

  describe("skipSection", () => {
    it("advances to the next section and resets question index", () => {
      useQuestionnaireStore.setState({ currentSectionIndex: 0, currentQuestionIndex: 3 });

      const store = useQuestionnaireStore.getState();
      store.skipSection();

      const updated = useQuestionnaireStore.getState();
      expect(updated.currentSectionIndex).toBe(1);
      expect(updated.currentQuestionIndex).toBe(0);
    });

    it("does nothing when on the last section", () => {
      const sections = useQuestionnaireStore.getState().sections;
      useQuestionnaireStore.setState({ currentSectionIndex: sections.length - 1 });

      const store = useQuestionnaireStore.getState();
      store.skipSection();

      const updated = useQuestionnaireStore.getState();
      expect(updated.currentSectionIndex).toBe(sections.length - 1);
    });
  });

  // ─── OPTIONAL_SECTIONS constant ────────────────────────────────────────────

  describe("OPTIONAL_SECTIONS", () => {
    it("includes the correct optional sections", () => {
      expect(OPTIONAL_SECTIONS).toContain("Urinary Function");
      expect(OPTIONAL_SECTIONS).toContain("Erectile Function");
      expect(OPTIONAL_SECTIONS).toContain("Bowel Function");
    });

    it("does not include Clinical Characteristics", () => {
      expect(OPTIONAL_SECTIONS).not.toContain("Clinical Characteristics");
    });
  });

  // ─── setErrors ─────────────────────────────────────────────────────────────

  describe("setErrors", () => {
    it("sets errors in state", () => {
      const store = useQuestionnaireStore.getState();
      store.setErrors({ age: "Required", psa: "Too low" });

      const updated = useQuestionnaireStore.getState();
      expect(updated.errors["age"]).toBe("Required");
      expect(updated.errors["psa"]).toBe("Too low");
    });
  });

  // ─── goToSection ───────────────────────────────────────────────────────────

  describe("goToSection", () => {
    it("jumps to a specific section and resets question index", () => {
      const store = useQuestionnaireStore.getState();
      store.goToSection(2);

      const updated = useQuestionnaireStore.getState();
      expect(updated.currentSectionIndex).toBe(2);
      expect(updated.currentQuestionIndex).toBe(0);
    });
  });

  // ─── loadInitialData ──────────────────────────────────────────────────────

  describe("loadInitialData", () => {
    it("creates a new session when no existing session is found", async () => {
      mockLoadLatestQuestionnaireSession.mockResolvedValue(null);

      const store = useQuestionnaireStore.getState();
      await store.loadInitialData();

      expect(mockCreateNewQuestionnaireSession).toHaveBeenCalledWith(
        "test-access-code",
        expect.objectContaining({
          answers: {},
          currentSectionIndex: 0,
          currentQuestionIndex: 0,
        })
      );

      const updated = useQuestionnaireStore.getState();
      expect(updated.sessionId).toBe("new-session-id");
      expect(updated.isLoading).toBe(false);
    });

    it("resumes an existing session when still valid (< 24h)", async () => {
      const recentTimestamp = Timestamp.now();
      mockLoadLatestQuestionnaireSession.mockResolvedValue({
        id: "existing-session-id",
        answers: { age: 70, psa: 5 },
        currentSectionIndex: 1,
        currentQuestionIndex: 2,
        createdAt: { toDate: () => new Date() }, // just now
        updatedAt: recentTimestamp,
      });

      const store = useQuestionnaireStore.getState();
      await store.loadInitialData();

      const updated = useQuestionnaireStore.getState();
      expect(updated.sessionId).toBe("existing-session-id");
      expect(updated.answers).toEqual({ age: 70, psa: 5 });
      expect(updated.currentSectionIndex).toBe(1);
      expect(updated.currentQuestionIndex).toBe(2);
      expect(updated.isLoading).toBe(false);
    });

    it("creates a new session when existing session is expired (>= 24h)", async () => {
      const expiredDate = new Date();
      expiredDate.setHours(expiredDate.getHours() - 25);

      mockLoadLatestQuestionnaireSession.mockResolvedValue({
        id: "old-session-id",
        answers: { age: 70 },
        currentSectionIndex: 2,
        currentQuestionIndex: 1,
        createdAt: { toDate: () => expiredDate },
        updatedAt: Timestamp.now(),
      });

      const store = useQuestionnaireStore.getState();
      await store.loadInitialData();

      expect(mockCreateNewQuestionnaireSession).toHaveBeenCalled();
      const updated = useQuestionnaireStore.getState();
      expect(updated.sessionId).toBe("new-session-id");
      expect(updated.answers).toEqual({});
    });
  });

  // ─── saveFinalAnswers ─────────────────────────────────────────────────────

  describe("saveFinalAnswers", () => {
    it("saves answers with completedAt and clinicalOutcomes to Firebase", async () => {
      useQuestionnaireStore.setState({
        answers: { age: 65, psa: 10, gleason_score: "3+4" },
      });

      const store = useQuestionnaireStore.getState();
      await store.saveFinalAnswers();

      expect(mockUpdateQuestionnaireSession).toHaveBeenCalledWith(
        "test-access-code",
        "test-session-id",
        expect.objectContaining({
          answers: { age: 65, psa: 10, gleason_score: "3+4" },
          completedAt: expect.anything(),
          clinicalOutcomes: expect.anything(),
        })
      );
    });

    it("does nothing when no accessCode or sessionId", async () => {
      useQuestionnaireStore.setState({ sessionId: null });

      const store = useQuestionnaireStore.getState();
      await store.saveFinalAnswers();

      expect(mockUpdateQuestionnaireSession).not.toHaveBeenCalled();
    });
  });

  // ─── startNewSession ──────────────────────────────────────────────────────

  describe("startNewSession", () => {
    it("resets state and creates a new Firebase session", async () => {
      useQuestionnaireStore.setState({
        answers: { age: 65 },
        currentSectionIndex: 2,
        currentQuestionIndex: 3,
      });

      const store = useQuestionnaireStore.getState();
      await store.startNewSession();

      expect(mockCreateNewQuestionnaireSession).toHaveBeenCalledWith(
        "test-access-code",
        expect.objectContaining({
          answers: {},
          currentSectionIndex: 0,
          currentQuestionIndex: 0,
        })
      );

      const updated = useQuestionnaireStore.getState();
      expect(updated.sessionId).toBe("new-session-id");
      expect(updated.answers).toEqual({});
      expect(updated.currentSectionIndex).toBe(0);
      expect(updated.isLoading).toBe(false);
    });
  });

  // ─── Questionnaire Data Structure ─────────────────────────────────────────

  describe("questionnaire data structure", () => {
    it("has 4 sections loaded from questionnaire.json", () => {
      const { sections } = useQuestionnaireStore.getState();
      expect(sections).toHaveLength(4);
    });

    it("section names match expected order", () => {
      const { sections } = useQuestionnaireStore.getState();
      expect(sections[0].section).toBe("Clinical Characteristics");
      expect(sections[1].section).toBe("Urinary Function");
      expect(sections[2].section).toBe("Erectile Function");
      expect(sections[3].section).toBe("Bowel Function");
    });

    it("Clinical Characteristics has 7 questions", () => {
      const { sections } = useQuestionnaireStore.getState();
      expect(sections[0].questions).toHaveLength(7);
    });

    it("each question has required fields", () => {
      const { sections } = useQuestionnaireStore.getState();
      sections.forEach((section) => {
        section.questions.forEach((question) => {
          expect(question.id).toBeDefined();
          expect(question.text).toBeDefined();
          expect(question.type).toBeDefined();
          expect(["radio", "number", "select"]).toContain(question.type);
        });
      });
    });
  });
});
