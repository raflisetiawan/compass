import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, RotateCcw, Download, Loader2 } from "lucide-react";
import BeSpokeLogo from "../components/BeSpokeLogo";
import Footer from "../components/Footer";
import { useVceStore } from "../stores/vceStore";

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

const IMPORTANCE_COLUMNS = ["less", "somewhat", "very"] as const;
const IMPORTANCE_LABELS = {
  less: "Less Important",
  somewhat: "Somewhat Important",
  very: "Very Important",
};

const IMPORTANCE_LABELS_SHORT = {
  less: "Less",
  somewhat: "Somewhat",
  very: "Very",
};

// Priority order for sorting: very (highest) > somewhat > less > null (lowest)
const IMPORTANCE_ORDER = {
  very: 0,
  somewhat: 1,
  less: 2,
  null: 3,
};

// Mobile card component for importance rating display
interface ImportanceRatingCardProps {
  label: string;
  selectedValue: "less" | "somewhat" | "very" | null;
}

const ImportanceRatingCard = ({ label, selectedValue }: ImportanceRatingCardProps) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3">
      <p className="text-sm text-gray-800 font-medium mb-3">{label}</p>
      <div className="flex gap-2">
        {IMPORTANCE_COLUMNS.map((col) => (
          <div
            key={col}
            className={`flex-1 py-2 px-1 rounded-lg text-center text-xs font-medium transition-colors ${
              selectedValue === col
                ? "bg-[#C2E2E9] text-gray-800"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              {selectedValue === col ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
              )}
              <span className="leading-tight">{IMPORTANCE_LABELS_SHORT[col]}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const VCEResultsPage = () => {
  const navigate = useNavigate();
  const {
    treatmentPhilosophy,
    sideEffectsImportance,
    logisticsImportance,
    mostImportantSideEffect,
    isLoading,
    loadVceAnswers,
    reset,
  } = useVceStore();

  // Load VCE answers from Firebase on mount
  useEffect(() => {
    loadVceAnswers();
  }, [loadVceAnswers]);

  // Sort side effects questions by importance (very important first)
  const sortedSideEffectsQuestions = [...SIDE_EFFECTS_QUESTIONS].sort((a, b) => {
    const aValue = sideEffectsImportance[a.key];
    const bValue = sideEffectsImportance[b.key];
    return IMPORTANCE_ORDER[aValue ?? "null"] - IMPORTANCE_ORDER[bValue ?? "null"];
  });

  // Sort logistics questions by importance (very important first)
  const sortedLogisticsQuestions = [...LOGISTICS_QUESTIONS].sort((a, b) => {
    const aValue = logisticsImportance[a.key];
    const bValue = logisticsImportance[b.key];
    return IMPORTANCE_ORDER[aValue ?? "null"] - IMPORTANCE_ORDER[bValue ?? "null"];
  });

  const handleStartOver = () => {
    reset();
    navigate("/vce/questions");
  };

  const handleDownload = () => {
    // TODO: Implement PDF download
    console.log("Download functionality to be implemented");
  };

  const handleNext = () => {
    navigate("/functional-outcome/survival-after-prostate-cancer-treatment");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#e0f2f7]">
      {/* Header */}
      <header className="px-4 sm:px-6 py-4 flex items-center justify-between">
        <h6 className="text-xl sm:text-2xl font-bold text-gray-800">Results</h6>
      </header>

      {/* Main Content */}
      <main className="grow px-3 sm:px-6 pb-6">
        <div className="w-full max-w-5xl mx-auto bg-white rounded-lg shadow-md">
          <div className="pt-4 sm:pt-6 pb-3 sm:pb-4 text-center">
            <BeSpokeLogo />
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-16 sm:py-20">
              <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-gray-400" />
              <span className="ml-3 text-gray-500 text-sm sm:text-base">Loading your answers...</span>
            </div>
          ) : (
          <div className="px-4 sm:px-8 pb-6 sm:pb-8 border-t border-gray-200">
            {/* Intro Section */}
            <div className="py-4 sm:py-6 border-b border-gray-200">
              <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-2">
                What is most important to me?
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Now we are going to ask you to consider a series of statements. These statements represent a variety of aspects of different prostate cancer treatments.
              </p>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mt-1">
                This is a value exercise that is meant to help you reflect on what is important to you. There is no right or wrong answer.
              </p>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mt-1">
                You might like to share your answers with your clinician so that they can help you choose a treatment that best matches your preferences.
              </p>
            </div>

            {/* Question 1: Treatment Philosophy */}
            <div className="py-4 sm:py-6 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs sm:text-sm font-semibold text-gray-600">Questions</span>
              </div>
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-medium">
                  1
                </span>
                <span className="text-xs sm:text-sm text-gray-500">of 3</span>
              </div>
              
              <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3 sm:mb-4">
                What is most important to me?
              </h3>
              
              <div className="bg-[#f0f4f8] rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                <p className="font-semibold text-gray-800 text-sm sm:text-base">
                  For some patients, it is possible to choose between monitoring the cancer or actively treating it.
                </p>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">
                  Which of these statements best reflects how you feel?
                </p>
              </div>

              {/* Option A */}
              <div className={`flex items-start sm:items-center gap-3 p-3 sm:p-4 mb-2 rounded-lg border border-gray-200 ${
                treatmentPhilosophy === "active" ? "bg-[#E8F4F8]" : "bg-white"
              }`}>
                <p className="text-gray-700 text-xs sm:text-sm flex-1">
                  I would like to actively do something to treat my prostate cancer, even if I may have some side effects
                </p>
                <div className="flex-shrink-0 w-6 sm:w-8 flex justify-center">
                  {treatmentPhilosophy === "active" && (
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                  )}
                </div>
              </div>

              {/* Option B */}
              <div className={`flex items-start sm:items-center gap-3 p-3 sm:p-4 rounded-lg border border-gray-200 ${
                treatmentPhilosophy === "monitoring" ? "bg-[#E8F4F8]" : "bg-white"
              }`}>
                <p className="text-gray-700 text-xs sm:text-sm flex-1">
                  I would like to hold off having treatment for as long as it is safe to do so
                </p>
                <div className="flex-shrink-0 w-6 sm:w-8 flex justify-center">
                  {treatmentPhilosophy === "monitoring" && (
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                  )}
                </div>
              </div>
            </div>

            {/* Question 2: Side Effects Importance */}
            <div className="py-4 sm:py-6 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs sm:text-sm font-semibold text-gray-600">Questions</span>
              </div>
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-medium">
                  2
                </span>
                <span className="text-xs sm:text-sm text-gray-500">of 3</span>
              </div>

              {/* Question Header */}
              <div className="bg-[#F0F8FA] rounded-lg p-3 sm:p-4 mb-4">
                <p className="font-semibold text-gray-800 text-sm sm:text-base">
                  Different prostate cancer treatments can have different side effects.
                </p>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">
                  If possible, how important is it to you to avoid the following?
                </p>
              </div>

              {/* Mobile: Card-based layout */}
              <div className="block md:hidden">
                {sortedSideEffectsQuestions.map((question) => (
                  <ImportanceRatingCard
                    key={question.key}
                    label={question.label}
                    selectedValue={sideEffectsImportance[question.key]}
                  />
                ))}
              </div>

              {/* Desktop: Table layout */}
              <div className="hidden md:block">
                {/* Table Header */}
                <div className="grid grid-cols-[1fr_120px_150px_120px] gap-0 mb-2 bg-[#F0F8FA] p-3 rounded-t-lg">
                  <div className="text-sm font-medium text-gray-600">Side Effect</div>
                  {IMPORTANCE_COLUMNS.map((col) => (
                    <div key={col} className="text-center text-sm font-medium text-gray-600 py-2 flex items-center justify-center">
                      {IMPORTANCE_LABELS[col]}
                    </div>
                  ))}
                </div>

                {/* Table Rows */}
                {sortedSideEffectsQuestions.map((question) => (
                  <div key={question.key} className="grid grid-cols-[1fr_120px_150px_120px] gap-0 border-t border-gray-100">
                    <div className="text-sm text-gray-700 py-3">{question.label}</div>
                    {IMPORTANCE_COLUMNS.map((col) => (
                      <div
                        key={col}
                        className={`flex justify-center items-center py-3 ${
                          sideEffectsImportance[question.key] === col
                            ? "bg-[#C2E2E9]"
                            : ""
                        }`}
                      >
                        {sideEffectsImportance[question.key] === col ? (
                          <CheckCircle2 className="w-5 h-5 text-gray-500" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Most Important Side Effect Selection */}
              <div className="mt-4 p-3 sm:p-4 bg-[#f0f8fa] border border-gray-200 rounded-lg">
                <p className="text-gray-800 font-medium text-xs sm:text-sm mb-2">
                  If you had to choose one side effect <span className="underline">you would most like to avoid</span>, which would it be?
                </p>
                <div className="flex items-start sm:items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                  <span className="text-gray-700 text-xs sm:text-sm">
                    {mostImportantSideEffect
                      ? SIDE_EFFECTS_QUESTIONS.find((q) => q.key === mostImportantSideEffect)?.label || "Not selected"
                      : "Not selected"}
                  </span>
                </div>
              </div>
            </div>

            {/* Question 3: Logistics Importance */}
            <div className="py-4 sm:py-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs sm:text-sm font-semibold text-gray-600">Questions</span>
              </div>
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-medium">
                  3
                </span>
                <span className="text-xs sm:text-sm text-gray-500">of 3</span>
              </div>

              {/* Question Header */}
              <div className="bg-[#F0F8FA] rounded-lg p-3 sm:p-4 mb-4">
                <p className="font-semibold text-gray-800 text-sm sm:text-base">
                  Some treatments require time away from your usual activities (work, caring for others, social activities, etc) or multiple visits to the hospital.
                </p>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">
                  If possible, how important is it to you to avoid the following?
                </p>
              </div>

              {/* Mobile: Card-based layout */}
              <div className="block md:hidden">
                {sortedLogisticsQuestions.map((question) => (
                  <ImportanceRatingCard
                    key={question.key}
                    label={question.label}
                    selectedValue={logisticsImportance[question.key]}
                  />
                ))}
              </div>

              {/* Desktop: Table layout */}
              <div className="hidden md:block">
                {/* Table Header */}
                <div className="grid grid-cols-[1fr_120px_150px_120px] gap-0 mb-2 bg-[#F0F8FA] p-3 rounded-t-lg">
                  <div className="text-sm font-medium text-gray-600">Activity</div>
                  {IMPORTANCE_COLUMNS.map((col) => (
                    <div key={col} className="text-center text-sm font-medium text-gray-600 py-2 flex items-center justify-center">
                      {IMPORTANCE_LABELS[col]}
                    </div>
                  ))}
                </div>

                {/* Table Rows */}
                {sortedLogisticsQuestions.map((question) => (
                  <div key={question.key} className="grid grid-cols-[1fr_120px_150px_120px] gap-0 border-t border-gray-100">
                    <div className="text-sm text-gray-700 py-3">{question.label}</div>
                    {IMPORTANCE_COLUMNS.map((col) => (
                      <div
                        key={col}
                        className={`flex justify-center items-center py-3 ${
                          logisticsImportance[question.key] === col
                            ? "bg-[#C2E2E9]"
                            : ""
                        }`}
                      >
                        {logisticsImportance[question.key] === col ? (
                          <CheckCircle2 className="w-5 h-5 text-gray-500" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => navigate("/vce/questions")}
                className="flex-1 sm:flex-none px-4 sm:px-8 py-2.5 sm:py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="flex-1 sm:flex-none px-4 sm:px-8 py-2.5 sm:py-2 text-sm font-semibold text-black bg-[#C2E2E9] rounded-lg hover:bg-[#a8d4de] active:bg-[#94c9d4] transition-colors"
              >
                Next
              </button>
            </div>
          </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VCEResultsPage;
