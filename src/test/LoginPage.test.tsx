import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import IntroductionPage from "../pages/IntroductionPage";
import SelectPatientPage from "../pages/SelectPatientPage";
import { useUserStore } from "../stores/userStore";
import type { Mock } from "vitest";

// -------------------------------------------------------------------
// Firebase mocks
// -------------------------------------------------------------------
vi.mock("../services/firebase", () => ({
  auth: {},
  getUserDocByAccessCode: vi.fn(),
  updateUserUid: vi.fn(),
}));

vi.mock("firebase/auth", () => ({
  signInAnonymously: vi.fn(),
  signOut: vi.fn().mockResolvedValue(undefined),
  onAuthStateChanged: vi.fn(() => () => {}), // returns unsubscribe fn
}));

// -------------------------------------------------------------------
// reCAPTCHA mock — make isRecaptchaAvailable() return false so tests
// can submit the form without completing a CAPTCHA widget
// -------------------------------------------------------------------
vi.mock("../services/recaptcha", () => ({
  loadRecaptchaScript: vi.fn().mockResolvedValue(undefined),
  renderRecaptcha: vi.fn(),
  resetRecaptcha: vi.fn(),
  isRecaptchaAvailable: vi.fn().mockReturnValue(false),
}));

// -------------------------------------------------------------------
// UI child-component mocks
// -------------------------------------------------------------------
vi.mock("../components/BeSpokeLogo", () => ({
  default: () => <div data-testid="bespoke-logo">BeSpoke Logo</div>,
}));
vi.mock("../components/Footer", () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}));

// -------------------------------------------------------------------
// Named imports used in test assertions
// -------------------------------------------------------------------
import { getUserDocByAccessCode, updateUserUid } from "../services/firebase";
import { signInAnonymously } from "firebase/auth";
import { isRecaptchaAvailable } from "../services/recaptcha";

// -------------------------------------------------------------------
// Restore original Zustand state before each test
// -------------------------------------------------------------------
const originalState = useUserStore.getState();
beforeEach(() => {
  useUserStore.setState(originalState);
});

// -------------------------------------------------------------------
// Helper
// -------------------------------------------------------------------
const renderWithRouter = (initialEntries = ["/login"]) =>
  render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/introduction" element={<IntroductionPage />} />
        <Route path="/select-patient" element={<SelectPatientPage />} />
      </Routes>
    </MemoryRouter>
  );

// ===================================================================
// Test suite
// ===================================================================
describe("LoginPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // reCAPTCHA must remain disabled so tests can submit the form freely
    (isRecaptchaAvailable as Mock).mockReturnValue(false);

    // Default anonymous sign-in mock
    (signInAnonymously as Mock).mockResolvedValue({
      user: {
        uid: "test-uid",
        getIdToken: async () => "test-token",
      },
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  // -----------------------------------------------------------------
  // Rendering
  // -----------------------------------------------------------------
  describe("Rendering", () => {
    it("renders the login form correctly", () => {
      renderWithRouter();
      expect(screen.getByText("Welcome back")).toBeInTheDocument();
      expect(screen.getByLabelText("Access Code")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Submit" })
      ).toBeInTheDocument();
      expect(screen.getByTestId("bespoke-logo")).toBeInTheDocument();
      expect(screen.getByTestId("footer")).toBeInTheDocument();
    });

    it("redirects to /introduction when user is already logged in", () => {
      useUserStore.setState({
        user: { uid: "test-uid", role: "patient", accessCode: "123456" },
      });
      renderWithRouter();
      expect(screen.getByText("The BeSpoke Decision Support tool")).toBeInTheDocument();
    });
  });

  // -----------------------------------------------------------------
  // Validation
  // -----------------------------------------------------------------
  describe("Validation", () => {
    it("shows an error when access code is shorter than 6 characters", async () => {
      renderWithRouter();
      const user = userEvent.setup();

      await user.type(screen.getByLabelText("Access Code"), "12345");
      await user.click(screen.getByRole("button", { name: "Submit" }));

      expect(
        await screen.findByText("Access code must be at least 6 characters long.")
      ).toBeInTheDocument();
      expect(getUserDocByAccessCode).not.toHaveBeenCalled();
    });

    it("shows an error for an invalid access code", async () => {
      (getUserDocByAccessCode as Mock).mockResolvedValue(null);
      renderWithRouter();
      const user = userEvent.setup();

      await user.type(screen.getByLabelText("Access Code"), "invalid-code");
      await user.click(screen.getByRole("button", { name: "Submit" }));

      expect(
        await screen.findByText("Invalid access code. Please try again.")
      ).toBeInTheDocument();
    });

    it("clears the validation error when the user starts typing again", async () => {
      renderWithRouter();
      const user = userEvent.setup();
      const input = screen.getByLabelText("Access Code");

      await user.type(input, "12345");
      await user.click(screen.getByRole("button", { name: "Submit" }));
      expect(
        await screen.findByText("Access code must be at least 6 characters long.")
      ).toBeInTheDocument();

      await user.type(input, "6");
      expect(
        screen.queryByText("Access code must be at least 6 characters long.")
      ).not.toBeInTheDocument();
    });
  });

  // -----------------------------------------------------------------
  // Successful login
  // -----------------------------------------------------------------
  describe("Successful login", () => {
    it("logs in a patient and navigates to /introduction", async () => {
      (getUserDocByAccessCode as Mock).mockResolvedValue({
        uid: "existing-uid",
        role: "patient",
      });

      renderWithRouter();
      const user = userEvent.setup();

      await user.type(screen.getByLabelText("Access Code"), "123456");
      await user.click(screen.getByRole("button", { name: "Submit" }));

      await waitFor(() => {
        expect(screen.getByText("The BeSpoke Decision Support tool")).toBeInTheDocument();
      });

      const userState = useUserStore.getState().user;
      expect(userState?.accessCode).toBe("123456");
      expect(userState?.role).toBe("patient");
    });

    it("logs in a clinican and navigates to /select-patient", async () => {
      (getUserDocByAccessCode as Mock).mockResolvedValue({
        uid: "existing-uid",
        role: "clinican",
      });

      renderWithRouter();
      const user = userEvent.setup();

      await user.type(screen.getByLabelText("Access Code"), "clinican-code");
      await user.click(screen.getByRole("button", { name: "Submit" }));

      await waitFor(() => {
        expect(screen.getByText("Clinican")).toBeInTheDocument();
      });

      const userState = useUserStore.getState().user;
      expect(userState?.accessCode).toBe("clinican-code");
      expect(userState?.role).toBe("clinican");
    });

    it("calls updateUserUid on first-time login (no uid in user doc)", async () => {
      (getUserDocByAccessCode as Mock).mockResolvedValue({ role: "patient" });

      renderWithRouter();
      const user = userEvent.setup();

      await user.type(screen.getByLabelText("Access Code"), "new-patient-code");
      await user.click(screen.getByRole("button", { name: "Submit" }));

      await waitFor(() => {
        expect(updateUserUid).toHaveBeenCalledWith("new-patient-code", "test-uid");
      });
      await waitFor(() => {
        expect(screen.getByText("The BeSpoke Decision Support tool")).toBeInTheDocument();
      });
    });

    it("does NOT call updateUserUid when the user doc already has a uid", async () => {
      (getUserDocByAccessCode as Mock).mockResolvedValue({
        uid: "existing-uid",
        role: "patient",
      });

      renderWithRouter();
      const user = userEvent.setup();

      await user.type(screen.getByLabelText("Access Code"), "returning-user");
      await user.click(screen.getByRole("button", { name: "Submit" }));

      await waitFor(() => {
        expect(screen.getByText("The BeSpoke Decision Support tool")).toBeInTheDocument();
      });
      expect(updateUserUid).not.toHaveBeenCalled();
    });
  });

  // -----------------------------------------------------------------
  // localStorage on login
  // -----------------------------------------------------------------
  describe("localStorage session data", () => {
    it("saves userToken, sessionStartTime, and compassAccessCode on successful login", async () => {
      (getUserDocByAccessCode as Mock).mockResolvedValue({
        uid: "existing-uid",
        role: "patient",
      });

      const before = Date.now();
      renderWithRouter();
      const user = userEvent.setup();

      await user.type(screen.getByLabelText("Access Code"), "mycode1");
      await user.click(screen.getByRole("button", { name: "Submit" }));

      await waitFor(() => {
        expect(screen.getByText("The BeSpoke Decision Support tool")).toBeInTheDocument();
      });

      expect(localStorage.getItem("userToken")).toBe("test-token");
      expect(localStorage.getItem("compassAccessCode")).toBe("mycode1");

      const sessionStart = Number(localStorage.getItem("sessionStartTime"));
      expect(sessionStart).toBeGreaterThanOrEqual(before);
      expect(sessionStart).toBeLessThanOrEqual(Date.now());
    });
  });
});

// ===================================================================
// userStore – checkSessionExpiry
// ===================================================================
describe("userStore – checkSessionExpiry", () => {
  afterEach(() => {
    localStorage.clear();
    useUserStore.setState(originalState);
  });

  it("returns true when session is within 24 hours", () => {
    localStorage.setItem("sessionStartTime", Date.now().toString());
    const result = useUserStore.getState().checkSessionExpiry();
    expect(result).toBe(true);
  });

  it("returns false and calls logout when session is older than 24 hours", async () => {
    // Simulate 25 hours ago
    const twentyFiveHoursAgo = Date.now() - 25 * 60 * 60 * 1000;
    localStorage.setItem("sessionStartTime", twentyFiveHoursAgo.toString());
    localStorage.setItem("compassAccessCode", "oldcode");
    localStorage.setItem("userToken", "old-token");

    useUserStore.setState({
      user: { uid: "uid-1", role: "patient", accessCode: "oldcode" },
    });

    const result = useUserStore.getState().checkSessionExpiry();
    expect(result).toBe(false);

    // Give the async logout a tick to complete
    await waitFor(() => {
      expect(useUserStore.getState().user).toBeNull();
    });

    expect(localStorage.getItem("sessionStartTime")).toBeNull();
    expect(localStorage.getItem("compassAccessCode")).toBeNull();
    expect(localStorage.getItem("userToken")).toBeNull();
  });

  it("returns false when sessionStartTime is not present", () => {
    localStorage.removeItem("sessionStartTime");
    const result = useUserStore.getState().checkSessionExpiry();
    expect(result).toBe(false);
    // user should remain unchanged
    expect(useUserStore.getState().user).toBe(originalState.user);
  });
});
