import { useState, useMemo } from "react";
import { FunctionalOutcomePageLayout } from "@/layouts/FunctionalOutcomePageLayout";
import { useOutcomePageData } from "@/hooks/useOutcomePageData";
import IconArray from "@/features/results/components/IconArray";
import padUsageData from "@/assets/use_of_urinary_pads_at_one_year.json";
import { IconLegendModal } from "@/features/results/components/IconLegendModal";
import UrinaryPadUsageTable from "@/features/results/components/UrinaryPadUsageTable";
import LegendIcon from "@/features/results/components/LegendIcon";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type PadUsageOutcome = {
  "N": number;
  "Not using pad": number;
  "Using one pad a day": number;
  "Using two or more pads a day": number;
};

type TreatmentData = {
  [key: string]: {
    "Pad status at baseline": {
      "Not using pad": PadUsageOutcome;
      "Using one pad a day": PadUsageOutcome;
      "Using two or more pads a day": PadUsageOutcome;
    };
  };
};

const UrinaryPadUsagePageContent = () => {
  const { answers } = useOutcomePageData();
  const [legendModalData, setLegendModalData] = useState<{
    name: string;
    data: { name: string; value: number; color: string; iconUrl?: string }[];
  } | null>(null);

  const baselinePadStatus = useMemo(() => {
    const padUsage = answers.pad_usage || "No pads";
    if (String(padUsage).includes("2 or more")) return "Using two or more pads a day";
    if (String(padUsage).includes("1 pad")) return "Using one pad a day";
    return "Not using pad";
  }, [answers.pad_usage]);

  const treatmentOutcomes = useMemo(() => {
    const data: TreatmentData = padUsageData;
    const treatments = ["Active Surveillance", "Focal Therapy", "Surgery", "Radiotherapy"];

    return treatments.map((treatment) => {
      const treatmentData = data[treatment]["Pad status at baseline"][baselinePadStatus as keyof typeof data[string]['Pad status at baseline']];
      let notUsing = Math.round(treatmentData["Not using pad"]);
      const onePad = Math.round(treatmentData["Using one pad a day"]);
      const twoOrMorePads = Math.round(treatmentData["Using two or more pads a day"]);

      const total = notUsing + onePad + twoOrMorePads;
      if (total !== 100) {
        notUsing -= total - 100;
      }

      return {
        name: treatment,
        data: [
          { name: "No use of pad; rarely or never leaking urine", value: notUsing, color: "#1B5E20" },
          { name: "1 pad used per day; any degree of leaking urine", value: onePad, color: "#FBC02D" },
          { name: "≥2 pad used per day; any degree of leaking urine", value: twoOrMorePads, color: "#D32F2F" },
        ],
      };
    });
  }, [baselinePadStatus]);

  const Legend = () => (
    <div className="mb-6">
      <h3 className="font-bold mb-2 text-lg">What the icons mean</h3>
      <div className="flex flex-col space-y-2">
        <div className="flex items-center">
          <LegendIcon color="#1B5E20" name="No use of pad" />
          <span className="ml-2">No use of pad; rarely or never leaking urine</span>
        </div>
        <div className="flex items-center">
          <LegendIcon color="#FBC02D" name="1 pad used" />
          <span className="ml-2">1 pad used per day; any degree of leaking urine</span>
        </div>
        <div className="flex items-center">
          <LegendIcon color="#D32F2F" name="≥2 pad used" />
          <span className="ml-2">≥2 pad used per day; any degree of leaking urine</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <p className="text-sm text-gray-600 mb-4">
        The following graphs represents 100 men with the same pad usage as you. The icon plot shows how their pad usage status changes at 1 year from starting their prostate cancer treatment.
      </p>
      <div className="border-2 border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-bold mb-2 text-lg">Your current use of pad and leaking status:</h3>
        <div className="flex items-center bg-pink-100 p-2 rounded">
          <LegendIcon
            color={
              baselinePadStatus.includes("2 or more") ? "#D32F2F" :
                baselinePadStatus.includes("1 pad") ? "#FBC02D" :
                  "#1B5E20"
            }
            name={baselinePadStatus}
          />
          <span className="ml-2">{baselinePadStatus}</span>
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
      <UrinaryPadUsageTable data={treatmentOutcomes} />
      <Accordion type="single" collapsible className="w-full mt-6">
        <AccordionItem value="summary">
          <AccordionTrigger className="font-bold text-lg">Summary</AccordionTrigger>
          <AccordionContent>
            <div className="text-sm text-gray-600 space-y-4">
              <p>
                Out of 100 men like you who are currently{" "}
                <span className="font-semibold">{baselinePadStatus.toLowerCase()}</span>, the outcomes at 1 year after treatment are:
              </p>
              {treatmentOutcomes.map((treatment) => (
                <div key={treatment.name}>
                  <p className="font-semibold">For men who choose {treatment.name}:</p>
                  <ul className="list-disc list-inside pl-4">
                    {treatment.data.map((outcome) => (
                      <li key={outcome.name}>{Math.round(outcome.value)} out of 100: {outcome.name}</li>
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

const UrinaryPadUsagePage = () => (
  <FunctionalOutcomePageLayout title="Use of urinary pads at 1 year">
    <UrinaryPadUsagePageContent />
  </FunctionalOutcomePageLayout>
);

export default UrinaryPadUsagePage;
