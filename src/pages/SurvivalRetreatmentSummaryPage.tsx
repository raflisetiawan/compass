import { useMemo } from "react";
import { FunctionalOutcomePageLayout } from "@/layouts/FunctionalOutcomePageLayout";
import { useOutcomePageData } from "@/hooks/useOutcomePageData";

// Survival imports
import { getAgeGroup, getPSARange, getGradeGroup } from "@/services/prediction";
import survivalData from "@/assets/survival_calculation.json";
import type { SurvivalData } from "@/types";
import OncologicalOutcomesTable from "@/features/results/components/OncologicalOutcomesTable";
import StickManIcon from "@/features/results/components/StickManIcon";

// Retreatment imports
import RiskRetreatmentTable from "@/features/results/components/RiskRetreatmentTable";
import { calculateAllStrategies } from "@/utils/riskRetreatmentUtils";

const SurvivalRetreatmentSummaryPageContent = () => {
  const { answers } = useOutcomePageData();

  // ── Survival data (same logic as SurvivalAfterTreatmentPage) ──
  const survivalOutcome = useMemo(() => {
    const age = parseInt(String(answers.age || "65"), 10);
    const psa = parseFloat(String(answers.psa || "8"));
    let tStage = String(answers.cancer_stage || "T2").replace("T", "");

    if (tStage === "4") tStage = "3b";
    if (tStage === "Unknown") tStage = "2";
    if (tStage === "1 or 2" || tStage.toLowerCase().includes("1 or t2")) {
      tStage = "2";
    }

    const gleasonScore = String(answers.gleason_score || "3+4");
    let ageGroup = getAgeGroup(age);
    if (ageGroup === "65-" || ageGroup === "70-") ageGroup = "60-";
    const psaRange = getPSARange(psa);
    const gradeGroup = getGradeGroup(gleasonScore);

    let result = (survivalData.Survival as SurvivalData[]).find(
      (item) =>
        item["Age Group"] === ageGroup &&
        String(item["T Stage"]) === tStage &&
        item["Grade Group"] === gradeGroup &&
        item["PSA"] === psaRange
    );

    const hasValidData = (data: SurvivalData | undefined) =>
      data && data["Alive (%)"] !== "" && data["Alive (%)"] != null;

    if (!hasValidData(result)) {
      if (gradeGroup === 1) {
        const fallbackResult = (survivalData.Survival as SurvivalData[]).find(
          (item) =>
            item["Age Group"] === ageGroup &&
            String(item["T Stage"]) === tStage &&
            item["Grade Group"] === 2 &&
            item["PSA"] === psaRange
        );
        if (hasValidData(fallbackResult)) result = fallbackResult;
      }
    }

    return result;
  }, [answers]);

  const survivalIconData = useMemo(() => {
    if (!survivalOutcome) return [];
    const alive = Number(survivalOutcome["Alive (%)"]);
    const pcaDeath = Number(survivalOutcome["PCa Death (%)"]);
    const otherDeath = Number(survivalOutcome["Other Death (%)"]);

    return [
      { name: "Alive", value: alive, color: "#6B8E23" },
      { name: "Death (from prostate cancer)", value: pcaDeath, color: "#D32F2F" },
      { name: "Death (from other causes)", value: otherDeath, color: "#9E9E9E" },
    ];
  }, [survivalOutcome]);

  // ── Retreatment data (same logic as RiskRetreatmentPage) ──
  const strategyResults = useMemo(() => calculateAllStrategies(answers), [answers]);

  const treatmentOutcomes = useMemo(
    () => [
      { name: "Active Surveillance", ...strategyResults.activeSurveillance },
      { name: "Focal Therapy", ...strategyResults.focalTherapy },
      { name: "Surgery", ...strategyResults.surgery },
      { name: "Radiotherapy", ...strategyResults.radiotherapy },
    ],
    [strategyResults]
  );

  return (
    <>
      {/* ── Section 1: Survival Table ── */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          Survival after prostate cancer diagnosis
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          The table below shows the predicted survival outcomes 5 years after
          receiving a diagnosis of prostate cancer, for 100 men with a cancer
          like yours.
        </p>

        <div className="border-2 border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="font-bold mb-2 text-lg">
            Summary of clinical parameters used:
          </h3>
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

        {survivalIconData.length > 0 ? (
          <>
            {/* Legend */}
            <div className="mb-4">
              <h3 className="font-bold mb-2 text-lg">What the icons mean</h3>
              <div className="flex flex-col space-y-2">
                {survivalIconData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <StickManIcon color={item.color} size={20} />
                    <span className="text-sm text-gray-700">
                      {item.name}: {item.value.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <OncologicalOutcomesTable data={survivalIconData} />
          </>
        ) : (
          <p className="text-sm text-gray-500">
            Survival data is not available for the given clinical parameters.
          </p>
        )}
      </section>

      {/* Divider */}
      <hr className="border-gray-300 my-8" />

      {/* ── Section 2: Additional Treatment Table ── */}
      <section>
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          Need for additional treatment
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          The table below shows the predicted treatment outcomes based on your
          clinical parameters, including the probability of requiring additional
          treatment or retreatment.
        </p>

        <div className="border-2 border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="font-bold mb-2 text-lg">Your Clinical Parameters:</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">T Stage:</span>{" "}
              <span className="font-medium">
                {answers.cancer_stage || answers.t_stage || "Not specified"}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Gleason Score:</span>{" "}
              <span className="font-medium">
                {answers.gleason_score || answers.gleason || "Not specified"}
              </span>
            </div>
            <div>
              <span className="text-gray-600">PSA:</span>{" "}
              <span className="font-medium">{answers.psa || "Not specified"} ng/mL</span>
            </div>
            <div>
              <span className="text-gray-600">MRI Visibility:</span>{" "}
              <span className="font-medium">
                {answers.mri_pirad_score || answers.mri_visibility || "Not specified"}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Maximum Cancer Core Length:</span>{" "}
              <span className="font-medium">
                {answers.max_cancer_core_length
                  ? `${answers.max_cancer_core_length} mm`
                  : "Not specified"}
              </span>
            </div>
            <div>
              <span className="text-gray-600">PSA Density:</span>{" "}
              <span className="font-medium">
                {answers.psa && answers.prostate_volume
                  ? (
                      parseFloat(String(answers.psa)) /
                      parseFloat(String(answers.prostate_volume))
                    ).toFixed(2)
                  : "Not specified"}
              </span>
            </div>
          </div>
        </div>

        <RiskRetreatmentTable data={treatmentOutcomes} />
      </section>
    </>
  );
};

const SurvivalRetreatmentSummaryPage = () => (
  <FunctionalOutcomePageLayout title="Survival and Additional Treatment Summary">
    <SurvivalRetreatmentSummaryPageContent />
  </FunctionalOutcomePageLayout>
);

export default SurvivalRetreatmentSummaryPage;
