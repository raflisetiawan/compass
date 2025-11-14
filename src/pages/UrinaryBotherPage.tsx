import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Info } from "lucide-react";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useQuestionnaireStore } from "@/stores/questionnaireStore";
import { useUserStore } from "@/stores/userStore";
import { ResultsSidebar } from "@/features/results/components/ResultsSidebar";
import IconArray from "@/features/results/components/IconArray";
import urinaryBotherData from "@/assets/urinary_bother.json";
import type {
  ClinicalParameters,
  BaselineFunction,
  ModalContentType,
} from "@/types";
import { ResultsMobileHeader } from "@/features/results/components/ResultsMobileHeader";
import { ResultsDesktopHeader } from "@/features/results/components/ResultsDesktopHeader";
import { ResultsModal } from "@/features/results/components/ResultsModal";
import { TreatmentCategoryLegend } from "@/features/results/components/TreatmentCategoryLegend";
import { IconLegendModal } from "@/features/results/components/IconLegendModal";
import UrinaryBotherTable from "@/features/results/components/UrinaryBotherTable";
import HappyFace from "@/components/icons/HappyFace";
import NeutralFace from "@/components/icons/NeutralFace";
import SadFace from "@/components/icons/SadFace";

type UrinaryBotherOutcome = {
  N: number;
  "No problem": number;
  "Very/small problem": number;
  "Moderate/big problem": number;
};

type TreatmentData = {
  [key: string]: {
    Total: number;
    "No problem": number;
    "Very/small problem": number;
    "Moderate/big problem": number;
    "Baseline urinary bother": {
      "No problem": UrinaryBotherOutcome;
      "Very/small problem": UrinaryBotherOutcome;
      "Moderate/big problem": UrinaryBotherOutcome;
    };
  };
};

const UrinaryBotherPage = () => {
  const { user } = useUserStore();
  const { answers, loadInitialData, isLoading, reset } =
    useQuestionnaireStore();
  const navigate = useNavigate();
  const [modalContent, setModalContent] = useState<ModalContentType>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isCategoryLegendOpen, setIsCategoryLegendOpen] = useState(false);
  const [legendModalData, setLegendModalData] = useState<{
    name: string;
    data: {
      name: string;
      value: number;
      color: string;
      Icon: React.ElementType;
    }[];
  } | null>(null);

  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user, loadInitialData]);

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

  const baselineBotherStatus = useMemo(() => {
    const bother = answers.urine_problem || "Not a problem";
    if (String(bother).includes("Moderate") || String(bother).includes("big"))
      return "Moderate/big problem";
    if (String(bother).includes("Very") || String(bother).includes("small"))
      return "Very/small problem";
    return "No problem";
  }, [answers.urine_problem]);

  const treatmentOutcomes = useMemo(() => {
    const data: TreatmentData = urinaryBotherData;
    const treatments = [
      "Active Surveillance",
      "Focal Therapy",
      "Surgery",
      "Radiotherapy",
    ];

    return treatments.map((treatment) => {
      const treatmentData =
        data[treatment]["Baseline urinary bother"][baselineBotherStatus];
      let noProblem = Math.round(treatmentData["No problem"]);
      const smallProblem = Math.round(treatmentData["Very/small problem"]);
      const bigProblem = Math.round(treatmentData["Moderate/big problem"]);

      const total = noProblem + smallProblem + bigProblem;
      if (total !== 100) {
        noProblem -= total - 100;
      }

      return {
        name: treatment,
        data: [
          {
            name: "No problem",
            value: noProblem,
            color: "#28a745",
            Icon: HappyFace,
          },
          {
            name: "Very small or small problem",
            value: smallProblem,
            color: "#ffc107",
            Icon: NeutralFace,
          },
          {
            name: "Moderate or big problem",
            value: bigProblem,
            color: "#dc3545",
            Icon: SadFace,
          },
        ],
      };
    });
  }, [baselineBotherStatus]);

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

  const Legend = () => (
    <div className="mb-6  p-4 rounded-lg">
      <h3 className="font-bold mb-2 text-lg">Legend</h3>
      <div className="flex flex-col space-y-2">
        <div className="flex items-center">
          <HappyFace size={24} />
          <span className="ml-2">No problem</span>
        </div>
        <div className="flex items-center">
          <NeutralFace size={24} />
          <span className="ml-2">Very small or small problem</span>
        </div>
        <div className="flex items-center">
          <SadFace size={24} />
          <span className="ml-2">Moderate or big problem</span>
        </div>
      </div>
    </div>
  );

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
                  Back to Results
                </Link>
              </Button>
              <Card>
                <CardHeader>
                  <div className="flex items-center">
                    <CardTitle className="text-2xl font-bold">
                      Bother with urinary function at 1 year
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsCategoryLegendOpen(true)}
                      className="ml-2"
                    >
                      <Info className="h-5 w-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    The following graphs represent 100 men with the same degree
                    of bother with their urinary function as you. The icon plot
                    shows how the degree of their urinary bother changes at 1
                    year from starting their prostate cancer treatment.
                  </p>

                  <div className="border-2 border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="font-bold mb-2 text-lg">
                      Your current urinary bother status:
                    </h3>
                    <div className="flex items-center bg-pink-100 p-2 rounded">
                      {baselineBotherStatus === "No problem" && (
                        <HappyFace size={24} />
                      )}
                      {baselineBotherStatus === "Very/small problem" && (
                        <NeutralFace size={24} />
                      )}
                      {baselineBotherStatus === "Moderate/big problem" && (
                        <SadFace size={24} />
                      )}
                      <span className="ml-2">
                        {answers.urine_problem || "Not a problem"}
                      </span>
                    </div>
                  </div>

                  <Legend />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {treatmentOutcomes.map((treatment) => (
                      <div
                        key={treatment.name}
                        onClick={() => setLegendModalData(treatment)}
                        className="cursor-pointer"
                      >
                        <h3 className="font-bold text-xl mb-2 text-center">
                          {treatment.name}
                        </h3>
                        <IconArray data={treatment.data} />
                      </div>
                    ))}
                  </div>
                  <h3 className="font-bold mt-6 mb-2 text-lg">Table</h3>
                  <UrinaryBotherTable data={treatmentOutcomes} />
                  <h3 className="font-bold mt-6 mb-2 text-lg">Summary</h3>
                  <div className="text-sm text-gray-600 space-y-4">
                    <p>
                      Based on the information you have entered, for men who are
                      currently experiencing{" "}
                      <span className="font-semibold">
                        {baselineBotherStatus.toLowerCase()}
                      </span>
                      , the outcomes at 1 year after treatment are:
                    </p>
                    {treatmentOutcomes.map((treatment) => (
                      <div key={treatment.name}>
                        <p className="font-semibold">
                          For men who choose {treatment.name}:
                        </p>
                        <ul className="list-disc list-inside pl-4">
                          {treatment.data.map((outcome) => (
                            <li key={outcome.name}>
                              {outcome.value}% will experience{" "}
                              {outcome.name.toLowerCase()}.
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
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
      <TreatmentCategoryLegend
        isOpen={isCategoryLegendOpen}
        onClose={() => setIsCategoryLegendOpen(false)}
      />
      {legendModalData && (
        <IconLegendModal
          isOpen={!!legendModalData}
          onClose={() => setLegendModalData(null)}
          title={`Legend for ${legendModalData.name}`}
          legendData={legendModalData.data.map((d) => ({
            ...d,
            Icon: d.Icon,
          }))}
        />
      )}
    </MainLayout>
  );
};

export default UrinaryBotherPage;
