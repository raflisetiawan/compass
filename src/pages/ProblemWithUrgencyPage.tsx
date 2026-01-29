import { useState, useMemo } from "react";
import { FunctionalOutcomePageLayout } from "@/layouts/FunctionalOutcomePageLayout";
import { useOutcomePageData } from "@/hooks/useOutcomePageData";
import NoFunctionalDataMessage from "@/features/results/components/NoFunctionalDataMessage";
import IconArray from "@/features/results/components/IconArray";
import problemWithUrgencyData from "@/assets/problem_with_bowel_urgency.json";
import { IconLegendModal } from "@/features/results/components/IconLegendModal";
import ProblemWithUrgencyTable from "@/features/results/components/ProblemWithUrgencyTable";
import LegendIcon from "@/features/results/components/LegendIcon";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type UrgencyOutcome = {
  N: number;
  "No_problem_%": number;
  "Very_small_problem_%": number;
  "Moderate_big_problem_%": number;
};

type TreatmentData = {
  [key: string]: {
    Baseline: {
      No_problem: UrgencyOutcome;
      Very_small_problem: UrgencyOutcome;
      Moderate_big_problem: UrgencyOutcome;
    };
  };
};

const ProblemWithUrgencyPageContent = () => {
  const { answers } = useOutcomePageData();
  const [legendModalData, setLegendModalData] = useState<{
    name: string;
    data: { name: string; value: number; color: string; Icon?: React.ElementType }[];
  } | null>(null);

  const baselineStatus = useMemo(() => {
    const urgency = answers.bowel_urgency || "No problem";
    if (urgency === "No problem") return "No_problem";
    if (urgency === "Very small" || urgency === "Small") return "Very_small_problem";
    if (urgency === "Moderate" || urgency === "Big problem") return "Moderate_big_problem";
    return "No_problem";
  }, [answers.bowel_urgency]);

  // Helper function to get display name for baseline status
  const getBaselineDisplayName = (status: string): string => {
    if (status === "No_problem") return "No problem";
    if (status === "Very_small_problem") return "Very small or small problem";
    if (status === "Moderate_big_problem") return "Moderate or big problem";
    return status.replace(/_/g, ' ');
  };

  const treatmentOutcomes = useMemo(() => {
    const data: TreatmentData = {
      "Active Surveillance": problemWithUrgencyData.Active_Surveillance,
      "Focal Therapy": problemWithUrgencyData.Focal,
      "Surgery": problemWithUrgencyData.Surgery,
      "Radiotherapy": problemWithUrgencyData.EBRT,
    };
    const treatments = ["Active Surveillance", "Focal Therapy", "Surgery", "Radiotherapy"];

    return treatments.map((treatment) => {
      const treatmentData = data[treatment].Baseline[baselineStatus as keyof typeof data[string]['Baseline']];

      let noProblem = Math.round(treatmentData["No_problem_%"]);
      const smallProblem = Math.round(treatmentData["Very_small_problem_%"]);
      const bigProblem = Math.round(treatmentData["Moderate_big_problem_%"]);

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
  }, [baselineStatus]);

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
      {!answers.bowel_urgency ? (
        <NoFunctionalDataMessage />
      ) : (
        <>
          <div className="text-sm text-gray-600 mb-4 space-y-2">
            <p>
              As men get older, some will develop problems with their bowel function. This can happen even without prostate cancer or its treatment.
            </p>
            <p>
              The following graphs represent 100 men with the same problem with bowel urgency as you. The icon plot show how their degree of problem with bowel urgency changes at 1 year from starting their prostate cancer treatment.
            </p>
          </div>
          <div className="border-2 border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-bold mb-2 text-lg">Your current problem with bowel urgency status:</h3>
            <div className="flex items-center bg-pink-100 p-2 rounded">
              <LegendIcon
                color={
                  baselineStatus === "No_problem" ? "#1b5e20" :
                    baselineStatus === "Very_small_problem" ? "#ffc107" :
                      "#dc3545"
                }
                name={baselineStatus}
              />
              <span className="ml-2">{getBaselineDisplayName(baselineStatus)}</span>
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
      <ProblemWithUrgencyTable data={treatmentOutcomes} />
      <Accordion type="single" collapsible className="w-full mt-6">
        <AccordionItem value="summary">
          <AccordionTrigger className="font-bold text-lg">Summary</AccordionTrigger>
          <AccordionContent>
            <div className="text-sm text-gray-600 space-y-4">
              <p>
                Out of 100 men like you who are currently experiencing a "{getBaselineDisplayName(baselineStatus).toLowerCase()}", the outcomes at 1 year after treatment are:
              </p>
              {treatmentOutcomes.map((treatment) => (
                <div key={treatment.name}>
                  <p className="font-semibold">For men who choose {treatment.name}:</p>
                  <ul className="list-disc list-inside pl-4">
                    {treatment.data.map((outcome) => (
                      <li key={outcome.name}>{Math.round(outcome.value)} out of 100 will consider bowel urgency after treatment {outcome.name.toLowerCase()}.</li>
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
      )}
    </>
  );
};

const ProblemWithUrgencyPage = () => (
  <FunctionalOutcomePageLayout title="Problem with bowel urgency at 1 year">
    <ProblemWithUrgencyPageContent />
  </FunctionalOutcomePageLayout>
);

export default ProblemWithUrgencyPage;
