import { useState, useMemo } from "react";
import { FunctionalOutcomePageLayout } from "@/layouts/FunctionalOutcomePageLayout";
import { useOutcomePageData } from "@/hooks/useOutcomePageData";
import { Sun, Droplet } from "lucide-react";
import IconArray from "@/features/results/components/IconArray";
import urinaryLeakageData from "@/assets/leaking_urine_at_one_year.json";
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

  const treatmentOutcomes = useMemo(() => {
    const data: TreatmentData = urinaryLeakageData;
    const treatments = ["Active Surveillance", "Focal Therapy", "Surgery", "RadioTherapy"];

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
          { name: "Rarely or never leaking", value: rarely, color: "#FFC107", Icon: Sun },
          { name: "Leaking once a week or more", value: weekly, color: "#64B5F6", Icon: Droplet },
          { name: "Leaking once a day or more", value: daily, color: "#1976D2", Icon: Droplet },
        ],
      };
    });
  }, [baselineLeakageStatus]);

  const Legend = () => (
    <div className="mb-6">
      <h3 className="font-bold mb-2 text-lg">Legend:</h3>
      <div className="flex flex-col space-y-2">
        <div className="flex items-center"><Sun className="h-5 w-5 mr-2 text-yellow-500" /><span >Rarely or never leaking</span></div>
        <div className="flex items-center"><Droplet className="h-5 w-5 mr-2 text-blue-400" /><span>Leaking once a week or more</span></div>
        <div className="flex items-center"><Droplet className="h-5 w-5 mr-2 text-blue-700" /><span>Leaking once a day or more</span></div>
      </div>
    </div>
  );

  return (
    <>
      <p className="text-sm text-gray-600 mb-4">
        The following graphs represent 100 men with the same leaking status as you. The icon plot shows how their leaking status changes at 1 year from starting their prostate cancer treatment.
      </p>
      <div className="border-2 border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-bold mb-2 text-lg">Your current urinary function:</h3>
        <div className="flex items-center bg-pink-100 p-2 rounded">
          <Sun className="h-5 w-5 mr-2 text-yellow-500" />
          <span>{baselineLeakageStatus}</span>
        </div>
      </div>
      <Legend />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {treatmentOutcomes.map((treatment) => (
          <div key={treatment.name} onClick={() => setLegendModalData(treatment)} className="cursor-pointer">
            <h3 className="font-bold text-xl mb-2 text-center">{treatment.name === "RadioTherapy" ? "Radiotherapy" : treatment.name}</h3>
            <IconArray data={treatment.data} />
          </div>
        ))}
      </div>
      <h3 className="font-bold mt-6 mb-2 text-lg">Table</h3>
      <UrinaryLeakageTable data={treatmentOutcomes} />
      <h3 className="font-bold mt-6 mb-2 text-lg">Summary</h3>
      <div className="text-sm text-gray-600 space-y-4">
        <p>
          Based on the information you have entered, for men who are currently{" "}
          <span className="font-semibold">{baselineLeakageStatus.toLowerCase()}</span>, the outcomes at 1 year after treatment are:
        </p>
        {treatmentOutcomes.map((treatment) => (
          <div key={treatment.name}>
            <p className="font-semibold">For men who choose {treatment.name === "RadioTherapy" ? "Radiotherapy" : treatment.name}:</p>
            <ul className="list-disc list-inside pl-4">
              {treatment.data.map((outcome) => (
                <li key={outcome.name}>{outcome.value}% will be {outcome.name.toLowerCase()}.</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {legendModalData && (
        <IconLegendModal
          isOpen={!!legendModalData}
          onClose={() => setLegendModalData(null)}
          title={`Legend for ${legendModalData.name === "RadioTherapy" ? "Radiotherapy" : legendModalData.name}`}
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
