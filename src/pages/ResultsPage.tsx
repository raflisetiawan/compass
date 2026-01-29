import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import survivalData from "@/assets/survival_calculation.json";
import MainLayout from "@/layouts/MainLayout";
import { useQuestionnaireStore } from "@/stores/questionnaireStore";
import { useUserStore } from "@/stores/userStore";
import { getAgeGroup, getPSARange, getGradeGroup } from "@/services/prediction";
import { ResultsMobileHeader } from "@/features/results/components/ResultsMobileHeader";
import { ResultsDesktopHeader } from "@/features/results/components/ResultsDesktopHeader";
import { ResultsSidebar } from "@/features/results/components/ResultsSidebar";
import { FunctionalOutcomesSummary } from "@/features/results/components/FunctionalOutcomesSummary";
import { ResultsModal } from "@/features/results/components/ResultsModal";
import type {
  ClinicalParameters,
  BaselineFunction,
  ModalContentType,
} from "@/types";

const ResultsPage = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [modalContent, setModalContent] = useState<ModalContentType>(null);
  const { user } = useUserStore();
  const { answers, reset, loadInitialData, isLoading } =
    useQuestionnaireStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user, loadInitialData]);

  const handleStartOver = () => {
    reset();
    navigate("/introduction");
  };

  const survivalOutcome = useMemo(() => {
    // If answers are not loaded, the defaults will be used for a preview.

    const age = parseInt(String(answers.age || "65"), 10);
    const psa = parseFloat(String(answers.psa || "8"));
    let tStage = String(answers.cancer_stage || "T2").replace("T", "");
    
    // Apply T-stage fixes
    if (tStage === "4") {
      tStage = "3b"; // Map T4 to 3b as T4 is not in the dataset
    }
    if (tStage === "Unknown") {
      tStage = "2"; // Default to T2 if unknown
    }
    // Handle "T1 or T2" option - use T2 data
    if (tStage === "1 or 2" || tStage.toLowerCase().includes("1 or t2")) {
      tStage = "2";
    }
    
    const gleasonScore = String(answers.gleason_score || "3+4");

    let ageGroup = getAgeGroup(age);
    // Fix: Map age groups 65- and 70- to 60- as the JSON only supports 60-
    if (ageGroup === '65-' || ageGroup === '70-') {
      ageGroup = '60-';
    }
    const psaRange = getPSARange(psa);
    const gradeGroup = getGradeGroup(gleasonScore);
    
    let result = survivalData.Survival.find(
      (item) =>
        item["Age Group"] === ageGroup &&
        String(item["T Stage"]) === tStage &&
        Number(item["Grade Group"]) === Number(gradeGroup) &&
        item["PSA"] === psaRange
    );

    // Fallback: If Grade Group is 1, try using Grade Group 2
    const hasValidData = (data: typeof result) => {
      return data && data["Alive (%)"] !== "" && data["Alive (%)"] != null;
    };

    if (!hasValidData(result)) {
      if (gradeGroup === 1) {
        const fallbackResult = survivalData.Survival.find(
          (item) =>
            item["Age Group"] === ageGroup &&
            String(item["T Stage"]) === tStage &&
            Number(item["Grade Group"]) === 2 &&
            item["PSA"] === psaRange
        );
        if (hasValidData(fallbackResult)) {
          result = fallbackResult;
        }
      }
    }

    return result;
  }, [answers]);

  const clinicalParameters: ClinicalParameters = {
    Age: `${answers.age || "65"} years`,
    PSA: `${answers.psa || "8"} ng/mL`,
    "Prostate volume": `${answers.prostate_volume || "60"} mL`,
    "Gleason score": answers.gleason_score || "3+4",
    "T stage": answers.cancer_stage || "T1 or T2",
    "MRI visibility": answers.mri_visibility || "Visible (Score 4-5)",
    "Maximal cancer core length": answers.max_cancer_core_length ? `${answers.max_cancer_core_length} mm` : "Unknown",
  };

  const baselineGenitoUrinaryBowelFunction: BaselineFunction = {
    Leakage: answers.urine_leak,
    "Urinary pad use": answers.pad_usage,
    "Bother with urinary function": answers.urine_problem,
    "Erectile function": answers.erection_quality,
    "Sexual medication or devices": answers.sex_medication,
    "Bother with erectile function": answers.erection_bother,
    "Problem with bowel urgency": answers.bowel_urgency,
    "Bother with bowel function": answers.bowel_bother,
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="text-lg text-gray-600">Loading your results...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow p-4 md:p-8 bg-gray-50">
          <ResultsMobileHeader
            onModalOpen={setModalContent}
            onStartOver={handleStartOver}
          />
          <ResultsDesktopHeader />

          <div className="flex md:gap-8">
            <ResultsSidebar
              isExpanded={isSidebarExpanded}
              onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
              clinicalParameters={clinicalParameters}
              baselineGenitoUrinaryBowelFunction={
                baselineGenitoUrinaryBowelFunction
              }
            />

            <div
              className={`w-full transition-all duration-300 ${
                isSidebarExpanded ? "md:w-2/3" : "md:w-[calc(100%-5rem)]"
              }`}
            >
              <FunctionalOutcomesSummary survivalOutcome={survivalOutcome} />
            </div>
          </div>
        </main>

        <ResultsModal
          modalContent={modalContent}
          onClose={() => setModalContent(null)}
          clinicalParameters={clinicalParameters}
          baselineGenitoUrinaryBowelFunction={
            baselineGenitoUrinaryBowelFunction
          }
        />
      </div>
    </MainLayout>
  );
};

export default ResultsPage;
