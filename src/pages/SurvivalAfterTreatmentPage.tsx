import { useMemo } from "react";
import { FunctionalOutcomePageLayout } from "@/layouts/FunctionalOutcomePageLayout";
import { useOutcomePageData } from "@/hooks/useOutcomePageData";
import IconArray from "@/features/results/components/IconArray";
import OncologicalOutcomesTable from "@/features/results/components/OncologicalOutcomesTable";
import { getAgeGroup, getPSARange, getGradeGroup } from "@/services/prediction";
import survivalData from "@/assets/survival_calculation.json";
import type { SurvivalData } from "@/types";
import StickManIcon from "@/features/results/components/StickManIcon";
import NoFunctionalDataMessage from "@/features/results/components/NoFunctionalDataMessage";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const SurvivalAfterTreatmentPageContent = () => {
  const { answers } = useOutcomePageData();

  const survivalOutcome = useMemo(() => {
    const age = parseInt(String(answers.age || "65"), 10);
    const psa = parseFloat(String(answers.psa || "8"));
    const tStage = String(answers.cancer_stage || "T2").replace("T", "");

    // T4 and Unknown are not in the dataset — return null to show "no data" message
    if (tStage === "4" || tStage === "Unknown") {
      return null;
    }
    // Handle "T1 or T2" option - use T2 data
    const effectiveTStage = (tStage === "1 or 2" || tStage.toLowerCase().includes("1 or t2")) ? "2" : tStage;

    const gleasonScore = String(answers.gleason_score || "3+4");

    const ageGroup = getAgeGroup(age);
    const psaRange = getPSARange(psa);
    const gradeGroup = getGradeGroup(gleasonScore);

    let result = (survivalData.Survival as SurvivalData[]).find(
      (item) =>
        item["Age Group"] === ageGroup &&
        String(item["T Stage"]) === effectiveTStage &&
        item["Grade Group"] === gradeGroup &&
        item["PSA"] === psaRange
    );

    // Fallback mechanisms for missing data (specifically for rare combinations like Grade 1, T3a, PSA > 20)
    const hasValidData = (data: SurvivalData | undefined) => {
      // Check if data exists and 'Alive (%)' is not an empty string or null/undefined
      return data && data["Alive (%)"] !== "" && data["Alive (%)"] != null;
    };

    if (!hasValidData(result)) {
      // Fallback 1: If Grade Group is 1, try using Grade Group 2 (assumption: behaves like higher risk if T3a/High PSA)
      if (gradeGroup === 1) {
        const fallbackResult = (survivalData.Survival as SurvivalData[]).find(
          (item) =>
            item["Age Group"] === ageGroup &&
            String(item["T Stage"]) === effectiveTStage &&
            item["Grade Group"] === 2 &&
            item["PSA"] === psaRange
        );
        if (hasValidData(fallbackResult)) {
          result = fallbackResult;
        }
      }
    }
    
    // Add additional fallbacks here if necessary

    return result;
  }, [answers]);

  const iconArrayData = useMemo(() => {
    if (!survivalOutcome) return [];

    const alive = Number(survivalOutcome["Alive (%)"]);
    const pcaDeath = Number(survivalOutcome["PCa Death (%)"]);
    const otherDeath = Number(survivalOutcome["Other Death (%)"]);

    return [
      { name: "Alive", value: alive, color: "#6B8E23", Icon: StickManIcon },
      {
        name: "Death (from prostate cancer)",
        value: pcaDeath,
        color: "#D32F2F",
        Icon: StickManIcon,
      },
      {
        name: "Death (from other causes)",
        value: otherDeath,
        color: "#9E9E9E",
        Icon: StickManIcon,
      },
    ];
  }, [survivalOutcome]);

  if (!survivalOutcome) {
    return <NoFunctionalDataMessage />;
  }

  return (
    <>
      <div className="text-sm text-gray-600 mb-4 space-y-3">
        <p>
          We know that many men, when they are first told they have prostate cancer, worry about whether this means that prostate cancer will shorten their life.
        </p>
        <p>
          We know that for most men with localised prostate cancer, the prostate cancer will not affect how long they live. Survival following a diagnosis of localised prostate cancer is therefore very good and people may have a higher risk of dying from other causes (such as dementia or heart problems).
        </p>
        <p className="font-semibold">
          The following graph represents 100 men with a cancer like yours. The icon plot shows what happens to those men 5 years after receiving a diagnosis of prostate cancer.
        </p>
      </div>
      <div className="border-2 border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-bold mb-2 text-lg">Summary of clinical parameters used for this section:</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-600">Age:</span>{" "}
            <span className="font-medium">{answers.age || "Not specified"}</span>
          </div>
          <div>
            <span className="text-gray-600">Gleason Score:</span>{" "}
            <span className="font-medium">{answers.gleason_score || "Not specified"}</span>
          </div>
          <div>
            <span className="text-gray-600">T Stage:</span>{" "}
            <span className="font-medium">{answers.cancer_stage || "Not specified"}</span>
          </div>
          <div>
            <span className="text-gray-600">PSA:</span>{" "}
            <span className="font-medium">{answers.psa || "Not specified"} ng/mL</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row md:items-start gap-6">
        <div className="max-w-[200px]">
          <IconArray data={iconArrayData} />
        </div>
        <div className="flex-shrink-0">
          <h3 className="font-bold mb-3 text-lg">What the icons mean</h3>
          <div className="flex flex-col space-y-2">
            {iconArrayData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <StickManIcon color={item.color} size={20} />
                <span className="text-sm text-gray-700">
                  {item.name}: {item.value.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-6">
        <OncologicalOutcomesTable data={iconArrayData} />
      </div>
      <Accordion type="single" collapsible className="w-full mt-6">
        <AccordionItem value="summary">
          <AccordionTrigger className="font-bold text-lg">Summary</AccordionTrigger>
          <AccordionContent>
            {iconArrayData.length > 0 && (
              <div className="text-sm text-gray-600 space-y-2">
                <p>Based on the information you have entered:</p>
                <ul className="list-disc list-inside pl-4">
                  <li>
                    {iconArrayData[0].value.toFixed(2)} out of 100 men who are diagnosed with prostate cancer in the UK will be alive at 5 years.
                  </li>
                  <li>
                    {iconArrayData[1].value.toFixed(2)} out of 100 men will have died from prostate cancer.
                  </li>
                  <li>
                    {iconArrayData[2].value.toFixed(2)} out of 100 men will have died from causes that are not related to prostate cancer.
                  </li>
                </ul>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
};

const SurvivalAfterTreatmentPage = () => (
  <FunctionalOutcomePageLayout title="Survival after prostate cancer treatment">
    <SurvivalAfterTreatmentPageContent />
  </FunctionalOutcomePageLayout>
);

export default SurvivalAfterTreatmentPage;
