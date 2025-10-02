import { useNavigate } from 'react-router-dom';
import { useQuestionnaireStore } from '@/stores/questionnaireStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AnimatedPage from '@/components/AnimatedPage';
import Header from '@/features/questionnaire/Header';
import Footer from '@/components/Footer';

// Helper to format the question IDs into readable labels
const formatQuestionLabel = (id: string): string => {
  return id
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const SummaryPage = () => {
  const navigate = useNavigate();
  const { sections, answers } = useQuestionnaireStore();

  const allQuestions = sections.flatMap((section) => section.questions);
  const hasAnswers = Object.keys(answers).length > 0;

  const renderAnswerList = (questionIds: string[]) => (
    <ul className="space-y-3">
      {questionIds.map((id) => {
        const question = allQuestions.find((q) => q.id === id);
        const answer = answers[id];

        if (!question || answer === undefined) return null;

        return (
          <li
            key={id}
            className="flex flex-col justify-between rounded-lg border bg-slate-50/50 p-3 sm:flex-row sm:items-center"
          >
            <p className="font-medium text-gray-600">{formatQuestionLabel(id)}</p>
            <p className="font-semibold text-gray-800">{String(answer)}</p>
          </li>
        );
      })}
    </ul>
  );

  return (
    <AnimatedPage>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-6 text-4xl font-bold text-gray-800">Your Answers</h1>

            {!hasAnswers ? (
              <p>No answers available.</p>
            ) : (
              <div className="space-y-8">
                {/* Clinical Parameters */}
                <Card>
                  <CardHeader>
                    <CardTitle>Clinical Parameters</CardTitle>
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
                  <CardHeader>
                    <CardTitle>Treatment Options</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderAnswerList(['nerve_sparing', 'radiotherapy_hormone'])}
                  </CardContent>
                </Card>

                {/* Baseline Function */}
                <Card>
                  <CardHeader>
                    <CardTitle>Baseline Function</CardTitle>
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
          </div>
        </main>
        <Footer />
      </div>
    </AnimatedPage>
  );
};

export default SummaryPage;
