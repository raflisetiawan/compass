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
    const tStage = String(answers.cancer_stage || "T2").replace("T", "");
    const gleasonScore = String(answers.gleason_score || "3+4");

    const ageGroup = getAgeGroup(age);
    const psaRange = getPSARange(psa);
    const gradeGroup = getGradeGroup(gleasonScore);
    const result = survivalData.Survival.find(
      (item) =>
        item["Age Group"] === ageGroup &&
        String(item["T Stage"]) === tStage &&
        Number(item["Grade Group"]) === Number(gradeGroup) &&
        item["PSA"] === psaRange
    );
    return result;
  }, [answers]);

  const clinicalParameters: ClinicalParameters = {
    Age: `${answers.age || "65"} years`,
    PSA: `${answers.psa || "8"} ng/mL`,
    "Prostate volume": `${answers.prostate_volume || "60"} mL`,
    "Gleason Score": answers.gleason_score || "3+4",
    "T Stage": answers.cancer_stage || "T2",
    "MRI visibility": answers.mri_visibility || "Visible (Score 4-5)",
    "Maximal Cancer Core Length": "8mm", // Not in questionnaire
    "Nerve sparing": answers.nerve_sparing || "Unknown",
    "Hormone treatment": answers.radiotherapy_hormone || "Unknown",
  };

  const baselineGenitoUrinaryBowelFunction: BaselineFunction = {
    Leakage: answers.urine_leak || "Rarely or never",
    Pad: answers.pad_usage || "No pads",
    "Bother with urinary function": answers.urine_problem || "Not a problem",
    "Erectile function":
      answers.erection_quality || "Sufficient erections for intercourse",
    "Sexual Medication or devices": answers.sex_medication || "None",
    "Bother with erectile function": answers.erection_bother || "Not a problem",
    "Bother with Bowel function": answers.bowel_bother || "Not a problem",
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
          <ResultsDesktopHeader onStartOver={handleStartOver} />

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
