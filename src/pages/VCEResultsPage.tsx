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
  somewhat: "Somewhat important",
  very: "Very Important",
};

// Priority order for sorting: very (highest) > somewhat > less > null (lowest)
const IMPORTANCE_ORDER = {
  very: 0,
  somewhat: 1,
  less: 2,
  null: 3,
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
    navigate("/vce/intro");
  };

  const handleDownload = () => {
    // TODO: Implement PDF download
    console.log("Download functionality to be implemented");
  };

  const handleNext = () => {
    navigate("/treatment-options/definition");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#e0f2f7]">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between">
        <h6 className="text-2xl font-bold text-gray-800">Results</h6>
        <div className="flex gap-3">
          <button
            onClick={handleStartOver}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            START OVER
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Download className="w-4 h-4" />
            DOWNLOAD
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="grow px-6 pb-6">
        <div className="w-full max-w-5xl mx-auto bg-white rounded-lg shadow-md">
          <div className="pt-6 pb-4 text-center">
            <BeSpokeLogo />
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              <span className="ml-3 text-gray-500">Loading your answers...</span>
            </div>
          ) : (
          <div className="px-8 pb-8 border-t border-gray-200">
            {/* Intro Section */}
            <div className="py-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 mb-2">
                What is most important to me?
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Now we are going to ask you to consider a series of statements. These statements represent a variety of aspects of different prostate cancer treatments.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed mt-1">
                This is a value exercise that is meant to help you reflect on what is important to you. There is no right or wrong answer.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed mt-1">
                You might like to share your answers with your clinician so that they can help you choose a treatment that best matches your preferences.
              </p>
            </div>

            {/* Question 1: Treatment Philosophy */}
            <div className="py-6 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-gray-600">Questions</span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-medium">
                  1
                </span>
                <span className="text-sm text-gray-500">of 3</span>
              </div>
              
              <h3 className="text-base font-semibold text-gray-800 mb-4">
                What is most important to me?
              </h3>
              
              <div className="bg-[#f0f4f8] rounded-lg p-4 mb-4">
                <p className="font-semibold text-gray-800">
                  For some patients, it is possible to choose between monitoring the cancer or actively treating it.
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  Which of these statements best reflects how you feel?
                </p>
              </div>

              {/* Option A */}
              <div className={`flex items-center justify-between p-4 mb-2 rounded-lg border border-gray-200 ${
                treatmentPhilosophy === "active" ? "bg-[#E8F4F8]" : "bg-white"
              }`}>
                <p className="text-gray-700 text-sm">
                  I would like to actively do something to treat my prostate cancer, even if I may have some side effects
                </p>
                <div className="w-24 flex justify-center">
                  {treatmentPhilosophy === "active" && (
                    <CheckCircle2 className="w-6 h-6 text-gray-500" />
                  )}
                </div>
              </div>

              {/* Option B */}
              <div className={`flex items-center justify-between p-4 rounded-lg border border-gray-200 ${
                treatmentPhilosophy === "monitoring" ? "bg-[#E8F4F8]" : "bg-white"
              }`}>
                <p className="text-gray-700 text-sm">
                  I would like to hold off having treatment for as long as it is safe to do so
                </p>
                <div className="w-24 flex justify-center">
                  {treatmentPhilosophy === "monitoring" && (
                    <CheckCircle2 className="w-6 h-6 text-gray-500" />
                  )}
                </div>
              </div>
            </div>

            {/* Question 2: Side Effects Importance */}
            <div className="py-6 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-gray-600">Questions</span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-medium">
                  2
                </span>
                <span className="text-sm text-gray-500">of 3</span>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-[1fr_120px_150px_120px] gap-0 mb-2 bg-[#F0F8FA] p-3">
                <div className="text-sm">
                  <p className="font-semibold text-gray-800">
                    Different prostate cancer treatments can have different side effects.
                  </p>
                  <p className="text-gray-600 text-xs mt-1">
                    If possible, how important is it to you to avoid the following?
                  </p>
                </div>
                {IMPORTANCE_COLUMNS.map((col) => (
                  <div key={col} className="text-center text-sm font-medium text-gray-600 bg-[#F0F8FA] py-2 flex items-center justify-center">
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

              {/* Most Important Side Effect Selection */}
              <div className="mt-4 p-4 bg-[#f0f8fa] border border-gray-200 rounded-lg">
                <p className="text-gray-800 font-medium mb-2">
                  If you had to choose one side effect <span className="underline">you would most like to avoid</span>, which would it be?
                </p>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  <span className="text-gray-700">
                    {mostImportantSideEffect
                      ? SIDE_EFFECTS_QUESTIONS.find((q) => q.key === mostImportantSideEffect)?.label || "Not selected"
                      : "Not selected"}
                  </span>
                </div>
              </div>
            </div>

            {/* Question 3: Logistics Importance */}
            <div className="py-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-gray-600">Questions</span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-medium">
                  3
                </span>
                <span className="text-sm text-gray-500">of 3</span>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-[1fr_120px_150px_120px] gap-0 mb-2 bg-[#F0F8FA] p-3">
                <div className="text-sm">
                  <p className="font-semibold text-gray-800">
                    Some treatments require time away from your usual activities (work, caring for others, social activities, etc) or multiple visits to the hospital.
                  </p>
                  <p className="text-gray-600 text-xs mt-1">
                    If possible, how important is it to you to avoid the following?
                  </p>
                </div>
                {IMPORTANCE_COLUMNS.map((col) => (
                  <div key={col} className="text-center text-sm font-medium text-gray-600  py-2 flex items-center justify-center">
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

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4 border-t border-gray-200">
              <button
                onClick={() => navigate("/vce/questions")}
                className="px-8 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="px-8 py-2 text-sm font-semibold text-black bg-[#C2E2E9] rounded-lg hover:bg-[#a8d4de] transition-colors"
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
