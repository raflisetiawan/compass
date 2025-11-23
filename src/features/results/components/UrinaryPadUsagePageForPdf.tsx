import { useMemo } from "react";
import IconArray from "@/features/results/components/IconArray";
import padUsageData from "@/assets/use_of_urinary_pads_at_one_year.json";
import UrinaryPadUsageTable from "@/features/results/components/UrinaryPadUsageTable";
import sunUnderwear from "@/assets/img/icons/sun_underwear.png";
import padWater from "@/assets/img/icons/pad_water.png";
import darkPadWater from "@/assets/img/icons/dark_pad_water.png";
import type { Answers } from '@/types/questionnaire';

type PadUsageOutcome = {
  N: number;
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

interface UrinaryPadUsagePageForPdfProps {
  answers: Answers;
}

const UrinaryPadUsagePageForPdf = ({
  answers,
}: UrinaryPadUsagePageForPdfProps) => {
  const baselinePadStatus = useMemo(() => {
    const padUsage = answers.pad_usage || "No pads";
    if (String(padUsage).includes("2 or more"))
      return "Using two or more pads a day";
    if (String(padUsage).includes("1 pad")) return "Using one pad a day";
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
      const treatmentData =
        data[treatment]["Pad status at baseline"][
        baselinePadStatus as keyof (typeof data)[string]["Pad status at baseline"]
        ];
      let notUsing = Math.round(treatmentData["Not using pad"]);
      const onePad = Math.round(treatmentData["Using one pad a day"]);
      const twoOrMorePads = Math.round(
        treatmentData["Using two or more pads a day"]
      );

      const total = notUsing + onePad + twoOrMorePads;
      if (total !== 100) {
        notUsing -= total - 100;
      }

      return {
        name: treatment,
        data: [
          {
            name: "No use of pad; rarely or never leaking urine",
            value: notUsing,
            color: "#FFC107",
            iconUrl: sunUnderwear,
          },
          {
            name: "1 pad used per day; any degree of leaking urine",
            value: onePad,
            color: "#64B5F6",
            iconUrl: padWater,
          },
          {
            name: "≥2 pad used per day; any degree of leaking urine",
            value: twoOrMorePads,
            color: "#1976D2",
            iconUrl: darkPadWater,
          },
        ],
      };
    });
  }, [baselinePadStatus]);

  const Legend = () => (
    <div className="mb-6">
      <h3 className="font-bold mb-2 text-lg">Legend:</h3>
      <div className="flex flex-col space-y-2">
        <div className="flex items-center">
          <img
            src={sunUnderwear}
            alt="No use of pad; rarely or never leaking urine"
            className="w-5 h-5 mr-2"
          />
          <span>No use of pad; rarely or never leaking urine</span>
        </div>
        <div className="flex items-center">
          <img
            src={padWater}
            alt="1 pad used per day; any degree of leaking urine"
            className="w-5 h-5 mr-2"
          />
          <span>1 pad used per day; any degree of leaking urine</span>
        </div>
        <div className="flex items-center">
          <img
            src={darkPadWater}
            alt="≥2 pad used per day; any degree of leaking urine"
            className="w-5 h-5 mr-2"
          />
          <span>≥2 pad used per day; any degree of leaking urine</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 bg-white">
      <p className="text-sm text-gray-600 mb-4">
        The following graphs represents 100 men with the same pad usage as you.
        The icon plot shows how their pad usage status changes at 1 year from
        starting their prostate cancer treatment.
      </p>
      <div className="border-2 border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-bold mb-2 text-lg">
          Your current use of pad and leaking status:
        </h3>
        <div className="flex items-center bg-pink-100 p-2 rounded">
          <img
            src={sunUnderwear}
            alt={baselinePadStatus}
            className="w-5 h-5 mr-2"
          />
          <span>{baselinePadStatus}</span>
        </div>
      </div>
      <Legend />
      <div className="grid grid-cols-2 gap-8">
        {treatmentOutcomes.map((treatment) => (
          <div key={treatment.name}>
            <h3 className="font-bold text-xl mb-2 text-center">
              {treatment.name}
            </h3>
            <IconArray data={treatment.data} />
          </div>
        ))}
      </div>
      <h3 className="font-bold mt-6 mb-2 text-lg">Table</h3>
      <UrinaryPadUsageTable data={treatmentOutcomes} />
      <h3 className="font-bold mt-6 mb-2 text-lg">Summary</h3>
      <div className="text-sm text-gray-600 space-y-4">
        <p>
          Based on the information you have entered, for men who are currently{" "}
          <span className="font-semibold">
            {baselinePadStatus.toLowerCase()}
          </span>
          , the outcomes at 1 year after treatment are:
        </p>
        {treatmentOutcomes.map((treatment) => (
          <div key={treatment.name}>
            <p className="font-semibold">
              For men who choose {treatment.name}:
            </p>
            <ul className="list-disc list-inside pl-4">
              {treatment.data.map((outcome) => (
                <li key={outcome.name}>
                  {outcome.value}%: {outcome.name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UrinaryPadUsagePageForPdf;
