import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useQuestionnaireStore } from '@/stores/questionnaireStore';
import { useUserStore } from '@/stores/userStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MainLayout from '@/layouts/MainLayout';

// Helper to format question IDs into readable labels
const formatQuestionLabel = (id: string): string => {
  const labels: { [key: string]: string } = {
    age: 'Age',
    psa: 'PSA Level',
    prostate_volume: 'Prostate Volume',
    gleason_score: 'Gleason Score',
    cancer_stage: 'Clinical Cancer Stage',
    mri_visibility: 'MRI Visibility of Tumour',
    nerve_sparing: 'Nerve Sparing Surgery',
    radiotherapy_hormone: 'Hormone Therapy with Radiotherapy',
    urine_leak: 'Urine Leakage',
    pad_usage: 'Pad Usage',
    urine_problem: 'Urinary Problems',
    erection_quality: 'Erection Quality',
    erection_bother: 'Bother from Erections',
    sex_interest: 'Interest in Sex',
    sex_medication: 'Use of Sexual Medication',
    bowel_urgency: 'Bowel Urgency',
    bowel_bother: 'Bother from Bowel Function',
  };
  return labels[id] || id.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

// Helper to format answers with units and more descriptive text
const formatAnswer = (id: string, answer: string | number | boolean): string => {
  if (answer === undefined || answer === null || answer === '') return 'Not answered';

  const value = String(answer);

  switch (id) {
    case 'age':
      return `${value} years`;
    case 'psa':
      return `${value} ng/mL`;
    case 'prostate_volume':
      return `${value} ml`;
    case 'gleason_score':
      return `Gleason ${value}`;
    case 'cancer_stage':
      return `Stage ${value}`;
    case 'pad_usage': {
      const pads = parseInt(value, 10);
      if (isNaN(pads) || pads === 0) return 'None';
      if (pads === 1) return '1 pad';
      return `${pads} pads`;
    }
    default:
      // Capitalize the first letter for simple text answers like "Yes" or "No"
      return value.charAt(0).toUpperCase() + value.slice(1);
  }
};

const SummaryPage = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { answers, setCurrentSectionIndex, loadInitialData, isLoading } = useQuestionnaireStore();

  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user, loadInitialData]);

  const hasAnswers = Object.values(answers).some((answer) => answer !== '' && answer !== undefined);

  const handleEdit = (sectionIndex: number) => {
    setCurrentSectionIndex(sectionIndex);
    navigate('/questionnaire');
  };

  const renderAnswerList = (questionIds: string[]) => {
    const answeredQuestions = questionIds.filter((id) => {
      const answer = answers[id];
      return answer !== undefined && answer !== null && answer !== '';
    });

    if (answeredQuestions.length === 0) {
      return <p className="text-sm text-gray-500">No answers provided for this section.</p>;
    }

    return (
      <ul className="space-y-3">
        {answeredQuestions.map((id) => (
          <li
            key={id}
            className="flex flex-col justify-between rounded-lg border bg-slate-50/50 p-3 sm:flex-row sm:items-center"
          >
            <p className="font-medium text-gray-600">{formatQuestionLabel(id)}</p>
            <p className="font-semibold text-gray-800">{formatAnswer(id, answers[id])}</p>
          </li>
        ))}
      </ul>
    );
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center gap-4 p-8">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="text-lg text-gray-600">Loading your summary...</p>
        </div>
      </MainLayout>
    );
  }

  return (
      <MainLayout>
        <h1 className="mb-6 text-4xl font-bold text-gray-800">Your Answers</h1>

        {!hasAnswers ? (
          <p>No answers available. Please go back to the questionnaire.</p>
        ) : (
          <div className="space-y-8">
            {/* Clinical Parameters */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Clinical Parameters</CardTitle>
                <Button variant="link" onClick={() => handleEdit(0)}>
                  Edit
                </Button>
              </CardHeader>
              <CardContent>
                {renderAnswerList([
                  'age',
                  'psa',
                  'prostate_volume',
                  'gleason_score',
                  'cancer_stage',
                  'mri_visibility',
                ])}
              </CardContent>
            </Card>

            {/* Treatment Options */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Treatment Options</CardTitle>
                <Button variant="link" onClick={() => handleEdit(1)}>
                  Edit
                </Button>
              </CardHeader>
              <CardContent>
                {renderAnswerList(['nerve_sparing', 'radiotherapy_hormone'])}
              </CardContent>
            </Card>

            {/* Baseline Function */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Baseline Function</CardTitle>
                <Button variant="link" onClick={() => handleEdit(2)}>
                  Edit
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="mb-2 text-lg font-semibold">Urinary Function</h3>
                  {renderAnswerList(['urine_leak', 'pad_usage', 'urine_problem'])}
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold">Sexual Function</h3>
                  {renderAnswerList([
                    'erection_quality',
                    'erection_bother',
                    'sex_interest',
                    'sex_medication',
                  ])}
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold">Bowel Function</h3>
                  {renderAnswerList(['bowel_urgency', 'bowel_bother'])}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <Button variant="outline" onClick={() => navigate('/questionnaire')}>
            Back
          </Button>
          <Button onClick={() => navigate('/results')} disabled={!hasAnswers}>
            See Your Results
          </Button>
        </div>
      </MainLayout>
  );
};

export default SummaryPage;
