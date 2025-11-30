import bowelBotherData from "@/assets/bowel_bother.json";
import urinaryBotherData from "@/assets/urinary_bother.json";
import erectileBotherData from "@/assets/erectile_bother.json";
import survivalData from "@/assets/survival_calculation.json";
import type { Answers, ClinicalOutcomes, OutcomeProbabilities, SurvivalOutcome } from "@/types/questionnaire";
import { getAgeGroup, getPSARange, getGradeGroup } from "@/services/prediction";

// Helper to map 5-scale answers to 3-scale JSON keys
const mapBotherToKey = (answer: string | number): string => {
    const strAnswer = String(answer);
    if (strAnswer === "No problem") return "No problem";
    if (strAnswer === "Very small" || strAnswer === "Small") return "Very/small problem";
    if (strAnswer === "Moderate" || strAnswer === "Big problem") return "Moderate/big problem";
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

    // Survival
    const survival = calculateSurvival(answers);
    if (survival) {
        outcomes.survival = survival;
    }

    return outcomes;
};
