import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import {
  getDocs,
  type QuerySnapshot,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { signInAnonymously, type UserCredential, type User } from 'firebase/auth';
import LoginPage from '../pages/LoginPage';
import IntroductionPage from '../pages/IntroductionPage';
import QuestionnairePage from '../pages/QuestionnairePage';

// Mocks
vi.mock('../services/firebase', () => ({ auth: {}, db: {} }));
vi.mock('firebase/firestore');
vi.mock('firebase/auth');

const setUser = vi.fn();
vi.mock('../stores/userStore', () => ({
  useStore: () => ({ setUser, user: null }),
}));

vi.mock('../pages/QuestionnairePage', () => ({
  default: () => <div>Questionnaire Page</div>,
}));

vi.mock('../pages/IntroductionPage', () => ({
  default: () => <div>Introduction Page</div>,
}));

// Type-safe mock helper
function createMock<T>(partial: Partial<T>): T {
  return partial as T;
}

// Test setup helpers
const renderComponent = () => {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/introduction" element={<IntroductionPage />} />
        <Route path="/questionnaire" element={<QuestionnairePage />} />
      </Routes>
    </MemoryRouter>
  );
};

const setup = async (accessCode: string) => {
  const user = userEvent.setup();
  renderComponent();
  const input = screen.getByPlaceholderText('Input your access code here...');
  const button = screen.getByRole('button', { name: /submit/i });
  await user.type(input, accessCode);
  await user.click(button);
  return { user };
};

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('UI Rendering', () => {
    it('should render the login form correctly', () => {
      renderComponent();
      expect(screen.getByText('Welcome back')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Input your access code here...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });
  });

  describe('User Interactions and Validation', () => {
    it('should show an error for access codes shorter than 6 characters', async () => {
      await setup('123');
      expect(await screen.findByText('Access code must be at least 6 characters long.')).toBeInTheDocument();
    });

    it('should show an error for an invalid access code', async () => {
      vi.mocked(getDocs).mockResolvedValue(
        createMock<QuerySnapshot>({ empty: true })
      );
      await setup('654321');
      expect(await screen.findByText('Invalid access code. Please try again.')).toBeInTheDocument();
    });
  });

  describe('Authentication Flow', () => {
    it('should log in and navigate to the introduction page on successful submission', async () => {
      vi.mocked(getDocs).mockResolvedValue(
        createMock<QuerySnapshot>({
          empty: false,
          docs: [
            createMock<QueryDocumentSnapshot>({ data: () => ({ code: '123456' }) }),
          ],
        })
      );
      vi.mocked(signInAnonymously).mockResolvedValue(
        createMock<UserCredential>({
          user: createMock<User>({
            uid: 'test-uid',
            getIdToken: vi.fn().mockResolvedValue('test-token'),
          }),
        })
      );

      await setup('123456');

      await waitFor(() => {
        expect(screen.getByText('Introduction Page')).toBeInTheDocument();
      });

      expect(setUser).toHaveBeenCalledWith(expect.objectContaining({ uid: 'test-uid' }));
      expect(getDocs).toHaveBeenCalled();
      expect(signInAnonymously).toHaveBeenCalled();
    });
  });
});
