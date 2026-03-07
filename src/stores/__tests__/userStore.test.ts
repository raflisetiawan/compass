import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useUserStore } from "../userStore";

// ---------------------------------------------------------------------------
// Firebase mocks
// ---------------------------------------------------------------------------
vi.mock("@/services/firebase", () => ({
  auth: {},
  getUserDocByAccessCode: vi.fn(),
}));

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: vi.fn(() => () => {}),
  signOut: vi.fn().mockResolvedValue(undefined),
}));

// ---------------------------------------------------------------------------
// questionnaireStore mock (dependency of logout)
// ---------------------------------------------------------------------------
const mockReset = vi.fn();
vi.mock("../questionnaireStore", () => ({
  useQuestionnaireStore: {
    getState: () => ({ reset: mockReset }),
  },
}));

import { signOut } from "firebase/auth";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const originalState = useUserStore.getState();

const setLoggedInUser = () => {
  useUserStore.setState({
    user: { uid: "test-uid", role: "patient", accessCode: "code123" },
    isLoading: false,
  });
};

// ---------------------------------------------------------------------------
describe("userStore – checkSessionExpiry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUserStore.setState(originalState);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ── Valid session ──────────────────────────────────────────────────────────

  it("returns true when session is less than 24 hours old", () => {
    localStorage.setItem("sessionStartTime", Date.now().toString());
    setLoggedInUser();

    const result = useUserStore.getState().checkSessionExpiry();

    expect(result).toBe(true);
    // User should still be logged in
    expect(useUserStore.getState().user).not.toBeNull();
  });

  it("returns true when session is exactly 1 hour old", () => {
    const oneHourAgo = Date.now() - 1 * 60 * 60 * 1000;
    localStorage.setItem("sessionStartTime", oneHourAgo.toString());
    setLoggedInUser();

    expect(useUserStore.getState().checkSessionExpiry()).toBe(true);
  });

  it("returns true when session is just under 24 hours old", () => {
    const justUnder24h = Date.now() - (24 * 60 * 60 * 1000 - 1000);
    localStorage.setItem("sessionStartTime", justUnder24h.toString());
    setLoggedInUser();

    expect(useUserStore.getState().checkSessionExpiry()).toBe(true);
  });

  // ── Expired session ────────────────────────────────────────────────────────

  it("returns false and triggers logout when session is exactly 24 hours old", async () => {
    const exactly24h = Date.now() - 24 * 60 * 60 * 1000;
    localStorage.setItem("sessionStartTime", exactly24h.toString());
    localStorage.setItem("compassAccessCode", "code123");
    localStorage.setItem("userToken", "old-token");
    setLoggedInUser();

    const result = useUserStore.getState().checkSessionExpiry();
    expect(result).toBe(false);

    // Wait for async logout to complete
    await vi.waitFor(() => {
      expect(useUserStore.getState().user).toBeNull();
    });

    expect(signOut).toHaveBeenCalled();
    expect(localStorage.getItem("sessionStartTime")).toBeNull();
    expect(localStorage.getItem("compassAccessCode")).toBeNull();
    expect(localStorage.getItem("userToken")).toBeNull();
  });

  it("returns false and triggers logout when session is 25 hours old", async () => {
    const twentyFiveHoursAgo = Date.now() - 25 * 60 * 60 * 1000;
    localStorage.setItem("sessionStartTime", twentyFiveHoursAgo.toString());
    setLoggedInUser();

    const result = useUserStore.getState().checkSessionExpiry();
    expect(result).toBe(false);

    await vi.waitFor(() => {
      expect(useUserStore.getState().user).toBeNull();
    });
  });

  it("calls questionnaire reset on session expiry logout", async () => {
    const expired = Date.now() - 25 * 60 * 60 * 1000;
    localStorage.setItem("sessionStartTime", expired.toString());
    setLoggedInUser();

    useUserStore.getState().checkSessionExpiry();

    await vi.waitFor(() => {
      expect(mockReset).toHaveBeenCalled();
    });
  });

  // ── No session data ────────────────────────────────────────────────────────

  it("returns false when sessionStartTime is not set", () => {
    localStorage.removeItem("sessionStartTime");
    setLoggedInUser();

    const result = useUserStore.getState().checkSessionExpiry();
    expect(result).toBe(false);
    // Should not logout (no session means not our concern)
    expect(signOut).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
describe("userStore – logout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUserStore.setState(originalState);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("clears all localStorage keys and sets user to null", async () => {
    localStorage.setItem("userToken", "tok");
    localStorage.setItem("sessionStartTime", Date.now().toString());
    localStorage.setItem("compassAccessCode", "abc123");
    setLoggedInUser();

    await useUserStore.getState().logout();

    expect(useUserStore.getState().user).toBeNull();
    expect(localStorage.getItem("userToken")).toBeNull();
    expect(localStorage.getItem("sessionStartTime")).toBeNull();
    expect(localStorage.getItem("compassAccessCode")).toBeNull();
  });

  it("calls Firebase signOut", async () => {
    setLoggedInUser();
    await useUserStore.getState().logout();
    expect(signOut).toHaveBeenCalled();
  });

  it("calls questionnaire store reset", async () => {
    setLoggedInUser();
    await useUserStore.getState().logout();
    expect(mockReset).toHaveBeenCalled();
  });

  it("sets user to null even if Firebase signOut throws", async () => {
    (signOut as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("network error")
    );
    setLoggedInUser();

    await useUserStore.getState().logout();

    expect(useUserStore.getState().user).toBeNull();
  });
});
