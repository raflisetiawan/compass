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
import padUsageData from "@/assets/use_of_urinary_pads_at_one_year.json";
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

import sunUnderwear from "@/assets/img/icons/sun_underwear.png";
import padWater from "@/assets/img/icons/pad_water.png";
import darkPadWater from "@/assets/img/icons/dark_pad_water.png";

type PadUsageOutcome = {
  "N": number;
  "Not using pad": number;
  "Using one pad a day": number;
  "Using two or more pads a day": number;
};

type TreatmentData = {
  [key: string]: {
    "Total": number;
    "Not using pad": number;
    "Using one pad a day": number;
    "Using two or more pads a day": number;
    "Pad status at baseline": {
      "Not using pad": PadUsageOutcome;
      "Using one pad a day": PadUsageOutcome;
      "Using two or more pads a day": PadUsageOutcome;
    };
  };
};

const UrinaryPadUsagePage = () => {
  const { user } = useUserStore();
  const { answers, loadInitialData, isLoading, reset } = useQuestionnaireStore();
  const navigate = useNavigate();
  const [modalContent, setModalContent] = useState<ModalContentType>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isCategoryLegendOpen, setIsCategoryLegendOpen] = useState(false);
  const [legendModalData, setLegendModalData] = useState<{
    name: string;
    data: any[];
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

  const baselinePadStatus = useMemo(() => {
    const padUsage = answers.pad_usage || "No pads";
    if (padUsage.includes("2 or more")) return "Using two or more pads a day";
    if (padUsage.includes("1 pad")) return "Using one pad a day";
    return "Not using pad";
  }, [answers.pad_usage]);

  const treatmentOutcomes = useMemo(() => {
    const data: TreatmentData = padUsageData;
    const treatments = [
      "Active Surveillance",
      "Focal Therapy",
      "Surgery",
      "Radiotherapy",
    ];

    return treatments.map((treatment) => {
      const treatmentData = data[treatment]["Pad status at baseline"][baselinePadStatus];
      let notUsing = Math.round(treatmentData["Not using pad"]);
      let onePad = Math.round(treatmentData["Using one pad a day"]);
      let twoOrMorePads = Math.round(treatmentData["Using two or more pads a day"]);

      const total = notUsing + onePad + twoOrMorePads;
      if (total !== 100) {
        notUsing -= total - 100;
      }

      return {
        name: treatment,
        data: [
          { name: "No use of pad; rarely or never leaking urine", value: notUsing, color: "#FFC107", iconUrl: sunUnderwear },
          { name: "1 pad used per day; any degree of leaking urine", value: onePad, color: "#64B5F6", iconUrl: padWater },
          { name: "≥2 pad used per day; any degree of leaking urine", value: twoOrMorePads, color: "#1976D2", iconUrl: darkPadWater },
        ],
      };
    });
  }, [baselinePadStatus]);

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
                <img src={sunUnderwear} alt="No use of pad; rarely or never leaking urine" className="w-5 h-5 mr-2" />
                <span>No use of pad; rarely or never leaking urine</span>
            </div>
            <div className="flex items-center">
                <img src={padWater} alt="1 pad used per day; any degree of leaking urine" className="w-5 h-5 mr-2" />
                <span>1 pad used per day; any degree of leaking urine</span>
            </div>
            <div className="flex items-center">
                <img src={darkPadWater} alt="≥2 pad used per day; any degree of leaking urine" className="w-5 h-5 mr-2" />
                <span>≥2 pad used per day; any degree of leaking urine</span>
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
                isSidebarExpanded ? "md/w-2/3" : "md/w-[calc(100%-5rem)]"
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
                      Use of urinary pads at 1 year
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
                    The following graphs represents 100 men with the same pad usage as you. The icon plot shows how their pad usage status changes at 1 year from starting their prostate cancer treatment.
                  </p>
                  
                  <div className="border-2 border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="font-bold mb-2 text-lg">Your current use of pad and leaking status:</h3>
                    <div className="flex items-center bg-pink-100 p-2 rounded">
                      <img src={sunUnderwear} alt={baselinePadStatus} className="w-5 h-5 mr-2" />
                      <span>{baselinePadStatus}</span>
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
                          {treatment.name === "Radiotherapy"
                            ? "Radiotherapy"
                            : treatment.name}
                        </h3>
                        <IconArray data={treatment.data} />
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
          title={`Legend for ${
            legendModalData.name === "Radiotherapy"
              ? "Radiotherapy"
              : legendModalData.name
          }`}
          legendData={legendModalData.data}
        />
      )}
    </MainLayout>
  );
};

export default UrinaryPadUsagePage;
