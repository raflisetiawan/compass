import bowelBotherData from "@/assets/bowel_bother.json";
import urinaryBotherData from "@/assets/urinary_bother.json";
import erectileBotherData from "@/assets/erectile_bother.json";
import urinaryLeakageData from "@/assets/leaking_urine_at_one_year.json";
import urinaryPadData from "@/assets/use_of_urinary_pads_at_one_year.json";
import erectileFunctionData from "@/assets/erectile_function_with_assist.json";
import problemWithUrgencyData from "@/assets/problem_with_bowel_urgency.json";
import survivalData from "@/assets/survival_calculation.json";
import type { Answers, ClinicalOutcomes, OutcomeProbabilities, SurvivalOutcome } from "@/types/questionnaire";
import { getAgeGroup, getPSARange, getGradeGroup } from "@/services/prediction";

// Helper to map 5-scale answers to 3-scale JSON keys
const mapBotherToKey = (answer: string | number): string => {
    const strAnswer = String(answer);
    if (strAnswer.includes("No problem") || strAnswer.includes("Not a problem")) return "No problem";
    if (strAnswer.includes("Very") || strAnswer.includes("small") || strAnswer.includes("Small")) return "Very/small problem";
    if (strAnswer.includes("Moderate") || strAnswer.includes("Big") || strAnswer.includes("big")) return "Moderate/big problem";
    return "No problem"; // Default fallback
};

const calculateProbabilities = (
    data: any,
    baselineKey: string,
    userAnswer: string | number
): OutcomeProbabilities => {
    const mappedKey = mapBotherToKey(userAnswer);
    const result: OutcomeProbabilities = {};

    for (const treatment in data) {
        const treatmentData = data[treatment];
        if (treatmentData && treatmentData[baselineKey] && treatmentData[baselineKey][mappedKey]) {
            const stats = treatmentData[baselineKey][mappedKey];


            result[treatment] = {
                "No problem": stats["No problem"],
                "Very/small problem": stats["Very/small problem"],
                "Moderate/big problem": stats["Moderate/big problem"],
            };
        }
    }

    return result;
};

const calculateSurvival = (answers: Answers): SurvivalOutcome | undefined => {
    // Extract required clinical data
    const age = typeof answers.age === 'number' ? answers.age : Number(answers.age);
    const psa = typeof answers.psa === 'number' ? answers.psa : Number(answers.psa);
    const gleasonScore = answers.gleason_score as string;
    const tStage = answers.cancer_stage as string;

    if (!age || !psa || !gleasonScore || !tStage || isNaN(age) || isNaN(psa)) {
        return undefined;
    }

    // Map to survival data keys
    const ageGroup = getAgeGroup(age);
    const psaRange = getPSARange(psa);
    const gradeGroup = getGradeGroup(gleasonScore);

    // Normalize T-Stage (remove "T" prefix if present)
    const normalizedTStage = tStage.replace(/^T/i, "");

    // Find matching survival entry
    const survivalEntry = survivalData.Survival.find((entry: any) => {
        return (
            entry["Age Group"] === ageGroup &&
            String(entry["T Stage"]) === normalizedTStage &&
            entry["Grade Group"] === gradeGroup &&
            entry["PSA"] === psaRange
        );
    });

    if (!survivalEntry) {
        return undefined;
    }

    return {
        "Alive (%)": Math.round(Number(survivalEntry["Alive (%)"]) || 0),
        "PCa Death (%)": Math.round(Number(survivalEntry["PCa Death (%)"]) || 0),
        "Other Death (%)": Math.round(Number(survivalEntry["Other Death (%)"]) || 0),
    };
};

export const calculateOutcomes = (answers: Answers): ClinicalOutcomes => {
    const outcomes: ClinicalOutcomes = {};

    // Bowel Function
    if (answers.bowel_bother) {
        outcomes.bowel = calculateProbabilities(
            bowelBotherData,
            "Baseline bowel bother",
            answers.bowel_bother
        );
    }

    // Urinary Function
    if (answers.urine_problem) {
        outcomes.urinary = calculateProbabilities(
            urinaryBotherData,
            "Baseline urinary bother",
            answers.urine_problem
        );
    }

    // Erectile Function
    if (answers.erection_bother) {
        outcomes.erectile = calculateProbabilities(
            erectileBotherData,
            "Baseline sexual bother",
            answers.erection_bother
        );
    }

    // Urinary Leakage
    outcomes.urinaryLeakage = calculateUrinaryLeakage(answers);

    // Urinary Pad
    outcomes.urinaryPad = calculateUrinaryPad(answers);

    // Erectile Function (Granular)
    outcomes.erectileFunction = calculateErectileFunction(answers);

    // Bowel Urgency
    outcomes.bowelUrgency = calculateBowelUrgency(answers);

    // Survival
    const survival = calculateSurvival(answers);
    if (survival) {
        outcomes.survival = survival;
    }

    return outcomes;
};

const calculateUrinaryLeakage = (answers: Answers): { [treatment: string]: { [status: string]: number } } | undefined => {
    const leakage = answers.urine_leak;
    if (!leakage) return undefined;

    const baselineStatus = (() => {
        const val = String(leakage);
        if (val.includes("day")) return "At least once a day";
        if (val.includes("week")) return "At least once a week";
        return "Rarely or never";
    })();

    const result: { [treatment: string]: { [status: string]: number } } = {};
    const treatments = ["Active Surveillance", "Focal Therapy", "Surgery", "Radiotherapy"];

    treatments.forEach(treatment => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = (urinaryLeakageData as any)[treatment]?.["Baseline urine leakage"]?.[baselineStatus];
        if (data) {
            result[treatment] = {
                "Rarely or never": Math.round(data["Rarely or never"]),
                "Weekly": Math.round(data["At least once a week"]),
                "Daily": Math.round(data["At least once a day"])
            };
        }
    });

    return result;
};

const calculateUrinaryPad = (answers: Answers): { [treatment: string]: { [status: string]: number } } | undefined => {
    const padUsage = answers.pad_usage;
    if (!padUsage) return undefined;

    const baselineStatus = (() => {
        const val = String(padUsage);
        if (val.includes("2 or more")) return "Using two or more pads a day";
        if (val.includes("1 pad")) return "Using one pad a day";
        return "Not using pad";
    })();

    const result: { [treatment: string]: { [status: string]: number } } = {};
    const treatments = ["Active Surveillance", "Focal Therapy", "Surgery", "Radiotherapy"];

    treatments.forEach(treatment => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = (urinaryPadData as any)[treatment]?.["Pad status at baseline"]?.[baselineStatus];
        if (data) {
            result[treatment] = {
                "No pads": Math.round(data["Not using pad"]),
                "1 pad": Math.round(data["Using one pad a day"]),
                "2+ pads": Math.round(data["Using two or more pads a day"])
            };
        }
    });

    return result;
};

const calculateErectileFunction = (answers: Answers): { [treatment: string]: { [status: string]: number } } | undefined => {
    const quality = answers.erection_quality;
    if (!quality) return undefined;

    const useMedication = answers.sex_medication === "Yes";
    const baselineStatus = (() => {
        const strQuality = String(quality);
        if (strQuality.includes("intercourse")) {
            return useMedication ? "Firm for intercourse - with assist" : "Firm for intercourse - no assist";
        }
        if (strQuality.includes("masturbation")) {
            return useMedication ? "Firm for masturbation - with assist" : "Firm for masturbation - no assist";
        }
        if (strQuality.includes("Not firm")) {
            return useMedication ? "Not firm - with assist" : "Not firm - no assist";
        }
        if (strQuality.includes("None")) {
            return useMedication ? "None at all - with assist" : "None at all - no assist";
        }
        return "Firm for intercourse - no assist"; // Fallback
    })();

    const result: { [treatment: string]: { [status: string]: number } } = {};
    const treatments = ["Active Surveillance", "Focal Therapy", "Surgery", "Radiotherapy"];

    treatments.forEach(treatment => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = (erectileFunctionData as any)[treatment]?.["Baseline quality of erection"]?.[baselineStatus];
        if (data) {
            // Aggregate to 3 categories for summary: Intercourse, Masturbation, None/Not Firm
            const firmIntercourse = 
                (data["Firm for intercourse - no assist"] || 0) + 
                (data["Firm for intercourse - with assist"] || 0);

            const firmMasturbation = 
                (data["Firm for masturbation - no assist"] || 0) + 
                (data["Firm for masturbation - with assist"] || 0);

            const notFirm = 
                (data["Not firm - no assist"] || 0) + 
                (data["Not firm - with assist"] || 0) + 
                (data["None at all - no assist"] || 0) + 
                (data["None at all - with assist"] || 0);

            result[treatment] = {
                "Firm for intercourse": Math.round(firmIntercourse),
                "Firm for masturbation": Math.round(firmMasturbation),
                "Not firm/None": Math.round(notFirm)
            };
        }
    });

    return result;
};

const calculateBowelUrgency = (answers: Answers): { [treatment: string]: { [status: string]: number } } | undefined => {
    const urgency = answers.bowel_urgency;
    if (!urgency) return undefined;

    const baselineStatus = (() => {
        const val = String(urgency);
        if (val.includes("Moderate") || val.includes("Big") || val.includes("big")) return "Moderate_big_problem";
        if (val.includes("Very") || val.includes("small") || val.includes("Small")) return "Very_small_problem";
        return "No_problem";
    })();

    const result: { [treatment: string]: { [status: string]: number } } = {};
    const treatments = ["Active Surveillance", "Focal Therapy", "Surgery", "Radiotherapy"];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const urgencyData: any = {
        "Active Surveillance": problemWithUrgencyData.Active_Surveillance,
        "Focal Therapy": problemWithUrgencyData.Focal,
        "Surgery": problemWithUrgencyData.Surgery,
        "Radiotherapy": problemWithUrgencyData.EBRT,
    };

    treatments.forEach(treatment => {
        const data = urgencyData[treatment]?.Baseline?.[baselineStatus];
        if (data) {
            result[treatment] = {
                "No problem": Math.round(data["No_problem_%"]),
                "Very small or small problem": Math.round(data["Very_small_problem_%"]),
                "Moderate or big problem": Math.round(data["Moderate_big_problem_%"])
            };
        }
    });

    return result;
};
