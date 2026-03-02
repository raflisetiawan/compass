import { useState, useMemo } from "react";
import { FunctionalOutcomePageLayout } from "@/layouts/FunctionalOutcomePageLayout";
import { useOutcomePageData } from "@/hooks/useOutcomePageData";
import NoFunctionalDataMessage from "@/features/results/components/NoFunctionalDataMessage";
import IconArray from "@/features/results/components/IconArray";
import erectileFunctionData from "@/assets/erectile_function_with_assist.json";
import { IconLegendModal } from "@/features/results/components/IconLegendModal";
import ErectileFunctionTable from "@/features/results/components/ErectileFunctionTable";
import LegendIcon from "@/features/results/components/LegendIcon";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";


type ErectileFunctionOutcome = {
  N: number;
  "Firm for intercourse - no assist": number;
  "Firm for intercourse - with assist": number;
  "Firm for masturbation - no assist": number;
  "Firm for masturbation - with assist": number;
  "Not firm or none - no assist": number;
  "Not firm or none - with assist": number;
};

type TreatmentData = {
  [key: string]: {
    "Baseline quality of erection": {
      "Firm for intercourse - no assist": ErectileFunctionOutcome;
      "Firm for intercourse - with assist": ErectileFunctionOutcome;
      "Firm for masturbation - no assist": ErectileFunctionOutcome;
      "Firm for masturbation - with assist": ErectileFunctionOutcome;
      "Not firm or none - no assist": ErectileFunctionOutcome;
      "Not firm or none - with assist": ErectileFunctionOutcome;
    };
  };
};

interface CategoryData {
  name: string;
  displayName: string;
  value: number;
  color: string;
  showPill: boolean;
}

// Helper function to get user-friendly baseline name
const getBaselineDisplayName = (baselineStatus: string): string => {
  const isAssist = baselineStatus.includes("with assist");
  const suffix = isAssist ? " (using medication or a device)" : "";

  if (baselineStatus.includes("Firm for intercourse")) {
    return `firm enough for intercourse${suffix}`;
  }
  if (baselineStatus.includes("Firm for masturbation")) {
    return `firm enough for masturbation only${suffix}`;
  }
  if (baselineStatus.includes("Not firm or none") || baselineStatus.includes("Not firm") || baselineStatus.includes("None at all")) {
    return `not firm enough for any sexual activity or none at all${suffix}`;
  }
  return baselineStatus.toLowerCase();
};

const ErectileFunctionPageContent = () => {
  const { answers } = useOutcomePageData();
  const [legendModalData, setLegendModalData] = useState<{
    name: string;
    data: { name: string; value: number; color: string; Icon?: React.ElementType }[];
  } | null>(null);

  // Map questionnaire answers to the new baseline categories
  const baselineStatus = useMemo(() => {
    const quality = answers.erection_quality || "Firm enough for intercourse";
    const useMedication = answers.sex_medication === "Yes";

    if (quality === "Firm enough for intercourse") {
      return useMedication ? "Firm for intercourse - with assist" : "Firm for intercourse - no assist";
    }
    if (quality === "Firm enough for masturbation and foreplay only") {
      return useMedication ? "Firm for masturbation - with assist" : "Firm for masturbation - no assist";
    }
    if (quality === "Not firm enough for any sexual activity" || quality === "None at all") {
      return useMedication ? "Not firm or none - with assist" : "Not firm or none - no assist";
    }
    return "Firm for intercourse - no assist"; // Default
  }, [answers.erection_quality, answers.sex_medication]);

  const treatmentOutcomes = useMemo(() => {
    const jsonData: TreatmentData = erectileFunctionData as TreatmentData;
    const treatments = ["Active Surveillance", "Focal Therapy", "Surgery", "Radiotherapy"];

    // First, process all treatments to get their full dataset with rounding/adjustments
    const allTreatmentsData = treatments.map((treatment) => {
      const treatmentData = jsonData[treatment]["Baseline quality of erection"][baselineStatus];
      const N = treatmentData.N;
      
      let categories: CategoryData[];

      if (N === 0) {
        categories = [
            { name: "Firm for intercourse - no assist", displayName: "Firm enough for intercourse", value: 0, color: '#1b5e20', showPill: false },
            { name: "Firm for intercourse - with assist", displayName: "Firm enough for intercourse (using medication/device)", value: 0, color: '#1b5e20', showPill: true },
            { name: "Firm for masturbation - no assist", displayName: "Firm enough for masturbation only", value: 0, color: '#ffc107', showPill: false },
            { name: "Firm for masturbation - with assist", displayName: "Firm enough for masturbation only (using medication/device)", value: 0, color: '#ffc107', showPill: true },
            { name: "Not firm or none - no assist", displayName: "Not firm enough for any sexual activity or none at all", value: 0, color: '#dc3545', showPill: false },
            { name: "Not firm or none - with assist", displayName: "Not firm enough for any sexual activity or none at all (using medication/device)", value: 0, color: '#dc3545', showPill: true }
        ];
      } else {
        categories = [
          {
            name: "Firm for intercourse - no assist",
            displayName: "Firm enough for intercourse",
            value: treatmentData["Firm for intercourse - no assist"],
            color: "#1b5e20",
            showPill: false
          },
          {
            name: "Firm for intercourse - with assist",
            displayName: "Firm enough for intercourse (using medication/device)",
            value: treatmentData["Firm for intercourse - with assist"],
            color: "#1b5e20",
            showPill: true
          },
          {
            name: "Firm for masturbation - no assist",
            displayName: "Firm enough for masturbation only",
            value: treatmentData["Firm for masturbation - no assist"],
            color: "#ffc107",
            showPill: false
          },
          {
            name: "Firm for masturbation - with assist",
            displayName: "Firm enough for masturbation only (using medication/device)",
            value: treatmentData["Firm for masturbation - with assist"],
            color: "#ffc107",
            showPill: true
          },
          {
            name: "Not firm or none - no assist",
            displayName: "Not firm enough for any sexual activity or none at all",
            value: treatmentData["Not firm or none - no assist"],
            color: "#dc3545",
            showPill: false
          },
          {
            name: "Not firm or none - with assist",
            displayName: "Not firm enough for any sexual activity or none at all (using medication/device)",
            value: treatmentData["Not firm or none - with assist"],
            color: "#dc3545",
            showPill: true
          }
        ];

        // Round each value
        categories = categories.map(item => ({
          ...item,
          value: Math.round(item.value)
        }));

        // Adjust total to ensure it equals 100%
        const total = categories.reduce((sum, item) => sum + item.value, 0);
        const diff = total - 100;

        if (diff !== 0) {
          // Find the item with the highest original percentage to adjust
          // We look at the processed categories since we don't have original indices easily, 
          // but strictly speaking we should look at original values. 
          // However, for this fix, finding max value in current array is sufficient heuristic.
          const maxIndex = categories.reduce((maxIdx, item, idx, arr) => 
            item.value > arr[maxIdx].value ? idx : maxIdx, 0);
          categories[maxIndex].value -= diff;
        }
      }

      return {
        name: treatment,
        data: categories
      };
    });

    // Return all treatments with all 8 categories (no filtering)
    console.log("Treatment outcomes data:", allTreatmentsData);
    return allTreatmentsData;

  }, [baselineStatus]);

  const Legend = () => (
    <div className="mb-6 p-4 rounded-lg">
      <h3 className="font-bold mb-2 text-lg">What the icons mean</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-2">
          <div className="flex items-start">
            <div className="shrink-0 mt-1"><LegendIcon color="#1b5e20" name="Firm intercourse" /></div>
            <span className="ml-2">Firm enough for intercourse</span>
          </div>
          <div className="flex items-start">
            <div className="shrink-0 mt-1"><LegendIcon color="#ffc107" name="Firm masturbation" /></div>
            <span className="ml-2">Firm enough for masturbation only</span>
          </div>
          <div className="flex items-start">
            <div className="shrink-0 mt-1"><LegendIcon color="#dc3545" name="Not firm" /></div>
            <span className="ml-2">Not firm enough for any sexual activity or none at all</span>
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <div className="flex items-start">
            <div className="shrink-0 mt-1"><LegendIcon color="#1b5e20" name="Firm intercourse assist" showPill /></div>
            <span className="ml-2">Firm enough for intercourse (using medication or a device)</span>
          </div>
          <div className="flex items-start">
            <div className="shrink-0 mt-1"><LegendIcon color="#ffc107" name="Firm masturbation assist" showPill /></div>
            <span className="ml-2">Firm enough for masturbation only (using medication or a device)</span>
          </div>
          <div className="flex items-start">
            <div className="shrink-0 mt-1"><LegendIcon color="#dc3545" name="Not firm assist" showPill /></div>
            <span className="ml-2">Not firm enough for any sexual activity or none at all (using medication or a device)</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {!answers.erection_quality ? (
        <NoFunctionalDataMessage />
      ) : (
        <>
          <div className="text-sm text-gray-600 mb-4 space-y-2">
            <p>
              As men get older, some will develop problems with erections. This can happen even without prostate cancer or its treatment.
            </p>
            <p>
              The following graphs represent 100 men with the same erectile function as you. The icon plot shows how erectile function changes at 1 year from their prostate cancer treatment.
            </p>
          </div>
          <div className="border-2 border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-bold mb-2 text-lg">Your current erectile function status:</h3>
            <div className="flex items-center bg-pink-100 p-2 rounded">
          <LegendIcon
            color={
              baselineStatus.includes("Firm for intercourse") ? "#1b5e20" :
                baselineStatus.includes("Firm for masturbation") ? "#ffc107" :
                  "#dc3545"
            }
            name={baselineStatus}
            showPill={baselineStatus.includes("with assist")}
          />
          <span className="ml-2">
            {getBaselineDisplayName(baselineStatus)}
          </span>
        </div>
      </div>
      <Legend />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="hidden lg:block"></div>
            {treatmentOutcomes.map((treatment) => (
              <div key={treatment.name} onClick={() => setLegendModalData(treatment)} className="cursor-pointer flex flex-col">
                <h3 className="font-bold text-md text-center min-h-[3rem] flex items-end justify-center pb-2">{treatment.name}</h3>
                <IconArray data={treatment.data} />
              </div>
            ))}
          </div>
      <h3 className="font-bold mt-6 mb-2 text-lg">Table</h3>
      <ErectileFunctionTable data={treatmentOutcomes} />
      <Accordion type="single" collapsible className="w-full mt-6">
        <AccordionItem value="summary">
          <AccordionTrigger className="font-bold text-lg">Summary</AccordionTrigger>
          <AccordionContent>
            <div className="text-sm text-gray-600 space-y-4">
              <p>
                Out of 100 men like you who currently have erections that are {' '}
                <span className="font-semibold">{getBaselineDisplayName(baselineStatus)}</span>, the outcomes at 1 year after treatment are:
              </p>
              {treatmentOutcomes.map((treatment) => (
                <div key={treatment.name}>
                  <p className="font-semibold">For men who choose {treatment.name}:</p>
                  <ul className="list-disc list-inside pl-4">
                    {treatment.data.map((outcome) => {
                      const roundedValue = Math.round(outcome.value);
                      
                      // Skip if value is 0
                      if (roundedValue === 0) return null;

                      let description = outcome.name.toLowerCase();
                      
                      // Special formatting for each category
                      if (outcome.name === "Firm enough for intercourse") {
                        description = "have erections of sufficient quality to have full intercourse";
                      } else if (outcome.name === "Using sexual medication or device") {
                        description = "be using sexual medication or device";
                      } else {
                        description = `have erections that are ${description}`;
                      }
                      
                      return (
                        <li key={outcome.name}>{roundedValue} out of 100 will {description}.</li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
          {legendModalData && (
            <IconLegendModal
              isOpen={!!legendModalData}
              onClose={() => setLegendModalData(null)}
              title={`Legend for ${legendModalData.name}`}
              legendData={legendModalData.data}
        />
          )}
        </>
      )}
    </>
  );
};

const ErectileFunctionPage = () => (
  <FunctionalOutcomePageLayout title="Erectile function at 1 year">
    <ErectileFunctionPageContent />
  </FunctionalOutcomePageLayout>
);

export default ErectileFunctionPage;
