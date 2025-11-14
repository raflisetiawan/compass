import { useMemo } from "react";
import { FunctionalOutcomePageLayout } from "@/layouts/FunctionalOutcomePageLayout";
import { useOutcomePageData } from "@/hooks/useOutcomePageData";
import IconArray from "@/features/results/components/IconArray";
import SurvivalDataTable from "@/features/results/components/SurvivalDataTable";
import { getAgeGroup, getPSARange, getGradeGroup } from "@/services/prediction";
import survivalData from "@/assets/survival_calculation.json";
import type { SurvivalData } from "@/types";
import LegendIcon from "@/features/results/components/LegendIcon";

const SurvivalAfterTreatmentPageContent = () => {
  const { answers } = useOutcomePageData();

  const survivalOutcome = useMemo(() => {
    const age = parseInt(String(answers.age || "65"), 10);
    const psa = parseFloat(String(answers.psa || "8"));
    const tStage = String(answers.cancer_stage || "T2").replace("T", "");
    const gleasonScore = String(answers.gleason_score || "3+4");

    const ageGroup = getAgeGroup(age);
    const psaRange = getPSARange(psa);
    const gradeGroup = getGradeGroup(gleasonScore);

    const result = (survivalData.Survival as SurvivalData[]).find(
      (item) =>
        item["Age Group"] === ageGroup &&
        String(item["T Stage"]) === tStage &&
        item["Grade Group"] === gradeGroup &&
        item["PSA"] === psaRange
    );

    return result;
  }, [answers]);

  const iconArrayData = useMemo(() => {
    if (!survivalOutcome) return [];

    let alive = Math.round(Number(survivalOutcome["Alive (%)"]));
    const pcaDeath = Math.round(Number(survivalOutcome["PCa Death (%)"]));
    const otherDeath = Math.round(Number(survivalOutcome["Other Death (%)"]));

    const total = alive + pcaDeath + otherDeath;
    if (total !== 100) {
      alive -= total - 100;
    }

    return [
      { name: "Alive", value: alive, color: "#8BC34A" },
      { name: "Death (from prostate cancer)", value: pcaDeath, color: "#F44336" },
      { name: "Death (from other causes)", value: otherDeath, color: "#9E9E9E" },
    ];
  }, [survivalOutcome]);

  return (
    <>
      <p className="text-sm text-gray-600 mb-4">
        The following graph represents 100 men with the same characteristics that you have indicated. The icon plot shows what happens those men after 5 years from receiving their diagnosis of prostate cancer.
      </p>
      <div className="flex flex-col md:flex-row md:items-start gap-4">
        <IconArray data={iconArrayData} />
        <div className="flex flex-wrap gap-4 md:mt-0">
          {iconArrayData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <LegendIcon color={item.color} name={item.name} />
              <span className="text-sm text-gray-700">{item.name} ({item.value}%)</span>
            </div>
          ))}
        </div>
      </div>
      <h3 className="font-bold mt-6 mb-2 text-lg">Table</h3>
      <SurvivalDataTable data={survivalOutcome} />
      <h3 className="font-bold mt-6 mb-2 text-lg">Summary</h3>
      {iconArrayData.length > 0 && (
        <div className="text-sm text-gray-600 space-y-2">
          <p>Based on the information you have entered:</p>
          <ul className="list-disc list-inside pl-4">
            <li>{iconArrayData[0].value}% of men who are diagnosed with prostate cancer in the UK will be alive at 5 years.</li>
            <li>{iconArrayData[1].value}% of men will have died from prostate cancer.</li>
            <li>{iconArrayData[2].value}% of men will have died from causes that are not related to prostate cancer.</li>
          </ul>
        </div>
      )}
    </>
  );
};

const SurvivalAfterTreatmentPage = () => (
  <FunctionalOutcomePageLayout title="Survival after prostate cancer treatment">
    <SurvivalAfterTreatmentPageContent />
  </FunctionalOutcomePageLayout>
);

export default SurvivalAfterTreatmentPage;
