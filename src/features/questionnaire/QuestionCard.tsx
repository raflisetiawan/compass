import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useQuestionnaireStore, OPTIONAL_SECTIONS } from "@/stores/questionnaireStore";
import { useNavigate } from "react-router-dom";
import { createQuestionSchema } from "@/lib/validation";
import { type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { SkipForward } from "lucide-react";

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
    skipSection,
    saveFinalAnswers,
  } = useQuestionnaireStore();
  const navigate = useNavigate();

  const section = sections[currentSectionIndex];
  const question = section.questions[currentQuestionIndex];
  const answer = answers[question.id];
  const error = errors[question.id];
  
  // Check if current section is optional
  const isOptionalSection = OPTIONAL_SECTIONS.includes(section.section);


  const handleNext = async () => {
    const currentAnswer = useQuestionnaireStore.getState().answers[question.id];
    
    // For optional sections, allow skipping without validation if no answer
    if (!isOptionalSection || (currentAnswer !== undefined && String(currentAnswer).trim() !== '')) {
      const schema = createQuestionSchema(question);
      const result = schema.safeParse(currentAnswer);

      if (!result.success) {
        const newErrors = {
          ...errors,
          [question.id]: result.error.issues[0].message,
        };
        setErrors(newErrors);
        return;
      }
    }

    const isLastQuestion =
      currentQuestionIndex === section.questions.length - 1;
    const isLastSection = currentSectionIndex === sections.length - 1;

    if (isLastQuestion && isLastSection) {
      await saveFinalAnswers();
      navigate("/vce/intro");
    } else {
      nextQuestion();
    }
  };
  
  const handleSkipSection = async () => {
    const isLastSection = currentSectionIndex === sections.length - 1;
    if (isLastSection) {
      await saveFinalAnswers();
      navigate("/vce/intro");
    } else {
      skipSection();
    }
  };

  const handleEnterPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleNext();
    }
  };

  const renderInput = () => {
    switch (question.type) {
      case "number":
        return (
          <div className="relative">
            <Input
              id={question.id}
              type="number"
              value={answer || ""}
              placeholder={question.placeholder}
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
      case "radio":
        return (
          <RadioGroup
            value={answer ? String(answer) : ""}
            onValueChange={(value) => setAnswer(question.id, value)}
            className="space-y-3"
          >
            {question.options?.map((option, index) => {
              const isStringOption = typeof option === "string";
              const value = isStringOption ? option : option.value;
              const label = isStringOption ? option : option.label;
              const id = `${question.id}-${value}`;
              const isSelected = answer === value;

              return (
                <Label
                  key={id}
                  htmlFor={id}
                  className={cn(
                    "flex cursor-pointer items-center gap-4 rounded-lg border bg-white p-4 transition-all hover:bg-slate-50",
                    isSelected && "border-blue-600 bg-blue-50"
                  )}
                >
                  <RadioGroupItem
                    value={String(value)}
                    id={id}
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-md border bg-slate-100 text-sm font-semibold",
                      isSelected && "border-blue-600 bg-blue-100 text-blue-800"
                    )}
                  >
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span
                    className={cn("font-medium", isSelected && "text-blue-800")}
                  >
                    {label}
                  </span>
                </Label>
              );
            })}
          </RadioGroup>
        );
      default:
        return null;
    }
  };

  const isAnswered = answer !== undefined && String(answer).trim() !== "";
  
  // Check if this is the last question in the last section
  const isLastQuestion = currentQuestionIndex === section.questions.length - 1;
  const isLastSection = currentSectionIndex === sections.length - 1;
  const isLastQuestionOverall = isLastQuestion && isLastSection;

  return (
    <Card className="w-full">
      <CardHeader>
        <p className="text-sm font-semibold text-blue-600">
          PRE-TREATMENT ASSESSMENT
        </p>
        <div className="flex items-center gap-3">
          <CardTitle className="text-3xl">{section.section}</CardTitle>
          {isOptionalSection && (
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
              Optional
            </span>
          )}
        </div>
        {isOptionalSection && currentQuestionIndex === 0 && (
          <p className="text-sm text-gray-500 mt-2">
            This section is optional. You can skip it or answer the questions for personalized predictions.
          </p>
        )}
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
          <label
            htmlFor={question.id}
            className="block text-md font-medium text-gray-800"
          >
            {question.text}
          </label>
          {question.helpText && (
            <p className="text-sm text-gray-500 mt-1 mb-3">{question.helpText}</p>
          )}
          {renderInput()}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevQuestion}
          disabled={currentSectionIndex === 0 && currentQuestionIndex === 0}
        >
          Back
        </Button>
        <div className="flex gap-2">
          {isOptionalSection && (
            <Button
              variant="ghost"
              onClick={handleSkipSection}
              className="text-gray-500 hover:text-gray-700"
            >
              <SkipForward className="w-4 h-4 mr-1" />
              Skip Section
            </Button>
          )}
          <Button
            size="lg"
            onClick={handleNext}
            disabled={!isOptionalSection && !isAnswered}
            className="bg-[#e0f2f7] text-gray-700 hover:bg-cyan-200 disabled:bg-gray-100 disabled:text-gray-400"
          >
            {isLastQuestionOverall ? "View Results" : "Next"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default QuestionCard;
