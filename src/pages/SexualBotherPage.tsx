import { useState, useMemo } from "react";
import { FunctionalOutcomePageLayout } from "@/layouts/FunctionalOutcomePageLayout";
import { useOutcomePageData } from "@/hooks/useOutcomePageData";
import IconArray from "@/features/results/components/IconArray";
import erectileBotherData from "@/assets/erectile_bother.json";
import { IconLegendModal } from "@/features/results/components/IconLegendModal";
import SexualBotherTable from "@/features/results/components/SexualBotherTable";
import LegendIcon from "@/features/results/components/LegendIcon";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type SexualBotherOutcome = {
  N: number;
  "No problem": number;
  "Very/small problem": number;
  "Moderate/big problem": number;
};

type TreatmentData = {
  [key: string]: {
    "Baseline sexual bother": {
      "No problem": SexualBotherOutcome;
      "Very/small problem": SexualBotherOutcome;
      "Moderate/big problem": SexualBotherOutcome;
    };
  };
};

const SexualBotherPageContent = () => {
  const { answers } = useOutcomePageData();
  const [legendModalData, setLegendModalData] = useState<{
    name: string;
    data: { name: string; value: number; color: string; Icon?: React.ElementType }[];
  } | null>(null);

  const baselineBotherStatus = useMemo(() => {
    const bother = answers.erection_bother || "Not a problem";
    if (String(bother).includes("Moderate") || String(bother).includes("big"))
      return "Moderate/big problem";
    if (String(bother).includes("Very") || String(bother).includes("small"))
      return "Very/small problem";
    return "No problem";
  }, [answers.erection_bother]);

  // Helper function to get display name for baseline status
  const getBaselineDisplayName = (status: string): string => {
    if (status === "No problem") return "No problem";
    if (status === "Very/small problem") return "Very small or small problem";
    if (status === "Moderate/big problem") return "Moderate or big problem";
    return status;
  };

  const treatmentOutcomes = useMemo(() => {
    const data: TreatmentData = erectileBotherData;
    const treatments = ["Active Surveillance", "Focal Therapy", "Surgery", "Radiotherapy"];

    return treatments.map((treatment) => {
      const treatmentData = data[treatment]["Baseline sexual bother"][baselineBotherStatus as keyof typeof data[string]['Baseline sexual bother']];
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
          { name: "No problem", value: noProblem, color: "#1b5e20" },
          { name: "Very small or small problem", value: smallProblem, color: "#ffc107" },
          { name: "Moderate or big problem", value: bigProblem, color: "#dc3545" },
        ],
      };
    });
  }, [baselineBotherStatus]);

  const Legend = () => (
    <div className="mb-6 p-4 rounded-lg">
      <h3 className="font-bold mb-2 text-lg">What the icons mean</h3>
      <div className="flex flex-col space-y-2">
        <div className="flex items-center"><LegendIcon color="#1b5e20" name="No problem" /><span className="ml-2">No problem</span></div>
        <div className="flex items-center"><LegendIcon color="#ffc107" name="Small problem" /><span className="ml-2">Very small or small problem</span></div>
        <div className="flex items-center"><LegendIcon color="#dc3545" name="Big problem" /><span className="ml-2">Moderate or big problem</span></div>
      </div>
    </div>
  );

  return (
    <>
      <p className="text-sm text-gray-600 mb-4">
        The following graphs represent 100 men with the same degree of bother with their erectile function as you. The icon plot shows how the degree of their sexual bother changes at 1 year from starting their prostate cancer treatment.
      </p>
      <div className="border-2 border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-bold mb-2 text-lg">Your current sexual bother status:</h3>
        <div className="flex items-center bg-pink-100 p-2 rounded">
          <LegendIcon
            color={
              baselineBotherStatus === "No problem" ? "#1b5e20" :
                baselineBotherStatus === "Very/small problem" ? "#ffc107" :
                  "#dc3545"
            }
            name={baselineBotherStatus}
          />
          <span className="ml-2">{getBaselineDisplayName(baselineBotherStatus)}</span>
        </div>
      </div>
      <Legend />
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {treatmentOutcomes.map((treatment) => (
          <div key={treatment.name} onClick={() => setLegendModalData(treatment)} className="cursor-pointer">
            <h3 className="font-bold text-md mb-2 text-center">{treatment.name}</h3>
            <IconArray data={treatment.data} />
          </div>
        ))}
      </div>
      <h3 className="font-bold mt-6 mb-2 text-lg">Table</h3>
      <SexualBotherTable data={treatmentOutcomes} />
      <Accordion type="single" collapsible className="w-full mt-6">
        <AccordionItem value="summary">
          <AccordionTrigger className="font-bold text-lg">Summary</AccordionTrigger>
          <AccordionContent>
            <div className="text-sm text-gray-600 space-y-4">
              <p>
                Out of 100 men like you who are currently experiencing{" "}
                <span className="font-semibold">{getBaselineDisplayName(baselineBotherStatus).toLowerCase()}</span>, the outcomes at 1 year after treatment are:
              </p>
              {treatmentOutcomes.map((treatment) => (
                <div key={treatment.name}>
                  <p className="font-semibold">For men who choose {treatment.name}:</p>
                  <ul className="list-disc list-inside pl-4">
                    {treatment.data.map((outcome) => (
                      <li key={outcome.name}>{Math.round(outcome.value)} out of 100 will consider their sexual function {outcome.name.toLowerCase()}.</li>
                    ))}
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
  );
};

const SexualBotherPage = () => (
  <FunctionalOutcomePageLayout title="Bother with erectile function at 1 year">
    <SexualBotherPageContent />
  </FunctionalOutcomePageLayout>
);

export default SexualBotherPage;
