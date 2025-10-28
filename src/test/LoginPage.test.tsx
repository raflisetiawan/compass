import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import IntroductionPage from "../pages/IntroductionPage";
import SelectPatientPage from "../pages/SelectPatientPage";
import { useUserStore } from "../stores/userStore";
import type { Mock } from "vitest";

// Mocking firebase services
vi.mock("../services/firebase", () => ({
  auth: {},
  getUserDocByAccessCode: vi.fn(),
  updateUserUid: vi.fn(),
}));

// Mocking firebase auth
vi.mock("firebase/auth", () => ({
  signInAnonymously: vi.fn(),
  onAuthStateChanged: vi.fn(() => () => {}), // Returns an unsubscribe function
}));

// Mocking the user store
const originalState = useUserStore.getState();
beforeEach(() => {
  useUserStore.setState(originalState);
});

// Mock child components to isolate tests
vi.mock("../components/BeSpokeLogo", () => ({
  default: () => <div data-testid="bespoke-logo">BeSpoke Logo</div>,
}));
vi.mock("../components/Footer", () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}));

// Import mocked functions to control their behavior in tests
import { getUserDocByAccessCode, updateUserUid } from "../services/firebase";
import { signInAnonymously } from "firebase/auth";

const renderWithRouter = (initialEntries = ["/login"]) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/introduction" element={<IntroductionPage />} />
        <Route path="/select-patient" element={<SelectPatientPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe("LoginPage", () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();

    // Mock signInAnonymously to return a predictable user credential
    (signInAnonymously as Mock).mockResolvedValue({
      user: {
        uid: "test-uid",
        getIdToken: async () => "test-token",
      },
    });
  });

  it("renders the login form correctly", () => {
    renderWithRouter();
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(screen.getByLabelText("Access Code")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
    expect(screen.getByTestId("bespoke-logo")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  it("shows a validation error for access codes shorter than 6 characters", async () => {
    renderWithRouter();
    const user = userEvent.setup();
    const input = screen.getByLabelText("Access Code");
    const submitButton = screen.getByRole("button", { name: "Submit" });

    await user.type(input, "12345");
    await user.click(submitButton);

    expect(
      await screen.findByText("Access code must be at least 6 characters long.")
    ).toBeInTheDocument();
    expect(getUserDocByAccessCode).not.toHaveBeenCalled();
  });

  it("shows an error for an invalid access code", async () => {
    (getUserDocByAccessCode as Mock).mockResolvedValue(null);
    renderWithRouter();
    const user = userEvent.setup();
    const input = screen.getByLabelText("Access Code");
    const submitButton = screen.getByRole("button", { name: "Submit" });

    await user.type(input, "invalid-code");
    await user.click(submitButton);

    expect(
      await screen.findByText("Invalid access code. Please try again.")
    ).toBeInTheDocument();
  });

  it("logs in a patient successfully and navigates to the introduction page", async () => {
    const mockUserDoc = {
      uid: "existing-uid",
      role: "patient",
    };
    (getUserDocByAccessCode as Mock).mockResolvedValue(mockUserDoc);

    renderWithRouter();
    const user = userEvent.setup();
    const input = screen.getByLabelText("Access Code");
    const submitButton = screen.getByRole("button", { name: "Submit" });

    await user.type(input, "123456");
    await user.click(submitButton);

    await waitFor(() => {
      // Check if navigation to IntroductionPage was successful
      expect(screen.getByText("Introduction")).toBeInTheDocument();
    });

    // Verify that the user state is updated
    const userState = useUserStore.getState().user;
    expect(userState?.accessCode).toBe("123456");
    expect(userState?.role).toBe("patient");
  });

  it("logs in a staff member successfully and navigates to the select patient page", async () => {
    const mockUserDoc = {
      uid: "existing-uid",
      role: "clinican",
    };
    (getUserDocByAccessCode as Mock).mockResolvedValue(mockUserDoc);

    renderWithRouter();
    const user = userEvent.setup();
    const input = screen.getByLabelText("Access Code");
    const submitButton = screen.getByRole("button", { name: "Submit" });

    await user.type(input, "staff-code");
    await user.click(submitButton);

    await waitFor(() => {
      // Check if navigation to SelectPatientPage was successful
      expect(screen.getByText("Clinican")).toBeInTheDocument();
    });

    // Verify that the user state is updated
    const userState = useUserStore.getState().user;
    expect(userState?.accessCode).toBe("staff-code");
    expect(userState?.role).toBe("clinican");
  });

  it("calls updateUserUid for a first-time login", async () => {
    const mockUserDoc = {
      // no uid
      role: "patient",
    };
    (getUserDocByAccessCode as Mock).mockResolvedValue(mockUserDoc);

    renderWithRouter();
    const user = userEvent.setup();
    const input = screen.getByLabelText("Access Code");
    const submitButton = screen.getByRole("button", { name: "Submit" });

    await user.type(input, "new-patient-code");
    await user.click(submitButton);

    await waitFor(() => {
      expect(updateUserUid).toHaveBeenCalledWith(
        "new-patient-code",
        "test-uid"
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Introduction")).toBeInTheDocument();
    });
  });

  it("redirects to introduction page if user is already logged in", () => {
    useUserStore.setState({
      user: { uid: "test-uid", role: "patient", accessCode: "123456" },
    });
    renderWithRouter();
    expect(screen.getByText("Introduction")).toBeInTheDocument();
  });
});
