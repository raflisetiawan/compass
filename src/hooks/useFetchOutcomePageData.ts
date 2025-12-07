import { useQuestionnaireStore } from "@/stores/questionnaireStore";
import { useUserStore } from "@/stores/userStore";
import { useEffect } from "react";
import type { ClinicalParameters, BaselineFunction } from "@/types";

export const useFetchOutcomePageData = () => {
  const { user } = useUserStore();
  const { answers, loadInitialData, isLoading, reset } = useQuestionnaireStore();

  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user, loadInitialData]);

  const clinicalParameters: ClinicalParameters = {
    Age: `${answers.age || "65"} years`,
    PSA: `${answers.psa || "8"} ng/mL`,
    "Prostate volume": `${answers.prostate_volume || "60"} mL`,
    "Gleason Score": answers.gleason_score || "3+4",
    "T Stage": answers.cancer_stage || "T2",
    "MRI visibility": answers.mri_visibility || "Visible (Score 4-5)",
    "Maximal Cancer Core Length": answers.max_cancer_core_length ? `${answers.max_cancer_core_length} mm` : "Unknown",
  };

  const baselineGenitoUrinaryBowelFunction: BaselineFunction = {
    Leakage: answers.urine_leak || "Rarely or never",
    "Urinary Pad Use": answers.pad_usage || "No pads",
    "Bother with urinary function": answers.urine_problem || "Not a problem",
    "Erectile function":
      answers.erection_quality || "Sufficient erections for intercourse",
    "Sexual Medication or devices": answers.sex_medication || "None",
    "Bother with erectile function": answers.erection_bother || "Not a problem",
    "Bother with Bowel function": answers.bowel_bother || "Not a problem",
  };

  return {
    user,
    answers,
    isLoading,
    reset,
    clinicalParameters,
    baselineGenitoUrinaryBowelFunction,
  };
};
