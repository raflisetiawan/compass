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
      } else {
        // Both "Not firm enough for any sexual activity" and "None at all" map to the
        // same JSON key family "Not firm or none - ..."
        erectileStatus = useMedication ? "Not firm or none - with assist" : "Not firm or none - no assist";
        erectileLabel = quality === "Not firm enough for any sexual activity" ? "Not firm enough" : "No erections";
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
      // Urinary leakage — show % who maintain the patient's own current leakage status
      let noLeaking: number | null = null;
      if (leakageStatus) {
        const leakageResult = (urinaryLeakageData as LeakageData)[treatmentName as keyof LeakageData];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        noLeaking = (leakageResult?.["Baseline urine leakage"] as any)?.[leakageStatus]?.[leakageStatus] ?? null;
      }

      // Pad usage — show % who maintain the patient's own current pad status
      let noPadUsed: number | null = null;
      if (padStatus) {
        const padOutcome = (urinaryPadData as PadData)[treatmentName as keyof PadData];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        noPadUsed = (padOutcome?.["Pad status at baseline"] as any)?.[padStatus]?.[padStatus] ?? null;
      }

      // Urinary bother — show % who maintain the patient's own current bother status
      let noUrinaryProblem: number | null = null;
      if (urinaryBotherStatus) {
        const urinaryBotherOutcome = (urinaryBotherData as UrinaryBotherData)[treatmentName as keyof UrinaryBotherData];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        noUrinaryProblem = (urinaryBotherOutcome?.["Baseline urinary bother"] as any)?.[urinaryBotherStatus]?.[urinaryBotherStatus] ?? null;
      }

      // Erections — show % who maintain the patient's own erection quality tier
      let erectionsSufficient: number | null = null;
      if (erectileStatus) {
        const erectileOutcome = (erectileFunctionData as ErectileFunctionDataType)[treatmentName as keyof ErectileFunctionDataType];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const baselineErection = (erectileOutcome?.["Baseline quality of erection"] as any)?.[erectileStatus];
        if (baselineErection) {
          // Determine which tier the patient is in and sum both assist variants for that tier
          if (erectileStatus.startsWith("Firm for intercourse")) {
            erectionsSufficient = (baselineErection["Firm for intercourse - no assist"] ?? 0) + (baselineErection["Firm for intercourse - with assist"] ?? 0);
          } else if (erectileStatus.startsWith("Firm for masturbation")) {
            erectionsSufficient = (baselineErection["Firm for masturbation - no assist"] ?? 0) + (baselineErection["Firm for masturbation - with assist"] ?? 0);
          } else {
            erectionsSufficient = (baselineErection["Not firm or none - no assist"] ?? 0) + (baselineErection["Not firm or none - with assist"] ?? 0);
          }
        }
      }

      // Erectile bother — show % who maintain the patient's own current bother status
      let noErectileProblem: number | null = null;
      if (erectileBotherStatus) {
        const erectileBotherOutcome = (erectileBotherData as ErectileBotherData)[treatmentName as keyof ErectileBotherData];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        noErectileProblem = (erectileBotherOutcome?.["Baseline sexual bother"] as any)?.[erectileBotherStatus]?.[erectileBotherStatus] ?? null;
      }

      // Bowel urgency — show % who maintain the patient's own current urgency status
      let noBowelUrgency: number | null = null;
      if (urgencyStatus) {
        const urgencyOutcome = (bowelUrgencyData as BowelUrgencyDataType)[urgencyKey as keyof BowelUrgencyDataType];
        const urgencyPctKey = (urgencyStatus + "_%") as "No_problem_%" | "Very_small_problem_%" | "Moderate_big_problem_%";
        noBowelUrgency = urgencyOutcome?.Baseline?.[urgencyStatus as keyof typeof urgencyOutcome.Baseline]?.[urgencyPctKey] ?? null;
      }

      // Bowel bother — show % who maintain the patient's own current bowel bother status
      let noBowelProblem: number | null = null;
      if (bowelBotherStatus) {
        const bowelBotherOutcome = (bowelBotherData as BowelBotherDataType)[treatmentName as keyof BowelBotherDataType];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        noBowelProblem = (bowelBotherOutcome?.["Baseline bowel bother"] as any)?.[bowelBotherStatus]?.[bowelBotherStatus] ?? null;
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
      {/* Clinical Parameters Box */}
      <div className="border-2 border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-bold mb-3 text-lg">Your Current Function:</h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div>
            <span className="text-gray-600">Urinary leakage:</span>{" "}
            <span className="font-medium">{baselineStatuses.leakageLabel}</span>
          </div>
          <div>
            <span className="text-gray-600">Erectile function:</span>{" "}
            <span className="font-medium">{baselineStatuses.erectileLabel}</span>
          </div>
          <div>
            <span className="text-gray-600">Pad usage:</span>{" "}
            <span className="font-medium">{baselineStatuses.padLabel}</span>
          </div>
          <div>
            <span className="text-gray-600">Sexual bother:</span>{" "}
            <span className="font-medium">{baselineStatuses.erectileBotherLabel}</span>
          </div>
          <div>
            <span className="text-gray-600">Urinary bother:</span>{" "}
            <span className="font-medium">{baselineStatuses.urinaryBotherLabel}</span>
          </div>
          <div>
            <span className="text-gray-600">Bowel urgency:</span>{" "}
            <span className="font-medium">{baselineStatuses.urgencyLabel}</span>
          </div>
          <div>
            <span className="text-gray-600">Bowel bother:</span>{" "}
            <span className="font-medium">{baselineStatuses.bowelBotherLabel}</span>
          </div>
        </div>
      </div>

      {/* Desktop Table - hidden on mobile */}
      <div className="hidden md:block">
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

            {/* Column Headers — dynamic labels from patient answers */}
            <tr className="bg-gray-100 text-xs">
              <th className="border border-gray-300 p-2 font-bold">TREATMENT</th>
              <th className="border border-gray-300 p-2 text-center font-medium">
                {baselineStatuses.leakageLabel || "Urinary leakage"}
              </th>
              <th className="border border-gray-300 p-2 text-center font-medium">
                {baselineStatuses.padLabel || "Pad usage"}
              </th>
              <th className="border border-gray-300 p-2 text-center font-medium">
                {baselineStatuses.urinaryBotherLabel || "Urinary bother"}
              </th>
              <th className="border border-gray-300 p-2 text-center font-medium">
                {baselineStatuses.erectileLabel || "Erectile function"}
              </th>
              <th className="border border-gray-300 p-2 text-center font-medium">
                {baselineStatuses.erectileBotherLabel || "Sexual bother"}
              </th>
              <th className="border border-gray-300 p-2 text-center font-medium">
                {baselineStatuses.urgencyLabel || "Bowel urgency"}
              </th>
              <th className="border border-gray-300 p-2 text-center font-medium">
                {baselineStatuses.bowelBotherLabel || "Bowel bother"}
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
                    <div className="text-xs text-gray-500">{baselineStatuses.leakageLabel || "Leakage"}</div>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-lg font-bold text-blue-600">{formatValue(row.noPadUsed)}</div>
                    <div className="text-xs text-gray-500">{baselineStatuses.padLabel || "Pad usage"}</div>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-lg font-bold text-blue-600">{formatValue(row.noUrinaryProblem)}</div>
                    <div className="text-xs text-gray-500">{baselineStatuses.urinaryBotherLabel || "Urinary bother"}</div>
                  </div>
                </div>
              </div>

              {/* Sexual Section */}
              <div className="border-b border-gray-100 pb-3">
                <h4 className="font-semibold text-sm text-gray-500 mb-2">Sexual</h4>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-lg font-bold text-purple-600">{formatValue(row.erectionsSufficient)}</div>
                    <div className="text-xs text-gray-500">{baselineStatuses.erectileLabel || "Erectile function"}</div>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-lg font-bold text-purple-600">{formatValue(row.noErectileProblem)}</div>
                    <div className="text-xs text-gray-500">{baselineStatuses.erectileBotherLabel || "Sexual bother"}</div>
                  </div>
                </div>
              </div>

              {/* Bowel Section */}
              <div>
                <h4 className="font-semibold text-sm text-gray-500 mb-2">Bowel</h4>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-lg font-bold text-green-600">{formatValue(row.noBowelUrgency)}</div>
                    <div className="text-xs text-gray-500">{baselineStatuses.urgencyLabel || "Bowel urgency"}</div>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-lg font-bold text-green-600">{formatValue(row.noBowelProblem)}</div>
                    <div className="text-xs text-gray-500">{baselineStatuses.bowelBotherLabel || "Bowel bother"}</div>
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
