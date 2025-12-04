import { useState, useMemo } from "react";
import { FunctionalOutcomePageLayout } from "@/layouts/FunctionalOutcomePageLayout";
import { useOutcomePageData } from "@/hooks/useOutcomePageData";
import FilledSun from "@/features/results/components/FilledSun";
import FilledDroplet from "@/features/results/components/FilledDroplet";
import IconArray from "@/features/results/components/IconArray";
import urinaryLeakageData from "@/assets/leaking_urine_at_one_year.json";
import { IconLegendModal } from "@/features/results/components/IconLegendModal";
import UrinaryLeakageTable from "@/features/results/components/UrinaryLeakageTable";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type UrinaryLeakageOutcome = {
  N: number;
  "Rarely or never": number;
  "At least once a week": number;
  "At least once a day": number;
};

type TreatmentData = {
  [key: string]: {
    "Baseline urine leakage": {
      "Rarely or never": UrinaryLeakageOutcome;
      "At least once a week": UrinaryLeakageOutcome;
      "At least once a day": UrinaryLeakageOutcome;
    };
  };
};

const UrinaryLeakagePageContent = () => {
  const { answers } = useOutcomePageData();
  const [legendModalData, setLegendModalData] = useState<{
    name: string;
    data: { name: string; value: number; color: string; Icon: React.ElementType }[];
  } | null>(null);

  const baselineLeakageStatus = useMemo(() => {
    const leakage = answers.urine_leak || "Rarely or never";
    if (String(leakage).includes("day")) return "At least once a day";
    if (String(leakage).includes("week")) return "At least once a week";
    return "Rarely or never";
  }, [answers.urine_leak]);

  // Helper function to get display name for baseline status
  const getBaselineDisplayName = (status: string): string => {
    if (status === "Rarely or never") return "Rarely or never leaking";
    if (status === "At least once a week") return "Leaking once a week or more";
    if (status === "At least once a day") return "Leaking once a day or more";
    return status;
  };

  const treatmentOutcomes = useMemo(() => {
    const data: TreatmentData = urinaryLeakageData;
    const treatments = ["Active Surveillance", "Focal Therapy", "Surgery", "Radiotherapy"];

    return treatments.map((treatment) => {
      const treatmentData = data[treatment]["Baseline urine leakage"][baselineLeakageStatus as keyof typeof data[string]['Baseline urine leakage']];
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
          { name: "Rarely or never leaking", value: rarely, color: "#FFC107", Icon: FilledSun },
          { name: "Leaking once a week or more", value: weekly, color: "#64B5F6", Icon: FilledDroplet },
          { name: "Leaking once a day or more", value: daily, color: "#1976D2", Icon: FilledDroplet },
        ],
      };
    });
  }, [baselineLeakageStatus]);

  const Legend = () => (
    <div className="mb-6">
      <h3 className="font-bold mb-2 text-lg">What the icons mean</h3>
      <div className="flex flex-col space-y-2">
        <div className="flex items-center"><FilledSun color="#FFC107" size={20} className="mr-2" /><span >Rarely or never leaking</span></div>
        <div className="flex items-center"><FilledDroplet color="#64B5F6" size={20} className="mr-2" /><span>Leaking once a week or more</span></div>
        <div className="flex items-center"><FilledDroplet color="#1976D2" size={20} className="mr-2" /><span>Leaking once a day or more</span></div>
      </div>
    </div>
  );

  return (
    <>
      <div className="text-sm text-gray-600 mb-4 space-y-2">
        <p>
          As men get older, some will develop urinary problems. This can happen even without prostate cancer or its treatment.
        </p>
        <p>
          The following graphs represent 100 men with the same leaking status as you. The icon plot shows how their leaking status changes at 1 year from starting their prostate cancer treatment.
        </p>
      </div>
      <div className="border-2 border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-bold mb-2 text-lg">Your current urinary function:</h3>
        <div className="flex items-center bg-pink-100 p-2 rounded"> 
          {baselineLeakageStatus === "Rarely or never" ? (
            <FilledSun color="#FFC107" size={20} className="mr-2" />
          ) : baselineLeakageStatus === "At least once a week" ? (
            <FilledDroplet color="#64B5F6" size={20} className="mr-2" />
          ) : (
            <FilledDroplet color="#1976D2" size={20} className="mr-2" />
          )}
          <span>{getBaselineDisplayName(baselineLeakageStatus)}</span>
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
      <UrinaryLeakageTable data={treatmentOutcomes} />
      <Accordion type="single" collapsible className="w-full mt-6">
        <AccordionItem value="summary">
          <AccordionTrigger className="font-bold text-lg">Summary</AccordionTrigger>
          <AccordionContent>
            <div className="text-sm text-gray-600 space-y-4">
              <p>
                Out of 100 men like you who are currently{" "}
                <span className="font-semibold">{getBaselineDisplayName(baselineLeakageStatus).toLowerCase()}</span>, the outcomes at 1 year after treatment are:
              </p>
              {treatmentOutcomes.map((treatment) => (
                <div key={treatment.name}>
                  <p className="font-semibold">For men who choose {treatment.name}:</p>
                  <ul className="list-disc list-inside pl-4">
                    {treatment.data.map((outcome) => (
                      <li key={outcome.name}>{Math.round(outcome.value)} out of 100 will be {outcome.name.toLowerCase()}.</li>
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

const UrinaryLeakagePage = () => (
  <FunctionalOutcomePageLayout title="Leaking urine at 1 year">
    <UrinaryLeakagePageContent />
  </FunctionalOutcomePageLayout>
);

export default UrinaryLeakagePage;
