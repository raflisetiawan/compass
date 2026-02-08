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
    const leakage = answers.urine_leak;
    let leakageStatus: string | null = null;
    let leakageLabel = "Not answered";
    if (leakage) {
      if (String(leakage).includes("day")) {
        leakageStatus = "At least once a day";
        leakageLabel = "Leaks daily";
      } else if (String(leakage).includes("week")) {
        leakageStatus = "At least once a week";
        leakageLabel = "Leaks weekly";
      } else {
        leakageStatus = "Rarely or never";
        leakageLabel = "No leakage";
      }
    }

    // Urinary Pad Usage
    const padUsage = answers.pad_usage;
    let padStatus: string | null = null;
    let padLabel = "Not answered";
    if (padUsage) {
      if (String(padUsage).includes("2 or more") || String(padUsage).includes("3 or more")) {
        padStatus = "Using two or more pads a day";
        padLabel = "2+ pads/day";
      } else if (String(padUsage).includes("1 pad")) {
        padStatus = "Using one pad a day";
        padLabel = "1 pad/day";
      } else {
        padStatus = "Not using pad";
        padLabel = "No pad";
      }
    }

    // Urinary Bother
    const urinaryBother = answers.urine_problem;
    let urinaryBotherStatus: string | null = null;
    let urinaryBotherLabel = "Not answered";
    if (urinaryBother) {
      if (String(urinaryBother).includes("Moderate") || String(urinaryBother).includes("big") || String(urinaryBother).includes("Big")) {
        urinaryBotherStatus = "Moderate/big problem";
        urinaryBotherLabel = "Moderate/big problem";
      } else if (String(urinaryBother).includes("Small") || String(urinaryBother).includes("small")) {
        urinaryBotherStatus = "Very/small problem";
        urinaryBotherLabel = "Small problem";
      } else if (String(urinaryBother).includes("Very")) {
        urinaryBotherStatus = "Very/small problem";
        urinaryBotherLabel = "Very small problem";
      } else {
        urinaryBotherStatus = "No problem";
        urinaryBotherLabel = "No problem";
      }
    }

    // Erectile Function
    const quality = answers.erection_quality;
    const useMedication = answers.sex_medication === "Yes";
    let erectileStatus: string | null = null;
    let erectileLabel = "Not answered";

    if (quality) {
      if (quality === "Firm enough for intercourse") {
        erectileStatus = useMedication ? "Firm for intercourse - with assist" : "Firm for intercourse - no assist";
        erectileLabel = "Firm for intercourse";
      } else if (quality === "Firm enough for masturbation and foreplay only") {
        erectileStatus = useMedication ? "Firm for masturbation - with assist" : "Firm for masturbation - no assist";
        erectileLabel = "Firm for masturbation only";
      } else if (quality === "Not firm enough for any sexual activity") {
        erectileStatus = useMedication ? "Not firm - with assist" : "Not firm - no assist";
        erectileLabel = "Not firm enough";
      } else {
        erectileStatus = useMedication ? "None at all - with assist" : "None at all - no assist";
        erectileLabel = "No erections";
      }
    }

    // Erectile Bother (Sexual Bother)
    const erectileBother = answers.erection_bother;
    let erectileBotherStatus: string | null = null;
    let erectileBotherLabel = "Not answered";
    if (erectileBother) {
      if (String(erectileBother).includes("Moderate") || String(erectileBother).includes("big") || String(erectileBother).includes("Big")) {
        erectileBotherStatus = "Moderate/big problem";
        erectileBotherLabel = "Moderate/big problem";
      } else if (String(erectileBother).includes("Small") || String(erectileBother).includes("small")) {
        erectileBotherStatus = "Very/small problem";
        erectileBotherLabel = "Small problem";
      } else if (String(erectileBother).includes("Very")) {
        erectileBotherStatus = "Very/small problem";
        erectileBotherLabel = "Very small problem";
      } else {
        erectileBotherStatus = "No problem";
        erectileBotherLabel = "No problem";
      }
    }

    // Bowel Urgency
    const urgency = answers.bowel_urgency;
    let urgencyStatus: string | null = null;
    let urgencyLabel = "Not answered";
    if (urgency) {
      if (urgency === "No problem") {
        urgencyStatus = "No_problem";
        urgencyLabel = "No problem";
      } else if (String(urgency).includes("Very small")) {
        urgencyStatus = "Very_small_problem";
        urgencyLabel = "Very small problem";
      } else if (String(urgency).includes("Small")) {
        urgencyStatus = "Very_small_problem";
        urgencyLabel = "Small problem";
      } else if (String(urgency).includes("Moderate")) {
        urgencyStatus = "Moderate_big_problem";
        urgencyLabel = "Moderate problem";
      } else if (String(urgency).includes("Big") || String(urgency).includes("big")) {
        urgencyStatus = "Moderate_big_problem";
        urgencyLabel = "Big problem";
      }
    }

    // Bowel Bother
    const bowelBother = answers.bowel_bother;
    let bowelBotherStatus: string | null = null;
    let bowelBotherLabel = "Not answered";
    if (bowelBother) {
      if (String(bowelBother).includes("Moderate") || String(bowelBother).includes("big") || String(bowelBother).includes("Big")) {
        bowelBotherStatus = "Moderate/big problem";
        bowelBotherLabel = "Moderate/big problem";
      } else if (String(bowelBother).includes("Small") || String(bowelBother).includes("small")) {
        bowelBotherStatus = "Very/small problem";
        bowelBotherLabel = "Small problem";
      } else if (String(bowelBother).includes("Very")) {
        bowelBotherStatus = "Very/small problem";
        bowelBotherLabel = "Very small problem";
      } else {
        bowelBotherStatus = "No problem";
        bowelBotherLabel = "No problem";
      }
    }

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
      // No Leaking (Rarely or never) - only calculate if answered
      let noLeaking: number | null = null;
      if (leakageStatus) {
        const leakageResult = (urinaryLeakageData as LeakageData)[treatmentName as keyof LeakageData];
        noLeaking = leakageResult?.["Baseline urine leakage"]?.[leakageStatus as keyof typeof leakageResult["Baseline urine leakage"]]?.["Rarely or never"] ?? null;
      }

      // No Pad Used - only calculate if answered
      let noPadUsed: number | null = null;
      if (padStatus) {
        const padOutcome = (urinaryPadData as PadData)[treatmentName as keyof PadData];
        noPadUsed = padOutcome?.["Pad status at baseline"]?.[padStatus as keyof typeof padOutcome["Pad status at baseline"]]?.["Not using pad"] ?? null;
      }

      // No Urinary Problem - only calculate if answered
      let noUrinaryProblem: number | null = null;
      if (urinaryBotherStatus) {
        const urinaryBotherOutcome = (urinaryBotherData as UrinaryBotherData)[treatmentName as keyof UrinaryBotherData];
        noUrinaryProblem = urinaryBotherOutcome?.["Baseline urinary bother"]?.[urinaryBotherStatus as keyof typeof urinaryBotherOutcome["Baseline urinary bother"]]?.["No problem"] ?? null;
      }

      // Erections Sufficient - only calculate if answered
      let erectionsSufficient: number | null = null;
      if (erectileStatus) {
        const erectileOutcome = (erectileFunctionData as ErectileFunctionDataType)[treatmentName as keyof ErectileFunctionDataType];
        const baselineErection = erectileOutcome?.["Baseline quality of erection"]?.[erectileStatus as keyof typeof erectileOutcome["Baseline quality of erection"]];
        if (baselineErection) {
          erectionsSufficient = (baselineErection["Firm for intercourse - no assist"] ?? 0) + (baselineErection["Firm for intercourse - with assist"] ?? 0);
        }
      }

      // No Erectile Problem - only calculate if answered
      let noErectileProblem: number | null = null;
      if (erectileBotherStatus) {
        const erectileBotherOutcome = (erectileBotherData as ErectileBotherData)[treatmentName as keyof ErectileBotherData];
        noErectileProblem = erectileBotherOutcome?.["Baseline sexual bother"]?.[erectileBotherStatus as keyof typeof erectileBotherOutcome["Baseline sexual bother"]]?.["No problem"] ?? null;
      }

      // No Bowel Urgency - only calculate if answered
      let noBowelUrgency: number | null = null;
      if (urgencyStatus) {
        const urgencyOutcome = (bowelUrgencyData as BowelUrgencyDataType)[urgencyKey as keyof BowelUrgencyDataType];
        noBowelUrgency = urgencyOutcome?.Baseline?.[urgencyStatus as keyof typeof urgencyOutcome.Baseline]?.["No_problem_%"] ?? null;
      }

      // No Bowel Problem - only calculate if answered
      let noBowelProblem: number | null = null;
      if (bowelBotherStatus) {
        const bowelBotherOutcome = (bowelBotherData as BowelBotherDataType)[treatmentName as keyof BowelBotherDataType];
        noBowelProblem = bowelBotherOutcome?.["Baseline bowel bother"]?.[bowelBotherStatus as keyof typeof bowelBotherOutcome["Baseline bowel bother"]]?.["No problem"] ?? null;
      }

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
        {/* Current Status Card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-blue-600 text-white px-4 py-3 font-bold text-center text-sm">
            Functional Outcomes at 1 year after treatment
          </div>
          <div className="px-4 py-3 bg-gray-50 border-b">
            <h4 className="font-semibold text-sm text-gray-700 mb-2">Your Current Status*</h4>
          </div>
          <div className="p-4 space-y-3">
            {/* Urinary Status */}
            <div className="border-b border-gray-100 pb-3">
              <h5 className="font-semibold text-xs text-gray-500 mb-2 uppercase">Urinary</h5>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Leakage:</span>
                  <span className={`font-medium ${baselineStatuses.leakageLabel === "Not answered" ? "text-orange-500 italic" : "text-gray-800"}`}>
                    {baselineStatuses.leakageLabel}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Pad usage:</span>
                  <span className={`font-medium ${baselineStatuses.padLabel === "Not answered" ? "text-orange-500 italic" : "text-gray-800"}`}>
                    {baselineStatuses.padLabel}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Urinary bother:</span>
                  <span className={`font-medium ${baselineStatuses.urinaryBotherLabel === "Not answered" ? "text-orange-500 italic" : "text-gray-800"}`}>
                    {baselineStatuses.urinaryBotherLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Sexual Status */}
            <div className="border-b border-gray-100 pb-3">
              <h5 className="font-semibold text-xs text-gray-500 mb-2 uppercase">Sexual</h5>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Erectile function:</span>
                  <span className={`font-medium ${baselineStatuses.erectileLabel === "Not answered" ? "text-orange-500 italic" : "text-gray-800"}`}>
                    {baselineStatuses.erectileLabel}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Sexual bother:</span>
                  <span className={`font-medium ${baselineStatuses.erectileBotherLabel === "Not answered" ? "text-orange-500 italic" : "text-gray-800"}`}>
                    {baselineStatuses.erectileBotherLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Bowel Status */}
            <div>
              <h5 className="font-semibold text-xs text-gray-500 mb-2 uppercase">Bowel</h5>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Urgency:</span>
                  <span className={`font-medium ${baselineStatuses.urgencyLabel === "Not answered" ? "text-orange-500 italic" : "text-gray-800"}`}>
                    {baselineStatuses.urgencyLabel}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Bowel bother:</span>
                  <span className={`font-medium ${baselineStatuses.bowelBotherLabel === "Not answered" ? "text-orange-500 italic" : "text-gray-800"}`}>
                    {baselineStatuses.bowelBotherLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Treatment Cards */}
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
