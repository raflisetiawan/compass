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
import erectileFunctionData from "@/assets/erectile_function_with_assist.json";
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
import ErectionFunctionIcon from "@/components/icons/ErectionFunctionIcon";
import ErectileFunctionTable from "@/features/results/components/ErectileFunctionTable";

type ErectileFunctionOutcome = {
  N: number;
  "Firm intercourse": number;
  "Firm masturbation": number;
  "Not firm - no assist": number;
  "Not firm - with assist": number;
};

type TreatmentData = {
  [key: string]: {
    "Baseline erectile quality": {
      "Firm intercourse": ErectileFunctionOutcome;
      "Firm masturbation": ErectileFunctionOutcome;
      "Not firm - no assist": ErectileFunctionOutcome;
      "Not firm - with assist": ErectileFunctionOutcome;
    };
  };
};

interface PercentageValues {
  firmIntercourse: number;
  firmMasturbation: number;
  notFirmNoAssist: number;
  notFirmWithAssist: number;
}

const ErectileFunctionPage = () => {
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
    const quality =
      answers.erection_quality || "Firm enough for intercourse";
    const medication = answers.sex_medication || "No";

    if (quality === "Firm enough for intercourse") {
      return "Firm intercourse";
    }
    if (quality === "Firm enough for masturbation/foreplay only") {
      return "Firm masturbation";
    }
    if (
      quality === "Not firm enough for any sexual activity" ||
      quality === "None at all"
    ) {
      if (medication === "Yes") {
        return "Not firm - with assist";
      }
      return "Not firm - no assist";
    }
    return "Firm intercourse"; // Default
  }, [answers.erection_quality, answers.sex_medication]);

  const treatmentOutcomes = useMemo(() => {
    const data: TreatmentData = {
        ...erectileFunctionData,
        "Active Surveillance": erectileFunctionData.TOTAL,
    };
    const treatments = [
      "Active Surveillance",
      "Focal Therapy",
      "Surgery",
      "Radiotherapy",
    ];

    return treatments.map((treatment) => {
      const treatmentData =
        data[treatment]["Baseline erectile quality"][baselineStatus];
      
      const N = treatmentData.N;
      if (N === 0) {
        return {
            name: treatment,
            data: [
                { name: "Firm enough for intercourse", value: 0, color: '#28a745', Icon: (props: { size?: number; color?: string }) => <ErectionFunctionIcon {...props} withAssist={false} /> },
                { name: "Firm enough for masturbation only", value: 0, color: '#ffc107', Icon: (props: { size?: number; color?: string }) => <ErectionFunctionIcon {...props} withAssist={false} /> },
                { name: "Not firm enough for any sexual activity", value: 0, color: '#dc3545', Icon: (props: { size?: number; color?: string }) => <ErectionFunctionIcon {...props} withAssist={false} /> },
                { name: "Not firm enough, using medication/device", value: 0, color: '#dc3545', Icon: (props: { size?: number; color?: string }) => <ErectionFunctionIcon {...props} withAssist={true} /> },
            ]
        }
      }

      const percentages: PercentageValues = {
        firmIntercourse: (treatmentData["Firm intercourse"] / N) * 100,
        firmMasturbation: (treatmentData["Firm masturbation"] / N) * 100,
        notFirmNoAssist: (treatmentData["Not firm - no assist"] / N) * 100,
        notFirmWithAssist: (treatmentData["Not firm - with assist"] / N) * 100,
      };

      const roundedPercentages: PercentageValues = {
        firmIntercourse: Math.round(percentages.firmIntercourse),
        firmMasturbation: Math.round(percentages.firmMasturbation),
        notFirmNoAssist: Math.round(percentages.notFirmNoAssist),
        notFirmWithAssist: Math.round(percentages.notFirmWithAssist),
      };

      const total = Object.values(roundedPercentages).reduce((sum, p) => sum + p, 0);
      const diff = total - 100;

      if (diff !== 0) {
        const keyToAdjust = Object.keys(percentages).reduce((a, b) => percentages[a as keyof PercentageValues] > percentages[b as keyof PercentageValues] ? a : b) as keyof PercentageValues;
        roundedPercentages[keyToAdjust] -= diff;
      }
      
      const { firmIntercourse, firmMasturbation, notFirmNoAssist, notFirmWithAssist } = roundedPercentages;

      return {
        name: treatment,
        data: [
          {
            name: "Firm enough for intercourse",
            value: firmIntercourse,
            color: "#28a745",
            Icon: (props: { size?: number; color?: string }) => <ErectionFunctionIcon {...props} withAssist={false} />,
          },
          {
            name: "Firm enough for masturbation only",
            value: firmMasturbation,
            color: "#ffc107",
            Icon: (props: { size?: number; color?: string }) => <ErectionFunctionIcon {...props} withAssist={false} />,
          },
          {
            name: "Not firm enough for any sexual activity",
            value: notFirmNoAssist,
            color: "#dc3545",
            Icon: (props: { size?: number; color?: string }) => <ErectionFunctionIcon {...props} withAssist={false} />,
          },
          {
            name: "Not firm enough, using medication/device",
            value: notFirmWithAssist,
            color: "#dc3545",
            Icon: (props: { size?: number; color?: string }) => <ErectionFunctionIcon {...props} withAssist={true} />,
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
          <ErectionFunctionIcon color="#28a745" withAssist={false} />
          <span className="ml-2">Firm enough for intercourse</span>
        </div>
        <div className="flex items-center">
          <ErectionFunctionIcon color="#ffc107" withAssist={false} />
          <span className="ml-2">Firm enough for masturbation only</span>
        </div>
        <div className="flex items-center">
          <ErectionFunctionIcon color="#dc3545" withAssist={false} />
          <span className="ml-2">Not firm enough for any sexual activity</span>
        </div>
        <div className="flex items-center">
          <ErectionFunctionIcon color="#dc3545" withAssist={true} />
          <span className="ml-2">Not firm enough, using medication/device</span>
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
                      Erectile function at 1 year
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
                    The following graphs represent 100 men with the same erectile function as you. The icon plot shows how erectile function changes at 1 year from their prostate cancer treatment.
                  </p>

                  <div className="border-2 border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="font-bold mb-2 text-lg">
                      Your current erectile function status:
                    </h3>
                    <div className="flex items-center bg-pink-100 p-2 rounded">
                      {baselineStatus === "Firm intercourse" && (
                        <ErectionFunctionIcon color="#28a745" withAssist={false} />
                      )}
                      {baselineStatus === "Firm masturbation" && (
                        <ErectionFunctionIcon color="#ffc107" withAssist={false} />
                      )}
                      {baselineStatus === "Not firm - no assist" && (
                        <ErectionFunctionIcon color="#dc3545" withAssist={false} />
                      )}
                      {baselineStatus === "Not firm - with assist" && (
                        <ErectionFunctionIcon color="#dc3545" withAssist={true} />
                      )}
                      <span className="ml-2">
                        {answers.erection_quality || "Firm enough for intercourse"}
                        {answers.sex_medication === 'Yes' && ' (with medication/device)'}
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
                  <ErectileFunctionTable data={treatmentOutcomes} />
                  <h3 className="font-bold mt-6 mb-2 text-lg">Summary</h3>
                  <div className="text-sm text-gray-600 space-y-4">
                    <p>
                      Based on the information you have entered, for men who currently have erections that are {' '}
                      <span className="font-semibold">
                        {baselineStatus.toLowerCase()}
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
                              {outcome.value}% will have erections that are{" "}
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

export default ErectileFunctionPage;
