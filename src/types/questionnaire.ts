export interface Question {
    id: string;
    text: string;
    type: "radio" | "select" | "number";
    options?: (string | { label: string; value: string | number })[];
    placeholder?: string;
    helpText?: string;
    unit?: string;
    validation?: { min?: number; max?: number; required?: boolean };
    required?: boolean;
}

export interface Section {
    section: string;
    questions: Question[];
}

export interface QuestionnaireData {
    questionnaire: Section[];
}

export type Answers = {
    [questionId: string]: string | number;
};

export type Errors = {
    [questionId: string]: string | undefined;
};

export interface OutcomeProbabilities {
    [treatment: string]: {
        "No problem": number;
        "Very/small problem": number;
        "Moderate/big problem": number;
    };
}

export interface SurvivalOutcome {
    "Alive (%)": number;
    "PCa Death (%)": number;
    "Other Death (%)": number;
}

export interface ClinicalOutcomes {
    bowel?: OutcomeProbabilities;
    urinary?: OutcomeProbabilities;
    erectile?: OutcomeProbabilities;
    urinaryLeakage?: { [treatment: string]: { [status: string]: number } };
    urinaryPad?: { [treatment: string]: { [status: string]: number } };
    erectileFunction?: { [treatment: string]: { [status: string]: number } };
    bowelUrgency?: { [treatment: string]: { [status: string]: number } };
    survival?: SurvivalOutcome;
}
