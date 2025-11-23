import { useState, useMemo } from "react";
import { FunctionalOutcomePageLayout } from "@/layouts/FunctionalOutcomePageLayout";
import { useOutcomePageData } from "@/hooks/useOutcomePageData";
import IconArray from "@/features/results/components/IconArray";
import erectileFunctionData from "@/assets/erectile_function_with_assist.json";
import { IconLegendModal } from "@/features/results/components/IconLegendModal";
import ErectileFunctionTable from "@/features/results/components/ErectileFunctionTable";
import LegendIcon from "@/features/results/components/LegendIcon";

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

const ErectileFunctionPageContent = () => {
  const { answers } = useOutcomePageData();
  const [legendModalData, setLegendModalData] = useState<{
    name: string;
    data: { name: string; value: number; color: string; Icon?: React.ElementType }[];
  } | null>(null);

  const baselineStatus = useMemo(() => {
    const quality = answers.erection_quality || "Firm enough for intercourse";
    const medication = answers.sex_medication || "No";

    if (quality === "Firm enough for intercourse") return "Firm intercourse";
    if (quality === "Firm enough for masturbation/foreplay only") return "Firm masturbation";
    if (quality === "Not firm enough for any sexual activity" || quality === "None at all") {
      if (medication === "Yes") return "Not firm - with assist";
      return "Not firm - no assist";
    }
    return "Firm intercourse"; // Default
  }, [answers.erection_quality, answers.sex_medication]);

  const treatmentOutcomes = useMemo(() => {
    const data: TreatmentData = { ...erectileFunctionData, "Active Surveillance": erectileFunctionData.TOTAL };
    const treatments = ["Active Surveillance", "Focal Therapy", "Surgery", "Radiotherapy"];

    return treatments.map((treatment) => {
      const treatmentData = data[treatment]["Baseline erectile quality"][baselineStatus];
      const N = treatmentData.N;
      if (N === 0) {
        return {
          name: treatment,
          data: [
            { name: "Firm enough for intercourse", value: 0, color: '#28a745' },
            { name: "Firm enough for masturbation only", value: 0, color: '#ffc107' },
            { name: "Not firm enough for any sexual activity", value: 0, color: '#dc3545' },
            { name: "Not firm enough, using medication/device", value: 0, color: '#dc3545' },
          ]
        };
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
          { name: "Firm enough for intercourse", value: firmIntercourse, color: "#28a745" },
          { name: "Firm enough for masturbation only", value: firmMasturbation, color: "#ffc107" },
          { name: "Not firm enough for any sexual activity", value: notFirmNoAssist, color: "#dc3545" },
          { name: "Not firm enough, using medication/device", value: notFirmWithAssist, color: "#dc3545" },
        ],
      };
    });
  }, [baselineStatus]);

  const Legend = () => (
    <div className="mb-6 p-4 rounded-lg">
      <h3 className="font-bold mb-2 text-lg">Legend</h3>
      <div className="flex flex-col space-y-2">
        <div className="flex items-center"><LegendIcon color="#28a745" name="Firm intercourse" /><span className="ml-2">Firm enough for intercourse</span></div>
        <div className="flex items-center"><LegendIcon color="#ffc107" name="Firm masturbation" /><span className="ml-2">Firm enough for masturbation only</span></div>
        <div className="flex items-center"><LegendIcon color="#dc3545" name="Not firm" /><span className="ml-2">Not firm enough for any sexual activity</span></div>
        <div className="flex items-center"><LegendIcon color="#dc3545" name="Not firm (assist)" /><span className="ml-2">Not firm enough, using medication/device</span></div>
      </div>
    </div>
  );

  return (
    <>
      <p className="text-sm text-gray-600 mb-4">
        The following graphs represent 100 men with the same erectile function as you. The icon plot shows how erectile function changes at 1 year from their prostate cancer treatment.
      </p>
      <div className="border-2 border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-bold mb-2 text-lg">Your current erectile function status:</h3>
        <div className="flex items-center bg-pink-100 p-2 rounded">
          <LegendIcon
            color={
              baselineStatus === "Firm intercourse" ? "#28a745" :
                baselineStatus === "Firm masturbation" ? "#ffc107" :
                  "#dc3545"
            }
            name={baselineStatus}
          />
          <span className="ml-2">
            {answers.erection_quality || "Firm enough for intercourse"}
            {answers.sex_medication === 'Yes' && ' (with medication/device)'}
          </span>
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
      <ErectileFunctionTable data={treatmentOutcomes} />
      <h3 className="font-bold mt-6 mb-2 text-lg">Summary</h3>
      <div className="text-sm text-gray-600 space-y-4">
        <p>
          Based on the information you have entered, for men who currently have erections that are {' '}
          <span className="font-semibold">{baselineStatus.toLowerCase()}</span>, the outcomes at 1 year after treatment are:
        </p>
        {treatmentOutcomes.map((treatment) => (
          <div key={treatment.name}>
            <p className="font-semibold">For men who choose {treatment.name}:</p>
            <ul className="list-disc list-inside pl-4">
              {treatment.data.map((outcome) => (
                <li key={outcome.name}>{outcome.value}% will have erections that are {outcome.name.toLowerCase()}.</li>
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

const ErectileFunctionPage = () => (
  <FunctionalOutcomePageLayout title="Erectile function at 1 year">
    <ErectileFunctionPageContent />
  </FunctionalOutcomePageLayout>
);

export default ErectileFunctionPage;
