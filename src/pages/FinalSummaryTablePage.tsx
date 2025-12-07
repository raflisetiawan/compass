import { useMemo } from "react";
import { FunctionalOutcomePageLayout } from "@/layouts/FunctionalOutcomePageLayout";
import { useOutcomePageData } from "@/hooks/useOutcomePageData";

// Import all data files
import urinaryLeakageData from "@/assets/leaking_urine_at_one_year.json";
import urinaryPadData from "@/assets/use_of_urinary_pads_at_one_year.json";
import urinaryBotherData from "@/assets/urinary_bother.json";
import erectileFunctionData from "@/assets/erectile_function_with_assist.json";
import erectileBotherData from "@/assets/erectile_bother.json";
import bowelUrgencyData from "@/assets/problem_with_bowel_urgency.json";
import bowelBotherData from "@/assets/bowel_bother.json";

const treatments = [
  { key: "Active Surveillance", urgencyKey: "Active_Surveillance", color: "bg-sky-100" },
  { key: "Focal Therapy", urgencyKey: "Focal", color: "bg-green-100" },
  { key: "Surgery", urgencyKey: "Surgery", color: "bg-orange-100" },
  { key: "Radiotherapy", urgencyKey: "EBRT", color: "bg-red-100" },
];

const definitions = [
  "No leakage: % of men who rarely or never leak",
  "No Pad used: % of men who do not wear any pad for urinary leakage",
  "No problem with urinary function: % of men who do not consider their current urinary function to be a problem",
  "Erections sufficient for intercourse: % of men whose erections are sufficient for intercourse (whether or not they are using any tablets or other medical devices to help)",
  "No problem with erectile function: % of men who do not consider their current degree of erectile function to be a problem",
  "No problem with bowel urgency: % of men who do not consider their current degree of bowel urgency to be a problem",
  "No problem with bowel function: % of men who do not consider their bowel function to be a problem",
];

// Type definitions for data files
type LeakageData = typeof urinaryLeakageData;
type PadData = typeof urinaryPadData;
type UrinaryBotherData = typeof urinaryBotherData;
type ErectileFunctionDataType = typeof erectileFunctionData;
type ErectileBotherData = typeof erectileBotherData;
type BowelUrgencyDataType = typeof bowelUrgencyData;
type BowelBotherDataType = typeof bowelBotherData;

const FinalSummaryTablePageContent = () => {
  const { answers } = useOutcomePageData();

  // Calculate baseline statuses from questionnaire answers
  const baselineStatuses = useMemo(() => {
    // Urinary Leakage
    const leakage = answers.urine_leak || "Rarely or never";
    let leakageStatus = "Rarely or never";
    let leakageLabel = "No leakage";
    if (String(leakage).includes("day")) {
      leakageStatus = "At least once a day";
      leakageLabel = "1 pad";
    } else if (String(leakage).includes("week")) {
      leakageStatus = "At least once a week";
      leakageLabel = "1 pad";
    }

    // Urinary Pad Usage
    const padUsage = answers.pad_usage || "No pads";
    let padStatus = "Not using pad";
    let padLabel = "1 pad";
    if (String(padUsage).includes("2 or more")) {
      padStatus = "Using two or more pads a day";
      padLabel = "1 pad";
    } else if (String(padUsage).includes("1 pad")) {
      padStatus = "Using one pad a day";
      padLabel = "1 pad";
    }

    // Urinary Bother
    const urinaryBother = answers.urine_problem || "Not a problem";
    let urinaryBotherStatus = "No problem";
    const urinaryBotherLabel = "Small bother";
    if (String(urinaryBother).includes("Moderate") || String(urinaryBother).includes("big"))
      urinaryBotherStatus = "Moderate/big problem";
    else if (String(urinaryBother).includes("Very") || String(urinaryBother).includes("small"))
      urinaryBotherStatus = "Very/small problem";

    // Erectile Function
    const quality = answers.erection_quality || "Firm enough for intercourse";
    const useMedication = answers.sex_medication === "Yes";
    let erectileStatus: string;
    let erectileLabel = "Good erections";

    if (quality === "Firm enough for intercourse") {
      erectileStatus = useMedication ? "Firm for intercourse - with assist" : "Firm for intercourse - no assist";
    } else if (quality === "Firm enough for masturbation and foreplay only") {
      erectileStatus = useMedication ? "Firm for masturbation - with assist" : "Firm for masturbation - no assist";
      erectileLabel = "Good erections";
    } else if (quality === "Not firm enough for any sexual activity") {
      erectileStatus = useMedication ? "Not firm - with assist" : "Not firm - no assist";
      erectileLabel = "Good erections";
    } else {
      erectileStatus = useMedication ? "None at all - with assist" : "None at all - no assist";
      erectileLabel = "Good erections";
    }

    // Erectile Bother (Sexual Bother)
    const erectileBother = answers.erection_bother || "Not a problem";
    let erectileBotherStatus = "No problem";
    const erectileBotherLabel = "No problem";
    if (String(erectileBother).includes("Moderate") || String(erectileBother).includes("big"))
      erectileBotherStatus = "Moderate/big problem";
    else if (String(erectileBother).includes("Very") || String(erectileBother).includes("small"))
      erectileBotherStatus = "Very/small problem";

    // Bowel Urgency
    const urgency = answers.bowel_urgency || "No problem";
    let urgencyStatus = "No_problem";
    const urgencyLabel = "No problem";
    if (urgency === "No problem") urgencyStatus = "No_problem";
    else if (urgency === "Very small" || urgency === "Small") urgencyStatus = "Very_small_problem";
    else if (urgency === "Moderate" || urgency === "Big problem") urgencyStatus = "Moderate_big_problem";

    // Bowel Bother
    const bowelBother = answers.bowel_bother || "Not a problem";
    let bowelBotherStatus = "No problem";
    const bowelBotherLabel = "No problem";
    if (String(bowelBother).includes("Moderate") || String(bowelBother).includes("big"))
      bowelBotherStatus = "Moderate/big problem";
    else if (String(bowelBother).includes("Very") || String(bowelBother).includes("small"))
      bowelBotherStatus = "Very/small problem";

    return {
      leakageStatus,
      leakageLabel,
      padStatus,
      padLabel,
      urinaryBotherStatus,
      urinaryBotherLabel,
      erectileStatus,
      erectileLabel,
      erectileBotherStatus,
      erectileBotherLabel,
      urgencyStatus,
      urgencyLabel,
      bowelBotherStatus,
      bowelBotherLabel,
    };
  }, [answers]);

  // Calculate outcomes for each treatment
  const tableData = useMemo(() => {
    const { leakageStatus, padStatus, urinaryBotherStatus, erectileStatus, erectileBotherStatus, urgencyStatus, bowelBotherStatus } = baselineStatuses;

    return treatments.map(({ key: treatmentName, urgencyKey, color }) => {
      // No Leaking (Rarely or never)
      const leakageResult = (urinaryLeakageData as LeakageData)[treatmentName as keyof LeakageData];
      const noLeaking = leakageResult?.["Baseline urine leakage"]?.[leakageStatus as keyof typeof leakageResult["Baseline urine leakage"]]?.["Rarely or never"] ?? null;

      // No Pad Used
      const padOutcome = (urinaryPadData as PadData)[treatmentName as keyof PadData];
      const noPadUsed = padOutcome?.["Pad status at baseline"]?.[padStatus as keyof typeof padOutcome["Pad status at baseline"]]?.["Not using pad"] ?? null;

      // No Urinary Problem
      const urinaryBotherOutcome = (urinaryBotherData as UrinaryBotherData)[treatmentName as keyof UrinaryBotherData];
      const noUrinaryProblem = urinaryBotherOutcome?.["Baseline urinary bother"]?.[urinaryBotherStatus as keyof typeof urinaryBotherOutcome["Baseline urinary bother"]]?.["No problem"] ?? null;

      // Erections Sufficient (Firm for intercourse - no assist + Firm for intercourse - with assist)
      const erectileOutcome = (erectileFunctionData as ErectileFunctionDataType)[treatmentName as keyof ErectileFunctionDataType];
      const baselineErection = erectileOutcome?.["Baseline quality of erection"]?.[erectileStatus as keyof typeof erectileOutcome["Baseline quality of erection"]];
      let erectionsSufficient: number | null = null;
      if (baselineErection) {
        erectionsSufficient = (baselineErection["Firm for intercourse - no assist"] ?? 0) + (baselineErection["Firm for intercourse - with assist"] ?? 0);
      }

      // No Erectile Problem
      const erectileBotherOutcome = (erectileBotherData as ErectileBotherData)[treatmentName as keyof ErectileBotherData];
      const noErectileProblem = erectileBotherOutcome?.["Baseline sexual bother"]?.[erectileBotherStatus as keyof typeof erectileBotherOutcome["Baseline sexual bother"]]?.["No problem"] ?? null;

      // No Bowel Urgency (No problem)
      const urgencyOutcome = (bowelUrgencyData as BowelUrgencyDataType)[urgencyKey as keyof BowelUrgencyDataType];
      const noBowelUrgency = urgencyOutcome?.Baseline?.[urgencyStatus as keyof typeof urgencyOutcome.Baseline]?.["No_problem_%"] ?? null;

      // No Bowel Problem
      const bowelBotherOutcome = (bowelBotherData as BowelBotherDataType)[treatmentName as keyof BowelBotherDataType];
      const noBowelProblem = bowelBotherOutcome?.["Baseline bowel bother"]?.[bowelBotherStatus as keyof typeof bowelBotherOutcome["Baseline bowel bother"]]?.["No problem"] ?? null;

      return {
        treatment: treatmentName,
        color,
        noLeaking,
        noPadUsed,
        noUrinaryProblem,
        erectionsSufficient,
        noErectileProblem,
        noBowelUrgency,
        noBowelProblem,
      };
    });
  }, [baselineStatuses]);

  const formatValue = (value: number | null) => {
    return value !== null ? `${value}%` : "-";
  };

  return (
    <>
      {/* Desktop Table - hidden on mobile */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          {/* Main Header */}
          <thead>
            <tr>
              <th colSpan={8} className="bg-blue-600 text-white py-3 px-4 text-center font-bold">
                Functional Outcomes at 1 year after treatment
              </th>
            </tr>
            {/* Category Headers */}
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2"></th>
              <th colSpan={3} className="border border-gray-300 p-2 text-center font-bold">
                URINARY
              </th>
              <th colSpan={2} className="border border-gray-300 p-2 text-center font-bold">
                SEXUAL
              </th>
              <th colSpan={2} className="border border-gray-300 p-2 text-center font-bold">
                BOWEL
              </th>
            </tr>
            {/* Current Status Row */}
            <tr className="bg-gray-50 text-xs">
              <td className="border border-gray-300 p-2 font-medium">Current status*</td>
              <td className="border border-gray-300 p-2 text-center">
                {baselineStatuses.leakageLabel}
              </td>
              <td className="border border-gray-300 p-2 text-center">
                {baselineStatuses.padLabel}
              </td>
              <td className="border border-gray-300 p-2 text-center">
                {baselineStatuses.urinaryBotherLabel}
              </td>
              <td className="border border-gray-300 p-2 text-center">
                {baselineStatuses.erectileLabel}
              </td>
              <td className="border border-gray-300 p-2 text-center">
                {baselineStatuses.erectileBotherLabel}
              </td>
              <td className="border border-gray-300 p-2 text-center">
                {baselineStatuses.urgencyLabel}
              </td>
              <td className="border border-gray-300 p-2 text-center">
                {baselineStatuses.bowelBotherLabel}
              </td>
            </tr>
            {/* Column Headers */}
            <tr className="bg-gray-100 text-xs">
              <th className="border border-gray-300 p-2 font-bold">TREATMENT</th>
              <th className="border border-gray-300 p-2 text-center font-medium">
                No<br />Leaking
              </th>
              <th className="border border-gray-300 p-2 text-center font-medium">
                No<br />Pad used
              </th>
              <th className="border border-gray-300 p-2 text-center font-medium">
                No problem<br />with urinary<br />function
              </th>
              <th className="border border-gray-300 p-2 text-center font-medium">
                Erections<br />sufficient for<br />intercourse
              </th>
              <th className="border border-gray-300 p-2 text-center font-medium">
                No problem<br />with erectile<br />function
              </th>
              <th className="border border-gray-300 p-2 text-center font-medium">
                No bowel<br />urgency
              </th>
              <th className="border border-gray-300 p-2 text-center font-medium">
                No problem<br />with bowel<br />function
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row) => (
              <tr key={row.treatment}>
                <td className={`border border-gray-300 p-2 font-bold ${row.color}`}>
                  {row.treatment.toUpperCase()}
                </td>
                <td className="border border-gray-300 p-2 text-center font-medium">
                  {formatValue(row.noLeaking)}
                </td>
                <td className="border border-gray-300 p-2 text-center font-medium">
                  {formatValue(row.noPadUsed)}
                </td>
                <td className="border border-gray-300 p-2 text-center font-medium">
                  {formatValue(row.noUrinaryProblem)}
                </td>
                <td className="border border-gray-300 p-2 text-center font-medium">
                  {formatValue(row.erectionsSufficient)}
                </td>
                <td className="border border-gray-300 p-2 text-center font-medium">
                  {formatValue(row.noErectileProblem)}
                </td>
                <td className="border border-gray-300 p-2 text-center font-medium">
                  {formatValue(row.noBowelUrgency)}
                </td>
                <td className="border border-gray-300 p-2 text-center font-medium">
                  {formatValue(row.noBowelProblem)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Definitions */}
        <div className="mt-6">
          <h3 className="font-bold mb-3">Definitions:</h3>
          <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
            {definitions.map((def, index) => (
              <li key={index}>{def}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-gray-600 italic">
            These definitions correspond to the lowest score (1 out of 5) of their corresponding EPIC-26 questions.
          </p>
        </div>
      </div>

      {/* Mobile Cards - shown only on mobile */}
      <div className="md:hidden space-y-4">
        {tableData.map((row) => (
          <div
            key={row.treatment}
            className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
          >
            <div className={`${row.color} px-4 py-3 font-bold border-b`}>
              {row.treatment.toUpperCase()}
            </div>
            <div className="p-4 space-y-3">
              {/* Urinary Section */}
              <div className="border-b border-gray-100 pb-3">
                <h4 className="font-semibold text-sm text-gray-500 mb-2">Urinary</h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-lg font-bold text-blue-600">{formatValue(row.noLeaking)}</div>
                    <div className="text-xs text-gray-500">No Leaking</div>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-lg font-bold text-blue-600">{formatValue(row.noPadUsed)}</div>
                    <div className="text-xs text-gray-500">No Pad</div>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-lg font-bold text-blue-600">{formatValue(row.noUrinaryProblem)}</div>
                    <div className="text-xs text-gray-500">No Problem</div>
                  </div>
                </div>
              </div>

              {/* Sexual Section */}
              <div className="border-b border-gray-100 pb-3">
                <h4 className="font-semibold text-sm text-gray-500 mb-2">Sexual</h4>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-lg font-bold text-purple-600">{formatValue(row.erectionsSufficient)}</div>
                    <div className="text-xs text-gray-500">Erections Sufficient</div>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-lg font-bold text-purple-600">{formatValue(row.noErectileProblem)}</div>
                    <div className="text-xs text-gray-500">No Problem</div>
                  </div>
                </div>
              </div>

              {/* Bowel Section */}
              <div>
                <h4 className="font-semibold text-sm text-gray-500 mb-2">Bowel</h4>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-lg font-bold text-green-600">{formatValue(row.noBowelUrgency)}</div>
                    <div className="text-xs text-gray-500">No Urgency</div>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-lg font-bold text-green-600">{formatValue(row.noBowelProblem)}</div>
                    <div className="text-xs text-gray-500">No Problem</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Mobile Definitions */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-bold mb-3">Definitions:</h3>
          <ul className="text-sm text-gray-700 space-y-2">
            {definitions.map((def, index) => (
              <li key={index} className="flex gap-2">
                <span>-</span>
                <span>{def}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-gray-600 italic">
            These definitions correspond to the lowest score (1 out of 5) of their corresponding EPIC-26 questions.
          </p>
        </div>
      </div>
    </>
  );
};

const FinalSummaryTablePage = () => (
  <FunctionalOutcomePageLayout title="Final Summary Table">
    <FinalSummaryTablePageContent />
  </FunctionalOutcomePageLayout>
);

export default FinalSummaryTablePage;
