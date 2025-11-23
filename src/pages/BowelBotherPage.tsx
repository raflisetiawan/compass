import { useState, useMemo } from "react";
import { FunctionalOutcomePageLayout } from "@/layouts/FunctionalOutcomePageLayout";
import { useOutcomePageData } from "@/hooks/useOutcomePageData";
import IconArray from "@/features/results/components/IconArray";
import bowelBotherData from "@/assets/bowel_bother.json";
import { IconLegendModal } from "@/features/results/components/IconLegendModal";
import BowelBotherTable from "@/features/results/components/BowelBotherTable";
import LegendIcon from "@/features/results/components/LegendIcon";

type BowelBotherOutcome = {
  N: number;
  "No problem": number;
  "Very/small problem": number;
  "Moderate/big problem": number;
};

type TreatmentData = {
  [key: string]: {
    "Baseline bowel bother": {
      "No problem": BowelBotherOutcome;
      "Very/small problem": BowelBotherOutcome;
      "Moderate/big problem": BowelBotherOutcome;
    };
  };
};

const BowelBotherPageContent = () => {
  const { answers } = useOutcomePageData();
  const [legendModalData, setLegendModalData] = useState<{
    name: string;
    data: { name: string; value: number; color: string; Icon?: React.ElementType }[];
  } | null>(null);

  const baselineBotherStatus = useMemo(() => {
    const bother = answers.bowel_bother || "Not a problem";
    if (String(bother).includes("Moderate") || String(bother).includes("big"))
      return "Moderate/big problem";
    if (String(bother).includes("Very") || String(bother).includes("small"))
      return "Very/small problem";
    return "No problem";
  }, [answers.bowel_bother]);

  const treatmentOutcomes = useMemo(() => {
    const data: TreatmentData = bowelBotherData;
    const treatments = [
      "Active Surveillance",
      "Focal Therapy",
      "Surgery",
      "Radiotherapy",
    ];

    return treatments.map((treatment) => {
      const treatmentData =
        data[treatment]["Baseline bowel bother"][baselineBotherStatus];
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
          { name: "No problem", value: noProblem, color: "#28a745" },
          { name: "Very small or small problem", value: smallProblem, color: "#ffc107" },
          { name: "Moderate or big problem", value: bigProblem, color: "#dc3545" },
        ],
      };
    });
  }, [baselineBotherStatus]);

  const Legend = () => (
    <div className="mb-6 p-4 rounded-lg">
      <h3 className="font-bold mb-2 text-lg">Legend</h3>
      <div className="flex flex-col space-y-2">
        <div className="flex items-center"><LegendIcon color="#28a745" name="No problem" /><span className="ml-2">No problem</span></div>
        <div className="flex items-center"><LegendIcon color="#ffc107" name="Small problem" /><span className="ml-2">Very small or small problem</span></div>
        <div className="flex items-center"><LegendIcon color="#dc3545" name="Big problem" /><span className="ml-2">Moderate or big problem</span></div>
      </div>
    </div>
  );

  return (
    <>
      <p className="text-sm text-gray-600 mb-4">
        The following graphs represent 100 men with the same degree of bother with their bowel function as you. The icon plot shows how the degree of their bowel bother changes at 1 year from starting their prostate cancer treatment.
      </p>
      <div className="border-2 border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-bold mb-2 text-lg">Your current bowel bother status:</h3>
        <div className="flex items-center bg-pink-100 p-2 rounded">
          <LegendIcon
            color={
              baselineBotherStatus === "No problem" ? "#28a745" :
                baselineBotherStatus === "Very/small problem" ? "#ffc107" :
                  "#dc3545"
            }
            name={baselineBotherStatus}
          />
          <span className="ml-2">{answers.bowel_bother || "Not a problem"}</span>
        </div>
      </div>
      <Legend />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {treatmentOutcomes.map((treatment) => (
          <div key={treatment.name} onClick={() => setLegendModalData(treatment)} className="cursor-pointer">
            <h3 className="font-bold text-xl mb-2 text-center">{treatment.name}</h3>
            <IconArray data={treatment.data} />
          </div>
        ))}
      </div>
      <h3 className="font-bold mt-6 mb-2 text-lg">Table</h3>
      <BowelBotherTable data={treatmentOutcomes} />
      <h3 className="font-bold mt-6 mb-2 text-lg">Summary</h3>
      <div className="text-sm text-gray-600 space-y-4">
        <p>
          Based on the information you have entered, for men who are currently experiencing{" "}
          <span className="font-semibold">{baselineBotherStatus.toLowerCase()}</span>, the outcomes at 1 year after treatment are:
        </p>
        {treatmentOutcomes.map((treatment) => (
          <div key={treatment.name}>
            <p className="font-semibold">For men who choose {treatment.name}:</p>
            <ul className="list-disc list-inside pl-4">
              {treatment.data.map((outcome) => (
                <li key={outcome.name}>{outcome.value}% will experience {outcome.name.toLowerCase()}.</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
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

const BowelBotherPage = () => (
  <FunctionalOutcomePageLayout title="Bother with bowel function at 1 year">
    <BowelBotherPageContent />
  </FunctionalOutcomePageLayout>
);

export default BowelBotherPage;
