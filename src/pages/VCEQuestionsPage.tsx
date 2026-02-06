import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import BeSpokeLogo from "../components/BeSpokeLogo";
import Footer from "../components/Footer";
import { useVceStore, type ImportanceLevel, type SideEffectKey } from "../stores/vceStore";

const IMPORTANCE_OPTIONS: { value: ImportanceLevel; label: string }[] = [
  { value: "less", label: "Less Important" },
  { value: "somewhat", label: "Somewhat important" },
  { value: "very", label: "Very Important" },
];

const SIDE_EFFECTS_QUESTIONS = [
  { key: "urinaryLeakage" as const, label: "Urinary leakage (including wearing pads)" },
  { key: "urinaryFrequency" as const, label: "Passing urine frequently or having to rush to the toilet" },
  { key: "bowelMovements" as const, label: "Problems with my bowel movements (urgency, discomfort)" },
  { key: "reducedEnergy" as const, label: "Reduced energy levels, mood swings or reduced sex drive" },
  { key: "erectileProblems" as const, label: "Problems with erections" },
];

const LOGISTICS_QUESTIONS = [
  { key: "dailyHospitalTravel" as const, label: "Travelling to the hospital every day for several weeks" },
  { key: "distantHospitalTravel" as const, label: "Travelling to a distant hospital a few times to receive a specific treatment" },
  { key: "timeAwayFromActivities" as const, label: "Taking time away from usual activities (work, caring for others, social activities, etc)" },
];

const VCEQuestionsPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  
  const {
    sideEffectsImportance,
    logisticsImportance,
    mostImportantSideEffect,
    isSaving,
    setTreatmentPhilosophy,
    setSideEffectImportance,
    setLogisticsImportance,
    setMostImportantSideEffect,
    saveVceAnswers,
  } = useVceStore();

  const handleTreatmentSelect = (option: "active" | "monitoring") => {
    setTreatmentPhilosophy(option);
    setCurrentStep(2);
  };

  const handleBackToQuestionnaire = () => {
    navigate("/questionnaire");
  };

  const handleBackToStep1 = () => {
    setCurrentStep(1);
  };

  const handleBackToStep2 = () => {
    setCurrentStep(2);
  };

  const handleSideEffectsNext = () => {
    setCurrentStep(3);
  };

  const handleLogisticsNext = async () => {
    await saveVceAnswers();
    navigate("/vce/results");
  };

  const isSideEffectsComplete = Object.values(sideEffectsImportance).every(
    (value) => value !== null
  ) && mostImportantSideEffect !== null;

  const isLogisticsComplete = Object.values(logisticsImportance).every(
    (value) => value !== null
  );

  const totalSteps = 3;

  return (
    <div className="flex flex-col min-h-screen bg-[#e0f2f7] p-4 sm:p-6 lg:p-8">
      <main className="grow flex items-center justify-center">
        <div className="w-full max-w-5xl bg-white rounded-lg shadow-md">
          <div className="pt-6 pb-4 text-center">
            <BeSpokeLogo />
          </div>
          <hr className="w-full" />
          <div className="p-6 sm:p-8">
            {/* Progress indicator */}
            <div className="mb-6">
              <p className="font-semibold text-gray-800">Questions</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-sm font-medium">
                  {currentStep}
                </span>
                <span className="text-gray-500 text-sm">of {totalSteps}</span>
              </div>
            </div>

            {/* Step 1: Treatment Philosophy */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-800">
                  What is most important to me?
                </h2>
                
                <div className="bg-[#f0f4f8] rounded-lg p-4 space-y-2">
                  <p className="font-semibold text-gray-800">
                    For some patients, it is possible to choose between monitoring the cancer or actively treating it.
                  </p>
                  <p className="text-gray-600 text-sm">
                    Which of these statements best reflects how you feel?
                  </p>
                </div>

                {/* Option A */}
                <div
                  className="relative border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-[#F0F8FA] transition-colors"
                  onMouseEnter={() => setHoveredOption("active")}
                  onMouseLeave={() => setHoveredOption(null)}
                  onClick={() => handleTreatmentSelect("active")}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <span className="text-blue-600 font-medium">A.</span>
                      <p className="text-gray-700">
                        I would like to actively do something to treat my prostate cancer, even if I may have some side effects
                      </p>
                    </div>
                    {hoveredOption === "active" && (
                      <button className="ml-4 px-4 py-1 text-sm font-medium text-black bg-[#C2E2E9] rounded-md hover:bg-[#a8d4de] transition-colors whitespace-nowrap">
                        Select
                      </button>
                    )}
                  </div>
                </div>

                {/* Option B */}
                <div
                  className="relative border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-[#F0F8FA] transition-colors"
                  onMouseEnter={() => setHoveredOption("monitoring")}
                  onMouseLeave={() => setHoveredOption(null)}
                  onClick={() => handleTreatmentSelect("monitoring")}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <span className="text-blue-600 font-medium">B.</span>
                      <p className="text-gray-700">
                        I would like to hold off having treatment for as long as it is safe to do so
                      </p>
                    </div>
                    {hoveredOption === "monitoring" && (
                      <button className="ml-4 px-4 py-1 text-sm font-medium text-black bg-[#C2E2E9] rounded-md hover:bg-[#a8d4de] transition-colors whitespace-nowrap">
                        Select
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex justify-start pt-4">
                  <button
                    onClick={handleBackToQuestionnaire}
                    className="px-8 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Side Effects Importance */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="bg-[#f0f4f8] rounded-lg p-4 space-y-2">
                  <p className="font-semibold text-gray-800">
                    Different prostate cancer treatments can have different side effects.
                  </p>
                  <p className="text-gray-600 text-sm">
                    If possible, how important is it to you to avoid the following?
                  </p>
                </div>

                {SIDE_EFFECTS_QUESTIONS.map((question) => (
                  <div
                    key={question.key}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <p className="text-gray-800 font-medium mb-3">
                      {question.label}
                    </p>
                    <div className="flex flex-wrap gap-6">
                      {IMPORTANCE_OPTIONS.map((option) => (
                        <label
                          key={option.value}
                          className="flex flex-col items-center gap-1 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name={question.key}
                            value={option.value || ""}
                            checked={sideEffectsImportance[question.key] === option.value}
                            onChange={() =>
                              setSideEffectImportance(question.key, option.value)
                            }
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-600">
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Dropdown for most important side effect */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-[#f0f8fa] p-4">
                    <p className="text-gray-800 font-medium">
                      If you had to choose one side effect <span className="underline">you would most like to avoid</span>, which would it be?
                    </p>
                  </div>
                  <div className="p-4 bg-white">
                    <div className="relative">
                      <select
                        value={mostImportantSideEffect || ""}
                        onChange={(e) => setMostImportantSideEffect(e.target.value as SideEffectKey || null)}
                        className="w-full p-3 pr-10 border border-gray-300 rounded-lg text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer appearance-none"
                      >
                        <option value="">Select an option...</option>
                        {SIDE_EFFECTS_QUESTIONS.map((question) => (
                          <option key={question.key} value={question.key}>
                            {question.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between pt-4">
                  <button
                    onClick={handleBackToStep1}
                    className="px-8 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSideEffectsNext}
                    disabled={!isSideEffectsComplete}
                    className={`px-8 py-2 text-sm font-semibold rounded-lg transition-colors ${
                      isSideEffectsComplete
                        ? "bg-[#C2E2E9] text-black hover:bg-[#a8d4de]"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Logistics Importance */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="bg-[#f0f4f8] rounded-lg p-4 space-y-2">
                  <p className="font-semibold text-gray-800">
                    Some treatments require time away from your usual activities (work, caring for others, social activities, etc) or multiple visits to the hospital.
                  </p>
                  <p className="text-gray-600 text-sm">
                    If possible, how important is it to you to avoid the following?
                  </p>
                </div>

                {LOGISTICS_QUESTIONS.map((question) => (
                  <div
                    key={question.key}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <p className="text-gray-800 font-medium mb-3">
                      {question.label}
                    </p>
                    <div className="flex flex-wrap gap-6">
                      {IMPORTANCE_OPTIONS.map((option) => (
                        <label
                          key={option.value}
                          className="flex flex-col items-center gap-1 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name={question.key}
                            value={option.value || ""}
                            checked={logisticsImportance[question.key] === option.value}
                            onChange={() =>
                              setLogisticsImportance(question.key, option.value)
                            }
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-600">
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex justify-between pt-4">
                  <button
                    onClick={handleBackToStep2}
                    className="px-8 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleLogisticsNext}
                    disabled={!isLogisticsComplete || isSaving}
                    className={`px-8 py-2 text-sm font-semibold rounded-lg transition-colors ${
                      isLogisticsComplete && !isSaving
                        ? "bg-[#C2E2E9] text-black hover:bg-[#a8d4de]"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {isSaving ? "Saving..." : "Next"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VCEQuestionsPage;
