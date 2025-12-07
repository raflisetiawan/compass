import { useMemo } from "react";
import { FunctionalOutcomePageLayout } from "@/layouts/FunctionalOutcomePageLayout";
import { useOutcomePageData } from "@/hooks/useOutcomePageData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Import all data files
import urinaryLeakageData from "@/assets/leaking_urine_at_one_year.json";
import urinaryPadData from "@/assets/use_of_urinary_pads_at_one_year.json";
import urinaryBotherData from "@/assets/urinary_bother.json";
import erectileFunctionData from "@/assets/erectile_function_with_assist.json";
import erectileBotherData from "@/assets/erectile_bother.json";
import bowelUrgencyData from "@/assets/problem_with_bowel_urgency.json";
import bowelBotherData from "@/assets/bowel_bother.json";

const treatments = [
  { key: "Active Surveillance", urgencyKey: "Active_Surveillance" },
  { key: "Focal Therapy", urgencyKey: "Focal" },
  { key: "Surgery", urgencyKey: "Surgery" },
  { key: "Radiotherapy", urgencyKey: "EBRT" },
];

const columns = [
  { key: "treatment", label: "Treatment" },
  { key: "noLeaking", label: "No Leaking" },
  { key: "noPadUsed", label: "No Pad Used" },
  { key: "noUrinaryProblem", label: "No Problem (Urinary)" },
  { key: "erectionsSufficient", label: "Erections Sufficient" },
  { key: "noErectileProblem", label: "No Problem (Erectile)" },
  { key: "noBowelUrgency", label: "No Bowel Urgency" },
  { key: "noBowelProblem", label: "No Problem (Bowel)" },
];

const definitions = [
  {
    term: "No Leaking",
    definition: "EPIC-26 Q1: 'Rarely or never' leaking urine.",
  },
  {
    term: "No Pad Used",
    definition: "EPIC-26 Q2: Using no pads or adult diapers per day.",
  },
  {
    term: "No Problem (Urinary)",
    definition: "EPIC-26 Q4: Overall urinary function rated as 'No problem'.",
  },
  {
    term: "Erections Sufficient",
    definition: "EPIC-26 Q5: Ability to have erections 'Firm enough for intercourse' (with or without assist).",
  },
  {
    term: "No Problem (Erectile)",
    definition: "EPIC-26 Q10: Overall sexual function rated as 'No problem'.",
  },
  {
    term: "No Bowel Urgency",
    definition: "EPIC-26 Q12: Urgency to have bowel movements rated as 'No problem'.",
  },
  {
    term: "No Problem (Bowel)",
    definition: "EPIC-26 Q14: Overall bowel function rated as 'No problem'.",
  },
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
    if (String(leakage).includes("day")) leakageStatus = "At least once a day";
    else if (String(leakage).includes("week")) leakageStatus = "At least once a week";

    // Urinary Pad Usage
    const padUsage = answers.pad_usage || "No pads";
    let padStatus = "Not using pad";
    if (String(padUsage).includes("2 or more")) padStatus = "Using two or more pads a day";
    else if (String(padUsage).includes("1 pad")) padStatus = "Using one pad a day";

    // Urinary Bother
    const urinaryBother = answers.urine_problem || "Not a problem";
    let urinaryBotherStatus = "No problem";
    if (String(urinaryBother).includes("Moderate") || String(urinaryBother).includes("big"))
      urinaryBotherStatus = "Moderate/big problem";
    else if (String(urinaryBother).includes("Very") || String(urinaryBother).includes("small"))
      urinaryBotherStatus = "Very/small problem";

    // Erectile Function
    const quality = answers.erection_quality || "Firm enough for intercourse";
    const useMedication = answers.sex_medication === "Yes";
    let erectileStatus: string;

    if (quality === "Firm enough for intercourse") {
      erectileStatus = useMedication ? "Firm for intercourse - with assist" : "Firm for intercourse - no assist";
    } else if (quality === "Firm enough for masturbation and foreplay only") {
      erectileStatus = useMedication ? "Firm for masturbation - with assist" : "Firm for masturbation - no assist";
    } else if (quality === "Not firm enough for any sexual activity") {
      erectileStatus = useMedication ? "Not firm - with assist" : "Not firm - no assist";
    } else {
      erectileStatus = useMedication ? "None at all - with assist" : "None at all - no assist";
    }

    // Erectile Bother (Sexual Bother)
    const erectileBother = answers.erection_bother || "Not a problem";
    let erectileBotherStatus = "No problem";
    if (String(erectileBother).includes("Moderate") || String(erectileBother).includes("big"))
      erectileBotherStatus = "Moderate/big problem";
    else if (String(erectileBother).includes("Very") || String(erectileBother).includes("small"))
      erectileBotherStatus = "Very/small problem";

    // Bowel Urgency
    const urgency = answers.bowel_urgency || "No problem";
    let urgencyStatus = "No_problem";
    if (urgency === "No problem") urgencyStatus = "No_problem";
    else if (urgency === "Very small" || urgency === "Small") urgencyStatus = "Very_small_problem";
    else if (urgency === "Moderate" || urgency === "Big problem") urgencyStatus = "Moderate_big_problem";

    // Bowel Bother
    const bowelBother = answers.bowel_bother || "Not a problem";
    let bowelBotherStatus = "No problem";
    if (String(bowelBother).includes("Moderate") || String(bowelBother).includes("big"))
      bowelBotherStatus = "Moderate/big problem";
    else if (String(bowelBother).includes("Very") || String(bowelBother).includes("small"))
      bowelBotherStatus = "Very/small problem";

    return {
      leakageStatus,
      padStatus,
      urinaryBotherStatus,
      erectileStatus,
      erectileBotherStatus,
      urgencyStatus,
      bowelBotherStatus,
    };
  }, [answers]);

  // Calculate outcomes for each treatment
  const tableData = useMemo(() => {
    const { leakageStatus, padStatus, urinaryBotherStatus, erectileStatus, erectileBotherStatus, urgencyStatus, bowelBotherStatus } = baselineStatuses;

    return treatments.map(({ key: treatmentName, urgencyKey }) => {
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
      <div className="text-sm text-gray-600 mb-4 space-y-2">
        <p>
          This table summarizes the percentage of men with functional outcomes at
          1 year after treatment for each treatment option, based on your current
          baseline function.
        </p>
      </div>

      {/* Desktop Table - hidden on mobile */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={
                    col.key === "treatment"
                      ? "font-bold bg-gray-100"
                      : "text-center bg-gray-100"
                  }
                >
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((row) => (
              <TableRow key={row.treatment}>
                <TableCell className="font-medium">{row.treatment}</TableCell>
                <TableCell className="text-center">{formatValue(row.noLeaking)}</TableCell>
                <TableCell className="text-center">{formatValue(row.noPadUsed)}</TableCell>
                <TableCell className="text-center">{formatValue(row.noUrinaryProblem)}</TableCell>
                <TableCell className="text-center">{formatValue(row.erectionsSufficient)}</TableCell>
                <TableCell className="text-center">{formatValue(row.noErectileProblem)}</TableCell>
                <TableCell className="text-center">{formatValue(row.noBowelUrgency)}</TableCell>
                <TableCell className="text-center">{formatValue(row.noBowelProblem)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards - shown only on mobile */}
      <div className="md:hidden space-y-4">
        {tableData.map((row) => (
          <div
            key={row.treatment}
            className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
          >
            <div className="bg-blue-600 text-white px-4 py-3 font-bold">
              {row.treatment}
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
      </div>

      <div className="mt-8">
        <h3 className="font-bold text-lg mb-4">Column Definitions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {definitions.map((def) => (
            <div
              key={def.term}
              className="bg-blue-50 border border-blue-100 rounded-lg p-3"
            >
              <p className="font-semibold text-blue-900">{def.term}</p>
              <p className="text-sm text-blue-700">{def.definition}</p>
            </div>
          ))}
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
