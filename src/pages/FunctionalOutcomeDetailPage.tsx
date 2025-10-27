import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useQuestionnaireStore } from "@/stores/questionnaireStore";
import { useUserStore } from "@/stores/userStore";
import { ResultsSidebar } from "@/features/results/components/ResultsSidebar";
import IconArray from "@/features/results/components/IconArray";
import SurvivalDataTable from "@/features/results/components/SurvivalDataTable";
import { getAgeGroup, getPSARange, getGradeGroup } from "@/services/prediction";
import survivalData from "@/assets/survival_calculation.json";
import type {
  ClinicalParameters,
  BaselineFunction,
  SurvivalData,
  ModalContentType,
} from "@/types";
import { ResultsMobileHeader } from "@/features/results/components/ResultsMobileHeader";
import { ResultsDesktopHeader } from "@/features/results/components/ResultsDesktopHeader";
import { ResultsModal } from "@/features/results/components/ResultsModal";

const FunctionalOutcomeDetailPage = () => {
  const { user } = useUserStore();
  const { answers, reset, loadInitialData, isLoading } =
    useQuestionnaireStore();
  const navigate = useNavigate();
  const [modalContent, setModalContent] = useState<ModalContentType>(null);
  const { outcome } = useParams<{ outcome: string }>();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user, loadInitialData]);

  const title = outcome
    ? outcome
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "Functional Outcome Detail";

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

  const survivalOutcome = useMemo(() => {
    const age = parseInt(String(answers.age || "65"), 10);
    const psa = parseFloat(String(answers.psa || "8"));
    const tStage = String(answers.cancer_stage || "T2").replace("T", "");
    const gleasonScore = String(answers.gleason_score || "3+4");

    const ageGroup = getAgeGroup(age);
    const psaRange = getPSARange(psa);
    const gradeGroup = getGradeGroup(gleasonScore);

    const result = (survivalData.Survival as SurvivalData[]).find(
      (item) =>
        item["Age Group"] === ageGroup &&
        String(item["T Stage"]) === tStage &&
        item["Grade Group"] === gradeGroup &&
        item["PSA"] === psaRange
    );

    return result;
  }, [answers]);

  const iconArrayData = useMemo(() => {
    if (!survivalOutcome) return [];

    let alive = Math.round(Number(survivalOutcome["Alive (%)"]));
    const pcaDeath = Math.round(Number(survivalOutcome["PCa Death (%)"]));
    const otherDeath = Math.round(Number(survivalOutcome["Other Death (%)"]));

    const total = alive + pcaDeath + otherDeath;
    if (total !== 100) {
      alive -= total - 100;
    }

    return [
      { name: "Alive", value: alive, color: "#8BC34A" },
      {
        name: "Death (from prostate cancer)",
        value: pcaDeath,
        color: "#F44336",
      },
      {
        name: "Death (from other causes)",
        value: otherDeath,
        color: "#9E9E9E",
      },
    ];
  }, [survivalOutcome]);

  const handleStartOver = () => {
    reset();
    navigate("/introduction");
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="text-lg text-gray-600">Loading details...</p>
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
              <Button asChild variant="outline" className="mb-4">
                <Link to="/results">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Detail
                </Link>
              </Button>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl font-bold">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    The following graph represents 100 men with the same
                    characteristics that you have indicated. The icon plot shows
                    what happens those men after 5 years from receiving their
                    diagnosis of prostate cancer.
                  </p>
                  <IconArray data={iconArrayData} />
                  <h3 className="font-bold mt-6 mb-2 text-lg">Table</h3>
                  <SurvivalDataTable data={survivalOutcome} />
                  <h3 className="font-bold mt-6 mb-2 text-lg">Summary</h3>
                  {iconArrayData.length > 0 && (
                    <div className="text-sm text-gray-600 space-y-2">
                      <p>Based on the information you have entered:</p>
                      <ul className="list-disc list-inside pl-4">
                        <li>
                          {iconArrayData[0].value}% of men who are diagnosed
                          with prostate cancer in the UK will be alive at 5
                          years.
                        </li>
                        <li>
                          {iconArrayData[1].value}% of men will have died from
                          prostate cancer.
                        </li>
                        <li>
                          {iconArrayData[2].value}% of men will have died from
                          causes that are not related to prostate cancer.
                        </li>
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
      <ResultsModal
        modalContent={modalContent}
        onClose={() => setModalContent(null)}
        clinicalParameters={clinicalParameters}
        baselineGenitoUrinaryBowelFunction={baselineGenitoUrinaryBowelFunction}
      />
    </MainLayout>
  );
};

export default FunctionalOutcomeDetailPage;
