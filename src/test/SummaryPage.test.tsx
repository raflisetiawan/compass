import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import SummaryPage from '../pages/SummaryPage';
import { useQuestionnaireStore } from '@/stores/questionnaireStore';

// Mock the store
const mockState = {
  sections: [
    {
      section: 'Clinical Characteristics',
      questions: [
        { id: 'age', text: 'How old are you?' },
        { id: 'psa', text: 'What was your last PSA?' },
      ],
    },
  ],
  answers: {
    age: 55,
    psa: 4.5,
  },
};

vi.mock('@/stores/questionnaireStore', () => ({
  useQuestionnaireStore: vi.fn(),
}));

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('SummaryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup the mock implementation for each test
    (useQuestionnaireStore as any).mockImplementation(() => mockState);
  });

  it('should render the summary with user answers', () => {
    render(
      <MemoryRouter>
        <SummaryPage />
      </MemoryRouter>
    );

    // Check for title
    expect(screen.getByText('Your Answers')).toBeInTheDocument();

    // Check for a specific question label and its value
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('55')).toBeInTheDocument();

    expect(screen.getByText('Psa')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('should display "No answers available" when there are no answers', () => {
    (useQuestionnaireStore as any).mockImplementation(() => ({
      ...mockState,
      answers: {},
    }));

    render(
      <MemoryRouter>
        <SummaryPage />
      </MemoryRouter>
    );

    expect(screen.getByText('No answers available.')).toBeInTheDocument();
    // The "See Your Results" button should be disabled
    expect(screen.getByRole('button', { name: /see your results/i })).toBeDisabled();
  });

  it('should navigate to /questionnaire when "Back" is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SummaryPage />
      </MemoryRouter>
    );

    const backButton = screen.getByRole('button', { name: /back/i });
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/questionnaire');
  });

  it('should navigate to /results when "See Your Results" is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SummaryPage />
      </MemoryRouter>
    );

    const nextButton = screen.getByRole('button', { name: /see your results/i });
    await user.click(nextButton);

    expect(mockNavigate).toHaveBeenCalledWith('/results');
  });
});
