import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sun, Droplet, Info } from "lucide-react";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useQuestionnaireStore } from "@/stores/questionnaireStore";
import { useUserStore } from "@/stores/userStore";
import { ResultsSidebar } from "@/features/results/components/ResultsSidebar";
import IconArray from "@/features/results/components/IconArray";
import urinaryLeakageData from "@/assets/leaking_urine_at_one_year.json";
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
import UrinaryLeakageTable from "@/features/results/components/UrinaryLeakageTable";

type UrinaryLeakageOutcome = {
  N: number;
  "Rarely or never": number;
  "At least once a week": number;
  "At least once a day": number;
};

type TreatmentData = {
  [key: string]: {
    Total: number;
    "Rarely or never": number;
    "At least once a week": number;
    "At least once a day": number;
    "Baseline urine leakage": {
      "Rarely or never": UrinaryLeakageOutcome;
      "At least once a week": UrinaryLeakageOutcome;
      "At least once a day": UrinaryLeakageOutcome;
    };
  };
};

const UrinaryLeakagePage = () => {
  const { user } = useUserStore();
  const { answers, loadInitialData, isLoading, reset } =
    useQuestionnaireStore();
  const navigate = useNavigate();
  const [modalContent, setModalContent] = useState<ModalContentType>(null);
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [legendModalData, setLegendModalData] = useState<{
    name: string;
    data: any[];
  } | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user, loadInitialData]);

  const clinicalParameters: ClinicalParameters = {
    Age: `${answers.age || "65"} years`,
    PSA: `${answers.psa || "8"} ngmL`,
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

  const baselineLeakageStatus = useMemo(() => {
    const leakage = answers.urine_leak || "Rarely or never";
    if (String(leakage).includes("day")) return "At least once a day";
    if (String(leakage).includes("week")) return "At least once a week";
    return "Rarely or never";
  }, [answers.urine_leak]);

  const treatmentOutcomes = useMemo(() => {
    const data: TreatmentData = urinaryLeakageData;
    const treatments = [
      "Active Surveillance",
      "Focal Therapy",
      "Surgery",
      "RadioTherapy",
    ];

    return treatments.map((treatment) => {
      const treatmentData =
        data[treatment]["Baseline urine leakage"][baselineLeakageStatus];
      let rarely = Math.round(treatmentData["Rarely or never"]);
      const weekly = Math.round(treatmentData["At least once a week"]);
      const daily = Math.round(treatmentData["At least once a day"]);

      const total = rarely + weekly + daily;
      if (total !== 100) {
        rarely -= total - 100;
      }

      return {
        name: treatment,
        data: [
          { name: "Rarely or never leaking", value: rarely, color: "#FFC107", Icon: Sun },
          {
            name: "Leaking once a week or more",
            value: weekly,
            color: "#64B5F6",
            Icon: Droplet,
          },
          {
            name: "Leaking once a day or more",
            value: daily,
            color: "#1976D2",
            Icon: Droplet,
          },
        ],
      };
    });
  }, [baselineLeakageStatus]);

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
    <div className="mb-6">
      <h3 className="font-bold mb-2 text-lg">Legend:</h3>
      <div className="flex flex-col space-y-2">
        <div className="flex items-center">
          <Sun className="h-5 w-5 mr-2 text-yellow-500" />
          <span>Rarely or never leaking</span>
        </div>
        <div className="flex items-center">
          <Droplet className="h-5 w-5 mr-2 text-blue-400" />
          <span>Leaking once a week or more</span>
        </div>
        <div className="flex items-center">
          <Droplet className="h-5 w-5 mr-2 text-blue-700" />
          <span>Leaking once a day or more</span>
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
                      Leaking urine at 1 year
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsLegendOpen(true)}
                      className="ml-2"
                    >
                      <Info className="h-5 w-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    The following graphs represent 100 men with the same leaking
                    status as you. The icon plot shows how their leaking status
                    changes at 1 year from starting their prostate cancer
                    treatment.
                  </p>

                  <div className="border-2 border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="font-bold mb-2 text-lg">
                      Your current urinary function:
                    </h3>
                    <div className="flex items-center bg-pink-100 p-2 rounded">
                      <Sun className="h-5 w-5 mr-2 text-yellow-500" />
                      <span>{baselineLeakageStatus}</span>
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
                          {treatment.name === "RadioTherapy"
                            ? "Radiotherapy"
                            : treatment.name}
                        </h3>
                        <IconArray data={treatment.data} />
                      </div>
                    ))}
                  </div>
                  <h3 className="font-bold mt-6 mb-2 text-lg">Table</h3>
                  <UrinaryLeakageTable data={treatmentOutcomes} />
                  <h3 className="font-bold mt-6 mb-2 text-lg">Summary</h3>
                  <div className="text-sm text-gray-600 space-y-4">
                    <p>
                      Based on the information you have entered, for men who are
                      currently{" "}
                      <span className="font-semibold">
                        {baselineLeakageStatus.toLowerCase()}
                      </span>
                      , the outcomes at 1 year after treatment are:
                    </p>
                    {treatmentOutcomes.map((treatment) => (
                      <div key={treatment.name}>
                        <p className="font-semibold">
                          For men who choose{" "}
                          {treatment.name === "RadioTherapy"
                            ? "Radiotherapy"
                            : treatment.name}
                          :
                        </p>
                        <ul className="list-disc list-inside pl-4">
                          {treatment.data.map((outcome) => (
                            <li key={outcome.name}>
                              {outcome.value}% will be{" "}
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
        isOpen={isLegendOpen}
        onClose={() => setIsLegendOpen(false)}
      />
      {legendModalData && (
        <IconLegendModal
          isOpen={!!legendModalData}
          onClose={() => setLegendModalData(null)}
          title={`Legend for ${
            legendModalData.name === "RadioTherapy"
              ? "Radiotherapy"
              : legendModalData.name
          }`}
          legendData={legendModalData.data}
        />
      )}
    </MainLayout>
  );
};

export default UrinaryLeakagePage;
