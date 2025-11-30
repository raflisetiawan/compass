import { useState, useMemo } from "react";
import { FunctionalOutcomePageLayout } from "@/layouts/FunctionalOutcomePageLayout";
import { useOutcomePageData } from "@/hooks/useOutcomePageData";
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

// Custom component for pill icon in a circle
const PillIcon = ({ color, size = 24, className }: { color: string; size?: number; className?: string }) => {
  const pillSize = size * 0.5;
  const center = size / 2;
  
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className}>
      <circle cx={center} cy={center} r={center} fill={color} />
      <g transform={`translate(${center}, ${center})`}>
        {/* Pill icon - simplified capsule shape */}
        <g transform={`translate(${-pillSize/2}, ${-pillSize/2}) scale(${pillSize/24})`}>
          <path
            d="M15.5 8.5l-7 7a3.5 3.5 0 1 0 4.95 4.95l7-7a3.5 3.5 0 1 0-4.95-4.95z"
            fill="white"
            stroke="white"
            strokeWidth="2"
          />
          <line
            x1="9"
            y1="15"
            x2="15"
            y2="9"
            stroke={color}
            strokeWidth="2"
          />
        </g>
      </g>
    </svg>
  );
};

type ErectileFunctionOutcome = {
  N: number;
  "Firm enough for intercourse": number;
  "Firm enough for masturbation": number;
  "Not firm enough for any sexual activity": number;
  "None at all": number;
};

type TreatmentData = {
  [key: string]: {
    "Baseline quality of erection": {
      "Firm enough for intercourse": ErectileFunctionOutcome;
      "Firm enough for masturbation and foreplay only": ErectileFunctionOutcome;
      "Not firm enough for any sexual activity": ErectileFunctionOutcome;
      "None at all": ErectileFunctionOutcome;
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

    if (quality === "Firm enough for intercourse") return "Firm enough for intercourse";
    if (quality === "Firm enough for masturbation and foreplay only") return "Firm enough for masturbation and foreplay only";
    if (quality === "Not firm enough for any sexual activity") return "Not firm enough for any sexual activity";
    if (quality === "None at all") return "None at all";
    return "Firm enough for intercourse"; // Default
  }, [answers.erection_quality]);

  const treatmentOutcomes = useMemo(() => {
    const data: TreatmentData = erectileFunctionData as TreatmentData;
    const treatments = ["Active Surveillance", "Focal Therapy", "Surgery", "Radiotherapy"];

    return treatments.map((treatment) => {
      const treatmentData = data[treatment]["Baseline quality of erection"][baselineStatus];
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
        firmIntercourse: (treatmentData["Firm enough for intercourse"] / N) * 100,
        firmMasturbation: (treatmentData["Firm enough for masturbation"] / N) * 100,
        notFirmNoAssist: (treatmentData["Not firm enough for any sexual activity"] / N) * 100,
        notFirmWithAssist: (treatmentData["None at all"] / N) * 100,
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
          { name: "Not firm enough, using medication/device", value: notFirmWithAssist, color: "#dc3545", Icon: PillIcon },
        ],
      };
    });
  }, [baselineStatus]);

  const Legend = () => (
    <div className="mb-6 p-4 rounded-lg">
      <h3 className="font-bold mb-2 text-lg">What the icons mean</h3>
      <div className="flex flex-col space-y-2">
        <div className="flex items-center"><LegendIcon color="#28a745" name="Firm intercourse" /><span className="ml-2">Firm enough for intercourse</span></div>
        <div className="flex items-center"><LegendIcon color="#ffc107" name="Firm masturbation" /><span className="ml-2">Firm enough for masturbation only</span></div>
        <div className="flex items-center"><LegendIcon color="#dc3545" name="Not firm" /><span className="ml-2">Not firm enough for any sexual activity</span></div>
        <div className="flex items-center"><PillIcon color="#dc3545" size={16} /><span className="ml-2">Not firm enough, using medication/device</span></div>
      </div>
    </div>
  );

  return (
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
              baselineStatus === "Firm enough for intercourse" ? "#28a745" :
                baselineStatus === "Firm enough for masturbation and foreplay only" ? "#ffc107" :
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
      <Accordion type="single" collapsible className="w-full mt-6">
        <AccordionItem value="summary">
          <AccordionTrigger className="font-bold text-lg">Summary</AccordionTrigger>
          <AccordionContent>
            <div className="text-sm text-gray-600 space-y-4">
              <p>
                Out of 100 men like you who currently have erections that are {' '}
                <span className="font-semibold">{baselineStatus.toLowerCase()}</span>, the outcomes at 1 year after treatment are:
              </p>
              {treatmentOutcomes.map((treatment) => (
                <div key={treatment.name}>
                  <p className="font-semibold">For men who choose {treatment.name}:</p>
                  <ul className="list-disc list-inside pl-4">
                    {treatment.data.map((outcome) => {
                      const roundedValue = Math.round(outcome.value);
                      let description = outcome.name.toLowerCase();
                      
                      // Special formatting for intercourse
                      if (outcome.name === "Firm enough for intercourse") {
                        description = "have erections of sufficient quality to have full intercourse";
                      } else if (outcome.name.includes("medication/device")) {
                        description = "not be firm enough for any sexual activity, even with medication/device";
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
  );
};

const ErectileFunctionPage = () => (
  <FunctionalOutcomePageLayout title="Erectile function at 1 year">
    <ErectileFunctionPageContent />
  </FunctionalOutcomePageLayout>
);

export default ErectileFunctionPage;
