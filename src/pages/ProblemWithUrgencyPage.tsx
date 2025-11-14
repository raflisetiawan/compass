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
import problemWithUrgencyData from "@/assets/problem_with_bowel_urgency.json";
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
import ProblemWithUrgencyTable from "@/features/results/components/ProblemWithUrgencyTable";
import WaterClosetOutlined from "@/components/icons/WaterClosetOutlined";
import WaterClosetGray from "@/components/icons/WaterClosetGray";
import WaterClosetBlack from "@/components/icons/WaterClosetBlack";

type UrgencyOutcome = {
  N: number;
  "No_problem_%": number;
  "Very_small_problem_%": number;
  "Moderate_big_problem_%": number;
};

type TreatmentData = {
  [key: string]: {
    Baseline: {
      No_problem: UrgencyOutcome;
      Very_small_problem: UrgencyOutcome;
      Moderate_big_problem: UrgencyOutcome;
    };
  };
};

const ProblemWithUrgencyPage = () => {
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

  const baselineStatus = useMemo(() => {
    const urgency = answers.bowel_urgency || "No problem";
    if (urgency === "No problem") return "No_problem";
    if (urgency === "Very small" || urgency === "Small")
      return "Very_small_problem";
    if (urgency === "Moderate" || urgency === "Big problem")
      return "Moderate_big_problem";
    return "No_problem";
  }, [answers.bowel_urgency]);

  const treatmentOutcomes = useMemo(() => {
    const data: TreatmentData = {
        "Active Surveillance": problemWithUrgencyData.Active_Surveillance,
        "Focal Therapy": problemWithUrgencyData.Focal,
        "Surgery": problemWithUrgencyData.Surgery,
        "Radiotherapy": problemWithUrgencyData.EBRT,
    };
    const treatments = [
      "Active Surveillance",
      "Focal Therapy",
      "Surgery",
      "Radiotherapy",
    ];

    return treatments.map((treatment) => {
      const treatmentData = data[treatment].Baseline[baselineStatus];
      
      let noProblem = Math.round(treatmentData["No_problem_%"]);
      const smallProblem = Math.round(treatmentData["Very_small_problem_%"]);
      const bigProblem = Math.round(treatmentData["Moderate_big_problem_%"]);

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
            color: "black",
            Icon: WaterClosetOutlined,
          },
          {
            name: "Very small or small problem",
            value: smallProblem,
            color: "#808080",
            Icon: WaterClosetGray,
          },
          {
            name: "Moderate or big problem",
            value: bigProblem,
            color: "black",
            Icon: WaterClosetBlack,
          },
        ],
      };
    });
  }, [baselineStatus]);

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
    <div className="mb-6 p-4 rounded-lg">
      <h3 className="font-bold mb-2 text-lg">Legend</h3>
      <div className="flex flex-col space-y-2">
        <div className="flex items-center">
          <WaterClosetOutlined size={24} />
          <span className="ml-2">No problem</span>
        </div>
        <div className="flex items-center">
          <WaterClosetGray size={24} />
          <span className="ml-2">Very small or small problem</span>
        </div>
        <div className="flex items-center">
          <WaterClosetBlack size={24} />
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
                      Problem with bowel urgency at 1 year
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
                    The following graphs represent 100 men with the same problem with bowel urgency as you. The icon plot show how their degree of problem with bowel urgency changes at 1 year from starting their prostate cancer treatment.
                  </p>

                  <div className="border-2 border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="font-bold mb-2 text-lg">
                      Your current problem with bowel urgency status:
                    </h3>
                    <div className="flex items-center bg-pink-100 p-2 rounded">
                      {baselineStatus === "No_problem" && (
                        <WaterClosetOutlined size={24} />
                      )}
                      {baselineStatus === "Very_small_problem" && (
                        <WaterClosetGray size={24} />
                      )}
                      {baselineStatus === "Moderate_big_problem" && (
                        <WaterClosetBlack size={24} />
                      )}
                      <span className="ml-2">
                        {answers.bowel_urgency || "No problem"}
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
                  <ProblemWithUrgencyTable data={treatmentOutcomes} />
                  <h3 className="font-bold mt-6 mb-2 text-lg">Summary</h3>
                  <div className="text-sm text-gray-600 space-y-4">
                    <p>
                      Based on the information you have entered, for men who are
                      currently experiencing a "{baselineStatus.replace(/_/g, ' ').toLowerCase()}"
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
                              {outcome.value}% will experience a "{outcome.name.toLowerCase()}".
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

export default ProblemWithUrgencyPage;
