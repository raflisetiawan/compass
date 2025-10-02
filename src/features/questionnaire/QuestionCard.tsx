import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuestionnaireStore } from '@/stores/questionnaireStore';
import { useNavigate } from 'react-router-dom';
import { createQuestionSchema } from '@/lib/validation';
import { type KeyboardEvent } from 'react';

const QuestionCard = () => {
  const {
    sections,
    currentSectionIndex,
    currentQuestionIndex,
    answers,
    errors,
    setAnswer,
    setErrors,
    nextQuestion,
    prevQuestion,
  } = useQuestionnaireStore();
  const navigate = useNavigate();

  const section = sections[currentSectionIndex];
  const question = section.questions[currentQuestionIndex];
  const answer = answers[question.id];
  const error = errors[question.id];

  const handleNext = () => {
    const schema = createQuestionSchema(question);
    const result = schema.safeParse(answer);

    if (!result.success) {
      const newErrors = { ...errors, [question.id]: result.error.issues[0].message };
      setErrors(newErrors);
      return;
    }

    const isLastQuestion = currentQuestionIndex === section.questions.length - 1;
    const isLastSection = currentSectionIndex === sections.length - 1;

    if (isLastQuestion && isLastSection) {
      navigate('/summary');
    } else {
      nextQuestion();
    }
  };

  const handleEnterPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleNext();
    }
  };

  const renderInput = () => {
    switch (question.type) {
      case 'number':
        return (
          <div className="relative">
            <Input
              id={question.id}
              type="number"
              value={answer || ''}
              onChange={(e) => setAnswer(question.id, e.target.value)}
              onKeyDown={handleEnterPress}
              className="pr-20"
            />
            {question.unit && (
              <span className="absolute inset-y-0 right-4 flex items-center text-sm text-gray-500">
                {question.unit}
              </span>
            )}
          </div>
        );
      case 'select':
        return (
          <Select
            value={answer ? String(answer) : ''}
            onValueChange={(value) => setAnswer(question.id, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option) => {
                const isStringOption = typeof option === 'string';
                const value = isStringOption ? option : option.value;
                const label = isStringOption ? option : option.label;
                return (
                  <SelectItem key={value} value={String(value)}>
                    {label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <p className="text-sm font-semibold text-blue-600">PRE-TREATMENT ASSESSMENT</p>
        <CardTitle className="text-3xl">{section.section}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-600 mb-2">Questions</p>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold">
              {currentQuestionIndex + 1}
            </div>
            <span className="text-gray-500">of {section.questions.length}</span>
          </div>
        </div>

        <div className="space-y-4">
          <label htmlFor={question.id} className="block text-md font-medium text-gray-800">
            {question.text}
          </label>
          {renderInput()}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={prevQuestion} disabled={currentSectionIndex === 0 && currentQuestionIndex === 0}>
          Back
        </Button>
        <Button size="lg" onClick={handleNext}>
          Next
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuestionCard;
