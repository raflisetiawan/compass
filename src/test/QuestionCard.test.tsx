import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import QuestionCard from "../features/questionnaire/QuestionCard";
import { useQuestionnaireStore } from "../stores/questionnaireStore";
import questionnaireData from "../assets/questionnaire.json";
import type { QuestionnaireData } from "../types/questionnaire";

// --- Mock firebase services ---
vi.mock("../services/firebase", () => ({
  auth: {},
  updateQuestionnaireSession: vi.fn(),
  createNewQuestionnaireSession: vi.fn(),
  loadLatestQuestionnaireSession: vi.fn(),
  updateUserLastLogin: vi.fn(),
}));

// --- Mock firebase/firestore ---
vi.mock("firebase/firestore", () => ({
  Timestamp: {
    now: () => ({ seconds: 1234567890, nanoseconds: 0 }),
  },
  deleteField: () => Symbol("deleteField"),
}));

// --- Mock firebase/auth ---
vi.mock("firebase/auth", () => ({
  signInAnonymously: vi.fn(),
  onAuthStateChanged: vi.fn(() => () => {}),
}));

// --- Mock calculateOutcomes ---
vi.mock("../services/outcomes", () => ({
  calculateOutcomes: vi.fn().mockReturnValue({}),
}));

// --- Mock debounce to execute immediately ---
vi.mock("../lib/utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../lib/utils")>();
  return {
    ...actual,
    debounce: <T extends (...args: unknown[]) => void>(fn: T) => fn,
  };
});

const sections = (questionnaireData as QuestionnaireData).questionnaire;

// Helper to reset store to a known clean state
const resetStore = (overrides = {}) => {
  useQuestionnaireStore.setState({
    sections,
    answers: {},
    errors: {},
    currentSectionIndex: 0,
    currentQuestionIndex: 0,
    isLoading: false,
    patientId: null,
    sessionId: "test-session-id",
    ...overrides,
  });
};

const renderWithRouter = () => {
  return render(
    <MemoryRouter>
      <QuestionCard />
    </MemoryRouter>
  );
};

describe("QuestionCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetStore();
  });

  // ─── Rendering ─────────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders the section title", () => {
      renderWithRouter();
      expect(screen.getByText("Clinical Characteristics")).toBeInTheDocument();
    });

    it("renders the first question text", () => {
      renderWithRouter();
      expect(
        screen.getByText("How old are you (at time of prostate biopsy)?")
      ).toBeInTheDocument();
    });

    it("renders question help text when available", () => {
      renderWithRouter();
      expect(
        screen.getByText(/We do not make decisions about prostate cancer treatment/i)
      ).toBeInTheDocument();
    });

    it("renders the question counter (1 of N)", () => {
      renderWithRouter();
      const questionCount = sections[0].questions.length;
      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText(`of ${questionCount}`)).toBeInTheDocument();
    });

    it("renders the PRE-TREATMENT ASSESSMENT label", () => {
      renderWithRouter();
      expect(screen.getByText("PRE-TREATMENT ASSESSMENT")).toBeInTheDocument();
    });
  });

  // ─── Number Input ──────────────────────────────────────────────────────────

  describe("number input", () => {
    it("renders a number input for the age question", () => {
      renderWithRouter();
      const input = document.getElementById("age") as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("type", "number");
    });

    it("renders the unit label", () => {
      renderWithRouter();
      expect(screen.getByText("years")).toBeInTheDocument();
    });

    it("updates the answer when typing", async () => {
      renderWithRouter();
      const user = userEvent.setup();
      const input = screen.getByRole("spinbutton");
      await user.type(input, "65");

      const state = useQuestionnaireStore.getState();
      expect(state.answers["age"]).toBeDefined();
    });
  });

  // ─── Radio Options ─────────────────────────────────────────────────────────

  describe("radio options", () => {
    beforeEach(() => {
      // Navigate to the gleason_score question (question index 3 in section 0)
      resetStore({ currentQuestionIndex: 3 });
    });

    it("renders all radio options for a radio question", () => {
      renderWithRouter();
      expect(screen.getByText("3+3")).toBeInTheDocument();
      expect(screen.getByText("3+4")).toBeInTheDocument();
      expect(screen.getByText("4+3")).toBeInTheDocument();
      expect(screen.getByText("4+4 or 3+5 or 5+3")).toBeInTheDocument();
      expect(screen.getByText("4+5 or 5+4 or 5+5")).toBeInTheDocument();
    });

    it("calls setAnswer when clicking a radio option", async () => {
      renderWithRouter();
      const user = userEvent.setup();

      const option = screen.getByText("3+4");
      await user.click(option);

      const state = useQuestionnaireStore.getState();
      expect(state.answers["gleason_score"]).toBe("3+4");
    });

    it("shows the option as selected after clicking", async () => {
      resetStore({ currentQuestionIndex: 3, answers: { gleason_score: "3+4" } });
      renderWithRouter();

      // The selected option should have the blue styling
      const optionElement = screen.getByText("3+4").closest("[role='button']");
      expect(optionElement).toHaveClass("border-blue-600");
    });

    it("calls clearAnswer when clicking an already-selected option (toggle/unselect)", async () => {
      resetStore({ currentQuestionIndex: 3, answers: { gleason_score: "3+4" } });
      renderWithRouter();
      const user = userEvent.setup();

      // Click the already-selected option to unselect it
      const option = screen.getByText("3+4");
      await user.click(option);

      const state = useQuestionnaireStore.getState();
      expect(state.answers["gleason_score"]).toBeUndefined();
    });

    it("switches selection when clicking a different option", async () => {
      resetStore({ currentQuestionIndex: 3, answers: { gleason_score: "3+3" } });
      renderWithRouter();
      const user = userEvent.setup();

      await user.click(screen.getByText("4+3"));

      const state = useQuestionnaireStore.getState();
      expect(state.answers["gleason_score"]).toBe("4+3");
    });
  });

  // ─── Navigation Buttons ────────────────────────────────────────────────────

  describe("navigation buttons", () => {
    it("renders Back and Next buttons", () => {
      renderWithRouter();
      expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /next|skip/i })).toBeInTheDocument();
    });

    it("Back button is disabled on the first question of the first section", () => {
      renderWithRouter();
      const backButton = screen.getByRole("button", { name: /back/i });
      expect(backButton).toBeDisabled();
    });

    it("Back button is enabled when not on the first question", () => {
      resetStore({ currentQuestionIndex: 1 });
      renderWithRouter();
      const backButton = screen.getByRole("button", { name: /back/i });
      expect(backButton).not.toBeDisabled();
    });

    it("Next button is disabled for required sections when no answer", () => {
      renderWithRouter();
      const nextButton = screen.getByRole("button", { name: /next/i });
      expect(nextButton).toBeDisabled();
    });

    it("Next button is enabled for required sections when an answer is provided", () => {
      resetStore({ answers: { age: 65 } });
      renderWithRouter();
      const nextButton = screen.getByRole("button", { name: /next/i });
      expect(nextButton).not.toBeDisabled();
    });
  });

  // ─── Optional Sections ────────────────────────────────────────────────────

  describe("optional sections", () => {
    it("shows 'Skip Question' for optional section when unanswered", () => {
      // Section 1 = Urinary Function (optional)
      resetStore({ currentSectionIndex: 1, currentQuestionIndex: 0 });
      renderWithRouter();

      expect(screen.getByRole("button", { name: /skip question/i })).toBeInTheDocument();
    });

    it("'Skip Question' button is not disabled for optional sections", () => {
      resetStore({ currentSectionIndex: 1, currentQuestionIndex: 0 });
      renderWithRouter();

      const skipButton = screen.getByRole("button", { name: /skip question/i });
      expect(skipButton).not.toBeDisabled();
    });

    it("shows 'Next' instead of 'Skip Question' when optional question is answered", () => {
      resetStore({
        currentSectionIndex: 1,
        currentQuestionIndex: 0,
        answers: { urine_leak: "Rarely or never" },
      });
      renderWithRouter();

      expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
    });
  });

  // ─── Error Display ─────────────────────────────────────────────────────────

  describe("error display", () => {
    it("displays an error message when there is an error for the current question", () => {
      resetStore({ errors: { age: "This field is required." } });
      renderWithRouter();

      expect(screen.getByText("This field is required.")).toBeInTheDocument();
    });

    it("does not display an error message when there is none", () => {
      renderWithRouter();
      expect(screen.queryByText("This field is required.")).not.toBeInTheDocument();
    });
  });

  // ─── Last Question Behavior ────────────────────────────────────────────────

  describe("last question", () => {
    it("shows 'Next Section: What is important to me' on the last question of last section", () => {
      const lastSection = sections.length - 1;
      const lastQuestion = sections[lastSection].questions.length - 1;
      resetStore({
        currentSectionIndex: lastSection,
        currentQuestionIndex: lastQuestion,
        answers: { bowel_bother: "No problem" },
      });
      renderWithRouter();

      expect(
        screen.getByRole("button", { name: /next section: what is important to me/i })
      ).toBeInTheDocument();
    });
  });
});
